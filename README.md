# Shopify Dev MCP - AI Agent Plugin

This plugin connects AI coding agents to the Shopify Dev MCP server, giving them access to Shopify's dev docs, API schemas, and development guidance. Ask questions and build on top of Shopify APIs without leaving your editor or terminal.

**What you get:**

- Search Shopify docs and API schemas on the fly
- Generate code for GraphQL Admin API, Storefront API, Functions, Liquid, and more
- Validate components, GraphQL, and theme files to ensure they're free of hallucinations
- Build Shopify apps faster with context-aware assistance

## Requirements

* Node.js 18+ with npm/npx available
* One of the supported agents below

> **First-run note:** On first use, npx will download the `@shopify/dev-mcp` package and its dependencies (~3 MB). This takes a few seconds and only happens once per machine.

## Installation

### GitHub Copilot (VS Code)

Open the Command Palette (`Cmd+Shift+P`) and run:

```
Chat: Install Plugin From Source
```

Enter the repository URL: `https://github.com/Shopify/Shopify-AI-Toolkit`

Or use the Copilot CLI:

```bash
copilot plugin install Shopify/Shopify-AI-Toolkit
```

### Gemini CLI

```bash
gemini extensions install https://github.com/Shopify/Shopify-AI-Toolkit
```

### Claude Code

```bash
/plugin marketplace add Shopify/Shopify-AI-Toolkit
/plugin install shopify-plugin@shopify-plugin
```

### Cursor

Install via **Dashboard → Settings → Plugins → Team Marketplaces → Import** and paste:

```
https://github.com/Shopify/Shopify-AI-Toolkit
```

Or browse for it on [cursor.directory](https://cursor.directory).

We also recommend [installing the Shopify CLI](https://shopify.dev/docs/api/shopify-cli#installation) to make it easier to build and test your app.

## Usage

Once installed, you can ask questions and give tasks like:

- "Create a validation Function requiring minimum 5 items in cart before checkout."
- "How do I create a product using the Admin API?"
- "Show me an example of a webhook subscription."
- "What fields are available on the Order object?"

The MCP server automatically searches Shopify's documentation to provide accurate responses.

## Resources

- [Shopify Dev MCP documentation](https://shopify.dev/docs/apps/build/devmcp)
- [Get started with Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Scaffold a Shopify app](https://shopify.dev/docs/apps/build/scaffold-app)

## Contributing

Thanks for your interest but we don't accept pull requests. Any pull requests will be automatically closed.

If you are a Shopify employee, please open your pull request at [Shopify/dev-mcp](https://github.com/Shopify/dev-mcp).