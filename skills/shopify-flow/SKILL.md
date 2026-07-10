---
name: shopify-flow
description: "Build, edit, inspect, or debug Shopify Flow workflows. Use for Flow templates, tasks, workflow JSON, environment paths, conditions, Liquid in Flow, shop resource lookups, ShopifyQL fields, test-event planning, and the workflow IaC lifecycle (validate / push / pull / diff / activate). Uses a CLI script for execution; do not call Flow or internal HTTP endpoints directly."
compatibility: Requires Node.js 18+
metadata:
  author: Shopify
  version: "0.9.0"
---

You are helping a developer work with Shopify Flow workflows from their IDE.
Flow is Shopify's automation product: workflows are directed graphs of triggers, conditions, actions, waits, and loops that run against a shop's data.

The skill ships a bundled CLI at `scripts/flow.mjs`. Use it for all Flow operations — do not call Flow or Sidekick HTTP endpoints directly.

## Auth

The CLI authenticates with a **store access token** obtained via `shopify store auth` (the same credential `shopify store execute` uses). Authenticate the target shop once, then every Flow command reuses the cached token automatically:

```bash
shopify store auth --store shop.myshopify.com   # one-time, opens browser (PKCE)
node scripts/flow.mjs workflow list --store shop.myshopify.com
```

There is **no Identity / device-login step** — the token is scoped to the store, not to a Shopify user. `shopify store auth` can hold credentials for several stores at once, so each Flow command still needs to know which store via `--store` or `flow.toml` (see below).

If the cached token is missing or expired, the command exits with a re-auth instruction. Run the printed `shopify store auth --store <shop> …` command, then retry — do not guess scopes or retry blindly.

Requires Node.js 18+ and a network connection.

## Local dev environment

When the target shop's domain ends with `.shop.dev` (e.g. `shop1.my.shop.dev`), set `SHOPIFY_SERVICE_ENV=local` so the script routes to local Flow + Sidekick services:

```bash
export SHOPIFY_SERVICE_ENV=local
# or prefix each invocation:
SHOPIFY_SERVICE_ENV=local node scripts/flow.mjs workflow:status
```

For production `*.myshopify.com` stores, leave it unset.

## Discovery and inspection

```bash
# Find templates by business goal
node scripts/flow.mjs template search "fraud prevention" "high risk orders"

# Save a template into the project as a new workflow folder (the "start a new workflow" path)
# `--as` is the folder slug. The template_id comes from a prior `template search` result.
node scripts/flow.mjs template save 01HQK000000000000000000000 --as fraud-prevention

# Find tasks (triggers, conditions, actions, etc.)
node scripts/flow.mjs task search "order created" "send email"

# Filter task search by type (trigger, action, condition, foreach, wait)
node scripts/flow.mjs task search "tagging" --type action

# Get a task's full configuration + return-field schema
node scripts/flow.mjs task describe shopify::admin::order_created@0.1

# Find environment field paths under an Admin API root type
node scripts/flow.mjs env search Order "customer email"

# Resolve the columns a ShopifyQL query produces
node scripts/flow.mjs shopifyql columns "FROM sales SHOW gross_sales BY product_title SINCE -7d"

# Search for a Shopify resource (routes through Sidekick → Admin API)
node scripts/flow.mjs resource search PRODUCT shoes --limit 5
```

All commands accept `--store <shop.myshopify.com>`. If you're inside a Flow IaC project (a directory with `flow.toml`), `--store` falls back to the file's `store` field.

Default output is tab-separated columns — grep / awk it directly, no parser needed. Pass `--json` only when you need the full structured payload (config field schemas, return field definitions, raw task metadata).

When validation fails, the script prints the error. Read the error — do not retry with guessed argument names, paths, scopes, fields, or enum values.

## Workflow IaC lifecycle

Initialize a project and bootstrap from an existing shop:

```bash
node scripts/flow.mjs init ./my-project --store shop.myshopify.com   # creates ./my-project/flow.toml
node scripts/flow.mjs init --store shop.myshopify.com                # writes flow.toml in cwd
cd ./my-project && node scripts/flow.mjs workflow pull --all
```

Day-to-day:

```bash
node scripts/flow.mjs workflow validate <file>     # dry-run validation, no DB writes
node scripts/flow.mjs workflow push     <file>     # writes <file>.flow.lock.json
node scripts/flow.mjs workflow pull     --workflow-id <id> --out <file>
node scripts/flow.mjs workflow show     <id>       # print remote JSON to stdout
node scripts/flow.mjs workflow diff     <file>     # exit 0 = clean, 1 = drift
node scripts/flow.mjs workflow activate <file>     # uses lockfile for id+version
node scripts/flow.mjs workflow deactivate <file>
node scripts/flow.mjs workflow list                # remote workflows on the shop
node scripts/flow.mjs workflow status              # local vs. remote audit
```

Load `skills/workflow-iac/SKILL.md` for the full lifecycle walkthrough.

## Rules

- Always have a store. Pass `--store`, or run inside a project with `flow.toml`. Ask if neither is available.
- The store must be authenticated with `shopify store auth --store <shop>` first. If a command fails with a re-auth instruction, run the printed `shopify store auth …` command and retry.
- Search templates (`template search`) before designing a new workflow.
- `task search` then `task describe` before referencing a task ID, version, field ID, port, or return field.
- `env search` before writing conditions or Liquid paths. Run it at most twice — pick the best match from the results rather than issuing a third search.
- `workflow show` (or `pull`) before modifying an existing workflow.
- Confirm before any mutating call: `workflow push`, `workflow activate`, `workflow deactivate`, test-event firing.
- Surface tool errors directly. Do not retry with guessed values.

## Reference Files

Load these only when the task needs them:

- `skills/workflow-iac/SKILL.md`: IaC lifecycle for git-tracked workflows.
- `skills/building-workflows/SKILL.md`: workflow JSON shape, create/update flow, task discovery, worked examples.
- `skills/workflow-runtime/SKILL.md`: environment variables, condition DSL, Flow Liquid restrictions.
- `skills/special-tasks/SKILL.md`: scheduled triggers, Send Admin API Request, ForEach, Run Code, metafields, ShopifyQL.
- `skills/shopify-search-syntax/SKILL.md`: search query syntax for Get Data tasks.
- `skills/running-test-events/SKILL.md`: test-event and sample-data discipline.
- `skills/flow-best-practices/SKILL.md`: response discipline and workflow quality checks.
