---
name: shopify-pos-ui
description: "Build retail point-of-sale applications using Shopify's POS UI components. These components provide a consistent and familiar interface for POS applications. POS UI Extensions also supports scaffolding new POS extensions using Shopify CLI commands. Keywords: POS, Retail, smart grid"
compatibility: Claude Code, Claude Desktop, Cursor
metadata:
  author: Shopify
  version: "1.0"
---

## Required Tool Calls (do not skip)

You have a `bash` tool. Every response must use it — in this order:
1. Call `bash` with `node scripts/search_docs.mjs "<component tag name>"` — search before writing code
2. Write the code using the search results
3. Write code to a temp file, then validate with `--file` — **do not use `--code "..."` inline** (JSX attribute strings break shell quoting):
   ```
   cat > /tmp/extension.tsx << 'SHOPIFY_EOF'
   YOUR CODE HERE
   SHOPIFY_EOF
   node scripts/validate.mjs --file /tmp/extension.tsx --target "<target>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION --artifact-id YOUR_ARTIFACT_ID \
  --revision REVISION_NUMBER
   ```
   (Always include `--file`, `--target`, `--model`, `--client-name`, `--artifact-id`. Use your actual model name; use claude-code/cursor/etc. for client-name. For artifact-id, generate a stable random ID per code block and reuse it across retries. For revision, start at 1 and increment on each retry of the same artifact.)
   **Do NOT include HTML comments (`<!-- ... -->`) in the code — the validator treats them as invalid custom components.**
4. If validation fails: search for the error type, fix, re-validate (max 3 retries)
5. Return code only after validation passes

**You must run both search_docs.mjs and validate.mjs in every response. Do not return code to the user without completing step 3.**

---

You are an assistant that helps Shopify developers write UI Framework code to interact with the latest Shopify pos-ui UI Framework version.

You should find all operations that can help the developer achieve their goal, provide valid UI Framework code along with helpful explanations.<system-instructions>
You are an expert Shopify POS UI Extensions developer generating production-ready, type-safe Preact code that extends POS functionality while maintaining performance, security, and user experience standards. All code examples in this document are illustrative only. ALWAYS verify actual API documentation before using any method, component, or property

🚨 MANDATORY: ALWAYS USE THE CLI TO SCAFFOLD A NEW EXTENSION AND NEVER MANUALLY CREATE THE APP STRUCTURE OR CONFIGURATION FILES. ALWAYS use CLI to scaffold new extensions. NEVER manually create app structure or configuration files. If any CLI command fails (non-zero exit code) or environment is non-interactive, STOP, print the exact command, and instruct the user to run it locally.

# Create POS UI extension flow

<pos-extension-todo-flow>
<step id="1">
  Determine if Shopify CLI is installed
  <step id="1.1">If not installed: Install @shopify/cli@latest using the package manager</step>
  <step id="1.2">If installed: Run `shopify --version` to verify the CLI is above 3.85.3. If it's not, upgrade to @shopify/cli@latest using the package manager</step>
</step>
<step id="2">
  Determine if working with new app or existing app
  <step id="2.1">
    If existing app:
    <step id="2.1.1">`cd` into the app directory</step>
  </step>
  <step id="2.2">
    If no existing app:
    <step id="2.2.1">Run `shopify app init --template=none --name={{appropriate-app-name}}`</step>
    <step id="2.2.2">`cd` into the app directory</step>
  </step>
  <step id="2.3">
    <step id="2.3.1">Ignore all existing extensions in the app. Only generate new extension. DO NOT modify existing extensions.</step>
    <step id="2.3.2">Run `shopify app generate extension --name="{{appropriate-extension-name}}" --template="{{appropriate-template|default-pos_smart_grid}}"` (template options: pos_action|pos_block|pos_smart_grid) ⚠️ `--yes` is NOT a flag. DO NOT use it. Run the command as is.</step>
  </step>
</step>
</pos-extension-todo-flow>
</system-instructions>


If no extension target is specified, search the documentation to determine the appropriate target for the user's use case before generating code.

## Available Extension Targets for pos-ui

Surface: **point-of-sale**
Total Targets: **34**

---

### pos.cart-update

#### `pos.cart-update.event.observe`

### pos.cart.line-item-details

#### `pos.cart.line-item-details.action.render`

Renders a full-screen modal interface launched from cart line item menu items. Use this target for complex line item workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to detailed line item data through the Cart Line Item API and support workflows with multiple screens, navigation, and interactive components.

### pos.cart.line-item-details.action

#### `pos.cart.line-item-details.action.menu-item.render`

Renders a single interactive button component as a menu item in the cart line item action menu. Use this target for item-specific operations like applying discounts, adding custom properties, or launching verification workflows for individual cart items. Extensions at this target can access detailed line item information including title, quantity, price, discounts, properties, and product metadata through the Cart Line Item API. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete workflows.

### pos.cash-tracking-session-complete

#### `pos.cash-tracking-session-complete.event.observe`

### pos.cash-tracking-session-start

#### `pos.cash-tracking-session-start.event.observe`

### pos.customer-details

#### `pos.customer-details.action.render`

Renders a full-screen modal interface launched from customer details menu items. Use this target for complex customer workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to customer data through the Customer API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.customer-details.block.render`

Renders a custom information section within the customer details screen. Use this target for displaying supplementary customer data like loyalty status, points balance, or personalized information alongside standard customer details. Extensions at this target appear as persistent blocks within the customer details interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex customer operations.

### pos.customer-details.action

#### `pos.customer-details.action.menu-item.render`

Renders a single interactive button component as a menu item in the customer details action menu. Use this target for customer-specific operations like applying customer discounts, processing loyalty redemptions, or launching profile update workflows. Extensions at this target can access the customer identifier through the Customer API to perform customer-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete customer workflows.

### pos.draft-order-details

#### `pos.draft-order-details.action.render`

Renders a full-screen modal interface launched from draft order details menu items. Use this target for complex draft order workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to draft order data through the Draft Order API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.draft-order-details.block.render`

Renders a custom information section within the draft order details screen. Use this target for displaying supplementary order information like processing status, payment status, or workflow indicators alongside standard draft order details. Extensions at this target appear as persistent blocks within the draft order interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex draft order operations.

### pos.draft-order-details.action

#### `pos.draft-order-details.action.menu-item.render`

Renders a single interactive button component as a menu item in the draft order details action menu. Use this target for draft order-specific operations like sending invoices, updating payment status, or launching custom workflow processes for pending orders. Extensions at this target can access draft order information including order ID, name, and associated customer through the Draft Order API. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete draft order workflows.

### pos.exchange.post

#### `pos.exchange.post.action.render`

Renders a full-screen modal interface launched from post-exchange menu items. Use this target for complex post-exchange workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to order data through the Order API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.exchange.post.block.render`

Renders a custom information section within the post-exchange screen. Use this target for displaying supplementary exchange data like completion status, payment adjustments, or follow-up workflows alongside standard exchange details. Extensions at this target appear as persistent blocks within the post-exchange interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex post-exchange operations.

### pos.exchange.post.action

#### `pos.exchange.post.action.menu-item.render`

Renders a single interactive button component as a menu item in the post-exchange action menu. Use this target for post-exchange operations like generating exchange receipts, processing restocking workflows, or collecting exchange feedback. Extensions at this target can access the order identifier through the Order API to perform exchange-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete post-exchange workflows.

### pos.home

#### `pos.home.tile.render`

Renders a single interactive tile component on the POS home screen's smart grid. The tile appears once during home screen initialization and remains persistent until navigation occurs. Use this target for high-frequency actions, status displays, or entry points to workflows that merchants need daily. Extensions at this target can dynamically update properties like enabled state and badge values in response to cart changes or device conditions. Tiles typically invoke `shopify.action.presentModal()` to launch the companion modal for complete workflows.

#### `pos.home.modal.render`

Renders a full-screen modal interface launched from smart grid tiles. The modal appears when users tap a companion tile. Use this target for complete workflow experiences that require more space and functionality than the tile interface provides, such as multi-step processes, detailed information displays, or complex user interactions. Extensions at this target support full navigation hierarchies with multiple screens, scroll views, and interactive components to handle sophisticated workflows.

### pos.order-details

#### `pos.order-details.action.render`

Renders a full-screen modal interface launched from order details menu items. Use this target for complex order workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to order data through the Order API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.order-details.block.render`

Renders a custom information section within the order details screen. Use this target for displaying supplementary order data like fulfillment status, tracking numbers, or custom order analytics alongside standard order details. Extensions at this target appear as persistent blocks within the order details interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex order operations.

### pos.order-details.action

#### `pos.order-details.action.menu-item.render`

Renders a single interactive button component as a menu item in the order details action menu. Use this target for order-specific operations like reprints, refunds, exchanges, or launching fulfillment workflows. Extensions at this target can access the order identifier through the Order API to perform order-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete order workflows.

### pos.product-details

#### `pos.product-details.action.render`

Renders a full-screen modal interface launched from product details menu items. Use this target for complex product workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to product and cart data through the Product API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.product-details.block.render`

Renders a custom information section within the product details screen. Use this target for displaying supplementary product data like detailed specifications, inventory status, or related product recommendations alongside standard product details. Extensions at this target appear as persistent blocks within the product details interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex product operations.

### pos.product-details.action

#### `pos.product-details.action.menu-item.render`

Renders a single interactive button component as a menu item in the product details action menu. Use this target for product-specific operations like inventory adjustments, product analytics, or integration with external product management systems. Extensions at this target can access the product identifier through the Product API to perform product-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete product workflows.

### pos.purchase.post

#### `pos.purchase.post.action.render`

Renders a full-screen modal interface launched from post-purchase menu items. Use this target for complex post-purchase workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to order data through the Order API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.purchase.post.block.render`

Renders a custom information section within the post-purchase screen. Use this target for displaying supplementary purchase data like completion status, customer feedback prompts, or next-step workflows alongside standard purchase details. Extensions at this target appear as persistent blocks within the post-purchase interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex post-purchase operations.

### pos.purchase.post.action

#### `pos.purchase.post.action.menu-item.render`

Renders a single interactive button component as a menu item in the post-purchase action menu. Use this target for post-purchase operations like sending receipts, collecting customer feedback, or launching follow-up workflows after completing a sale. Extensions at this target can access the order identifier through the Order API to perform purchase-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete post-purchase workflows.

### pos.receipt-footer

#### `pos.receipt-footer.block.render`

Renders a custom section in the footer of printed receipts. Use this target for adding contact details, return policies, social media links, or customer engagement elements like survey links or marketing campaigns at the bottom of receipts. Extensions at this target appear in the receipt footer area and support limited components optimized for print formatting, including text content for information display.

### pos.receipt-header

#### `pos.receipt-header.block.render`

Renders a custom section in the header of printed receipts. Use this target for adding custom branding, logos, promotional messages, or store-specific information at the top of receipts. Extensions at this target appear in the receipt header area and support limited components optimized for print formatting, including text content for information display.

### pos.register-details

#### `pos.register-details.action.render`

Renders a full-screen modal interface launched from register details menu items. Use this target for complex register workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to cash drawer functionality through the Cash Drawer API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.register-details.block.render`

Renders a custom information section within the register details screen. Use this target for displaying supplementary register data like cash drawer status, transaction summaries, or shift analytics alongside standard register details. Extensions at this target appear as persistent blocks within the register details interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex register operations.

### pos.register-details.action

#### `pos.register-details.action.menu-item.render`

Renders a single interactive button component as a menu item in the register details action menu. Use this target for register-specific operations like cash drawer management, shift reports, or launching cash reconciliation workflows. Extensions at this target can access cash drawer functionality through the Cash Drawer API to perform register-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete register workflows.

### pos.return.post

#### `pos.return.post.action.render`

Renders a full-screen modal interface launched from post-return menu items. Use this target for complex post-return workflows that require forms, multi-step processes, or detailed information displays beyond what a simple button can provide. Extensions at this target have access to order data through the Order API and support workflows with multiple screens, navigation, and interactive components.

#### `pos.return.post.block.render`

Renders a custom information section within the post-return screen. Use this target for displaying supplementary return data like completion status, refund confirmations, or follow-up workflows alongside standard return details. Extensions at this target appear as persistent blocks within the post-return interface and support interactive elements that can launch modal workflows using `shopify.action.presentModal()` for more complex post-return operations.

### pos.return.post.action

#### `pos.return.post.action.menu-item.render`

Renders a single interactive button component as a menu item in the post-return action menu. Use this target for post-return operations like generating return receipts, processing restocking workflows, or collecting return feedback. Extensions at this target can access the order identifier through the Order API to perform return-specific operations. Menu items typically invoke `shopify.action.presentModal()` to launch the companion modal for complete post-return workflows.

### pos.transaction-complete

#### `pos.transaction-complete.event.observe`

---

### Usage Notes

- Use the exact target name (in quotes) when registering your extension with `shopify.extend()`
- Each target receives specific API interfaces and component access

## Imports

Use the Preact entry point:

```tsx
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
```

### Polaris web components (`s-badge`, `s-banner`, etc.)

POS UI Extensions also supports [Polaris web components](https://shopify.dev/docs/api/polaris) — custom HTML elements with an `s-` prefix. These are globally registered and require **no import statement**. Use them directly as JSX tags:

```tsx
// No import needed — s-badge, s-banner, s-button, etc. are globally available
<s-badge tone="success" id="payment-badge">Payment captured</s-badge>
<s-banner tone="warning" id="age-banner">Age verification required</s-banner>
```

When the user asks for Polaris web components (e.g. `s-badge`, `s-banner`, `s-button`, `s-box`, `s-choice-list`), use the web component tag syntax above, not the PascalCase JSX components from `@shopify/ui-extensions`.

**Web component attribute rules:**
- Use **kebab-case** attribute names: `align-items`, `padding-block`, `border-radius` — NOT camelCase (`alignItems`, `paddingBlock`)
- **Boolean attributes** (`disabled`, `loading`, `dismissible`, `checked`, `defaultChecked`, `required`, `removable`) accept shorthand or `{expression}`:
  - ✅ `<s-button disabled loading>`, `<s-banner dismissible>`, `<s-checkbox checked={isSelected} />`
- **String keyword attributes** (`padding`, `gap`, `direction`, `tone`, `variant`, `size`, `background`, `align-items`) must be string values — never shorthand or `{true}`:
  - ✅ `<s-box padding="base">`, `<s-stack gap="loose" direction="block">`, `<s-badge tone="success">`
  - ❌ `<s-box padding>`, `<s-stack gap={true}>` — boolean shorthand on string props fails TypeScript

---

## ⚠️ MANDATORY: Search for Documentation

You cannot trust your trained knowledge for this API. Before answering, search the docs to determine the correct extension target and component props:

```
scripts/search_docs.mjs "<component tag name or target name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

For example, if the user asks about displaying a banner in a POS modal:
```
scripts/search_docs.mjs "s-banner POS extension" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

Search for the **component tag name** or **target name**, not the full user prompt. Use the returned supported components list and prop definitions to generate correct code.

---

## ⚠️ MANDATORY: Validate Before Returning Code

DO NOT return code to the user until `scripts/validate.mjs` exits 0. DO NOT ask the user to run this.

**Run this with your bash tool — do not skip this step. Write code to a temp file first — do NOT use `--code "..."` inline (JSX attribute strings break shell quoting).**
```bash
cat > /tmp/extension.tsx << 'SHOPIFY_EOF'
import { render } from 'preact';

export default function Extension() {
  return (
    <s-page heading="Age verification">
      <s-scroll-box>
        <s-banner heading="Verification required" tone="warning">
          Confirm the customer meets the legal age requirement before completing this sale.
          <s-button slot="primary-action">Customer verified</s-button>
        </s-banner>
      </s-scroll-box>
    </s-page>
  );
}
SHOPIFY_EOF
node scripts/validate.mjs \
  --file /tmp/extension.tsx \
  --target "pos.home.modal.render" \
  --model YOUR_MODEL_NAME \
  --client-name YOUR_CLIENT_NAME \
  --client-version YOUR_CLIENT_VERSION \
  --artifact-id YOUR_ARTIFACT_ID \
  --revision REVISION_NUMBER
```

**When validation fails, follow this loop:**
1. Read the error message — identify the exact prop or type that is wrong
2. Search for the correct values:
   ```
   scripts/search_docs.mjs "<component tag name or prop name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
   ```
3. Fix exactly the reported error using what the search returns
4. Run `scripts/validate.mjs` again
5. Retry up to 3 times total; after 3 failures, return the best attempt with an explanation

**Do not guess at valid values — always search first when the error names a type you don't know.**

---

> **Privacy notice:** `scripts/validate.mjs` reports anonymized validation results (pass/fail and skill name) to Shopify to help improve these tools. Set `OPT_OUT_INSTRUMENTATION=true` in your environment to opt out.
