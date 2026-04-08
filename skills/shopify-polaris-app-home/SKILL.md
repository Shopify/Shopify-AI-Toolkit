---
name: shopify-polaris-app-home
description: "Build your app's primary user interface embedded in the Shopify admin. If the prompt just mentions `Polaris` and you can't tell based off of the context what API they meant, assume they meant this API."
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
   node scripts/validate.mjs --file /tmp/extension.tsx --target "app-home" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION --artifact-id YOUR_ARTIFACT_ID \
  --revision REVISION_NUMBER
   ```
   (Always include `--file`, `--target`, `--model`, `--client-name`, `--artifact-id`. Use your actual model name; use claude-code/cursor/etc. for client-name. For artifact-id, generate a stable random ID per code block and reuse it across retries. For revision, start at 1 and increment on each retry of the same artifact.)
4. If validation fails: search for the error type, fix, re-validate (max 3 retries)
5. Return code only after validation passes

**You must run both search_docs.mjs and validate.mjs in every response. Do not return code to the user without completing step 3.**

---

You are an assistant that helps Shopify developers write UI Framework code to interact with the latest Shopify polaris-app-home UI Framework version.

You should find all operations that can help the developer achieve their goal, provide valid UI Framework code along with helpful explanations.
Polaris App Home has a set of ready to use UI design patterns and templates for common use cases that you can use to build your app.


version: unversioned

## APIs

**Available APIs:** App, Config, Environment, Resource Fetching, ID Token, Intents, Loading, Modal API, Navigation, Picker, POS, Print, Resource Picker, Reviews, Save Bar, Scanner, Scopes, Share, Support, Toast, User, Web Vitals
**React Hooks:** useAppBridge

## Patterns

**Compositions:** Account connection, App card, Callout card, Empty state, Footer help, Index table, Interstitial nav, Media card, Metrics card, Resource list, Setup guide
**Templates:** Details, Homepage, Index, Settings

## Guides

**Available guides:** Using Polaris web components




Components available for Polaris App Home.
These examples have all the props available for the component. Some example values for these props are provided.
Refer to the developer documentation to find all valid values for a prop. Ensure the component is available for the target you are using.
```html
<s-avatar initials="JD" src="https://example.com/avatar.jpg" size="base" alt="Jane Doe"></s-avatar>
<s-badge tone="success" color="base" icon="check-circle" size="base">Fulfilled</s-badge>
<s-banner heading="Important" tone="info" dismissible>Message content</s-banner>
<s-box padding="base" background="subdued" border="base" border-radius="base">Content</s-box>
<s-button variant="primary" tone="auto" icon="save" type="submit">Save</s-button>
<s-button-group gap="base"><s-button variant="primary">Save</s-button><s-button variant="secondary">Cancel</s-button></s-button-group>
<s-checkbox label="Accept terms" name="terms" value="accepted"></s-checkbox>
<s-chip color="base" accessibility-label="Tag">Category</s-chip>
<s-choice-list label="Options" name="options"><s-choice value="1">Option 1</s-choice><s-choice value="2">Option 2</s-choice></s-choice-list>
<s-clickable href="/products/42" padding="base" background="subdued">Click area</s-clickable>
<s-clickable-chip color="strong" removable accessibility-label="Filter">Active</s-clickable-chip>
<s-color-field label="Brand color" name="brandColor" value="#FF5733" alpha></s-color-field>
<s-color-picker name="bgColor" value="#3498DB" alpha></s-color-picker>
<s-date-field label="Start date" name="startDate" value="2025-06-15" allow="2025--" required></s-date-field>
<s-date-picker type="single" name="selectedDate" value="2025-03-01"></s-date-picker>
<s-divider direction="inline" color="base"></s-divider>
<s-drop-zone label="Upload file" name="file" accept=".jpg,.png" multiple></s-drop-zone>
<s-email-field label="Email" name="email" placeholder="you@example.com" autocomplete="email" required></s-email-field>
<s-grid grid-template-columns="1fr 1fr" gap="base"><s-box>Col 1</s-box><s-box>Col 2</s-box></s-grid>
<s-heading>Section Title</s-heading>
<s-icon type="cart" tone="auto" color="base" size="base"></s-icon>
<s-image src="https://example.com/image.png" alt="Description" aspect-ratio="16/9" object-fit="cover" loading="lazy"></s-image>
<s-link href="https://example.com" tone="auto">Link text</s-link>
<s-button command-for="actions-menu" icon="menu-vertical"></s-button>
<s-menu id="actions-menu" accessibility-label="Actions"><s-button icon="edit" variant="tertiary">Edit</s-button></s-menu>
<s-modal id="my-modal" heading="Title" size="base"><s-text>Modal content</s-text></s-modal>
<s-money-field label="Amount" name="amount" min={0} max={999999}></s-money-field>
<s-number-field label="Quantity" name="qty" min={1} max={100} step={1} input-mode="numeric"></s-number-field>
<s-ordered-list><s-list-item>First</s-list-item><s-list-item>Second</s-list-item></s-ordered-list>
<s-page heading="Products" inline-size="base"><s-section heading="All products"><s-text>Content</s-text></s-section></s-page>
<s-paragraph tone="neutral" color="subdued">Body text content</s-paragraph>
<s-password-field label="Password" name="password" autocomplete="current-password" min-length="8" required></s-password-field>
<s-popover id="pop" inline-size="300px"><s-box padding="base"><s-text>Popover content</s-text></s-box></s-popover>
<s-query-container container-name="main">Content</s-query-container>
<s-search-field label="Search" name="query" placeholder="Search..." label-accessibility-visibility="exclusive"></s-search-field>
<s-section heading="Section" padding="base"><s-text>Section content</s-text></s-section>
<s-select label="Choose" name="choice" placeholder="Select..."><s-option value="a">A</s-option><s-option value="b">B</s-option></s-select>
<s-spinner size="base" accessibility-label="Loading"></s-spinner>
<s-stack direction="inline" gap="base" align-items="center"><s-text>Item 1</s-text><s-text>Item 2</s-text></s-stack>
<s-switch label="Enable" name="enabled" checked></s-switch>
<s-table variant="auto"><s-table-header-row><s-table-header list-slot="primary">Name</s-table-header><s-table-header list-slot="labeled" format="currency">Price</s-table-header></s-table-header-row><s-table-body><s-table-row><s-table-cell>Item</s-table-cell><s-table-cell>$25</s-table-cell></s-table-row></s-table-body></s-table>
<s-text type="strong" tone="success" color="base">Styled text</s-text>
<s-text-area label="Description" name="desc" rows={4} max-length={500}></s-text-area>
<s-text-field label="Name" name="name" placeholder="Enter name" icon="product" required></s-text-field>
<s-thumbnail src="https://example.com/thumb.jpg" alt="Product" size="small"></s-thumbnail>
<s-icon type="info" interest-for="my-tip"></s-icon><s-tooltip id="my-tip">Hover for info</s-tooltip>
<s-unordered-list><s-list-item>Item A</s-list-item><s-list-item>Item B</s-list-item></s-unordered-list>
<s-url-field label="Website" name="url" autocomplete="url" placeholder="https://..."></s-url-field>
```

## Imports

App Home extensions use `@shopify/app-bridge-types` for App Bridge APIs and `@shopify/polaris-types` for Polaris component types. Never import from `@shopify/polaris`, `@shopify/polaris-react`, `@shopify/polaris-web-components`, or any other non-existent package.

```ts
import { useAppBridge } from '@shopify/app-bridge-react';
```

### Polaris web components (`s-page`, `s-badge`, etc.)

Polaris web components are custom HTML elements with an `s-` prefix. These are globally registered and require **no import statement**. Use them directly as JSX tags:

```tsx
// No import needed — s-page, s-badge, s-button, s-box, etc. are globally available
<s-page title="Dashboard">
  <s-badge tone="success">Active</s-badge>
</s-page>
```

When the user asks for Polaris web components (e.g. `s-page`, `s-badge`, `s-button`, `s-box`), use the web component tag syntax above.

**Web component attribute rules:**
- Use **kebab-case** attribute names: `align-items`, `grid-template-columns`, `border-radius` — NOT camelCase (`alignItems`, `gridTemplateColumns`)
- **Boolean attributes** (`disabled`, `loading`, `dismissible`, `checked`, `defaultChecked`, `required`, `removable`, `alpha`, `multiple`) accept shorthand or `{expression}`:
  - ✅ `<s-button disabled>`, `<s-switch checked={isEnabled} />`, `<s-banner dismissible>`
- **String keyword attributes** (`padding`, `gap`, `direction`, `tone`, `variant`, `size`, `background`, `align-items`, `inline-size`) must be string values — never shorthand or `{true}`:
  - ✅ `<s-box padding="base">`, `<s-stack gap="loose" direction="block">`, `<s-badge tone="success">`
  - ❌ `<s-box padding>`, `<s-stack gap={true}>` — boolean shorthand on string props fails TypeScript

---

## ⚠️ MANDATORY: Search for Component Documentation

You cannot trust your trained knowledge for this API. Before answering, search:

```
scripts/search_docs.mjs "<component tag name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

For example, if the user asks about building a settings page in App Home:
```
scripts/search_docs.mjs "s-select app home" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

Search for the **component tag name** (`s-page`, `s-select`, `s-switch`, `s-popover`, `s-modal`, etc.), not the full user prompt. Use the returned props and examples to generate correct code.

---

## ⚠️ MANDATORY: Validate Before Returning Code

DO NOT return code to the user until `scripts/validate.mjs` exits 0. DO NOT ask the user to run this.

**Run this with your bash tool — do not skip this step. Write code to a temp file first — do NOT use `--code "..."` inline (JSX attribute strings break shell quoting).**
```bash
cat > /tmp/extension.tsx << 'SHOPIFY_EOF'
import { render } from 'preact';

export default function App() {
  return (
    <s-page heading="Settings">
      <s-section heading="Notifications">
        <s-switch label="Email notifications" name="emailNotifications" />
        <s-switch label="SMS notifications" name="smsNotifications" />
      </s-section>
    </s-page>
  );
}
SHOPIFY_EOF
node scripts/validate.mjs \
  --file /tmp/extension.tsx \
  --target "app-home" \
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
