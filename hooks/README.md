# Skill-execution telemetry hooks

These hooks close the markdown-only skill-execution telemetry gap. The
toolkit's existing instrumentation only fires when a skill calls one of
its generated scripts (`scripts/search_docs.mjs`, `scripts/validate.mjs`)
or when the bundled MCP server (`shopify-dev-mcp`) is invoked. Skills
that are pure SKILL.md prose — or skill loads where the agent reads the
SKILL.md and follows the instructions without invoking a script —
emit nothing.

The `track-telemetry` hook runs on every `PostToolUse` event in
supported agents — and, on Claude Code, on `UserPromptSubmit` (see
"What is reported") — and reports a `skill_invocation` event whenever
the agent does one of:

1. Calls the host agent's `Skill` / `skill` tool with a Shopify AI
   Toolkit skill name (e.g. `shopify-admin`, `shopify-storefront-graphql`,
   `shopify-liquid`).
2. Reads a `SKILL.md` file from a recognized Shopify AI Toolkit install
   path.

Both branches end up in the same place: a `POST` to
`https://shopify.dev/mcp/usage` whose shape matches the payload the
existing instrumentation modules already send. Server-side, the same
handler routes everything into monorail.

## Coverage

The hook script (`scripts/track-telemetry.sh`, `.ps1`) is wired up in
two places so it fires for both plugin installs and standalone skill
installs:

| Surface                          | Manifest / Config                                                    | Honored by                                                           |
| -------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Plugin manifest                  | `hooks.json`                                                         | Claude Code                                                          |
| Plugin manifest                  | `cursor-hooks.json`                                                  | Cursor                                                               |
| Plugin manifest                  | `copilot-hooks.json`                                                 | GitHub Copilot CLI, VS Code Copilot                                  |
| Skill frontmatter `hooks:` block | injected by `generate-agent-skills.ts` into every generated SKILL.md | Claude Code (only agent that supports skill-frontmatter hooks today) |

The plugin manifests are auto-loaded when the user installs the plugin
(e.g. `gemini extensions install`, `/plugin install ...`). The
skill-frontmatter block is what fires when a user installs skills
directly — e.g. `npx skills add Shopify/shopify-ai-toolkit` — on an
agent that supports frontmatter hooks. Without the frontmatter block,
those standalone installs emit no skill telemetry at all.

For Codex and Gemini, skill telemetry stays limited to whatever the
generated scripts and MCP server self-report — they expose neither a
plugin-manifest hook API nor frontmatter hook support.

## Source labeling and downstream dedup

When the plugin is installed on Claude Code, *both* the plugin-manifest
hook and the skill-frontmatter hook fire for the same
`Skill("shopify-admin")` invocation. Each event is labeled so consumers
can collapse duplicates after the fact:

- Plugin manifests prefix the hook command with
  `SHOPIFY_AI_TOOLKIT_HOOK_SOURCE=plugin`. The skill-frontmatter
  invocation leaves the variable unset and defaults to `skill`. Both
  values flow out as the `hookSource` field inside the body's
  `parameters` object.
- Each event also carries the agent's `sessionId` and `toolUseId`
  inside `parameters`, so consumers can dedup on
  `(sessionId, toolUseId)` and keep whichever source they prefer.

All three labels ride inside the body's `parameters` object — never as
HTTP headers. The `/mcp/usage` handler at `shopify.dev` reads only a
short allow-list of headers (`X-Shopify-Surface`, `X-Shopify-Client-Name`
/`-Version`/`-Model`) into first-class monorail columns; the entire
`parameters` object is JSON-stringified into a single monorail column,
so anything inside it survives without a schema change. Headers outside
the allow-list are silently dropped.

This is intentionally simpler than client-side dedup, which had to
guess at install paths and was fragile across OSes and stale plugin
caches. Downstream consumers see the truth (one tool call, N events
with the same `sessionId` + `toolUseId`) and decide from there.

## What is reported

```jsonc
POST https://shopify.dev/mcp/usage
X-Shopify-Surface: skills-hook
X-Shopify-Client-Name: claude-code | cursor | copilot-cli | vscode | vscode-insiders

{
  "tool": "skill_invocation",
  "parameters": {
    "skill": "shopify-admin",
    "skillVersion": "1.2.2",       // null when not recoverable from path
    "trigger": "skill-tool",        // or "skill-md-read"
    "client": "claude-code",
    "hookSource": "plugin",         // or "skill" (skill-frontmatter origin)
    "sessionId": "abc-123",         // null when client doesn't supply one
    "toolUseId": "toolu_abc123",    // null when client doesn't supply one
    "user_prompt": "fix the cart…"  // Claude Code only, ≤2000 chars; omitted otherwise
  },
  "result": "ok"
}
```

The hook does not report tool inputs, file contents, generated code, or
other tool arguments. It *does* capture `user_prompt` on Claude Code,
out-of-band: a `UserPromptSubmit` hook stashes the verbatim prompt to a
per-session file under a per-user (per-uid) temp directory
(`${TMPDIR:-/tmp}/shopify-ai-toolkit-telemetry-$(id -u)/`), written `0600`
so the prompt stays owner-only even on a shared `/tmp` fallback — local
only, never sent on its own. The `PostToolUse` path attaches
it as `user_prompt` only when a Shopify skill actually activates. Prompts
from sessions that never touch a Shopify skill are never transmitted, and
`OPT_OUT_INSTRUMENTATION=true` disables the capture entirely. On other
hosts (Cursor, Copilot) the hook carries no prompt — `user_prompt` there
comes from the per-skill script surfaces (`scripts/validate.mjs` for
skills with validation, `scripts/log_skill_use.mjs` for skills without).
The hook always also supplies the dedup keys (`sessionId` + `toolUseId`).

## What is _not_ reported

- Tool calls against the `shopify-dev-mcp` MCP server (already self-
  reported by `packages/dev-mcp/src/utils/instrumentation.ts`).
- Invocations of `scripts/search_docs.mjs` or `scripts/validate.mjs`
  inside a skill folder (already self-reported by
  `packages/shopify-dev-tools/src/agent-skills/scripts/instrumentation.ts`).
- Any tool call whose target is not a Shopify AI Toolkit skill or
  SKILL.md — the hook fires for every `PostToolUse` but only emits when
  it can identify a Shopify-owned skill.

## Opt-out

The hook honors `OPT_OUT_INSTRUMENTATION=true` — the same env var the
rest of the toolkit respects. Setting it disables every telemetry
surface in one place:

- Skill scripts (`reportValidation()`).
- MCP server tool calls (`recordUsage()`).
- This hook.

## Failure semantics

The hook is required to never break the host tool call. The script:

- Exits 0 even on JSON parse errors, missing `curl`, or unreachable
  endpoint.
- Emits `{"continue":true}` on stdout on every code path.
- Sends the HTTP request in the background with a 5-second timeout so
  agent tool loops are never delayed by network latency.

## Local testing

```bash
# Skill tool call (Claude Code) — plugin source
SHOPIFY_AI_TOOLKIT_HOOK_SOURCE=plugin \
echo '{"hook_event_name":"PostToolUse","tool_name":"Skill","tool_input":{"skill":"shopify-plugin:shopify-admin"},"session_id":"local","tool_use_id":"toolu_local"}' \
  | bash scripts/track-telemetry.sh

# Same call, skill-frontmatter source (default when the env var is unset).
echo '{"hook_event_name":"PostToolUse","tool_name":"Skill","tool_input":{"skill":"shopify-admin"},"session_id":"local","tool_use_id":"toolu_local"}' \
  | bash scripts/track-telemetry.sh

# SKILL.md read (VS Code)
echo '{"hook_event_name":"PostToolUse","tool_name":"read_file","tool_use_id":"x__vscode","tool_input":{"path":"/Users/me/.vscode/agent-plugins/github.com/Shopify/shopify-ai-toolkit/.github/plugins/shopify-ai-toolkit/skills/shopify-liquid/SKILL.md"}}' \
  | bash scripts/track-telemetry.sh

# Opt-out (no network call)
echo '{"tool_name":"Skill","tool_input":{"skill":"shopify-admin"}}' \
  | OPT_OUT_INSTRUMENTATION=true bash scripts/track-telemetry.sh
```

Override the endpoint for staging or local tests via `SHOPIFY_MCP_USAGE_ENDPOINT` (hook-only) or `SHOPIFY_DEV_INSTRUMENTATION_URL` (shared with `packages/shopify-dev-tools/src/http/index.ts`, used by the evals harness to black-hole telemetry — set this to redirect both hook and TS-side telemetry to the same target).

## Automated tests

Run the bash test suite:

```bash
bash packages/plugins/hooks/test/track-telemetry-test.sh
```

Bash plus `jq` (the suite guards for `jq` up front and fails with a clear message if it's missing) — no bats. Runs on every PR (ubuntu-latest + macos-latest) via `.github/workflows/test.yml`, so sed-portability regressions are caught on both GNU sed (Linux) and BSD sed (macOS).

The script supports a hidden `SKILL_TELEMETRY_TEST_MODE=1` env var that skips the curl call and writes the would-be request to stderr as `[TEST_TELEMETRY_ENDPOINT]`, `[TEST_TELEMETRY_HEADER]`, and `[TEST_TELEMETRY_BODY]` markers — that's the surface the test suite asserts on.

PowerShell parity tests are out of scope today (no `pwsh` in CI matrix); the `.ps1` mirrors the bash logic and the bash tests act as a proxy for shape correctness.

## Mirror layout

This directory lives at `packages/plugins/hooks/` in `ai-toolkit-source`
and rsyncs to `/hooks/` at the root of the public
`Shopify/Shopify-AI-Toolkit` mirror — matching the layout each agent's
plugin loader expects (`${CLAUDE_PLUGIN_ROOT}/hooks/...`,
`${CURSOR_PLUGIN_ROOT}/hooks/...`, `${PLUGIN_ROOT}/hooks/...`).

The two script files (`track-telemetry.sh`, `.ps1`) are *also* copied
into each generated skill's `scripts/` directory by
`packages/shopify-dev-tools/scripts/generate-agent-skills.ts`. The
skill-frontmatter hook invokes `$CLAUDE_PLUGIN_ROOT/scripts/track-telemetry.sh`:
Claude Code runs frontmatter-hook commands in the session cwd (not the skill
dir) and exposes no skill-dir variable, but it sets `$CLAUDE_PLUGIN_ROOT` to
the skill's own directory for a frontmatter hook, so the reference resolves on
standalone installs regardless of cwd. The command is guarded with `if [ -f ]`
so it is a silent no-op in plugin installs (where `$CLAUDE_PLUGIN_ROOT` is the
plugin root and the plugin-manifest hook already reports telemetry).
