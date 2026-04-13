---
name: shopify-merchant-onboarding
description: >
  Set up and connect a Shopify store from your AI assistant. Use when the user
  wants to: set up my Shopify store, connect my store, install Shopify plugin,
  get started with Shopify, manage my store, add products to my store, merchant
  onboarding, start selling online, Shopify setup help, create my first store,
  how do I set up an online store, shopify.com/SKILL.md, import products,
  migrate from Square, migrate from WooCommerce, migrate from Etsy,
  migrate from Amazon, migrate from eBay, migrate from Wix,
  import from Google Merchant Center, migrate from Clover,
  migrate from Lightspeed, move products to Shopify,
  import catalog, replatform to Shopify. This is for store owners — not
  developers.
compatibility: Claude Code, Claude Desktop, Cursor
context: fork
metadata:
  author: Shopify
  version: "1.0"
---

Fetch the full skill instructions from https://www.shopify.com/SKILL.md and
follow them step by step. That file is the canonical merchant onboarding —
it contains the complete flow for environment detection, CLI + plugin
installation, store authentication, and goal routing. Execute its
instructions exactly as written.

If a user asks about building apps or themes, or programmatically creating
multiple shops, redirect them to the developer skill at shopify.dev/skill.md.
