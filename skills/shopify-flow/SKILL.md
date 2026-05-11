---
name: shopify-flow
description: "Build, edit, inspect, or debug Shopify Flow workflows. Use for Flow templates, tasks, workflow JSON, environment paths, conditions, Liquid in Flow, shop resource lookups, ShopifyQL fields, test-event planning, and the workflow IaC lifecycle (validate / push / pull / diff / activate). Uses Shopify CLI for execution; do not call Flow or internal HTTP endpoints directly."
compatibility: Requires Node.js and Shopify CLI
metadata:
  author: Shopify
  version: "0.7.0"
---

You are helping a developer work with Shopify Flow workflows from their IDE.
Flow is Shopify's automation product: workflows are directed graphs of triggers, conditions, actions, waits, and loops that run against a shop's data.

The CLI exposes Flow as first-class commands (no JSON tool dispatch). Discover them with `shopify flow --help` or `shopify flow workflow --help`.

## Discovery and inspection

```bash
# Find templates by business goal
shopify flow template search "fraud prevention" "high risk orders"

# Save a template into the project as a new workflow folder (the "start a new workflow" path)
# `--as` is the folder slug. The template_id comes from a prior `template search` result.
shopify flow template save 01HQK000000000000000000000 --as fraud-prevention

# Find tasks (triggers, conditions, actions, etc.)
shopify flow task search "order created" "send email"

# Get a task's full configuration + return-field schema
shopify flow task describe shopify::admin::order_created@0.1

# Find environment field paths under an Admin API root type
shopify flow env search Order "customer email"

# Show a GraphQL type's structure (fields, args, return types)
shopify flow type show Product

# Resolve the columns a ShopifyQL query produces
shopify flow shopifyql columns "FROM sales SHOW gross_sales BY product_title SINCE -7d"

# Search for a Shopify resource (routes through Sidekick → Admin API)
shopify flow resource search PRODUCT shoes --limit 5
```

All commands accept `--store <shop.myshopify.com>`. If you're inside a Flow IaC project (a directory with `flow.toml`), `--store` falls back to the file's `store` field. `--json` is available for scripting.

When validation fails, the CLI prints the error with the canonical example. Read the error — do not retry with guessed argument names, paths, scopes, fields, or enum values.

Never call Flow HTTP APIs directly. Never invent or paste bearer tokens.

## Workflow IaC lifecycle

Initialize a project and bootstrap from an existing shop:

```bash
shopify flow init --store shop.myshopify.com
shopify flow workflow pull --all
```

Day-to-day:

```bash
shopify flow workflow validate <file>     # dry-run validation, no DB writes
shopify flow workflow push     <file>     # writes <file>.flow.lock.json
shopify flow workflow pull     --workflow-id <id> --out <file>
shopify flow workflow show     <id>       # print remote JSON to stdout
shopify flow workflow diff     <file>     # exit 0 = clean, 1 = drift
shopify flow workflow activate <file>     # uses lockfile for id+version
shopify flow workflow deactivate <file>
shopify flow workflow list                # remote workflows on the shop
shopify flow workflow status              # local vs. remote audit
```

Load `skills/workflow-iac/SKILL.md` for the full lifecycle walkthrough.

## Rules

- Always have a store. Pass `--store`, or run inside a project with `flow.toml`. Ask if neither is available.
- Search templates (`flow template search`) before designing a new workflow.
- `flow task search` then `flow task describe` before referencing a task ID, version, field ID, port, or return field.
- `flow env search` before writing conditions or Liquid paths.
- `flow workflow show` (or `pull`) before modifying an existing workflow.
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
