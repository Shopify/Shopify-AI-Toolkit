---
name: building-workflows
description: "How to construct, validate, and submit a Shopify Flow workflow. Load whenever the user asks to create, edit, fix, copy, or delete a workflow. Covers JSON structure, the create-or-update mutation contract, task discovery, the pre-submission checklist, and worked examples."
metadata:
  author: Shopify Flow
  version: "0.1.0"
---

Load this skill when you're about to build or change a workflow. Pairs with [`workflow-runtime`](../workflow-runtime/SKILL.md) (env vars, conditions, Liquid) and [`special-tasks`](../special-tasks/SKILL.md) (scheduled triggers, Admin API requests, ForEach, Run Code, metafields, etc.).

## 1. Workflow JSON structure

Every workflow you submit to `workflow-create-or-update` must follow this shape:

```json
{
  "__metadata": { "version": 0.1 },
  "root": {
    "workflow_name": "Tag draft orders with NEW",
    "steps": [
      {
        "step_id": 1,
        "task_id": "shopify::admin::draft_order_created",
        "task_version": "0.1",
        "task_type": "TRIGGER",
        "config_field_values": []
      },
      {
        "step_id": 2,
        "task_id": "shopify::admin::add_draft_order_tags",
        "task_version": "0.1",
        "task_type": "ACTION",
        "config_field_values": [
          { "config_field_id": "draft_order_id", "value": "{\"value\": \"{{ draftOrder.id }}\", \"default_value\": \"\"}" },
          { "config_field_id": "tags", "value": "[\"NEW\"]" }
        ]
      }
    ],
    "links": [
      { "from_step_id": 1, "from_port_id": "output", "to_step_id": 2, "to_port_id": "input" }
    ],
    "patched_fields": []
  }
}
```

Required structure:

- `__metadata` and `root` at the top level.
- Inside `root`: `workflow_name`, `steps`, `links`, `patched_fields`.
- `workflow_name` uses sentence case ("Cancel high risk orders for customer", not Title Case).
- Each step has `step_id`, `task_id`, `task_version`, `task_type`, `config_field_values`.
- At least one `TRIGGER` step (entry point) and at least one `ACTION` step.

### Task types (UPPERCASE)

- `TRIGGER` — starts execution
- `ACTION` — performs operations
- `CONDITION` — branching logic
- `FOREACH` — iterate over a list
- `WAIT` — pause execution

## 2. Creating vs. updating

### To CREATE a new workflow

Build the JSON, then call:

```bash
scripts/call_tool.mjs --op workflow-create-or-update \
  --store <shop.myshopify.com> \
  --arguments-file /tmp/wf.json
```

where `/tmp/wf.json` contains `{"workflow_json": {...}}`. Leave `workflow_id` and `workflow_version` unset.

### To UPDATE an existing workflow

1. Look up the current state:
   ```bash
   scripts/call_tool.mjs --op workflow-lookup \
     --store <shop.myshopify.com> \
     --arguments '{"workflow_id":"gid://flow/Workflow/123"}'
   ```
2. Modify the returned JSON (only what the user asked — preserve everything else).
3. Submit with both `workflow_id` AND `workflow_version` set:
   ```json
   { "workflow_id": "gid://flow/Workflow/123", "workflow_version": "v7", "workflow_json": { ... } }
   ```

When to leave the IDs empty:
- Brand-new workflow.
- User explicitly asks to copy/duplicate.

When to keep the existing IDs:
- Fixing validation errors and retrying.
- User reports issues with their current workflow.
- Any modification to existing work.

### Preserving user modifications

When updating, the user may have made manual changes since the workflow was last automated. Read the full current state via `workflow-lookup` (or from the IDE's `<flow-app>.workflow` context if you've been given it), identify what's different from your mental model, and only change what the user asked. **Make surgical changes, preserve user work.** Don't rebuild from scratch.

## 3. Task discovery (the two-step workflow)

Before referencing any task, look it up. Don't memorize task IDs — verify them.

**Step 1 — search by natural language:**

```bash
scripts/call_tool.mjs --op task-search \
  --store <shop.myshopify.com> \
  --arguments '{"search_queries":["order created","add order tags","send email"]}'
```

Returns `{id, label, description, publisher, installed, version}` per task. Selection priority:

1. Prefer `installed: true` over `installed: false`.
2. Publisher priority: `shopify` > `flow` > `flow-connectors` > `shopify-app` > `non-shopify-app`.
3. Best semantic match if priority is tied.

**Step 2 — get configuration details:**

```bash
scripts/call_tool.mjs --op task-configuration \
  --store <shop.myshopify.com> \
  --arguments '{
  "tasks":[
    {"id":"shopify::admin::order_created","version":"0.1"},
    {"id":"shopify::admin::add_order_tags","version":"0.1"}
  ]
}'
```

Returns `config_fields` JSON (with validation rules, accepted values), `return_fields` JSON (the output shape), `task_type`, `input_port_id`, and `output_port_ids`.

**`task-configuration` is the source of truth for `config_field_id` values, query filters, and return fields. Never guess.**

## 4. Config field values

```json
"config_field_values": [
  { "config_field_id": "field_name", "value": "field_value" }
]
```

`config_field_id` values come from the `config_fields` JSON returned by `task-configuration`. The `value` is always a string, but the *content* of the string varies by field type — sometimes plain text, sometimes JSON, sometimes a Liquid-templated wrapper like `{"value": "{{ ... }}", "default_value": ""}`. Read the `config_fields` schema for the field to know which.

## 5. Errors and retry

The `workflow-create-or-update` op returns errors in named buckets:

- **`configFieldErrors`** — invalid config values, bad variable paths, typos, wrong formats. Fix with [`environment-paths-search`](../../ops/environment-paths-search.json) for path issues, or re-read `task-configuration` for field shape.
- **`conditionErrors`** — condition DSL syntax errors. See [`workflow-runtime`](../workflow-runtime/SKILL.md) §Conditions.
- **`foreachBodyErrors`** — wrong variable scope, ForEach item used outside the loop body. Check that `<list>Foreachitem` is only referenced inside steps connected to the `loop_body` port.
- **`taskErrors`** — task configuration issues. Re-read `task-configuration`.

When you get these errors, **fix them and retry with the SAME `workflow_id` + `workflow_version`** — do not create a new workflow.

**Never hand off a workflow with fixable validation errors.** The merchant cannot triage them.

### Informational errors (do NOT retry)

- Marketing automation email tasks — require manual setup in the merchant's tools.
- Transactional email connectors — require third-party apps to be installed.
- Iris alert tasks — hardcoded configuration; nothing to fix.

Tell the user what they need to do and stop.

## 6. Pre-submission checklist

Before calling `workflow-create-or-update`, verify:

- [ ] JSON has `__metadata` + `root` with `workflow_name`, `steps`, `links`, `patched_fields`.
- [ ] Task types are UPPERCASE: `TRIGGER`, `ACTION`, `CONDITION`, `FOREACH`, `WAIT`.
- [ ] At least one `TRIGGER` and at least one `ACTION`.
- [ ] Variable names are lowercase + direct access (no `.edges`, `.nodes`, `[0]`).
- [ ] Conditions use DSL syntax only — no Liquid `{{ }}` inside conditions.
- [ ] Liquid outputs only scalar values — no `| json` filter, no outputting full objects/arrays.
- [ ] All variable paths verified via `environment-paths-search` (no guessed paths).
- [ ] All task IDs and `config_field_id` values verified via `task-configuration` (no guessed names).
- [ ] All resource references (products, customers, collections...) resolved via `search-shop-resource` before being inlined.

If you cannot tick a box, stop and resolve before submitting.

## 7. Worked examples

Links shorthand: `step_id[port]→step_id`. The `to_port_id` is always `"input"`.

- `[output]` — port for `TRIGGER` and `ACTION` steps.
- `[true]` — `CONDITION` true branch (NOT `"output"`).
- `[false]` — `CONDITION` false branch.
- `[loop_body]` — `FOREACH` loop body.
- `[after]` — runs once after `FOREACH` completes.

### 7.1 Simple condition branching: tag high-value orders

Steps:

1. `TRIGGER` `shopify::admin::order_created`
2. `CONDITION` `shopify::flow::condition` — `(order.totalPrice > 500)`
3. `ACTION` `shopify::admin::add_order_tags` — tags: `["High-Value"]`

Links: `1[output]→2`, `2[true]→3`.

### 7.2 ForEach with nested condition: tag products in presale orders

Steps:

1. `TRIGGER` `shopify::admin::order_created`
2. `CONDITION` `(order.lineItems any? |lineItems_item| (lineItems_item.product.tags any? |tags_item| (tags_item == 'presale')))`
3. `FOREACH` `shopify::flow::foreach` on `order.lineItems`
4. `CONDITION` (in loop) `(lineItemsForeachitem.product.tags any? |tags_item| (tags_item == 'presale'))`
5. `ACTION` (in loop) `shopify::admin::add_product_tags` — tags: `["Ordered-Presale"]`, `product_id: lineItemsForeachitem.product.id`
6. `ACTION` (after loop) `shopify::flow::send_email` — staff notification

Links: `1[output]→2`, `2[true]→3`, `3[loop_body]→4`, `4[true]→5`, `3[after]→6`.

Key: the `loop_body` port runs steps inside the loop, `after` runs once when the loop finishes. Inside the loop, `lineItemsForeachitem` exposes each item.

### 7.3 Branching on both true and false: fraud prevention

Steps:

1. `TRIGGER` `shopify::admin::order_risk_analyzed`
2. `CONDITION` `(orderRiskLevel != 'High')`
3. `CONDITION` `(order.capturable == true)`
4. `ACTION` `shopify::admin::capture_payment`
5. `ACTION` `shopify::admin::add_order_tags` — tags: `["Payment-Hold"]`
6. `ACTION` `shopify::flow::send_email` — fraud alert

Links: `1[output]→2`, `2[true]→3`, `2[false]→6`, `3[true]→4`, `3[false]→5`.

Both `[true]` and `[false]` ports can connect to different actions — that's how you express if/else.

### 7.4 Scheduled trigger with Get Data: daily unfulfilled orders report

Steps:

1. `TRIGGER` `shopify::flow::scheduled_time` — daily at 9AM in shop's timezone (RRULE: `DTSTART;TZID=America/New_York:20250620T090000\nRRULE:FREQ=DAILY;INTERVAL=1;WKST=MO`).
2. `ACTION` `shopify::flow::fetch::orders` — query: `fulfillment_status:unfulfilled AND NOT status:cancelled`, sort by `CREATED_AT` desc, max 100.
3. `ACTION` `shopify::flow::send_email` — Liquid template loops over `getOrderData`.

Links: `1[output]→2`, `2[output]→3`.

Key: scheduled triggers use RRULE format with IANA timezone from shop context. `getOrderData` is a list — see [`workflow-runtime`](../workflow-runtime/SKILL.md) §Step output variables for how to count/iterate it. DTSTART must be a future date.

### 7.5 Admin API chaining: Order Edit (begin → modify per item → commit)

Steps:

1. `TRIGGER` `shopify::admin::order_created`
2. `ACTION` `shopify::admin::admin_api_operation` — `orderEditBegin`
3. `ACTION` `shopify::admin::admin_api_operation` — `orderEditAddShippingLine`, using `{{ sendAdminApiRequest.calculatedOrder.id }}` from step 2
4. `FOREACH` `shopify::flow::foreach` on `order.lineItems`
5. `ACTION` (in loop) `shopify::admin::admin_api_operation` — `orderEditAddLineItemDiscount`, using `{{ sendAdminApiRequest.calculatedOrder.id }}` and `{{ lineItemsForeachitem.id }}`
6. `ACTION` (after loop) `shopify::admin::admin_api_operation` — `orderEditCommit`

Links: `1[output]→2`, `2[output]→3`, `3[output]→4`, `4[loop_body]→5`, `4[after]→6`.

Key: each Admin API request's response becomes a chained variable (`sendAdminApiRequest`, `sendAdminApiRequest1`, ...). See [`special-tasks`](../special-tasks/SKILL.md) §Send Admin API Request for the `name`/`blob` shape.

### 7.6 Run Code for filtering + aggregation: alert on high-value fragile items

Steps:

1. `TRIGGER` `shopify::admin::order_created`
2. `ACTION` `shopify::flow::run_code` — sums prices of fragile-tagged line items
3. `CONDITION` `(runCode.fragileTotal > 200)`
4. `ACTION` `shopify::flow::send_email` — alert

Links: `1[output]→2`, `2[output]→3`, `3[true]→4`.

Run Code is appropriate here because Sum and the condition DSL alone can't filter items by tag and then aggregate. See [`special-tasks`](../special-tasks/SKILL.md) §Run Code Action for the config field structure and the input/script/output_schema contract.
