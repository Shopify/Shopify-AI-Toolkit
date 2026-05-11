---
name: shopify-search-syntax
description: "Shopify search query syntax for Get Data tasks (orders/customers/products fetches). Comparators, connectives, modifiers, exists/prefix queries, and the per-resource filter sets. Load whenever you're configuring a query string for shopify::flow::fetch::* or any task that takes a Shopify search query."
metadata:
  author: Shopify Flow
  version: "0.1.0"
---

This skill is for the `query` config field on Get Data tasks (`shopify::flow::fetch::orders`, `_::customers`, `_::products`) and any other task whose `config_fields` declares a Shopify-search-style filter.

## Source of truth

**The available filters for a specific task are whatever its `task-configuration` response declares.** Don't memorize the list below as canonical — verify per task:

```bash
scripts/call_tool.mjs --op task-configuration \
  --store <shop.myshopify.com> \
  --arguments '{
  "tasks":[{"id":"shopify::flow::fetch::orders","version":"0.1"}]
}'
```

Read the `config_fields` in the response. Only use filters that appear there. If the filter you want isn't present, leave the query blank or take a different approach.

## Common Get Data task IDs

- Orders: `shopify::flow::fetch::orders`
- Customers: `shopify::flow::fetch::customers`
- Products: `shopify::flow::fetch::products`

## Query syntax

### Comparators

| Operator | Meaning |
|---|---|
| `:` | equality (exact match for non-tokenized fields, contains for tokenized fields) |
| `:<` | less than |
| `:>` | greater than |
| `:<=` | less than or equal |
| `:>=` | greater than or equal |

### Connectives

- `AND` — both conditions must match (default if omitted).
- `OR` — either condition.

### Modifiers

- `-field:value` or `NOT field:value` — exclude documents matching.

## Examples

Field search:

```
first_name:Bob age:27
```

Range:

```
orders_count:>16 orders_count:<=30
```

NOT:

```
-tag:wholesale
NOT status:cancelled
```

Boolean:

```
(status:open OR status:closed) AND financial_status:paid
```

Phrase (use quotes for tokenized fields):

```
first_name:"Bob Norman"
```

Prefix:

```
norm*
```

Exists / does-not-exist:

```
published_at:*
-published_at:*
```

## Order query filters

**Basic:**

- `name:1001-A`
- `id:1234` or `id:>=1234`
- `status:(open|closed|cancelled)`
- `created_at:2020-10-21T23:39:20Z`

**Financial:**

- `financial_status:(paid|pending|authorized|partially_paid|partially_refunded|refunded|voided)`
- `gateway:shopify_payments`
- `discount_code:ABC123`

**Fulfillment:**

- `fulfillment_status:(unfulfilled|fulfilled|partial|scheduled|on_hold)`
- `delivery_method:(shipping|pick-up|retail|local)`

**Customer:**

- `email:example@shopify.com`
- `customer_id:123`
- `channel:web` or `channel:web,pos`

**Other:**

- `risk_level:(high|medium|low|none)`
- `tag:my_tag` / `tag_not:my_tag`
- `sku:ABC123`

## Product query filters

- `title:The Minimal Snowboard`
- `status:(ACTIVE|ARCHIVED|DRAFT)`
- `sku:XYZ-12345`
- `inventory_total:>150`
- `out_of_stock_somewhere:true`
- `tag:my_tag`

## Customer query filters

**Basic:**

- `default` — case-insensitive search across multiple fields. Examples: `Bob Norman`, `title:green hoodie`.
- `id:1234` or `id:>=1234`
- `email:gmail.com` or `email:"bo.wang@example.com"` (tokenized — quote for exact).
- `email:*` — has any email.
- `phone:+18005550100` or `phone:*`.

**Name:**

- `first_name:Jane`
- `last_name:Reeves`

**Address:**

- `country:Canada` or `country:JP` (full name or two-letter).

**Dates:**

- `customer_date:'2024-03-15T14:30:00Z'` or `customer_date:>='2024-01-01'` — when the customer record was created.
- `updated_at:2024-01-01T00:00:00Z` or `updated_at:<now` — when the customer info was last updated.
- `order_date:'2024-02-20T00:00:00Z'` or `order_date:>='2024-01-01'` — date the customer placed an order. Use this to check whether a customer ordered within a date range.
- `last_abandoned_order_date:'2024-04-01T10:00:00Z'`.

**Order & spending:**

- `orders_count:5` or `orders_count:>10`
- `total_spent:100.50` or `total_spent:>50.00`

**Marketing:**

- `accepts_marketing:true`

**Tags:**

- `tag:'VIP'` or `tag:'Wholesale,Repeat'`
- `tag_not:'Prospect'` or `tag_not:'Test,Internal'`

**Account state (Classic Customer Accounts only):**

- `state:ENABLED` or `state:(INVITED|DISABLED|DECLINED)`

## Worked examples

These combine the search syntax with Flow's date filters from [`workflow-runtime`](../workflow-runtime/SKILL.md) §Liquid.

Orders updated in the last day (scheduled trigger):

```liquid
updated_at:<='{{ scheduledAt }}' AND updated_at:>'{{ scheduledAt | date_minus: "1 day" }}'
```

Customer's recent orders. Verify `legacyResourceId` exists via `environment-paths-search` before using:

```liquid
created_at:>'{{ "now" | date_minus: "6 months" }}' AND customer_id:{{ order.customer.legacyResourceId }}
```

Unfulfilled orders older than 2 days:

```liquid
created_at:<='{{ scheduledAt | date_minus: "2 days" }}' AND fulfillment_status:unfulfilled AND NOT status:cancelled
```

Inactive customers (no orders in 6 months):

```liquid
NOT order_date:>='{{ "now" | date_minus: "6 months" }}'
```

High-value, frequent customers:

```
orders_count:>=10 AND total_spent:>=1000
```

## Notes and pitfalls

- **Verify filters exist** in `task-configuration` before using. Invalid field names are silently ignored and return all results — wrong filter, wrong data, no error.
- **Prefer `legacyResourceId` over `id` when querying by ID**. Verify it exists for the object via `environment-paths-search`. If validation returns `"<var>" is invalid. Replace this variable`, search for the correct ID field — never leave that error unfixed.
- Use ISO 8601 for dates: `2025-06-05T04:00:00.000Z`.
- Get Data actions return **0–100 resources max** per call.
