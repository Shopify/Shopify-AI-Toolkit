---
name: flow-best-practices
description: "Best practices and response guidelines for Flow workflow tasks: workflow construction, condition building, Liquid code, error handling, finding shop data, when to use placeholders, and the response format (short, terse, no headers, call out placeholders). Always load alongside using-flow — these rules govern every Flow interaction."
metadata:
  author: Shopify Flow
  version: "0.1.0"
---

This skill is **always loaded alongside [`using-flow`](../using-flow/SKILL.md)**. The transport rule and the never-fabricate rule live in `using-flow`; the rules below govern the *shape* of your work.

## Workflow construction

1. **Search templates first.** Run `template-search` before building any workflow from scratch. Templates are expert-built and often solve the request directly or reveal patterns to copy.
2. **Use the exact JSON structure** from [`building-workflows`](../building-workflows/SKILL.md) §1. Don't invent new top-level keys, don't omit `__metadata` or `patched_fields`.
3. **Check trigger data first.** Most data is already hydrated by the trigger — do NOT add Get Data steps for the same object that triggered the workflow.
4. **Never guess field paths.** Always verify with `environment-paths-search` before referencing a path in a condition, Liquid template, or task config.
5. **Minimize Get Data actions.** Each one is a real API call; only fetch what's not in the trigger.
6. **Use descriptive step names.** They become variable names — `Get unfulfilled orders` reads better than `Get orders 1` and `getUnfulfilledOrders` is more useful than `getOrders1`.
7. **Plan step dependencies.** Before adding a step, check what variables are available at that point in the graph. ForEach items, in particular, are scoped to the loop body.

## Condition building

1. **Search fields first** with `environment-paths-search` before writing any condition.
2. **Match operators to data types.** String operators on string fields, `nil?`/`not_nil?` on non-strings, array operators on lists.
3. **Use parentheses** for complex logic.
4. **Test edge cases:** empty lists, null fields, missing optional fields.
5. **Never use Liquid in conditions.** The condition DSL is its own language — see [`workflow-runtime`](../workflow-runtime/SKILL.md) §Condition DSL.

## Liquid code

1. **Always loop through lists** — never use array indexes (`[0]`, `[1]`, ...).
2. **Check for empty/nil before nested property access.** `{% if order.customer %}{{ order.customer.email }}{% endif %}`.
3. **Use comments only when the WHY is non-obvious.** Don't narrate what the Liquid does — the reader can read it.
4. **Test realistically.** Use a test event with realistic data shape (see [`running-test-events`](../running-test-events/SKILL.md)).
5. **Follow Flow's restrictions.** No `size` filter on objects, no `.first`/`.last`/`.empty?`, no `| json` on objects, no array indexing. See [`workflow-runtime`](../workflow-runtime/SKILL.md) §Liquid.

## Error handling

1. **Provide fallbacks for optional data.** `{{ order.customer.email | default: "no email on file" }}`.
2. **Handle empty lists.** Always check `{% assign count = list.id | size %}{% if count > 0 %}` before iterating.
3. **Use existence checks before nested access.** `{% if order.customer and order.customer.firstName %}`.
4. **Inform the user about manual steps.** Some tasks (marketing email, transactional email connectors, alert tasks) require setup outside Flow. Tell the user clearly.
5. **Use placeholder values when you have to.** See "Finding shop data and using placeholders" below.

## Workflow building process

When you receive a request:

1. **Search templates first** — `template-search`. Templates may solve the problem directly.
2. **Think through the data flow** before responding. Trigger → conditions → actions. What variables exist at each point? Which paths need verification?
3. **Use the two-step task discovery** (`task-search` → `task-configuration`).
4. **Verify all variable paths** with `environment-paths-search` before using them. Never guess `order.customer.totalSpent` — search for `totalSpent` on `Customer` first.
5. **Use the right adjacent skill when stuck.** If templates and path searches don't reveal the data or operation you need, use the relevant Shopify AI Toolkit/Admin GraphQL skill if it is installed, or ask for the missing capability to be added to the Flow tool catalog. Do not call Flow directly as a workaround.
6. **Provide complete configurations** in the proper JSON format. No partials, no "fill in the rest yourself."
7. **Use best judgment.** Don't ask the user to choose technical details (port names, task versions, internal IDs) — pick a reasonable default and tell them what you chose.
8. **Use the exact structure** from [`building-workflows`](../building-workflows/SKILL.md) §1.

## Finding shop data and using placeholders

Priority order for shop-specific values:

1. **Use shop context first.** Check whatever `<shop>` context the IDE has provided you (the merchant's `shopTimeZone`, `shopCurrencyCode`, `primaryDomain`, etc.).
2. **Use `search-shop-resource`** when the user mentions a specific resource by name. See list below.
3. **Use an Admin GraphQL-capable skill/tool** when `search-shop-resource` doesn't support the resource type or you need a complex filter.
4. **Use placeholders** only when the data cannot be inferred from context.

Use shop context for:

- Timezone in scheduled triggers (`shopTimeZone` or the user's `userTimeZone`).
- Currency awareness when discussing prices.
- Country-specific formatting/logic.
- Personalizing workflow content with `shopName`.

Use `search-shop-resource` for:

- **Products / variants by name** ("add product X", "update Blue T-Shirt") → product/variant GID.
- **Collections by name** ("tag products in Summer Sale") → collection GID.
- **Customers by name/email** ("tag customer john@example.com") → customer GID.
- **Locations by name** ("fulfill from Warehouse A") → location GID.
- **Discounts by name** ("apply SUMMER20") → discount GID.
- **Metaobjects by name** ("get FAQ entry X") → metaobject GID.

If the workflow logic references a specific resource by name, you **MUST** resolve it to a GID via `search-shop-resource` before building. Don't put the name into a config field — Flow will reject it.

Fall back to Admin GraphQL when:

- The resource type isn't supported by `search-shop-resource` (inventory items, fulfillment services, shipping zones).
- You need to query by fields `search-shop-resource` doesn't filter on (metafield values, complex nested filters).

Use placeholders only when the user hasn't provided specific values **and** the data cannot be inferred from shop context or conversation:

- **Email addresses:** `staff@example.com`, `merchant@example.com`.
- **Phone numbers:** `+1-555-555-5555`.
- **URLs:** `https://api.example.com/webhook`.
- **API keys:** `YOUR_API_KEY`, `SHOPIFY_API_KEY`.
- **GIDs:** `gid://shopify/Product/1234567890`, `gid://shopify/Customer/1234567890` — only as last resort, AFTER trying `search-shop-resource`.

**Always call out placeholders briefly** in your reply: "Replace `staff@example.com` with your actual email."

## Response format

**Keep responses SHORT.** The merchant cares about the workflow, not your prose.

DO NOT:

- Use markdown headers (`#`, `##`, `###`) unless the response is genuinely structured (e.g. several distinct workflows).
- Write long explanations of what the workflow does — the JSON is the source of truth.
- Create lengthy "What This Workflow Does" sections.
- Add verbose "Next Steps" lists.

DO:

- Briefly confirm the workflow was created.
- Call out any placeholders that need updating (one line each).
- Mention any limitations or manual setup briefly.
- Keep total response to 2–4 sentences when possible.

Good:

```
Created the order notification workflow. Replace `staff@example.com` with your actual staff email. The workflow will trigger on new orders and send the email with order details.
```

Bad (too verbose):

```
## What This Workflow Does
**Trigger:** Starts automatically whenever an order is created in your shop...
**Action:** Sends a detailed email notification...
## Next Steps:
1. Review the workflow...
```

## When to inform the user

Always tell the user when:

- Manual configuration is required (email templates, third-party connector setup).
- You used placeholder values that need replacement.
- The workflow has limitations or constraints (rate limits, scope of data, etc.).
- They can manually trigger the workflow for testing.
- Additional setup steps are needed outside Flow.

Don't bury these in prose. One line per item. The merchant should see them at a glance.
