---
name: workflow-iac
description: Infrastructure-as-Code lifecycle for Shopify Flow workflows — local JSON files committed to git, validated against a shop, pushed and activated explicitly via the Shopify CLI.
---

This sub-skill covers the full IaC lifecycle: bootstrap → edit → validate → push → diff → activate. Load it when the user wants to track workflows in git, manage them as code, or iterate on a workflow file before pushing.

## Project model

A Flow IaC project is rooted at a directory containing `flow.toml`. Each workflow lives in its own subdirectory under `workflows/`:

```
my-flow-project/
  flow.toml
  workflows/
    high-value-orders/
      workflow.flow.json       # source of truth, edited and committed
      workflow.flow.lock.json  # last-pushed metadata, committed
      # optional: notes.md, sample-events/, fixtures, etc.
    welcome-email/
      workflow.flow.json
      workflow.flow.lock.json
```

The per-workflow folder gives you a workspace: drop notes, sample event JSON, screenshots, or anything else relevant alongside the workflow without cluttering the project root.

`flow.toml`:

```toml
store = "shop.myshopify.com"

[workflows]
dir = "workflows"
```

Lifecycle commands read `flow.toml` from the current directory or any ancestor. `--store` and `--workflows-dir` flags override the file when needed.

The lockfile records `workflow_id`, `workflow_definition_version`, `payload_sha256`, `store`, and `pushed_at`. Treat it as authoritative for the lifecycle commands — it tells `activate`, `diff`, `status`, and `push` which workflow on the shop the file maps to.

## Bootstrap (existing shop → IaC project)

Use this when adopting IaC on a shop that already has workflows in the UI:

```bash
node scripts/flow.mjs init --store shop.myshopify.com
node scripts/flow.mjs workflow pull --all
git add flow.toml workflows/
git commit -m "Bootstrap Flow IaC from shop.myshopify.com"
```

`pull --all` calls `list-workflows` to enumerate every workflow on the shop, then writes one file per workflow to the configured directory. Pass `--include-hidden` to include hidden workflows. Existing files are skipped unless `--force` is passed.

## Lifecycle

```bash
# 1. Edit workflows/high-value-orders/workflow.flow.json
#    The agent edits the JSON directly. Same shape as workflow-create-or-update tool args.

# 2. Validate against the shop (no writes):
node scripts/flow.mjs workflow validate workflows/high-value-orders/workflow.flow.json --store shop1.my.shop.dev

# 3. Push (creates or updates, writes/refreshes the lockfile):
node scripts/flow.mjs workflow push workflows/high-value-orders/workflow.flow.json --store shop1.my.shop.dev

# 4. Inspect drift between local and remote:
node scripts/flow.mjs workflow diff workflows/high-value-orders/workflow.flow.json --store shop1.my.shop.dev
#   Exit 0 = clean, exit 1 = differences

# 5. Activate the pushed definition:
node scripts/flow.mjs workflow activate workflows/high-value-orders/workflow.flow.json --store shop1.my.shop.dev

# 6. Deactivate when needed:
node scripts/flow.mjs workflow deactivate workflows/high-value-orders/workflow.flow.json --store shop1.my.shop.dev
```

## What the commands do under the hood

- **validate** — sets `X-Shopify-Is-Eval: true` on the upsert tool call. Same code path as `push`, but no DB writes. Returns shop-scoped validation errors.
- **push** — calls the upsert tool with `hidden: false` so the workflow is immediately visible/activatable. Writes a fresh lockfile with the returned `workflow_id` and `workflow_definition_version`.
- **pull** — fetches a single workflow, normalizes the JSON (sorted keys, 2-space indent, trailing newline), writes the file and lockfile. With `--all`: enumerates every workflow on the shop and writes one folder per workflow.
- **show** — prints a remote workflow's normalized JSON to stdout. No files written. Use to inspect a remote workflow without committing to a local copy.
- **diff** — pulls the remote into memory, normalizes both sides, prints unified diff (`--- remote`, `+++ local`). Added lines (`+`) = what `push` would change.
- **activate / deactivate** — resolves `workflow_id` and `workflow_definition_version` from the lockfile by default.
- **status** — walks the workflows directory and classifies every file: `clean` (matches remote), `drifted` (local ≠ remote), `new` (no lockfile yet), `orphaned` (lockfile but remote missing). Also flags `unknown` workflows that exist on the shop but aren't tracked locally. Exit 1 if anything other than `clean`.

Most lifecycle commands accept `--store`, but if a `flow.toml` is present in cwd or any ancestor, `--store` falls back to the `store` field in that file. Run inside a project and you usually don't need to pass it.

## Activation input modes

```bash
# (a) lockfile-driven (default)
node scripts/flow.mjs workflow activate workflows/high-value-orders/workflow.flow.json --store shop.myshopify.com

# (b) explicit id + version (no lockfile required)
node scripts/flow.mjs workflow activate \
  --workflow-id 01HQK... \
  --workflow-version 01HQL... \
  --store shop.myshopify.com

# (c) latest main version via lookup
node scripts/flow.mjs workflow activate \
  --workflow-id 01HQK... \
  --use-latest \
  --store shop.myshopify.com
```

`--workflow-id` alone is rejected — pass `--workflow-version` for an exact pin or `--use-latest` to resolve via workflow_lookup.

## Hidden workflow gotcha

Workflows created from the UI default to visible. Workflows created via Sidekick chat (the upsert tool path without IaC) default to `hidden: true` and **cannot be activated until unhidden**. The lifecycle `push` command always sends `hidden: false` — this is the IaC default and is what you want.

If you encounter `WORKFLOW_HIDDEN` from `activate`, it means the workflow was previously created hidden (chat path or pre-IaC). Run `push` again on the file to flip `hidden: false`, then activate.

## Format normalization

Both `push` and `pull` write files in canonical form: keys sorted alphabetically (recursively), 2-space indent, trailing newline. This means `git diff` reflects real workflow changes rather than formatting noise. Don't reformat by hand — let the CLI normalize.

## Worked example: end-to-end

```bash
# Once flow.toml is initialized, --store is read from it. You can omit --store
# from every command below if cwd is inside the project.
node scripts/flow.mjs init --store shop1.my.shop.dev

# Initial scaffold from a template
node scripts/flow.mjs tool call template-search --arguments '{"search_queries":["tag high-value orders"]}'

# Save the chosen template's workflow_json into a local file
# workflows/high-value-orders/workflow.flow.json

node scripts/flow.mjs workflow validate workflows/high-value-orders/workflow.flow.json
# → Workflow is valid.

node scripts/flow.mjs workflow push workflows/high-value-orders/workflow.flow.json
# → Pushed workflow 01HQK... (version 01HQL...). Lockfile updated.

git add workflows/high-value-orders/
git commit -m "Add high-value-orders workflow"

node scripts/flow.mjs workflow activate workflows/high-value-orders/workflow.flow.json
# → Activated workflow 01HQK... (version 01HQL...).

node scripts/flow.mjs workflow status
# → clean: 1, drifted: 0, new: 0, orphaned: 0, unknown: 0
```

After future edits to the JSON: `validate` → fix any errors → `push` → `diff` (should be clean) → optionally `activate` if workflow needs the new definition active.

## Rules

- Commit both `workflow.flow.json` and `workflow.flow.lock.json` per workflow folder. Commit `flow.toml`.
- Never hand-edit the lockfile; let `push` and `pull` write it.
- `validate` before `push` for fast feedback. Activation runs validation again, but earlier is cheaper.
- When two people edit the same workflow file in parallel, expect git conflicts on the JSON, not on the lockfile (each push refreshes it).
- If a merchant edits the workflow in the Flow UI after a push, the next `diff` (or `status`) will show drift. Decide whether to `pull` (accept their edits) or `push` (overwrite back to your local truth).
- Run `status` in CI to fail on drift between repo and shop.
- Never confirm a `push` or `activate` without explicit user OK if the change isn't trivial.
