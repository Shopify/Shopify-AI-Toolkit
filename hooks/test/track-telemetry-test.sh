#!/usr/bin/env bash
# Test suite for track-telemetry.sh.
#
# Asserts on the markers the script emits to stderr when
# SKILL_TELEMETRY_TEST_MODE=1 is set. Each case pipes a synthetic
# agent payload into the script and checks the captured stderr (and
# stdout for the universal `{"continue":true}` envelope) against
# expectations.
#
# Plain bash for zero external dependencies — runs anywhere the hook
# itself runs (macOS BSD sed, Linux GNU sed). No bats install needed.
#
# Usage:
#   bash packages/plugins/hooks/test/track-telemetry-test.sh
#
# Exits 0 on all-pass, 1 on any failure.

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="${SCRIPT_DIR}/../scripts/track-telemetry.sh"

if [ ! -f "$HOOK" ]; then
  echo "FATAL: track-telemetry.sh not found at $HOOK" >&2
  exit 1
fi

PASS_COUNT=0
FAIL_COUNT=0
FAILURES=()

# Run the hook with a payload and captured env, returning combined
# stdout + stderr separately (stderr → fd 3 → captured into stderr var).
#
# Usage:
#   run_hook "<payload json>" [VAR=val ...]
# After call:
#   $STDOUT, $STDERR, $EXIT contain the captured streams + exit code.
run_hook() {
  local payload="$1"
  shift
  # Split remaining args at `--`: everything before is env=value pairs for
  # the hook subprocess; everything after is forwarded as script args.
  local env_pairs=()
  local script_args=()
  local seen_sep=0
  for arg in "$@"; do
    if [ "$arg" = "--" ]; then
      seen_sep=1
      continue
    fi
    if [ "$seen_sep" = "1" ]; then
      script_args+=("$arg")
    else
      env_pairs+=("$arg")
    fi
  done
  local stderr_file
  stderr_file=$(mktemp)
  # `"${array[@]+"${array[@]}"}"` is the safe-under-set-u expansion for
  # possibly-empty arrays. `env -i` resets the environment so each test
  # case is isolated; PATH and HOME are passed through explicitly so the
  # hook can find jq/curl and resolve $HOME-relative install paths.
  STDOUT=$(env -i \
    PATH="$PATH" \
    HOME="$HOME" \
    SKILL_TELEMETRY_TEST_MODE=1 \
    "${env_pairs[@]+"${env_pairs[@]}"}" \
    bash "$HOOK" "${script_args[@]+"${script_args[@]}"}" 2>"$stderr_file" <<<"$payload")
  EXIT=$?
  STDERR=$(cat "$stderr_file")
  rm -f "$stderr_file"
}

# Assert a condition. First arg = description, then bash expression
# (as string) that evaluates with `eval`.
assert() {
  local desc="$1"
  local expr="$2"
  if eval "$expr"; then
    PASS_COUNT=$((PASS_COUNT + 1))
    printf '  ✓ %s\n' "$desc"
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    FAILURES+=("$desc")
    printf '  ✗ %s\n' "$desc" >&2
    printf '    STDERR: %s\n' "$STDERR" >&2
    printf '    STDOUT: %s\n' "$STDOUT" >&2
  fi
}

# Convenience asserters.
assert_emitted() {
  local desc="$1"
  assert "$desc — body emitted" '[[ "$STDERR" == *"[TEST_TELEMETRY_BODY]"* ]]'
}
assert_not_emitted() {
  local desc="$1"
  assert "$desc — no body emitted" '[[ "$STDERR" != *"[TEST_TELEMETRY_BODY]"* ]]'
}
assert_continue() {
  assert "continue:true envelope" '[[ "$STDOUT" == *"{\"continue\":true}"* ]]'
}
assert_body_contains() {
  local desc="$1"
  local needle="$2"
  assert "body contains $desc" '[[ "$STDERR" == *"$needle"* ]]'
}
assert_header() {
  local name="$1"
  local value="$2"
  assert "header $name: $value" '[[ "$STDERR" == *"[TEST_TELEMETRY_HEADER] $name: $value"* ]]'
}

# ─── Cases ────────────────────────────────────────────────────────────────────

echo "=== Test 1: Claude Code Skill tool call with shopify-plugin: prefix ==="
run_hook '{"hook_event_name":"PostToolUse","tool_name":"Skill","tool_input":{"skill":"shopify-plugin:shopify-admin"},"session_id":"sess-claude","tool_use_id":"toolu_abc"}'
assert_emitted "claude skill call"
assert_continue
assert_body_contains "skill=shopify-admin" '"skill":"shopify-admin"'
assert_body_contains "trigger=skill-tool" '"trigger":"skill-tool"'
assert_body_contains "client=claude-code" '"client":"claude-code"'
assert_header "X-Shopify-Client-Name" "claude-code"
assert_body_contains "sessionId=sess-claude (in body, not header)" '"sessionId":"sess-claude"'

echo "=== Test 2: Claude Code SKILL.md read with version segment ==="
run_hook '{"hook_event_name":"PostToolUse","tool_name":"Read","tool_input":{"file_path":"/Users/me/.claude/plugins/cache/shopify-ai-toolkit/shopify-plugin/1.2.2/skills/shopify-admin/SKILL.md"},"session_id":"sess-md"}'
assert_emitted "claude SKILL.md read"
assert_body_contains "skill=shopify-admin" '"skill":"shopify-admin"'
assert_body_contains "skillVersion=1.2.2" '"skillVersion":"1.2.2"'
assert_body_contains "trigger=skill-md-read" '"trigger":"skill-md-read"'
assert_body_contains "client=claude-code" '"client":"claude-code"'

echo "=== Test 3: Cursor SKILL.md read ==="
run_hook '{"tool_name":"Read","tool_input":{"file_path":"/Users/me/.cursor/extensions/shopify.shopify-plugin-1.2.2/skills/shopify-liquid/SKILL.md"}}' \
  "CURSOR_PLUGIN_ROOT=/Users/me/.cursor/extensions/shopify.shopify-plugin-1.2.2"
assert_emitted "cursor SKILL.md read"
assert_body_contains "skill=shopify-liquid" '"skill":"shopify-liquid"'
assert_body_contains "client=cursor" '"client":"cursor"'

echo "=== Test 4: Copilot CLI camelCase ==="
run_hook '{"toolName":"skill","toolArgs":{"skill":"shopify-storefront-graphql"},"sessionId":"copilot-sess"}' \
  "COPILOT_CLI=1"
assert_emitted "copilot skill call"
assert_body_contains "skill=shopify-storefront-graphql" '"skill":"shopify-storefront-graphql"'
assert_body_contains "client=copilot-cli" '"client":"copilot-cli"'
assert_body_contains "sessionId=copilot-sess (in body, not header)" '"sessionId":"copilot-sess"'

echo "=== Test 5: VS Code Copilot transcript detection via __vscode ==="
run_hook '{"hook_event_name":"PostToolUse","tool_name":"read_file","tool_use_id":"call_abc__vscode","tool_input":{"path":"/Users/me/.vscode/agent-plugins/github.com/shopify/shopify-ai-toolkit/.github/plugins/shopify-ai-toolkit/skills/shopify-storefront-graphql/SKILL.md"}}'
assert_emitted "vscode SKILL.md read"
assert_body_contains "skill=shopify-storefront-graphql" '"skill":"shopify-storefront-graphql"'
assert_body_contains "client=vscode" '"client":"vscode"'

echo "=== Test 6: Opt-out via OPT_OUT_INSTRUMENTATION=true ==="
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}' \
  "OPT_OUT_INSTRUMENTATION=true"
assert_not_emitted "opt-out"
assert_continue

echo "=== Test 7: Foreign-plugin skill (not in allowlist) ==="
run_hook '{"tool_name":"Skill","tool_input":{"skill":"microsoft-azure"}}'
assert_not_emitted "foreign-plugin skill"
assert_continue

echo "=== Test 8: Empty stdin ==="
run_hook ''
assert_not_emitted "empty stdin"
assert_continue

echo "=== Test 9: Malformed JSON ==="
run_hook 'this is not json at all'
assert_not_emitted "malformed JSON"
assert_continue

echo "=== Test 10: SKILL.md read without version segment in path ==="
run_hook '{"tool_name":"Read","tool_input":{"file_path":"/Users/me/.agents/skills/shopify-storefront/SKILL.md"}}'
assert_emitted "SKILL.md read no version"
assert_body_contains "skill=shopify-storefront" '"skill":"shopify-storefront"'
assert_body_contains "skillVersion=null" '"skillVersion":null'
assert_body_contains "trigger=skill-md-read" '"trigger":"skill-md-read"'

echo "=== Test 11: session_id with embedded CR/LF (security regression) ==="
# JSON \r\n escapes decode to real CR/LF at extraction time. session_id now
# lives inside parameters.sessionId in the JSON body (not in a header), so
# the original threat (header line splitting via curl --header) is gone.
# But `tr -d '\r\n\t'` is still load-bearing: if control chars leaked into
# the body, the JSON sent over the wire would be malformed (e.g. a raw
# newline mid-string would either break the JSON or split the body across
# two lines of output). Verify (a) the would-be injected text is sanitized
# in the body value, and (b) the entire body emission is a single line.
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"},"session_id":"abc\r\nX-Injected: evil"}'
assert_emitted "session_id with CRLF"
# Control chars stripped → injected text folded harmlessly into the value
assert_body_contains "sanitized sessionId value (no control chars)" '"sessionId":"abcX-Injected: evil"'
# Body must be on a single [TEST_TELEMETRY_BODY] line — no CR/LF leak
BODY_LINES=$(printf '%s\n' "$STDERR" | grep -c '^\[TEST_TELEMETRY_BODY\]')
assert "single-line body emission (no CR/LF in body)" '[ "$BODY_LINES" = "1" ]'

echo "=== Test 12: 'ucp' skill (non-shopify- prefix, explicit allow) ==="
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-plugin:ucp"}}'
assert_emitted "ucp skill"
assert_body_contains "skill=ucp" '"skill":"ucp"'

echo "=== Test 13: MCP server tool call should NOT emit (already self-reports) ==="
run_hook '{"tool_name":"mcp__shopify-dev-mcp__introspect_admin_schema","tool_input":{}}'
assert_not_emitted "MCP tool call"
assert_continue

echo "=== Test 14: Skill name without shopify- / ucp prefix is rejected ==="
run_hook '{"tool_name":"Skill","tool_input":{"skill":""}}'
assert_not_emitted "empty skill"
run_hook '{"tool_name":"Skill","tool_input":{"skill":"some-random-skill"}}'
assert_not_emitted "non-toolkit skill"

echo "=== Test 15: --hook-source CLI flag wins over env var ==="
# `VAR=value cmd` only works when the hook host shells out, which Cursor /
# Copilot don't formally document — Richard's #880 review. The CLI flag is
# the portable form. Each variant below should produce hookSource=plugin.
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}' \
  -- --hook-source plugin
assert_body_contains "flag --hook-source plugin" '"hookSource":"plugin"'

run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}' \
  -- --hook-source=plugin
assert_body_contains "flag --hook-source=plugin (=-form)" '"hookSource":"plugin"'

# CLI flag must override the legacy env var (env says skill, flag says plugin)
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}' \
  "SHOPIFY_AI_TOOLKIT_HOOK_SOURCE=skill" -- --hook-source plugin
assert_body_contains "CLI flag overrides env var" '"hookSource":"plugin"'

echo "=== Test 16: env var still works as fallback (backwards compat) ==="
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}' \
  "SHOPIFY_AI_TOOLKIT_HOOK_SOURCE=plugin"
assert_body_contains "env-var fallback when no flag" '"hookSource":"plugin"'

echo "=== Test 17: default hookSource is 'skill' when neither set ==="
run_hook '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}'
assert_body_contains "default hookSource=skill" '"hookSource":"skill"'

# ─── Report ───────────────────────────────────────────────────────────────────

echo
echo "─────────────────────────────────────────"
TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ "$FAIL_COUNT" -eq 0 ]; then
  printf '✓ All %d assertions passed.\n' "$TOTAL"
  exit 0
else
  printf '✗ %d/%d assertions failed:\n' "$FAIL_COUNT" "$TOTAL" >&2
  for f in "${FAILURES[@]}"; do
    printf '  - %s\n' "$f" >&2
  done
  exit 1
fi
