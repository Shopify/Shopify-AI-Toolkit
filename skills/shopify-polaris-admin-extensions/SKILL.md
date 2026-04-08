---
name: shopify-polaris-admin-extensions
description: "Add custom actions and blocks from your app at contextually relevant spots throughout the Shopify Admin. Admin UI Extensions also supports scaffolding new adminextensions using Shopify CLI commands."
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

You are an assistant that helps Shopify developers write UI Framework code to interact with the latest Shopify polaris-admin-extensions UI Framework version.

You should find all operations that can help the developer achieve their goal, provide valid UI Framework code along with helpful explanations.
Admin Extensions integrate into the Shopify admin at contextual locations for merchant workflows.
Admin actions are a UI extension that you can use to create transactional workflows within existing pages of the Shopify admin. Merchants can launch these UI extensions from the More actions menus on resource pages or from an index table's bulk action menu when one or more resources are selected. After the UI extensions are launched, they display as modals. After they're closed, the page updates with the changes from the action.

## IMPORTANT : ALWAYS USE THE CLI TO SCAFFOLD A NEW EXTENSION

Shopify CLI generates templates that aligns with the latest available version and is not prone to errors. ALWAYS use the CLI Command to Scaffold a new Admin UI extension

CLI Command to Scaffold a new Admin Action Extension

```bash
shopify app generate extension --template admin_action --name my-admin-action
```

 Admin blocks are built with UI extensions and enable your app to embed contextual information and inputs directly on resource pages in the Shopify admin. When a merchant has added them to their pages, these UI extensions display as cards inline with the other resource information. Merchants need to manually add and pin the block to their page in the Shopify admin before they can use it.
 With admin blocks, merchants can view and modify information from your app and other data on the page simultaneously. To facilitate complex interactions and transactional changes, you can launch admin actions directly from admin blocks.

 CLI Command to Scaffold a new Admin Block Extension:

 ```bash
 shopify app generate extension --template admin_block --name my-admin-block
 ```

 Admin link extensions let you direct merchants from pages in the Shopify admin to related, complex workflows in your app. For example, the Shopify Flow app has an admin link extension that directs merchants to a page of the app where they can run an automation for any order:
```bash
shopify app generate extension --template admin_link --name admin-link-extension
```

Admin print actions are a special form of UI extension designed to let your app print documents from key pages in the Shopify admin. Unlike typical actions provided by UI extensions, admin print actions are found under the Print menu on orders and product pages. Additionally, they contain special APIs to let your app display a preview of a document and print it.
CLI Command to Scaffold a new Admin Print Action Extension:

```bash
shopify app generate extension --template admin_print --name my-admin-print-extension
```


version: 2026-01

## Target APIs

**Contextual APIs:** Customer Segment Template Extension API, Discount Function Settings API, Order Routing Rule API, Product Details Configuration API, Product Variant Details Configuration API, Purchase Options Card Configuration API, Validation Settings API
**Core APIs:** Action Extension API, Block Extension API, Print Action Extension API, Standard API
**Utility APIs:** Intents API, Picker API, Resource Picker API, Should Render API

## Polaris Web Components

**Actions:** Button, ButtonGroup, Clickable, ClickableChip, Link, Menu
**Feedback and status indicators:** Badge, Banner, Spinner
**Forms:** Checkbox, ChoiceList, ColorField, ColorPicker, DateField, DatePicker, EmailField, Form, FunctionSettings, MoneyField, NumberField, PasswordField, SearchField, Select, Switch, TextArea, TextField, URLField
**Layout and structure:** Box, Divider, Grid, OrderedList, QueryContainer, Section, Stack, Table, UnorderedList
**Media and visuals:** Avatar, Icon, Image, Thumbnail
**Settings and templates:** AdminAction, AdminBlock, AdminPrintAction
**Typography and content:** Chip, Heading, Paragraph, Text, Tooltip

## Guides

**Available guides:** Network Features



## Components available for Admin UI extensions.
These examples have all the props available for the component. Some example values for these props are provided.
Refer to the developer documentation to find all valid values for a prop. Ensure the component is available for the target you are using.
```html
<s-admin-action heading="Edit product" loading>Content</s-admin-action>
<s-admin-block heading="Custom Fields" collapsed-summary="3 fields configured">Content</s-admin-block>
<s-admin-print-action src="https://example.com/invoice.pdf"></s-admin-print-action>
<s-avatar initials="JD" src="https://example.com/avatar.jpg" size="base" alt="Jane Doe"></s-avatar>
<s-badge tone="success" color="base" icon="check-circle" size="base">Fulfilled</s-badge>
<s-banner heading="Important notice" tone="info" dismissible hidden>Message content</s-banner>
<s-box accessibility-label="Container" accessibility-role="group" accessibility-visibility="visible" background="subdued" block-size="auto" border="base" border-color="base" border-radius="base" border-style="solid" border-width="base" display="auto" inline-size="100%" max-block-size="500px" max-inline-size="100%" min-block-size="100px" min-inline-size="50px" overflow="hidden" padding="base" padding-block="large" padding-block-start="base" padding-block-end="base" padding-inline="large" padding-inline-start="base" padding-inline-end="base">Content</s-box>
<s-button accessibility-label="Save product" disabled command="--show" command-for="my-modal" icon="save" interest-for="my-tooltip" lang="en" loading type="submit" tone="auto" variant="primary" target="_blank" href="https://example.com" download="file.csv" inline-size="fill">Save</s-button>
<s-button-group gap="base" accessibility-label="Actions"><s-button slot="primary-action" variant="primary">Save</s-button><s-button slot="secondary-actions">Cancel</s-button></s-button-group>
<s-checkbox accessibility-label="Accept" checked default-checked details="Required" error="Must accept" label="Accept terms" required name="terms" disabled value="accepted" indeterminate default-indeterminate></s-checkbox>
<s-chip color="base" accessibility-label="Category">Electronics</s-chip>
<s-choice-list details="Pick shipping" disabled error="Required" label="Shipping method" label-accessibility-visibility="exclusive" multiple name="shipping" values={["standard"]}><s-choice value="standard" selected default-selected disabled accessibility-label="Standard shipping">Standard</s-choice><s-choice value="express">Express</s-choice></s-choice-list>
<s-clickable accessibility-label="View product" command="--show" command-for="detail-modal" disabled download="file.pdf" href="/products/42" interest-for="tip" lang="en" loading target="_blank" type="button" padding="base" background="subdued" border-radius="base">Content</s-clickable>
<s-clickable-chip color="base" accessibility-label="Filter" removable hidden href="/filter" disabled command="--show" command-for="chip-menu" interest-for="chip-tip">Active</s-clickable-chip>
<s-color-field name="brandColor" value="#FF5733" default-value="#000000" disabled label="Brand color" label-accessibility-visibility="exclusive" placeholder="Pick color" read-only required error="Invalid" details="Brand color" autocomplete="off" alpha></s-color-field>
<s-color-picker alpha value="#3498DB" default-value="#000000" name="accent"></s-color-picker>
<s-date-field name="startDate" value="2025-06-15" default-value="2025-01-01" disabled label="Start date" label-accessibility-visibility="exclusive" placeholder="YYYY-MM-DD" read-only required error="Invalid date" details="Event start" autocomplete="bday" allow="2025--" allow-days="1,2,3,4,5" disallow="2025-12-25" disallow-days="0,6" view="2025-06" default-view="2025-01"></s-date-field>
<s-date-picker type="range" value="2025-03-01" default-value="2025-01-01" name="dateRange" default-view="2025-06" view="2025-03" allow="2025--" disallow="2025-12-25" allow-days="1,2,3,4,5" disallow-days="0,6"></s-date-picker>
<s-divider direction="inline" color="base"></s-divider>
<s-drop-zone accept=".jpg,.png" accessibility-label="Upload images" disabled error="File too large" label="Product images" label-accessibility-visibility="exclusive" multiple name="images" required value="file.jpg"></s-drop-zone>
<s-email-field name="email" value="test@example.com" default-value="user@shop.com" disabled label="Email" label-accessibility-visibility="exclusive" placeholder="you@example.com" read-only required error="Invalid email" details="Contact email" autocomplete="email" max-length="100" min-length="5"></s-email-field>
<s-form id="my-form"><s-text-field label="Name" name="name"></s-text-field><s-button type="submit">Submit</s-button></s-form>
<s-function-settings id="my-settings"><s-number-field label="Min order" name="minAmount" min={0}></s-number-field></s-function-settings>
<s-grid grid-template-columns="1fr 2fr" grid-template-rows="auto" align-items="center" justify-items="start" place-items="center" align-content="start" justify-content="space-between" place-content="center" gap="base" row-gap="large" column-gap="base" padding="base" background="subdued"><s-grid-item grid-column="1 / 3" grid-row="1" padding="base">Col 1</s-grid-item><s-grid-item>Col 2</s-grid-item></s-grid>
<s-heading accessibility-role="presentation" accessibility-visibility="visible" line-clamp="2">Page Title</s-heading>
<s-icon type="cart" tone="success" color="base" size="base" interest-for="cart-tip"></s-icon>
<s-image src="https://example.com/product.jpg" src-set="img-1x.jpg 1x, img-2x.jpg 2x" sizes="(max-width: 600px) 100vw, 50vw" alt="Product" loading="lazy" accessibility-role="presentation" inline-size="100%" aspect-ratio="16/9" object-fit="cover" border="base" border-color="base" border-radius="base" border-style="solid" border-width="base"></s-image>
<s-link accessibility-label="Docs" command="--show" command-for="help-modal" interest-for="link-tip" download="report.csv" href="https://shopify.dev" lang="en" target="_blank" tone="auto">Shopify Docs</s-link>
<s-menu id="actions-menu" accessibility-label="Product actions"><s-button variant="tertiary" icon="edit">Edit</s-button><s-button variant="tertiary" icon="delete" tone="critical">Delete</s-button></s-menu>
<s-money-field name="price" value="29.99" default-value="0" disabled label="Price" label-accessibility-visibility="exclusive" placeholder="0.00" read-only required error="Required" details="Product price" autocomplete="off" max={999999} min={0}></s-money-field>
<s-number-field name="qty" value="10" default-value="1" disabled label="Quantity" label-accessibility-visibility="exclusive" placeholder="0" read-only required error="Invalid" details="Enter quantity" autocomplete="off" input-mode="numeric" max={100} min={1} prefix="#" step={1} suffix="units"></s-number-field>
<s-ordered-list><s-list-item>First</s-list-item><s-list-item>Second</s-list-item></s-ordered-list>
<s-paragraph accessibility-visibility="visible" font-variant-numeric="tabular-nums" tone="neutral" dir="ltr" color="subdued" line-clamp="3">Body text content</s-paragraph>
<s-password-field name="password" value="secret123" default-value="" disabled label="Password" label-accessibility-visibility="exclusive" placeholder="Enter password" read-only required error="Too short" details="Min 8 chars" autocomplete="current-password" max-length="128" min-length="8"></s-password-field>
<s-query-container container-name="main">Content</s-query-container>
<s-search-field name="query" value="blue shirt" default-value="" disabled label="Search" label-accessibility-visibility="exclusive" placeholder="Search products" read-only required error="No results" details="Search catalog" autocomplete="off" max-length="200" min-length="1"></s-search-field>
<s-section accessibility-label="Details" heading="Product details" padding="base">Content</s-section>
<s-select disabled name="status" value="active" details="Pick status" error="Required" label="Status" label-accessibility-visibility="exclusive" placeholder="Select status" required icon="product"><s-option-group disabled label="States"><s-option value="active" disabled selected default-selected>Active</s-option><s-option value="draft">Draft</s-option></s-option-group></s-select>
<s-spinner accessibility-label="Loading products" size="base"></s-spinner>
<s-stack direction="inline" justify-content="space-between" align-items="center" align-content="start" gap="base" row-gap="large" column-gap="base" padding="base" background="subdued"><s-text>Item 1</s-text><s-text>Item 2</s-text></s-stack>
<s-switch accessibility-label="Toggle" checked default-checked details="Enable feature" error="Required" label="Active" required name="active" disabled value="on" label-accessibility-visibility="exclusive"></s-switch>
<s-table loading paginate has-previous-page has-next-page variant="auto"><s-table-header-row><s-table-header list-slot="primary">Product</s-table-header><s-table-header list-slot="labeled" format="currency">Price</s-table-header></s-table-header-row><s-table-body><s-table-row click-delegate="first-cell"><s-table-cell>Blue T-Shirt</s-table-cell><s-table-cell>$29.99</s-table-cell></s-table-row></s-table-body></s-table>
<s-text accessibility-visibility="visible" dir="ltr" color="subdued" type="strong" tone="success" font-variant-numeric="tabular-nums" interest-for="text-tip">Styled text</s-text>
<s-text-area name="description" value="A great product" default-value="" disabled label="Description" label-accessibility-visibility="exclusive" placeholder="Enter description" read-only required error="Too short" details="Product description" autocomplete="off" max-length="500" min-length="10" rows={4}></s-text-area>
<s-text-field disabled name="title" value="Blue T-Shirt" default-value="Untitled" details="Product name" error="Required" label="Title" label-accessibility-visibility="exclusive" placeholder="Enter title" read-only required autocomplete="off" icon="product" max-length="255" min-length="1" prefix="SKU-" suffix="™"></s-text-field>
<s-thumbnail src="https://example.com/thumb.jpg" alt="Product" size="base"></s-thumbnail>
<s-tooltip id="my-tip">Helpful tooltip text</s-tooltip>
<s-unordered-list><s-list-item>Item A</s-list-item><s-list-item>Item B</s-list-item></s-unordered-list>
<s-url-field name="website" value="https://example.com" default-value="https://" disabled label="Website" label-accessibility-visibility="exclusive" placeholder="https://example.com" read-only required error="Invalid URL" details="Store URL" autocomplete="url" max-length="2000" min-length="10"></s-url-field>
```

## Imports

Use the Preact entry point:

```ts
import '@shopify/ui-extensions/preact';
import { render } from 'preact';
```

### Polaris web components (`s-admin-action`, `s-badge`, etc.)

Polaris web components are custom HTML elements with an `s-` prefix. These are globally registered and require **no import statement**. Use them directly as JSX tags:

```tsx
// No import needed — s-admin-action, s-badge, s-button, etc. are globally available
<s-admin-action heading="My Action">
  <s-button slot="primary-action">Submit</s-button>
  <s-button slot="secondary-actions">Cancel</s-button>
</s-admin-action>
```

When the user asks for Polaris web components (e.g. `s-admin-action`, `s-badge`, `s-button`, `s-text`), use the web component tag syntax above.

**Web component attribute rules:**
- Use **kebab-case** attribute names: `align-items`, `padding-block`, `border-radius` — NOT camelCase (`alignItems`, `paddingBlock`)
- **Boolean attributes** (`disabled`, `loading`, `dismissible`, `hidden`, `required`, `checked`, `defaultChecked`) accept shorthand or `{expression}`:
  - ✅ `<s-button disabled loading>`, `<s-banner dismissible>`, `<s-checkbox checked={isChecked} />`
- **String keyword attributes** (`padding`, `gap`, `direction`, `tone`, `variant`, `size`, `background`, `align-items`) must be string values — never shorthand or `{true}`:
  - ✅ `<s-box padding="base">`, `<s-stack gap="loose" direction="block">`, `<s-badge tone="success">`
  - ❌ `<s-box padding>`, `<s-stack gap={true}>` — boolean shorthand on string props fails TypeScript

---

## ⚠️ MANDATORY: Search for Component Documentation

You cannot trust your trained knowledge for this API. Before answering, search:

```
scripts/search_docs.mjs "<component tag name>" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

For example, if the user asks about building a form in an Admin action:
```
scripts/search_docs.mjs "s-select admin extension" --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION
```

Search for the **component tag name** (`s-form`, `s-select`, `s-money-field`, etc.), not the full user prompt. Use the returned props and examples to generate correct code.

---

## ⚠️ MANDATORY: Validate Before Returning Code

DO NOT return code to the user until `scripts/validate.mjs` exits 0. DO NOT ask the user to run this.

**Run this with your bash tool — do not skip this step. Write code to a temp file first — do NOT use `--code "..."` inline (JSX attribute strings break shell quoting).**
```bash
cat > /tmp/extension.tsx << 'SHOPIFY_EOF'
import { render } from 'preact';

export default function Extension() {
  return (
    <s-admin-action heading="Update order note">
      <s-text-field label="Note" name="note" required />
      <s-button slot="primary-action" type="submit">Save</s-button>
      <s-button slot="secondary-actions">Cancel</s-button>
    </s-admin-action>
  );
}
SHOPIFY_EOF
node scripts/validate.mjs \
  --file /tmp/extension.tsx \
  --target "admin.order-details.action.render" \
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
