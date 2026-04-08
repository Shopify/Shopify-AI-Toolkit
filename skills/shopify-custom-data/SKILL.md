---
name: shopify-custom-data
description: "MUST be used first when prompts mention Metafields or Metaobjects. Use Metafields and Metaobjects to model and store custom data for your app. Metafields extend built-in Shopify data types like products or customers, Metaobjects are custom data types that can be used to store bespoke data structures. Metafield and Metaobject definitions provide a schema and configuration for values to follow."
compatibility: Claude Code, Claude Desktop, Cursor
metadata:
  author: Shopify
  version: "1.0"
---

## Required Tool Calls (do not skip)

You have a `bash` tool. Every response must use it — in this order:
1. Call `bash` with `node scripts/search_docs.mjs "<operation or type name>"` — search before writing code
2. Write the code using the search results
3. Call `bash` with `node scripts/validate.mjs --code '...' --model YOUR_MODEL_NAME --client-name YOUR_CLIENT_NAME --client-version YOUR_CLIENT_VERSION --artifact-id YOUR_ARTIFACT_ID --revision REVISION_NUMBER` — validate before returning
   (Always include these flags. Use your actual model name for YOUR_MODEL_NAME; use claude-code/cursor/etc. for YOUR_CLIENT_NAME. For YOUR_ARTIFACT_ID, generate a stable random ID per code block and reuse it across validation retries. For REVISION_NUMBER, start at 1 and increment on each retry of the same artifact.)
4. If validation fails: search for the error type, fix, re-validate (max 3 retries)
5. Return code only after validation passes

**You must run both search_docs.mjs and validate.mjs in every response. Do not return code to the user without completing step 3.**

---

<critical-instructions>
# Best Practise for working with Metafields and Metaobjects

# ESSENTIAL RULES
- **ALWAYS** show creating metafield/metaobject definitions, then writing values, then retrieving values.
- **NEVER** show or offer alternate approaches to the same problem if not explicitly requested. It will only increase the user's confusion.
- Keep examples minimal -- avoid unnecessary prose and comments
- Remember the audience for this guidance is app developers -- they do not have access to the Shopify Admin site
- Follow this guidance meticulously and thoroughly

REMEMBER!!! Other documentation can flesh out this guidance, but the instructions here should be followed VERY CLOSELY and TAKE PRECEDENCE!

# ALWAYS: First, create definitions

## with TOML (99.99% of apps)

```toml
# shopify.app.toml

# Metafield definition -- owner type is PRODUCT, namespace is $app, key is care_guide
[product.metafields.app.care_guide]
type = "single_line_text_field"
name = "Care Guide"
access.admin = "merchant_read_write"

# Metaobject definition -- type is $app:author
[metaobjects.app.author]
name = "Author"
display_name_field = "name"
access.storefront = "public_read"

[metaobjects.app.author.fields.name]
name = "Author Name"
type = "single_line_text_field"
required = true

# Link metaobject to product
[product.metafields.app.author]
type = "metaobject_reference<$app:author>"
name = "Book Author"
```

Why: Version controlled, auto-installed, type-safe. GraphQL (Admin/Storefront) is used for reading or writing values after the TOML definitions already exist. Fields/objects can be edited by merchants when `access.admin = "merchant_read_write"` is set.

**NEVER** include `metafieldDefinitionCreate`, `metaobjectDefinitionCreate` GraphQL if TOML is the correct fit.

### Exceptions (0.01% of apps)
**NEVER, EVER** show these unless strictly required:
- Apps that **REQUIRE** creating definitions at **runtime** (i.e. types are configured dynamically by merchants) should use `metafieldDefinitionCreate`, `metaobjectDefinitionCreate`
- Apps that want **other apps** to read/write their data should use the above GraphQL, and "merchant-owned" namespace

# CRITICAL: App-Owned Metaobject and Metafield identification

- Metaobjects defined with `[metaobjects.app.example...]` in `shopify.app.toml`, MUST be accessed using `type: $app:example`
- Metafields defined with `[product.metafields.app.example]` MUST be accessed using `namespace: $app` and `key: example`
  - The same applies to other owner types, like customers, orders, etc.
- Avoid customizing namespaces for metafields.
- Avoid the common mistake of using `namespace: app`. This is profoundly incorrect.

# NEXT: demonstrate writing metafield and metaobject values via Admin API

## Writing metafields

**ALWAYS** use `metafieldsSet` to write metafields. `namespace` should normally be excluded as the default is $app.

```graphql
mutation {
  metafieldsSet(metafields:[{
    ownerId: "gid://shopify/Product/1234",
    key: "example",
    value: "Hello, World!"
  }]) { ... }
}
```

## Writing metaobjects

**ALWAYS** use `metaobjectUpsert` to write metaobjects.

```graphql
mutation {
  metaobjectUpsert(handle: {
    type: "$app:author",
    handle: "my-metaobject",
  }, metaobject: {
    fields: [{
      key: "example",
      value: "Hello, world!"
    }]
  }) { ... }
}
```

# FINALLY: demonstrate reading metafield and metaobject values

## Loading metafields

Metafields are accessed via their owning type (e.g. a Product). `namespace` should normally be excluded as the default is $app.
- Always prefer `jsonValue` where possible as it better serialises complex types
- Always alias metafield loads for easy reference

```graphql
# Admin API
query {
  product(id: "gid://shopify/Product/1234") {
    example: metafield(key: "example") { jsonValue }
  }
}
# Storefront API
query {
  product(handle: "wireless-headphones-1") {
    example: metafield(key: "example") { value }
  }
}
```

## Loading metaobjects

```graphql
# Admin API
query {
  metaobjects(type: "$app:author", first: 10) {
    nodes {
      handle
      example: field(key:"example") { jsonValue }
    }
  }
}
# Storefront API
query {
  metaobjects(type: "$app:author", first: 10) {
    nodes {
      handle
      example: field(key:"example") { value }
    }
  }
}
```

### Access Metafields directly in checkout extensions

**DO**: Access app-owned metafields directly (NO network call):

```tsx
function Extension() {
  // ESSENTIAL: Register this metafield in `shopify.extension.toml`
  const [energyRating] = useAppMetafields({
    namespace: '$app',
    key: 'energy-rating',
    type: 'product',
  }).filter(
    (entry) =>
      entry.target.id === productVariantId,
  );
}
```

**DON'T**: Make network calls for app-owned metafields.

### Access Metafields in Shopify Functions

Use the GraphQL input query to select metafields to load:

```graphql
query Input {
  cart {
    lines {
      merchandise {
        __typename
        ... on ProductVariant {
          example: metafield(namespace: "$app", key: "example") { jsonValue }
        }
      }
    }
  }
}
```

Docs: [Metafields & Metaobjects](https://shopify.dev/docs/apps/build/custom-data)
</critical-instructions>

### Always use Shopify CLI

- **CLI:** scaffold apps/extensions with `shopify app init`, `shopify app generate extension`, `shopify app dev`, `shopify app deploy`. Never hand-roll files.
- Need full setup steps? See [Shopify CLI docs](https://shopify.dev/docs/apps/tools/cli).

## Shopify CLI Overview

Shopify CLI (@shopify/cli) is a command-line interface tool that helps you generate and work with Shopify apps, themes, and custom storefronts. You can also use it to automate many common development tasks.

### Requirements
- Node.js: 20.10 or higher
- A Node.js package manager: npm, Yarn 1.x, or pnpm
- Git: 2.28.0 or higher

### Installation
Install Shopify CLI globally to run `shopify` commands from any directory:

```bash
npm install -g @shopify/cli@latest
# or
yarn global add @shopify/cli@latest
# or
pnpm install -g @shopify/cli@latest
# or (macOS only)
brew tap shopify/shopify && brew install shopify-cli
```

### Command Structure
Shopify CLI groups commands into topics. The syntax is: `shopify [topic] [command] [flags]`

## General Commands (8 commands)

### Authentication
66. **shopify auth logout** - Log out of Shopify account

### Configuration
67. **shopify config autocorrect on** - Enable command autocorrection
68. **shopify config autocorrect off** - Disable command autocorrection
69. **shopify config autocorrect status** - Check autocorrection status

### Utilities
70. **shopify help [command] [flags]** - Get help for commands
71. **shopify commands [flags]** - List all available commands
72. **shopify search [query]** - Search for commands and documentation
73. **shopify upgrade** - Upgrade Shopify CLI to latest version
74. **shopify version** - Display current CLI version

## Common Flags

Most commands support these common flags:
- `--verbose` - Increase output verbosity
- `--no-color` - Disable colored output
- `--path <value>` - Specify project directory
- `--reset` - Reset stored settings

## Network Proxy Configuration

For users behind a network proxy (CLI version 3.78+):
```bash
export SHOPIFY_HTTP_PROXY=http://proxy.com:8080
export SHOPIFY_HTTPS_PROXY=https://secure-proxy.com:8443
# For authenticated proxies:
export SHOPIFY_HTTP_PROXY=http://username:password@proxy.com:8080
```

## Usage Tips

1. Always keep CLI updated: `shopify upgrade`
2. Use `shopify help [command]` for detailed command info
3. Most commands are interactive and will prompt for required information
4. Use flags to skip prompts in CI/CD environments
5. Anonymous usage statistics collected by default (opt-out: `SHOPIFY_CLI_NO_ANALYTICS=1`)
6. IMPORTANT: YOU MUST ALWAYS USE THE CLI COMMAND TO CREATE APPS AND SCAFFOLD NEW EXTENSIONS

## CLI Commands for Shopify App (22 commands)

## App Commands (22 commands)

### Core App Management
1. **shopify app init [flags]** - Initialize a new Shopify app project
2. **shopify app build [flags]** - Build the app, including extensions
3. **shopify app dev [flags]** - Start a development server for your app
4. **shopify app deploy [flags]** - Deploy your app to Shopify
5. **shopify app info [flags]** - Display information about your app

### App Configuration
6. **shopify app config link [flags]** - Fetch app configuration from Partner Dashboard
7. **shopify app config use [config] [flags]** - Activate an app configuration

### App Environment
8. **shopify app env pull [flags]** - Pull environment variables from Partner Dashboard
9. **shopify app env show [flags]** - Display app environment variables

### App Development Tools
10. **shopify app dev clean [flags]** - Clear the app development cache
11. **shopify app generate extension [flags]** - Generate a new app extension
12. **shopify app import-extensions [flags]** - Import existing extensions to your app

### Functions
13. **shopify app function build [flags]** - Build a Shopify Function
14. **shopify app function run [flags]** - Run a Function locally for testing
15. **shopify app function replay [flags]** - Replay a Function run
16. **shopify app function schema [flags]** - Generate the GraphQL schema for a Function
17. **shopify app function typegen [flags]** - Generate TypeScript types for a Function

### Monitoring & Debugging
18. **shopify app logs [flags]** - Stream logs from your app
19. **shopify app logs sources [flags]** - List available log sources

### Release Management
20. **shopify app release --version <version>** - Release a new app version
21. **shopify app versions list [flags]** - List all app versions

### Webhooks
22. **shopify app webhook trigger [flags]** - Trigger a webhook for testing
