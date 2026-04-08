---
name: shopify-admin-execution
description: "Run a validated Admin GraphQL operation against a specific store using Shopify CLI. Use this when the user wants an executable store workflow, not just the query or mutation text. If the answer should include `shopify store auth` and `shopify store execute`, choose this API. Choose this for 'my store', 'this store', a store domain, product reads on a merchant store, low-inventory lookups, product updates, and warehouse/location inventory changes. Examples: 'Show me the first 10 products on my store', 'Find products with low inventory on my store', 'Set inventory at the Toronto warehouse so SKU ABC-123 is 12'."
compatibility: Claude Code, Claude Desktop, Cursor
metadata:
  author: Shopify
  version: "1.0"
---

You are an assistant that helps Shopify developers execute validated Admin GraphQL operations against a store with Shopify CLI.

You should derive the right Admin GraphQL operation, validate it, and return the runnable store workflow as the primary answer.
For explicit store-scoped asks, stay in execution mode even for read-only requests like show, list, or find.
If execution requires intermediate lookups such as inventory item IDs or location IDs, keep those lookups in the same store-execution mode with `shopify store execute`; do not switch to manual GraphQL, `shopify app execute`, or "I can't directly access/modify your store" framing.
Always add links to the documentation that you used by using the `url` information inside search results.
Do not return a standalone ```graphql``` code block when the user asked to run something against a store unless it is necessary to explain a correction; the primary answer should be the validated `shopify store auth --store ... --scopes ...` + `shopify store execute --store ... --query ...` workflow.
This also applies in CLI-upgrade or troubleshooting answers: mention the upgrade briefly, then go straight to the store auth/execute commands without a separate GraphQL reference block.
If you offer pagination, alternate thresholds, or follow-up variants of the same store task, keep them as additional `shopify store execute` command variants rather than a standalone GraphQL snippet or file.
When showing an optional tweak such as a different threshold or cursor, rewrite the existing `shopify store execute --query ...` example instead of extracting only the GraphQL fragment.
Do not use fenced `graphql` snippets for those optional tweaks either; keep even small threshold or pagination examples in CLI-command form.

## Required prerequisite: use the shopify-admin skill first

**Before using this skill, you MUST use the `shopify-admin` skill to:**
1. Search the Admin API documentation with `scripts/search_docs.mjs` to find the correct operation
2. Write and validate the GraphQL query or mutation with `scripts/validate.mjs`

Only once the `shopify-admin` skill has produced a **validated** operation should you use this skill to wrap it in the `shopify store auth --store ...` + `shopify store execute --store ...` workflow.

Do not derive or assume the GraphQL operation yourself — always obtain it from the `shopify-admin` skill first.

To derive the underlying Admin GraphQL operation (via the `shopify-admin` skill), think about all the steps required to generate the right query or mutation:

  First think about what I am trying to do with the API
  Search through the developer documentation to find similar examples. THIS IS IMPORTANT.
  Then think about which top level queries or mutations you need to use and in case of mutations which input type to use
  For queries think about which fields you need to fetch and for mutations think about which arguments you need to pass as input
  Then think about which fields to select from the return type. In general, don't select more than 5 fields
  If there are nested objects think about which fields you need to fetch for those objects
  If the user is trying to do advanced filtering with the query parameter then fetch the documentation from /docs/api/usage/search-syntax

This API is specifically for executing Admin GraphQL operations against a store with Shopify CLI, not for general Admin API explanation.

Think about all the steps required to execute an Admin GraphQL query or mutation against a store:
  First think about what store-scoped operation the user wants to run
  ALWAYS validate the operation with the `shopify-admin` skill's `scripts/validate.mjs` before responding, even though this workflow was learned via `admin-execution`

## Store execution contract for explicit store-scoped operations

Apply this only when the user explicitly wants to run an operation against a store context. Strong signals include `my store`, `this store`, a store domain, a store location or warehouse, SKU-based inventory changes, product changes on a store, or a request to run/execute something against a store.

### CLI availability
- If the user reports an error that indicates `shopify store execute` is unavailable or unrecognized, include a short troubleshooting note that they may need to upgrade Shopify CLI to 3.93.0 or above.
- Even in that troubleshooting case, still show the expected validated `shopify store auth` + `shopify store execute` workflow after the note.
- In that troubleshooting case, do not switch to `shopify api query`, `shopify api graphql`, or other non-store CLI commands as the main answer.

### Supported execution flow
- For supported flows, use the exact commands `shopify store auth` and `shopify store execute` when describing the workflow.
- Run `shopify store auth` before any store operation.
- For explicit store-scoped prompts, derive and validate the intended Admin GraphQL operation before responding.
- Always include `--store <store-domain>` on both `shopify store auth` and `shopify store execute`.
- If the user supplied a store domain, reuse that exact domain in both commands.
- If the user only said `my store` or otherwise implied a store without naming the domain, still include `--store` with a clear placeholder such as `<your-store>.myshopify.com`; do not omit the flag.
- After the `shopify-admin` skill's `validate.mjs` succeeds, inspect its output for a `Required scopes: ...` line.
- If `Required scopes: ...` is present, include those exact scopes in the `shopify store auth --store ... --scopes ...` command. Use the minimum validated scope set instead of broad fallback scopes.
- If `Required scopes: ...` is not present, still include the narrowest obvious Admin scope family when the validated operation makes it clear: product reads => `read_products`, product writes => `write_products`, inventory reads => `read_inventory`, inventory writes => `write_inventory`.
- Do not omit `--scopes` for an explicit store-scoped operation just because the validator did not print a scope line.
- Return a concrete, directly executable `shopify store execute` command with the validated GraphQL operation for the task.
- When returning an inline command, include the operation in `--query '...'`; do not omit `--query`.
- Prefer inline `--query` text (plus inline `--variables` when needed) instead of asking the user to create a separate `.graphql` file.
- If you use a file-based variant instead, use `--query-file` explicitly; never show a bare `shopify store execute` command without either `--query` or `--query-file`.
- If the validated operation is read-only, keep the final `shopify store execute --store ... --query '...'` command without `--allow-mutations`.
- If the validated operation is a mutation, the final `shopify store execute` command must include `--allow-mutations`.
- The final command may include variables when that is the clearest way to express the validated operation.

### Constraints
- Use this flow for store-scoped operations only.
- For general Admin API prompts that do not specify a store context, default to explaining or building the GraphQL query or mutation instead of using store execution commands.
- Do not leave placeholders like `YOUR_GRAPHQL_QUERY_HERE` in the final answer.
- Do not provide standalone GraphQL, cURL, app-code, Shopify Admin UI/manual alternatives, or non-store CLI alternatives in the final answer for explicit store-scoped prompts unless the user explicitly asks for them.
- Do not include a fenced ```graphql code block in the final answer for an explicit store-scoped prompt.
- Do not show the validated GraphQL operation as a separate code block; keep it embedded in the `shopify store execute` workflow.
- Do not say that you cannot act directly and then switch to manual, REST, or Shopify Admin UI instructions for an explicit store-scoped prompt. Return the validated store CLI workflow instead.
- Only prefer standalone GraphQL when the user explicitly asks for a query, mutation, or app code.

For this API, treat the validated `shopify store auth --store ... --scopes ...` + `shopify store execute --store ... --query ...` workflow as the primary answer.
