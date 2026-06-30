# Shopify Dev MCP - AI Agent Plugin

Connect your AI tools to the Shopify platform.

The Toolkit gives your agent access to Shopify's documentation, API schemas, and code validation for building apps, and store management through the CLI's store execute capabilities. For more info, [see the docs](https://shopify.dev/docs/apps/build/ai-toolkit).

## Install

- **For Claude Code**: In your terminal, run `claude plugin install`:

  ```
  claude plugin install shopify-ai-toolkit@claude-plugins-official
  ```

- **For OpenAI Codex**: In your terminal, run `codex plugin add`:

  ```
  codex plugin add shopify@openai-curated
  ```

- **For Antigravity CLI**: In your terminal, install the Shopify plugin:

  ```
  agy plugin install https://github.com/Shopify/shopify-ai-toolkit
  ```

- **For Cursor**: In Cursor Chat, add the Shopify plugin:

  ```
  /add-plugin shopify
  ```

- **For Hermes**: In your terminal, download the install script and run it:

  ```
  curl -fsSL https://raw.githubusercontent.com/Shopify/Shopify-AI-Toolkit/main/.hermes-plugin/install.sh -o /tmp/shopify-hermes-install.sh
  bash /tmp/shopify-hermes-install.sh
  ```

- **For VS Code**:

  1. Ensure the [Agent plugins](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) preview is enabled in your VS Code settings.

  2. Open the Command Palette (`Cmd+Shift+P` on macOS, `Ctrl+Shift+P` on Windows/Linux) and run:

     ```
     Chat: Install Plugin From Source
     ```

  3. When prompted, enter the repository URL:

     ```
     https://github.com/Shopify/shopify-ai-toolkit
     ```

## What you get

- **Docs and API schemas**: Search Shopify's documentation and API schemas without leaving your editor
- **Code validation**: Validate GraphQL queries, Liquid templates, and UI extensions against Shopify's schemas
- **Store management**: Manage your Shopify store through the CLI's store execute capabilities
- **Auto-updates**: The plugin updates automatically as new capabilities are released

## Telemetry

The skill scripts (`scripts/search_docs.mjs`, `scripts/validate.mjs`, `scripts/log_skill_use.mjs`) send a usage event to `https://shopify.dev/mcp/usage` on each invocation. The payload includes:

- tool name, skill name and version
- model name, client name, and client version (when supplied as flags)
- the search query text and search response or error text (for `search_docs.mjs`)
- the validation result, the validated code when present, and validator-specific context such as API name, extension target, filename, file type, theme path, and file list (for `validate.mjs`)
- artifact ID and revision number (when supplied)
- the user's most recent message verbatim (truncated to 2000 chars), when the agent passes it base64-encoded via `--user-prompt-base64` to `validate.mjs` (for skills with validation) or `log_skill_use.mjs` (for skills without). Encoding the prompt keeps untrusted message text out of shell syntax. Exactly one designated capture point per skill — `search_docs.mjs` does not carry user_prompt.
- the agent's `sessionId` and `toolUseId` (when supplied via `--session-id` / `--tool-use-id`) so analytics can join script events with the hook's `skill_invocation` event for the same activation.

The plugin also registers a `PostToolUse` hook (`hooks/track-telemetry.sh`, `.ps1`) on Claude Code, Cursor, and GitHub Copilot. It emits a `skill_invocation` event to the same endpoint whenever the agent calls the host `Skill` tool with a Shopify AI Toolkit skill or reads a `SKILL.md` from a recognized install path. The payload includes:

- skill name, skill version (when recoverable from the install path)
- trigger (`skill-tool` or `skill-md-read`)
- detected client (`claude-code` / `cursor` / `copilot-cli` / `vscode` / `vscode-insiders`)
- hook source (`plugin` or `skill`)
- the agent's `sessionId` and `toolUseId` (when supplied)
- on Claude Code only: the user's most recent prompt verbatim (truncated to 2000 chars), captured out-of-band via a `UserPromptSubmit` hook that stashes it locally and attached here only when a skill activates. Honors `OPT_OUT_INSTRUMENTATION`; other hosts carry no prompt on this surface.

The same script is also injected into each generated SKILL.md as a `hooks:` frontmatter block, so Claude Code emits the same event when skills are installed standalone (e.g. via `npx skills add Shopify/shopify-ai-toolkit`) without the plugin. Events from each source are labeled with `hookSource` and carry `sessionId` + `toolUseId` inside the body's `parameters` object, so downstream consumers can dedup on `(sessionId, toolUseId)` when both surfaces are installed.

The hook does not report tool inputs, file contents, generated code, or other tool arguments. On Claude Code it can additionally attach `user_prompt` (the most recent prompt verbatim) via the `UserPromptSubmit` stash, but only when a Shopify skill activates. On other hosts (Cursor, Copilot) the hook carries no prompt and `user_prompt` capture happens on the script surfaces only (`validate.mjs` for skills with validation, `log_skill_use.mjs` for skills without). See [`hooks/README.md`](./hooks/README.md) for full coverage details.

This is **on by default**. To opt out — for skill scripts, the MCP server, and the hook — set the environment variable:

```
OPT_OUT_INSTRUMENTATION=true
```

## Other install methods

If your platform doesn't support plugins, you can install agent skills or the Dev MCP server directly. For instructions, see [shopify.dev/docs/apps/build/ai-toolkit](https://shopify.dev/docs/apps/build/ai-toolkit).

## Contributing

Thanks for your interest but we don't accept pull requests. Any pull requests will be automatically closed.
