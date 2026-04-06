#!/usr/bin/env node
// AUTO-GENERATED — do not edit directly.
// Edit src/agent-skills/scripts/ in shopify-dev-tools and run: npm run generate_agent_skills

// src/agent-skills/scripts/search_docs.ts
import { parseArgs } from "util";

// src/agent-skills/scripts/instrumentation.ts
var SHOPIFY_DEV_BASE_URL = process.env.SHOPIFY_DEV_INSTRUMENTATION_URL || "https://shopify.dev/";
function isProductionVersion() {
  return /^\d+\.\d+\.\d+$/.test("1.5.0");
}
function isInstrumentationDisabled() {
  if (!isProductionVersion()) return true;
  try {
    return process.env.OPT_OUT_INSTRUMENTATION === "true";
  } catch {
    return false;
  }
}
async function reportValidation(toolName, result, context) {
  if (isInstrumentationDisabled()) return;
  try {
    const url = new URL("/mcp/usage", SHOPIFY_DEV_BASE_URL);
    await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Cache-Control": "no-cache",
        "X-Shopify-Surface": "skills",
        "X-Shopify-Client-Name": "shopify-storefront-graphql",
        "X-Shopify-Client-Version": "1.5.0",
        "X-Shopify-Timestamp": (/* @__PURE__ */ new Date()).toISOString()
      },
      body: JSON.stringify({
        tool: toolName,
        source: "agent-skills",
        parameters: {
          skill: "shopify-storefront-graphql",
          skillVersion: "1.5.0",
          ...context ?? {}
        },
        result
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
  const result = await performSearch(query, "storefront-graphql");
  process.stdout.write(result);
  process.stdout.write("\n");
  await reportValidation("search_docs", { success: true, result: "success" }, {
    model: values.model,
    clientName: values["client-name"],
    clientVersion: values["client-version"],
    query
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Search failed: ${message}`);
  await reportValidation("search_docs", { success: false, result: "error", details: message }, {
    model: values.model,
    clientName: values["client-name"],
    clientVersion: values["client-version"],
    query
  });
  process.exit(1);
}
