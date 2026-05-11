---
name: special-tasks
description: "Per-task configuration quirks for Shopify Flow's special task types: scheduled triggers, Send Admin API Request, Send HTTP Request, sending emails (internal/transactional/marketing), Condition, ForEach, Error Alert, Run Code, metafields, fields with arguments (translations/inCollection), metaobjects, manual triggering, and Get Analytics Data (ShopifyQL). Load when configuring any of these."
metadata:
  author: Shopify Flow
  version: "0.1.0"
---

This skill covers the task-specific config quirks that go beyond the generic patterns in [`building-workflows`](../building-workflows/SKILL.md). For each, the pattern is: discover the task with `task-search`, read its `config_fields` via `task-configuration`, then format the values per the rules below.

## Scheduled time trigger

Task ID: `shopify::flow::scheduled_time`. Task type: `TRIGGER`.

Recurrence format:

```
["DTSTART;TZID=<timezone>:<datetime>\nRRULE:<recurrence_rule>"]
```

Components:

- `DTSTART` — start datetime, **must be in the future**. Format: `YYYYMMDDTHHMMSS`.
- `TZID` — IANA timezone (`America/New_York`, `Europe/London`, etc.). Use `shopTimeZone` or `userTimeZone` from the IDE's `<shop>` context.
- `RRULE` — recurrence rule.

Example — every 10 minutes starting Jun 17 2025 at 10:00 EDT:

```json
{
  "config_field_values": [
    {
      "config_field_id": "recurrence",
      "value": "[\"DTSTART;TZID=America/Toronto:20250617T100000\\nRRULE:FREQ=MINUTELY;INTERVAL=10;WKST=MO\"]"
    }
  ]
}
```

`RRULE` options:

- `FREQ`: `MINUTELY`, `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`.
- `INTERVAL`: number of frequency units between occurrences.
- `WKST`: week start day (`MO`–`SU`).
- `BYHOUR`, `BYMINUTE`, `BYDAY`: time-of-day / day-of-week constraints.

Constraints:

- Never use a past `DTSTART`.
- Escape newlines as `\\n` in the JSON string.
- **Minimum interval: 10 minutes** (e.g. `FREQ=MINUTELY;INTERVAL=10`).
- **Maximum interval: 1 year.**

## Send Admin API Request

Task ID: `shopify::admin::admin_api_operation`.

**Use only when no dedicated task exists.** Most common operations (tagging, updating inventory, sending emails) have purpose-built tasks with simpler config — search first via `task-search`. This task is for advanced mutations not covered by existing tasks.

Critical rules:

1. **Verify the mutation exists** in the Admin GraphQL API before using it. In BYO, use an Admin GraphQL-capable Shopify AI Toolkit skill/tool if one is available. Never guess mutation names.
2. **Operations needing begin/commit semantics** (Order Edit) need multiple chained requests — see worked example 7.5 in [`building-workflows`](../building-workflows/SKILL.md).

Format — `api_call` config field value:

```json
{
  "name": "mutationName",
  "blob": "{\"param1\": \"value1\", \"param2\": \"value2\"}"
}
```

Rules:

- Use the mutation **name only** (`refundCreate`, `orderEditBegin`). Do NOT include the `mutation` keyword or wrap in GraphQL syntax.
- `blob` must be valid JSON (NOT GraphQL syntax).
- Properly JSON-escape the blob inside the outer string.

Examples (the `\n` are literal newlines inside the JSON string):

Single parameter:

```json
{
  "name": "orderCancel",
  "blob": "{\n  \"orderId\": \"{{ order.id }}\"\n}"
}
```

Multiple parameters:

```json
{
  "name": "refundCreate",
  "blob": "{\n  \"orderId\": \"{{ order.id }}\",\n  \"note\": \"Refund requested\",\n  \"notify\": true\n}"
}
```

Nested input:

```json
{
  "name": "customerUpdate",
  "blob": "{\n  \"input\": {\n    \"id\": \"{{ order.customer.id }}\",\n    \"tags\": [\"VIP\", \"Repeat-Buyer\"],\n    \"note\": \"Updated via Flow\"\n  }\n}"
}
```

### Chaining

Each Admin API request response becomes a variable: `sendAdminApiRequest`, `sendAdminApiRequest1`, `sendAdminApiRequest2`. Access fields via dot: `sendAdminApiRequest.calculatedOrder.id`.

Common pattern for Order Edit: **Begin → Modify (add/remove/discount) → Commit.** See building-workflows §7.5.

## Send HTTP Request

Required `config_field_values`:

- `method` — `GET`, `POST`, `PUT`, `DELETE`, or `PATCH`.
- `url` — full endpoint URL.
- `headers` — array as a string: `"[[\"Key1\",\"value1\"],[\"Key2\",\"value2\"]]"`.
- `body` — request payload (for `POST`/`PUT`/`PATCH`).
- `on_client_error` — `retry`, `fail`, or `ignore`.
- `on_server_error` — `retry`, `fail`, or `ignore`.

Example POST:

```json
{
  "config_field_values": [
    { "config_field_id": "method", "value": "POST" },
    { "config_field_id": "url", "value": "https://api.example.com/notify" },
    { "config_field_id": "headers", "value": "[[\"Content-Type\",\"application/json\"],[\"Authorization\",\"Bearer API_KEY\"]]" },
    { "config_field_id": "body", "value": "{\"order_id\":\"{{ order.id }}\",\"customer\":\"{{ order.customer.email }}\"}" },
    { "config_field_id": "on_client_error", "value": "retry" },
    { "config_field_id": "on_server_error", "value": "retry" }
  ]
}
```

API key placeholders — when the merchant hasn't given you the actual key, use a descriptive placeholder and call it out in your reply: `YOUR_API_KEY`, `SHIPSTATION_API_KEY`, `SLACK_WEBHOOK_URL`.

## Sending emails

**Internal email (to shop staff):** Task ID `shopify::flow::send_email`. Configure recipients, subject, and a Liquid-rendered body.

**Transactional email (to customers):** Search via `task-search` for "Send transactional email". Common 3rd-party publishers: FlowMail, DotDigital, FlowBuddy. Prefer `installed: true`. If none installed, tell the user they need to install the connector — do not retry.

**Marketing email:** Task ID `shopify::email::execute_marketing_activity`. **Requires manual template configuration** in the merchant's email tool. Inform the user and stop.

## Condition task

```json
{
  "step_id": 2,
  "task_id": "shopify::flow::condition",
  "task_version": "0.1",
  "task_type": "CONDITION",
  "config_field_values": [
    { "config_field_id": "condition", "value": "(order.totalPrice > 100)" }
  ]
}
```

Condition DSL syntax in [`workflow-runtime`](../workflow-runtime/SKILL.md) §Condition DSL. Output ports are `true` and `false` (NOT `output`).

## ForEach task

Task ID: `shopify::flow::foreach`. **Use `listpath` (NOT `list`)**:

```json
{
  "step_id": 3,
  "task_id": "shopify::flow::foreach",
  "task_version": "0.1",
  "task_type": "FOREACH",
  "config_field_values": [
    { "config_field_id": "listpath", "value": "order.lineItems" }
  ]
}
```

Inside the loop, items are exposed as `<listName>Foreachitem`:

- `order.lineItems` → `lineItemsForeachitem`
- `getOrderData` → `getOrderDataForeachitem`

Output ports: `loop_body` (for steps inside the loop) and `after` (for steps that run once after the loop completes).

## Error alert task

Task ID: `shopify::iris::send_shopify_alert_for_errors`. **Has hardcoded config — leave `config_field_values` empty**:

```json
{
  "step_id": 4,
  "task_id": "shopify::iris::send_shopify_alert_for_errors",
  "task_version": "0.1",
  "task_type": "ACTION",
  "config_field_values": []
}
```

If validation reports a missing config field, do NOT add config — this is an informational error; tell the user about the underlying setup requirement and stop.

## Run Code action

Task ID: `shopify::flow::run_code`. **Last resort.** Before reaching for it, check whether the problem can be solved with:

1. The condition DSL (see [`workflow-runtime`](../workflow-runtime/SKILL.md) §Condition DSL) for boolean logic.
2. The Sum task (`shopify::flow::sum`) or Count task (`shopify::flow::count`) for aggregation.
3. A directly available environment path discovered via `environment-paths-search`.

Use Run Code only when none of the above can express what's needed (e.g. filter-then-aggregate by a tag value).

Three required config fields:

- `input` — a **GraphQL query against the Flow environment** (NOT the Shopify Admin API). Pulls trigger / step data into the script.
- `script` — JavaScript: `export default function main(input) { ... }`.
- `output_schema` — GraphQL SDL defining the return type.

Example `config_field_values`:

```json
[
  {
    "config_field_id": "input",
    "value": "query {\n  order {\n    note\n    lineItems {\n      title\n      quantity\n    }\n  }\n}"
  },
  {
    "config_field_id": "script",
    "value": "export default function main(input) {\n  const hasGift = input.order.lineItems.some(item => item.title.includes('Gift'));\n  return { hasGiftItem: hasGift, itemCount: input.order.lineItems.length };\n}"
  },
  {
    "config_field_id": "output_schema",
    "value": "type Output {\n  \"Whether order contains a gift item\"\n  hasGiftItem: Boolean!\n  \"Total number of line items\"\n  itemCount: Int!\n}"
  }
]
```

Access the output via the step name: `runCode.hasGiftItem`, `runCode.itemCount`.

Limitations:

- No `async`/`await`.
- No `Promise`, `setTimeout`, `setInterval`.
- No `fetch` or other network I/O.
- No `import` of external modules.

## Metafields

**Why `patched_fields`?** Metafields are NOT automatically available in Flow. Add them to the `patched_fields` array on the workflow root to expose them as workflow variables.

Process:

1. Query the metafield definition with an Admin GraphQL-capable skill/tool.
2. Check `patched_fields` for an existing entry with the same arguments.
3. If found, use directly: `product.metafieldHandle.value`.
4. If not, add a new entry.

Format:

```json
{
  "patched_fields": [
    {
      "field": "metafield",
      "arguments": { "key": "loyalty_tier", "namespace": "custom" },
      "handle": "loyalty_tier",
      "patched_type": "CUSTOMER",
      "merchant_configured": true
    }
  ]
}
```

Supported `patched_type` values: `PRODUCT`, `CUSTOMER`, `ORDER`, `VARIANT`, etc.

Liquid usage:

```liquid
{{ product.customHandle.value }}
{{ customer.loyaltyTier.value }}
```

## Fields with arguments (generic)

For GraphQL fields with arguments other than metafields — translations, `inCollection`, `publishedOnPublication`, etc.

Use `environment-paths-search` and [`object-type-definition-search`](../../ops/object-type-definition-search.json) to discover field structure, arguments, and return types. Check `patched_fields` for an existing entry with the same arguments before adding a new one. For ID arguments, use `search-shop-resource` to find the entity GID.

Format:

```json
{
  "field": "fieldName",
  "arguments": { "argName": "argValue" },
  "handle": "yourHandle",
  "patched_type": "TYPE",
  "merchant_configured": true
}
```

Translations example:

```json
{
  "field": "translations",
  "arguments": { "locale": "en" },
  "handle": "englishTranslation",
  "patched_type": "PRODUCT",
  "merchant_configured": true
}
```

```liquid
{{ product.englishTranslation.key }}
{{ product.englishTranslation.value }}
```

`inCollection` example:

```json
{
  "field": "inCollection",
  "arguments": { "id": "gid://shopify/Collection/456789" },
  "handle": "inSummerSale",
  "patched_type": "PRODUCT",
  "merchant_configured": true
}
```

```liquid
{{ product.inSummerSale }}
```

## Metaobjects

**Metaobject triggers:**

1. Use `search-shop-resource` to get the metaobject definition.
2. Use the **GID of the definition** in the trigger config.

**Get Metaobject Entry:** for a specific instance, use the **GID of the definition** + the **handle of the instance**.

**Get Metaobject Entries:** for all entries, use the **GID of the definition** only.

## Manually triggering workflows

Some triggers support manual fire from the admin UI: `order_created`, `draft_order_created`, `product_created`, `customer_created`.

How: resource page → select item → "More actions" → "Run Flow Automation" → choose workflow.

Useful to flag in your reply when the merchant might want to test before enabling the trigger.

## Get Analytics Data (ShopifyQL) — gated

This action is gated on the `f_flow_execute_shopifyql` verdict flag. If your environment has it enabled:

Task ID: `shopify::flow::execute_shopifyql`.

**Never write your own ShopifyQL query without schema support.** In BYO, the user is expected to provide the query, or you compose it from the user's request and the Admin Analytics schema. Use the query exactly as provided — preserve whitespace and newlines.

After generating the query, ALWAYS call [`shopifyql-query-fields`](../../ops/shopifyql-query-fields.json) with that query to get the available column names:

```bash
scripts/call_tool.mjs --op shopifyql-query-fields \
  --store <shop.myshopify.com> \
  --arguments '{"query":"<exact query>"}'
```

The response shows `columns: [{name, type}]` — these are the only fields you can reference on each row.

### Step name → variable

"Get analytics data" → `getAnalyticsData`. Multiple instances: `getAnalyticsData1`, `getAnalyticsData2`.

The step returns an object with key `rows` (array). Each item in `rows` has the columns from `shopifyql-query-fields` as fields.

```liquid
{% for rows_item in getAnalyticsData.rows %}
  {{ rows_item.product_title }}
  {{ rows_item.quantity_ordered }}
{% endfor %}
```

Rules:

- **Never use fields not returned by `shopifyql-query-fields`.**
- **Never access `rows` with `.first`, `.last`, or `[]`** — use Liquid filters or a `for` loop.
  - Bad: `rows.first`
  - Good: `rows | last`
- **Never treat `rows` as a single object.** It is always an array.
