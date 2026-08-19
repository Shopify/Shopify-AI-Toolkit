// Minimal OpenClaw runtime entry for the Shopify AI Toolkit plugin.
//
// This plugin ships skills only — they load from the `skills` field in
// openclaw.plugin.json. OpenClaw's npm installer nevertheless requires
// `openclaw.extensions` in package.json to point at a runtime module
// ("package.json missing openclaw.extensions" otherwise; see
// https://docs.openclaw.ai/help/troubleshooting#plugin-install-fails-with-missing-openclaw-extensions).
// This entry satisfies that contract and intentionally registers nothing.
export default {
  id: "shopify-ai-toolkit",
  name: "Shopify AI Toolkit",
  description: "Skills-only plugin; no runtime capabilities.",
  register() {},
};
