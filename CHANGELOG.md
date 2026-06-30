# shopify-plugin

## 1.5.2

### Patch Changes

- fd29ec1: Update the AI Toolkit plugin README installation instructions to match the public docs. (Retroactive changeset for #1162.)

## 1.5.1

### Patch Changes

- b1a40b9: Use `log!` + `process::abort()` in the Functions `main.rs` example so the documented template matches the runtime the rest of the SKILL recommends.

## 1.5.0

### Minor Changes

- f9cef30: Add Codex repo marketplace metadata for installing the Shopify plugin from a marketplace source.

### Patch Changes

- 4d50229: App review now retrieves the requirements page with the Shopify CLI's `shopify doc fetch`, giving a cleaner, more predictable fetch of the canonical Markdown than ad-hoc browser or web-fetch retrieval.
- 5cf5a15: Fix invalid `s-badge tone="success"` examples in the checkout and customer-account extension instructions (their badge tone is `auto`/`neutral`/`critical`).
- 0da06ce: store execute attribution: add an `m:<model>` tag to `SHOPIFY_CLI_AGENT_INFO`, give concrete per-field examples, disambiguate the version field, and add a "use `none` if unknown" rule so agent-run CLI commands stop reporting generic provider/version values and start capturing the actual model.
- 6897a17: Remove stale JS template-literal `\$` escapes from the Functions instructions so example GraphQL operations use valid `$variable` syntax.
- b222a16: Reduce false positives in theme validation by skipping single-codeblock checks that require co-resident files, including snippets/assets/blocks/locales.

  Treat `WARNING` and `INFO` theme-check findings as advice rather than failures across MCP and CLI theme validators, while still surfacing them in result detail.

- 87b0111: Reject duplicate theme codeblock paths instead of silently overwriting them, and document the `--context <theme|app>` flag in the stateless validation instructions.

## 1.4.1

### Patch Changes

- 68c6757: Capture user_prompt out-of-band on Claude Code: a `UserPromptSubmit` hook stashes the verbatim prompt locally and the `PostToolUse` telemetry hook attaches it (truncated to 2000 chars) when a Shopify skill activates. Honors `OPT_OUT_INSTRUMENTATION`; other hosts are unchanged.

## 1.4.0

### Minor Changes

- 64d4b72: Capture the user's most recent prompt (verbatim, truncated to 2000 chars) in skill telemetry. Each skill ships exactly one user_prompt-capturing script: `validate.mjs` for skills with validation, or a new `log_skill_use.mjs` for skills without. The hook does not carry user_prompt — it identifies the activation and supplies dedup keys (`sessionId`, `toolUseId`). Honors `OPT_OUT_INSTRUMENTATION=true`.
- d1533d2: Add version-aware Shopify API context, search, validation, and generated skills.
- f9d177b: Add a `PostToolUse` telemetry hook to the Claude Code, Cursor, and GitHub Copilot plugin manifests that reports `skill_invocation` events when the agent calls the host `Skill` tool with a Shopify AI Toolkit skill or reads a `SKILL.md`. Closes the telemetry gap for markdown-only skills that never invoke a script. Honors `OPT_OUT_INSTRUMENTATION=true`; the hook never reports tool inputs, file contents, prompts, or code.
- 84645c5: Inject a `hooks:` block into every generated `SKILL.md` so Claude Code emits `skill_invocation` telemetry when skills are installed standalone (e.g. `npx skills add Shopify/shopify-ai-toolkit`), not only when the plugin is installed. Events from the plugin-manifest and skill-frontmatter hooks are labeled with `hookSource` and carry the agent's `sessionId` + `toolUseId` inside the body's `parameters` object, so downstream consumers can dedup on `(sessionId, toolUseId)` when both surfaces fire for the same tool call.

### Patch Changes

- 19a9a93: Fix the skill-frontmatter telemetry hook to resolve its script via `$CLAUDE_PLUGIN_ROOT` so standalone Claude Code skill installs emit `skill_invocation` instead of failing with a no-such-file hook error.
- a137176: Pass the captured user prompt to skill telemetry as a base64 argument (`--user-prompt-base64`) instead of a shell heredoc, closing a shell-injection seam for prompts containing the heredoc delimiter.

## 1.3.0

### Minor Changes

- d9be812: Add Hermes client manifest (`.hermes-plugin/`).

  Hermes users can now install the Shopify AI Toolkit with a single command:

  ```
  curl -fsSL https://raw.githubusercontent.com/Shopify/Shopify-AI-Toolkit/main/.hermes-plugin/install.sh | bash
  ```

  The manifest resolves skills from the shared `skills/` folder — no
  vendoring, no separate sync step. Re-running the install command updates
  the plugin to the latest published version.

## 1.2.2

### Patch Changes

- 716d22b: `shopify-app-store-review` skill now points the agent at the canonical shopify.dev requirements page (https://shopify.dev/docs/apps/launch/app-store-review/app-store-ai-self-review-requirements) instead of carrying a hand-maintained inline copy, and adds 5.x category-specific requirements. Output format and status taxonomy are unchanged. (Retroactive changeset for #722, which merged without one.)
- f8d1abd: Disclose default-on telemetry more clearly in mirrored plugin install surfaces and generated skill privacy notices, including the opt-out environment variable. Clarify that validation and search scripts report specific request data to `shopify.dev/mcp/usage`.
- 716d22b: Skill validate scripts (`validate_graphql`, `validate_components`, `validate_functions`, `validate_theme`) now emit the same markdown summary the MCP `validate_*_codeblocks` tools return, including artifact ID and revision lines. The id is auto-minted when not supplied and echoed back to the agent, matching the MCP behavior so retries can chain across revisions on either surface.

## 1.2.1

### Patch Changes

- aab0a72: `shopify-app-store-review` skill now points the agent at the canonical shopify.dev requirements page (https://shopify.dev/docs/apps/launch/app-store-review/app-store-ai-self-review-requirements) instead of carrying a hand-maintained inline copy, and adds 5.x category-specific requirements. Output format and status taxonomy are unchanged. (Retroactive changeset for #722, which merged without one.)

## 1.2.0

### Minor Changes

- d7608c7: Changeset to force a new release
