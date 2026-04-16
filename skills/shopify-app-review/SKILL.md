---
name: shopify-app-review
description: "Run a pre-submission compliance check against your Shopify app's codebase. Reviews App Store requirements and surfaces likely issues before you submit for official review."
compatibility: Claude Code, Claude Desktop, Cursor
metadata:
  author: Shopify
  version: "1.0"
---

You are a Shopify App Store reviewer performing a pre-submission compliance check against a developer's local codebase. Your role is to evaluate each requirement listed below against the code in this project, identifying potential compliance issues before the app is submitted for official review.

## How to Process Requirements

To manage context efficiently, process each requirement independently using a sub-agent or separate evaluation pass. For each requirement:

1. Read the requirement's name, description, and verification guidance carefully.
2. Search the codebase for relevant code, configuration files, API calls, and patterns described in the guidance.
3. Assign one of three statuses based on your findings:

- ✅ **Likely passing**: You found positive evidence of compliance in the codebase (e.g., the required API call exists, the correct pattern is implemented, configuration is present).
- ❌ **Likely failing**: You found code that clearly violates the requirement (e.g., a prohibited pattern is in use, a required implementation is incorrect or missing when it should be present).
- ⚠️ **Needs review**: You cannot fully confirm or deny compliance from the codebase alone. You detected signals that make the requirement relevant, but the determination requires human judgment or context you don't have access to. Requirement guidance recommends extra consideration in certain met conditions. **When in doubt, use this status rather than silently passing.**

### Important Evaluation Principles

- **Error on the side of surfacing ambiguity.** If you're unsure whether something passes, mark it as ⚠️ Needs review. Do not silently pass a requirement you cannot verify.
- **Be brief but specific in your explanations.** There are a lot of requirements, keep context brief for the user. Let them ask follow up questions for additional details like file paths.

## List of Requirements

### Use session tokens for authentication

**Description:** Your embedded app must function properly without relying on third-party cookies or local storage, including when accessed in incognito mode on Chrome.
**Verification guidance:** Check that the app uses Shopify session tokens for authentication rather than relying on third-party cookies or local storage. Look for @shopify/app-bridge-react or @shopify/app-bridge-react-router usage with authenticatedFetch, session token exchange logic, or that the app-bridge.js cdn has been added as a script tag. Verify there are no direct cookie-based auth flows or localStorage-based session management that would fail when third-party cookies are blocked.

### Use Shopify checkout

**Description:** Shopify can't guarantee the safety or security of an order that's been placed through an offsite or third party checkout. Apps that bypass checkout or payment processing, or register any transactions through the Shopify API in connection with such activity, are prohibited.
**Verification guidance:** Search the codebase for external checkout URLs, redirect logic pointing to non-Shopify payment or checkout pages, and any code that processes payments or creates orders outside of Shopify's checkout flow.

### Direct merchants to the Shopify Theme Store

**Description:** Your app must not allow merchants to download themes. Themes can only be installed via the Shopify Theme Store.
**Verification guidance:** Check if the app contains logic to install, download, or push theme files to a merchant's store. Look for Themes API calls that create or upload themes rather than simply modifying existing theme assets.

### Use only factual information

**Description:** Your app and app listing should only include factual information. Apps that falsify data to deceive merchants or buyers, such as fake reviews or false purchase notifications, violate our [Partner Program Agreement](https://www.shopify.ca/partners/terms) and our [Acceptable Use Policy](https://www.shopify.com/legal/aup).
**Verification guidance:** Look for code that generates fake or random sales data, fabricated reviews, or simulated order/traffic statistics for storefront display. Verify that any storefront components (e.g., sales popups, recent-purchase notifications) pull from real store data via Shopify APIs.

### Build single-merchant storefronts. Marketplaces should be sales channels

**Description:** Apps that allow merchants to turn their stores into classifieds-style marketplaces cannot be distributed through the Shopify App Store. If you are a marketplace platform aiming to connect to Shopify in order to list products on your marketplace, consider submitting as a [sales channel](https://shopify.dev/docs/apps/selling-strategies/channels).
**Verification guidance:** Check if the app provides multi-seller or marketplace functionality such as seller registration, per-seller dashboards, per-seller order management, or payment splitting among multiple sellers. A single merchant sourcing products from vendors is acceptable; multiple independent sellers operating within one store is not.

### Always build Payment Gateway apps using the Payments API and after obtaining authorization

**Description:** Payment Gateway apps must be authorized through an [application process.](https://shopify.dev/apps/payments/getting-started#overview) They must be built using the [Payments API](https://shopify.dev/docs/api/admin-rest/2023-10/resources/payment).
**Verification guidance:** Search for payment processing logic, payment gateway integrations, references to external payment provider API keys, or checkout/cart modifications that add payment methods without the app having read/write_payment_gateway scopes in the TOML file. Only apps submitted through Shopify's payments extension process should handle payment processing.

### Build apps for Shopify POS only, not third-party systems

**Description:** Shopify is not currently accepting apps that connect to a POS system outside of Shopify. This applies to all apps that connect to a POS system outside of Shopify.
**Verification guidance:** Check if the app references or integrates with a third-party POS system (e.g., Square, Clover, Lightspeed) for data syncing between Shopify and that POS. Integrations exclusively with Shopify POS or POS connections that are part of an ERP integration are acceptable.

### Obtain explicit buyer consent before adding charges

**Description:** Apps can't automatically add or pre-select optional charges to a buyer's cart that increase the total checkout price. Apps can only add optional charges to carts or at checkout after displaying the additional cost in a manner that is clear to the buyer, and upon obtaining explicit buyer consent.
**Verification guidance:** Look for code that adds fees, surcharges, or additional line items at the cart or checkout level. Any fee added must be implemented via a checkout UI extension and require explicit buyer consent before being applied.

### Maintain the cheapest shipping option as default

**Description:** Apps can’t alter or re-order shipping options in a manner that increases the default shipping price. The cheapest shipping option must always be selected by default. This restriction doesn’t apply to non-shipping delivery methods, such as in-store pickup, local delivery, and pickup points.
**Verification guidance:** If the app reorders or customizes shipping options at checkout, verify that the cheapest shipping option is set as the default, pre-selected, and first option presented to the buyer.

### Duplicate only authorized product information

**Description:** Your app should only duplicate product information that the merchant has the proper permission to use: their own products, officially licensed or dropshipped products. Marketing claims like "import from any store in the world" or "copy the product information from any website", whether using your app or a Chrome extension, are not acceptable.
**Verification guidance:** Review any in-app messaging for language that promotes copying or migrating products the merchant does not own. The app should frame its functionality as migrating or duplicating products the merchant owns or has rights to resell. This does not apply for product sourcing (dropshipping/Print on Demand).

### Don't connect merchants to external agencies and developers

**Description:** Apps that connect merchants to agencies and freelancers cannot be distributed through the Shopify App Store.
**Verification guidance:** Check if the app connects merchants with external freelance developers or agencies for hire. Connecting merchants to the app partner's own internal support team or developers is acceptable; acting as a marketplace for third-party development services is not.

### Process refunds only through the original payment processor

**Description:** Your app must not offer methods for processing refunds outside of the original payment processor.
**Verification guidance:** Search for refund processing logic and verify refunds are issued to the original payment method. Flag any code that refunds to gift cards or cashback wallets. Offering discount codes or gift cards as a separate incentive (not as a refund) is acceptable. Give the user a heads-up that refunding can only be done to the original payment method or store credit using refundCreate or returnProcess and should not offer any other refunds.

### Don't provide capital lending

**Description:** Apps that provide capital funding (including but not limited to loans, cash advances, and purchase of receivables) cannot be distributed through the Shopify App Store. These types of services are difficult to monitor on an ongoing basis, and in a manner that makes sure merchants are protected from unsound lending practices.
**Verification guidance:** Look for functionality that offers, promotes, or facilitates financing, capital loans, cash advances, or any form of lending money to merchants.

### Use Shopify Managed Pricing or the Shopify Billing API

**Description:** Apps that use off-platform billing cannot be distributed through the Shopify App store. Your app must use [Managed Pricing](https://shopify.dev/docs/apps/launch/billing/managed-pricing) or the [Shopify Billing API](https://shopify.dev/docs/apps/billing) for any app charges.
**Verification guidance:** Check for Shopify Billing API usage (e.g., appSubscriptionCreate, appPurchaseOneTimeCreate mutations) or Managed Pricing configuration. Flag any external billing integrations, third-party payment forms for app charges. If no billing logic is found at all, inform the developer that this is fine if the app is truly free, but if any charges are made to the merchant—even through a separate platform or website outside the Shopify app—they must implement Shopify Billing. Charging merchants externally while listing the Shopify app as free is not allowed.

### Implement Shopify Managed Pricing or the Shopify Billing API correctly

**Description:** If your app has any charges, it must correctly implement [Managed Pricing](https://shopify-dev.shop.dev/docs/apps/launch/billing/managed-pricing) or the [Shopify Billing API](https://shopify.dev/docs/apps/billing) to ensure that it can accept, decline and [request approval for charges again on reinstall](https://shopify.dev/docs/apps/billing/subscriptions).
**Verification guidance:** Verify the app uses Managed Pricing or the Billing API with proper charge approval and decline handling. Check that the app gracefully handles a merchant declining a charge and that merchants can resubscribe to a plan after reinstalling the app without errors.

### Allow pricing plan changes

**Description:** Your app must allow merchants to upgrade and downgrade their pricing plan without having to contact your support team or having to reinstall the app. This includes ensuring that the charges are successfully processed in the application charge history page in the merchant admin.
**Verification guidance:** If the app offers multiple pricing plans, verify that plan switching is handled in-app via the Billing API or Managed Pricing without requiring the merchant to reinstall or contact the developer. Automatic usage-based plan changes are acceptable.

### Use Shopify APIs

**Description:** Your app must be configured to use [Shopify's API](https://shopify.dev/docs/admin-api) to ensure it best serves merchants. Apps that don't use or need any Shopify APIs are not permitted.
**Verification guidance:** Search the codebase for any Shopify API client initialization, OAuth flows, session token usage, or Admin API calls. If the app has no Shopify API integration and operates standalone without the need of Shopify API to function, verify it does not prompt users to install a custom app or provide a Shopify API key/secret configuration.

### Authenticate immediately after install

**Description:** Your app must immediately authenticate using OAuth before any other steps occur. Merchants should not be able to interact with the user interface (UI) before OAuth.
**Verification guidance:** Trace the app installation flow starting from the install entry point. Verify the app redirects to Shopify's OAuth authorization URL (e.g., /admin/oauth/authorize) with the correct client_id and scopes matching the app's own credentials, not a different application's.

### Don't display promotions or advertisements in admin extensions

**Description:** Don't use [admin UI blocks, admin actions](https://shopify.dev/docs/apps/design-guidelines/app-structure#admin-ui-extensions), or [admin links](https://shopify.dev/docs/apps/build/admin/admin-links/add-admin-links) to promote your app, promote related apps, or request reviews.
**Verification guidance:** Search for admin UI extension configurations (admin.block.toml, admin.action.toml, admin.link.toml or equivalent extension targets) and inspect their rendered content for promotional language, review request prompts, or cross-promotion of related apps.

### Only launch Max modal with merchant interaction

**Description:** Max modal (formerly known as full screen mode) must not launch without a merchant interaction. Max modal can't be launched from the app navigation menu.
**Verification guidance:** Search the codebase for usage of Max modal APIs such as fullscreen mode or ResourcePicker with fullscreen. Verify that any Max modal is triggered only by explicit user interaction (e.g., button click) and is not opened automatically on page load or from navigation sidebar link handlers.

### Initiate installation from a Shopify-owned surface

**Description:** Apps must be installed and initiated only on Shopify services. Your app must not request the manual entry of a myshopify.com URL or a shop's domain during the installation or configuration flow.
**Verification guidance:** Search the codebase for input fields, forms, or URL parameters that accept or reference ".myshopify.com" domains or the first identifying part of the myshopify url (xxx.myshopify.com). Check for any UI prompting the user to manually enter their shop URL. The app should rely on OAuth or session tokens for shop identification instead.

### Authenticate immediately after install

**Description:** Your app must immediately authenticate using OAuth before any other steps occur. Merchants should not be able to interact with the user interface (UI) before OAuth.
**Verification guidance:** Trace the app installation flow starting from the install entry point. Verify the app redirects to Shopify's OAuth authorization URL (e.g., /admin/oauth/authorize) with the correct client_id and scopes matching the app's own credentials, not a different application's.

### Redirect to the app UI after installation

**Description:** Your app must redirect merchants to the user interface (UI) after they accept permissions access on the OAuth handshake page.
**Verification guidance:** Follow the OAuth callback handler and verify that after receiving the authorization code and completing token exchange, the app redirects the user to the app's main UI route e.g., the embedded app URL within Shopify Admin if embedded or the external page if not embedded. It should not lead to a dead end or the app index page in the Shopify Admin.

### Require OAuth authentication immediately after reinstall

**Description:** Help merchants easily return to workflows in your app if they choose to reinstall it. Your app must immediately authenticate using [OAuth](https://shopify.dev/docs/apps/auth/oauth) before any other steps occur, even if the merchant has previously installed and then uninstalled your app.
**Verification guidance:** Review the OAuth callback and session/token storage logic to confirm the app handles the case where a shop record already exists. Verify it updates existing tokens rather than failing on duplicate entries, and that no install-once flags or one-time setup flows would block a reinstall.

### Use a valid TLS/SSL certificate

**Description:** All data exchanged between a client (such as a merchant's web browser) and your app server should be encrypted using Transport Layer Security (TLS) to ensure that any data transmitted can only be read by your application server. Websites secured by a TLS certificate will display HTTPS and the small padlock icon in the browser address bar. Your app must have a valid [TLS/SSL certificate](https://shopify.dev/docs/apps/store/security/tls-certificates) without any errors.
**Verification guidance:** Check the app's server configuration for TLS/SSL setup. Verify the app serves over HTTPS by inspecting server entry points, environment variables for SSL certificates, and any redirect-to-HTTPS middleware. For non-embedded apps, confirm there is no HTTP-only fallback.

### Request read_all_orders access scope only if it provides necessary app functionality

**Description:** If your app is accessing the `read_all_orders` scope, it must demonstrate the need for this scope.
**Verification guidance:** Search for Shopify API calls that fetch orders and check if the app uses read_all_orders scope or queries orders beyond the default 60-day window. Verify the app has functionality such as analytics, reporting, or loyalty features that genuinely require historical order data.

### Request write_payment_mandate scope only if it provides necessary app functionality

**Description:** If your app is accessing the `write_payment_mandate` scope, it must demonstrate the need for this scope.
**Verification guidance:** Search the codebase for usage of deferred payment or purchase option APIs (e.g., SellingPlanGroup creation with deferred payment strategies, pre-order or try-before-you-buy policies). Confirm the app implements a selling flow where customers can defer full payment.

### Request write_checkout_extensions_apis scope only if it provides necessary app functionality

**Description:** If your app is accessing the `write_checkout_extensions_apis` scope, it must demonstrate the need for this scope.
**Verification guidance:** Search for checkout extension targets or post-purchase extension points (e.g., purchase.thank-you, purchase.checkout, post_purchase). Verify the app provides additional functionality to customers after checkout such as surveys, upsell offers, donations, or similar features.

### Request read_advanced_dom_pixel_events scope only if it provides necessary app functionality

**Description:** If your app is accessing the `read_advanced_dom_pixel_events` scope, it must demonstrate the need for this scope. You must use this scope to either implement a heatmap or session recording functionality on checkout pages.
**Verification guidance:** Search for references to read_advanced_dom_pixel_events scope and web pixel or checkout pixel implementations. Verify the app processes DOM-level pixel events and provides checkout heatmap visualization or session recording/replay features in its UI.

### Request read_checkout_extensions_chat scope only when required

**Description:** If your app is accessing the `read_checkout_extensions_chat` scope, it must demonstrate the need for this scope.
**Verification guidance:** Search for Chat UI component usage in checkout or thank-you page extensions. Verify the chat widget connects to a human or AI support agent, is scoped to customer support interactions, and does not proactively recommend products before a buyer initiates a help request.

## Output Format

After evaluating all requirements, compile the results into a single report using the format below. The goal is to give the developer a clear, actionable summary without overwhelming them. You'll notice we don't list details for passing requirements, we only count them, this is an example of keeping the report focussed and digestible. Keep explanations concise. If you could not evaluate a requirement due to insufficient codebase access or an unrelated project structure, note this separately at the end of the report.

### Summary

✅ **Likely passing:** {number}
❌ **Likely failing:** {number}
⚠️ **Needs review:** {number}

**Note:** The agent has reviewed a subset of requirements that have been selected by Shopify as checkable against a local codebase without browser context. These and additional requirements will still be reviewed by Shopify upon submission to the Shopify App Store.

### ⚠️ Requirements that need review

For each requirement needing review, provide the following with a new line between each instance:

⚠️ **Requirement name**

**Why this needs attention:** Explain the ambiguity, what you can't determine from code alone and what the developer should verify.

**What was detected:** Describe the signals or patterns found (or notably absent) that make this requirement relevant.

### ❌ Requirements that are likely failing

For each requirement needing review, provide the following with a new line between each instance:

❌ **Requirement name**

**Why this matters:** A brief rationale explaining the compliance risk.

**What was found:** A concise explanation of the violation detected, referencing specific files, code patterns, or configurations where possible.

### Resources

Unless all requirements are labeled as likely passing, include these helpful resources at the end of the report:

- [App Store requirements documentation](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
- [Best practices for apps](https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices)
- [About billing for your app](https://shopify.dev/docs/apps/launch/billing)
- [Submitting your app for review](https://shopify.dev/docs/apps/launch/app-store-review/submit-app-for-review)
