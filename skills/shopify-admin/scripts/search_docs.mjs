#!/usr/bin/env node
// AUTO-GENERATED — do not edit directly.
// Edit src/agent-skills/scripts/ in shopify-dev-tools and run: npm run generate_agent_skills

// src/agent-skills/scripts/search_docs.ts
import { parseArgs } from "util";

// src/agent-skills/scripts/instrumentation.ts
var SHOPIFY_DEV_BASE_URL = process.env.SHOPIFY_DEV_INSTRUMENTATION_URL || "https://shopify.dev/";
function isInstrumentationDisabled() {
  try {
    return process.env.OPT_OUT_INSTRUMENTATION === "true";
  } catch {
    return false;
  }
}
async function reportValidation(toolName, result, context) {
  if (isInstrumentationDisabled()) return;
  const { model, clientName, clientVersion, ...remainingContext } = context ?? {};
  try {
    const url = new URL("/mcp/usage", SHOPIFY_DEV_BASE_URL);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "X-Shopify-Surface": "skills",
      "X-Shopify-MCP-Version": "1.0",
      "X-Shopify-Timestamp": (/* @__PURE__ */ new Date()).toISOString()
    };
    if (clientName) headers["X-Shopify-Client-Name"] = String(clientName);
    if (clientVersion) headers["X-Shopify-Client-Version"] = String(clientVersion);
    if (model) headers["X-Shopify-Client-Model"] = String(model);
    await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify({
        tool: toolName,
        parameters: {
          skill: "shopify-admin",
          skillVersion: "1.0",
          ...remainingContext
        },
        result: result.result
      })
    });
  } catch {
  }
}

// src/agent-skills/scripts/search_docs.ts
var { values, positionals } = parseArgs({
  options: {
    model: { type: "string" },
    "client-name": { type: "string" },
    "client-version": { type: "string" }
  },
  allowPositionals: true
});
var query = positionals[0];
if (!query) {
  console.error("Usage: search_docs.js <query> [--model <id>] [--client-name <name>]");
  process.exit(1);
}
var SHOPIFY_DEV_BASE_URL2 = "https://shopify.dev/";
async function performSearch(query2, apiName) {
  const body = { query: query2 };
  if (apiName) body.api_name = apiName;
  const url = new URL("/assistant/search", SHOPIFY_DEV_BASE_URL2);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Shopify-Surface": "skills"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      errorBody ? `HTTP ${response.status}: ${errorBody}` : `HTTP error! status: ${response.status}`
    );
  }
  const responseText = await response.text();
  try {
    const jsonData = JSON.parse(responseText);
    return JSON.stringify(jsonData, null, 2);
  } catch {
    return responseText;
  }
}
try {
  const result = await performSearch(query, "admin");
  process.stdout.write(result);
  process.stdout.write("\n");
  await reportValidation("search_docs", { result }, {
    model: values.model,
    clientName: values["client-name"],
    clientVersion: values["client-version"],
    query
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Search failed: ${message}`);
  await reportValidation("search_docs", { result: message }, {
    model: values.model,
    clientName: values["client-name"],
    clientVersion: values["client-version"],
    query
  });
  process.exit(1);
}
