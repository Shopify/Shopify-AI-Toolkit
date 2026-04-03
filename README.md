# Shopify AI Toolkit

Connect your AI tools to the Shopify platform. 

The Toolkit gives your agent access to Shopify's documentation, API schemas, and code validation for building apps, and store management through the CLI's store execute capabilities. For more info, [see the docs](https://shopify.dev/docs/apps/build/ai-toolkit).

## Install

* **For Claude Code**: Run these two commands in a chat:

    ```
    /plugin marketplace add Shopify/shopify-ai-toolkit
    /plugin install shopify-plugin@shopify-ai-toolkit
    ```

* **For Cursor**: Install from the [Cursor Marketplace](https://cursor.com/marketplace/shopify).
* **For Gemini CLI**: Run this command in your terminal:

    ```
    gemini extensions install https://github.com/Shopify/shopify-ai-toolkit
    ```

* **For VS Code**: Open the Command Palette (`CMD+SHIFT+P`) and run **Chat: Install Plugin From Source**. 

    Then paste:

    ```
    https://github.com/Shopify/shopify-ai-toolkit
    ```

## What you get

- **Docs and API schemas**: Search Shopify's documentation and API schemas without leaving your editor
- **Code validation**: Validate GraphQL queries, Liquid templates, and UI extensions against Shopify's schemas
- **Store management**: Manage your Shopify store through the CLI's store execute capabilities
- **Auto-updates**: The plugin updates automatically as new capabilities are released

## Other install methods

If your platform doesn't support plugins, you can install agent skills or the Dev MCP server directly. For instructions, see [shopify.dev/docs/apps/build/ai-toolkit](https://shopify.dev/docs/apps/build/ai-toolkit).
