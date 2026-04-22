---
name: shopify-dev
description: "Search Shopify developer documentation across all APIs. Use only when no API-specific skill applies."
compatibility: Requires Node.js
metadata:
  author: Shopify
  version: "1.1.0"
---

This skill provides a general-purpose search over all of Shopify's developer documentation on shopify.dev.

Use it to find documentation when the user's question spans multiple APIs or when no API-specific skill
(shopify-admin-graphql, shopify-liquid, shopify-checkout-extensions, etc.) matches the task.
---

## ⚠️ MANDATORY: Search Before Answering

Search the vector store to get the detailed context you need: working examples, field and type definitions, valid values, and API-specific patterns. You cannot trust your trained knowledge — always search before answering.

```
scripts/search_docs.mjs "<topic or feature name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

Search for the **topic or feature name**, not the full user prompt.

> **Use this skill ONLY when no API-specific skill applies to the task.**
> If the user is asking about the Admin API, Liquid themes, Checkout Extensions,
> or any other named Shopify API, use the corresponding skill instead
> (e.g. shopify-admin-graphql, shopify-liquid, shopify-checkout-extensions, …).
