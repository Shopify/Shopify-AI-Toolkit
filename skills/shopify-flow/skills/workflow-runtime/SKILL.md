---
name: workflow-runtime
description: "What lives inside a Flow workflow step at runtime: environment variables (trigger data, step outputs, ForEach item access), the condition DSL (operators, array iteration, null/empty rules), and Flow's restricted Liquid (allowed filters, what doesn't work, Flow-specific date/crypto filters). Load when authoring step internals — config field values, condition expressions, Liquid templates."
metadata:
  author: Shopify Flow
  version: "0.1.0"
---

This skill is for the *inside* of a step. Pairs with [`building-workflows`](../building-workflows/SKILL.md) (overall structure, JSON shape, submission) and [`special-tasks`](../special-tasks/SKILL.md) (per-task config quirks).

## Workflow environment variables

Every workflow has access to a `shop` object plus whatever the trigger and prior steps have hydrated. **You don't see the full environment until you query it for the path you want.**

### How to discover paths — never guess

```bash
scripts/call_tool.mjs --op environment-paths-search \
  --store <shop.myshopify.com> \
  --arguments '{
  "searches":[
    {"root_type":"Order","search_term":"customer email"},
    {"root_type":"Product","search_term":"tags"}
  ],
  "data_type_filter":"ALL"
}'
```

Each result carries:

- `search_categories` — `SCALAR`, `SCALAR_IN_LIST`, `LIST`, or `ALL`. **Read this before building a condition.**
  - `SCALAR` — no lists in path, use operators directly: `(order.totalPrice > 100)`.
  - `SCALAR_IN_LIST` — one list in path, iterate first: `(order.tags any? |t| (t == 'vip'))`.
  - `LIST` — ends in a list of objects: `(order.lineItems any? |li| (...))`.
  - `ALL` alone — multiple nested lists, nest the iteration: `(order.lineItems any? |li| (li.product.tags any? |t| (t == 'fragile')))`.
- `path_elements_types` — full type chain (e.g. `["order:Order","customer:Customer","tags:String"]`).
- `leaf_type` — the final scalar type.

Plural names (`lineItems`, `tags`, `variants`) are a strong hint that a segment is a list — but verify.

### Translating user words to field names

Merchants describe things in non-technical language. Translate before searching:

- "how much the order costs" → `totalPrice`, `subtotalPrice`, `currentTotalPrice`
- "where the customer lives" → `customer address`, `defaultAddress`, `city`, `country`
- "what they bought" → `lineItems`, `product`, `variant`
- "how many items" → `quantity`, `lineItems`, `currentQuantity`
- "discount" / "coupon" → `discountCode`, `discountApplications`, `totalDiscounts`
- "shipping" / "delivery" → `shippingLine`, `shippingAddress`, `fulfillment`
- "inventory" / "stock" → `inventoryLevel`, `inventoryQuantity`, `inventoryItem`
- "when it was placed" → `createdAt`, `processedAt`

These are illustrative — translate based on context.

### Trigger data hydration

When a trigger fires, Flow automatically loads relevant fields from the event. **You usually do NOT need a Get Data step for the same object that triggered the workflow.**

Trigger data uses **camelCase** object names: `order.customer.email`, `fulfillmentOrder.id`, `draftOrder.id`.

Use Get Data only when:
- You need related records not in the trigger payload (e.g. all customer orders when triggered by a single order).
- You need additional context (e.g. product inventory when triggered by an order).
- You need historical or aggregate data beyond the triggering event.

Do **not** Get Data for the trigger object itself — `order` is already there when triggered by `order_created`.

### Step output variables

Each step adds a variable to the environment, named by camelCasing the step name. Multiple instances of the same step type get suffixes.

| Step | Variable name | Shape |
|---|---|---|
| "Get order data" | `getOrderData` | array (filterable list) |
| Multiple Get Data | `getOrderData`, `getOrderData1`, `getOrderData2` | each its own array |
| ForEach over `order.lineItems` | `lineItemsForeachitem` (inside body only) | one item per iteration |
| ForEach over `getOrderData` | `getOrderDataForeachitem` (inside body only) | one item per iteration |
| "Send admin api request" | `sendAdminApiRequest`, `sendAdminApiRequest1` | mutation/query response object |
| "Count" | `count`, `count1` | integer |
| "Sum" | `sum`, `sum1` | number |

**ForEach iteration items are ONLY available inside the loop body.** Don't reference `lineItemsForeachitem` in a step connected to the `after` port — Flow will reject it as `foreachBodyErrors`.

### Object access rules

```liquid
{{ order.name }}
{{ customer.email }}
{{ getOrderData.name }}              <!-- only inside a ForEach body -->
{{ lineItemsForeachitem.title }}
```

Wrong (these are GraphQL connection patterns Flow doesn't expose):

```liquid
{{ order.lineItems.edges | map: 'node' }}
{{ customer.orders.nodes }}
{{ getOrderData.edges }}
```

Rules:

- Object names always **lowercase**: `order.lineItems`, never `Order.lineItems`.
- **No `.edges`, no `.nodes`, no `| map: 'node'`** — Flow handles GraphQL plumbing automatically.
- Direct property access throughout.

## Condition DSL

The condition DSL is **not Liquid**. It has its own grammar.

### Data types

| Type | Example |
|---|---|
| Integer | `42` |
| Float | `4.25` |
| String | `'paid'` (case-insensitive comparisons) |
| Boolean | `true` / `false` |
| Date | `'2025-06-05T04:00:00.000Z'` (ISO 8601) |
| Money | `10.00` |
| Decimal | `3.14159` |
| Enum | predefined constants |

### Operators

**Binary** (compare two values):

- `==` `!=` `>` `>=` `<` `<=`
- `start_with?` / `not_start_with?` / `end_with?` / `not_end_with?` — **strings only**
- `include?` / `not_include?` — **strings only** (substring check). To check list membership, use `any?` instead.
- `in?` / `not_in?` — value is in a comma-separated list literal: `(order.financialStatus in? 'paid,partially_refunded,refunded')`. Numeric works too: `(order.quantity in? '1,2,3')`.

**Unary** (check single value):

- `empty_or_nil?` / `not_empty_and_not_nil?` — **strings only**
- `nil?` / `not_nil?` — for everything else (Integer, Float, Boolean, Date, Money, Decimal, Enum)

**Array** (iterate a list):

- `any?` — at least one item matches
- `all?` — every item matches
- `none?` — no item matches

**Logical**:

- `&&` (AND), `||` (OR)

### Examples

Simple:

```
(order.totalPrice > 100)
```

String operator on a string field:

```
(order.customer.email end_with? '.edu')
(order.note include? 'urgent')
```

Iterate into a list with array operators:

```
(order.lineItems any? |lineItems_item| (lineItems_item.product.tags any? |tags_item| (tags_item == 'presale')))
```

Multiple criteria inside a list item:

```
(order.lineItems any? |lineItems_item| ((lineItems_item.product.tags any? |tags_item| (tags_item == 'presale')) && (lineItems_item.product.productType == 'Clothing')))
```

### Null/empty checks — use the right operator for the type

For **strings**:

```
CORRECT: (shop.email empty_or_nil?)
CORRECT: (customer.firstName not_empty_and_not_nil?)
WRONG:   (shop.email == '')
```

For **non-strings** (Integer, Float, Boolean, Date, Money, Decimal, Enum):

```
CORRECT: (order.totalPrice nil?)
CORRECT: (order.createdAt not_nil?)
WRONG:   (order.totalPrice empty_or_nil?)
WRONG:   (order.createdAt not_empty_and_not_nil?)
```

### List operations — always iterate first

To check if a list contains a value, use `any?` with `==` — never `include?`:

```
CORRECT: (order.tags any? |tags_item| (tags_item == 'vip'))
WRONG:   (order.tags include? 'vip')
```

Applying a string operator to list items requires iteration:

```
CORRECT: (product.tags any? |tags_item| (tags_item start_with? 'presale'))
WRONG:   (product.tags start_with? 'presale')
```

Checking list items for a value requires iteration:

```
CORRECT: (getOrderData any? |getOrderData_item| (getOrderData_item.id not_empty_and_not_nil?))
WRONG:   (getOrderData.id not_empty_and_not_nil?)
```

### Rules

1. Always run `environment-paths-search` to confirm the path exists.
2. Match operators to data types.
3. **No Liquid syntax in conditions.** No `{{ }}`, no `{% %}`, no Liquid filters. The condition DSL cannot evaluate them.
4. **Never mix `&&` and `||` at the same nesting level.** If you need complex logic, use multiple condition steps.
5. Check `search_categories` from path search — `SCALAR_IN_LIST` and `LIST` paths MUST iterate before applying any operator.
6. `include?`/`not_include?`/`start_with?`/`end_with?` are strings-only.
7. `empty_or_nil?`/`not_empty_and_not_nil?` are strings-only.
8. String comparisons are case-insensitive.
9. Dates: ISO 8601, e.g. `2025-06-05T04:00:00.000Z`.
10. Booleans: `true` / `false`.

### No Liquid in conditions — common pitfall

WRONG (will fail at validation):

```
(getCustomerDataForeachitem.lastOrder.createdAt < '{{ scheduledAt | date_minus: "6 months" }}')
```

CORRECT options:

- Hardcode the date: `(getCustomerDataForeachitem.lastOrder.createdAt < '2024-06-05T04:00:00.000Z')`
- Use an existing variable: `(order.createdAt > customer.lastOrderDate)`
- Compute dynamically with a Run Code action first, then reference its output.

### Output format (in `config_field_values`)

```json
{
  "config_field_values": [
    { "config_field_id": "condition", "value": "(order.totalPrice > 100)" }
  ]
}
```

## Liquid in Flow

Flow's Liquid is restricted. It only outputs **scalar values** (strings, numbers, booleans). To work with complex data, use ForEach to iterate.

### What you cannot do

- Output entire lists/objects: `{{ order.lineItems }}` — wrong.
- Use the `json` filter: `{{ order | json }}` — wrong.
- Use `size` on objects/lists: `{{ order.lineItems | size }}` — wrong.
- Use dot notation for filters: `{{ order.lineItems.size }}` — wrong.
- Use array indexes: `{{ order.lineItems[0].title }}` — wrong.
- Use `.first`, `.last`, `.empty?` filters — wrong.
- Use filters inside conditional comparisons: `{% if order.lineItems.id | size > 0 %}` — wrong.

### What you can do

- Dot notation for properties: `{{ order.customer.email }}`.
- Loop through lists: `{% for item in order.lineItems %}`.
- `size` on **field arrays** (the trick): `{{ order.lineItems.id | size }}`. This extracts the `id` field from every item then counts — Flow allows this shape.
- Access individual properties inside loops.
- Assign first, then test: `{% assign count = order.lineItems.id | size %}{% if count > 0 %}`.
- Flow-specific filters (date arithmetic, crypto hashing) below.

### Flow-specific filters

**Date filters** (mostly used in query filters for Get Data):

- `date_minus` — subtract time from a date.
  - `{{ "now" | date_minus: "6 months" }}`
  - `{{ scheduledAt | date_minus: "1 day" }}`
- `date_plus` — add time to a date.
  - `{{ "now" | date_plus: "30 days" }}`
  - `{{ order.createdAt | date_plus: "1 week" }}`
- Units: `days`, `weeks`, `months`, `years`.

**Crypto filters**:

- `md5` `sha1` `sha256` `blake3` — hash filters: `{{ order.id | sha256 }}`.
- `hmac_sha1`, `hmac_sha256` — `{{ order.id | hmac_sha256: secret_key }}`.

### Liquid examples

Check payment status:

```liquid
{% if order.financialStatus == "paid" %}
  The order amount paid was {{ order.totalPrice | money }}
{% else %}
  Order is not paid yet
{% endif %}
```

Loop through line items (note the `size` trick on `.id`):

```liquid
{% assign item_count = order.lineItems.id | size %}
{% if item_count > 0 %}
  {% for item in order.lineItems %}
    Item: {{ item.title }}
    Quantity: {{ item.quantity }}
    Price: {{ item.price | money }}
  {% endfor %}
{% else %}
  No items in order
{% endif %}
```

Stock status with branching per item:

```liquid
{% for item in order.lineItems %}
  {{ item.title }}
  Quantity: {{ item.quantity }}
  Stock: {{ item.variant.inventoryQuantity }}

  {% if item.variant.inventoryQuantity <= 0 %}
    Status: OUT OF STOCK
  {% elsif item.variant.inventoryQuantity < item.quantity %}
    Status: INSUFFICIENT STOCK
  {% else %}
    Status: IN STOCK
  {% endif %}
{% endfor %}
```

Customer profile (verify paths first via `environment-paths-search`):

```liquid
Customer Information:

{% if order.customer.firstName or order.customer.lastName %}
  Name: {{ order.customer.firstName }} {{ order.customer.lastName }}
{% endif %}

{% if order.customer.email %}
  Email: {{ order.customer.email }}
{% endif %}

Total Orders: {{ order.customer.ordersCount }}
Total Spent: {{ order.customer.totalSpent | money }}

{% if order.customer.ordersCount == 1 %}
  [First Time Customer!]
{% elsif order.customer.ordersCount >= 10 %}
  [Loyal Customer]
{% endif %}
```
