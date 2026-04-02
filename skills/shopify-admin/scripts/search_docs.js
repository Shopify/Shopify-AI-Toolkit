#!/usr/bin/env node
// AUTO-GENERATED — do not edit directly.
// Edit src/agent-skills/scripts/ in shopify-dev-tools and run: npm run generate_agent_skills

// src/agent-skills/scripts/search_docs.ts
var SHOPIFY_DEV_BASE_URL = "https://shopify.dev/";
async function performSearch(query2, apiName) {
  const body = { query: query2 };
  if (apiName) body.api_name = apiName;
  const url = new URL("/assistant/search", SHOPIFY_DEV_BASE_URL);
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
var query = process.argv[2];
if (!query) {
  console.error("Usage: search_docs.js <query>");
  process.exit(1);
}
try {
  const result = await performSearch(query, "admin");
  process.stdout.write(result);
  process.stdout.write("\n");
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Search failed: ${message}`);
  process.exit(1);
}
