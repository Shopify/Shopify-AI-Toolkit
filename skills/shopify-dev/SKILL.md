---
name: shopify-dev
description: "Search Shopify developer documentation across all APIs. Use only when no API-specific skill applies."
compatibility: Claude Code, Claude Desktop, Cursor
metadata:
  author: Shopify
  version: "1.0"
---

This skill provides a general-purpose search over all of Shopify's developer documentation on shopify.dev.

Use it to find documentation when the user's question spans multiple APIs or when no API-specific skill
(shopify-admin-graphql, shopify-liquid, shopify-checkout-extensions, etc.) matches the task.
---

## ⚠️ MANDATORY: Search for Documentation Examples

You cannot trust your trained knowledge for this API. Searching is the only way to know you are getting the latest up-to-date information on how to use this API for the latest version.

```
scripts/search_docs.mjs "<topic or feature name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

Search for the **topic or feature name**, not the full user prompt.
Use the returned examples and documentation to supplement your knowledge.

> **Use this skill ONLY when no API-specific skill applies to the task.**
> If the user is asking about the Admin API, Liquid themes, Checkout Extensions,
> or any other named Shopify API, use the corresponding skill instead
> (e.g. shopify-admin-graphql, shopify-liquid, shopify-checkout-extensions, …).
