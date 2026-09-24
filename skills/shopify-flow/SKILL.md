---
name: shopify-flow
description: "Create draft Shopify Flow automation workflows on a store through the Admin GraphQL API with plain Shopify CLI (`shopify store auth`, `shopify store execute`). Use when the user asks an agent to build or create a workflow on a store from natural-language requirements. Only creation is currently exposed; skip for reading, updating, activating, listing, or deleting workflows."
metadata:
  author: Shopify
  version: "1.1.0"
---

# Create a Shopify Flow workflow

Create Shopify Flow draft workflows through the Admin GraphQL API using the plain Shopify CLI. There is no `shopify flow` command group and no Flow-specific helper script. Do not call Flow, Sidekick, or an internal HTTP endpoint directly.

The currently exposed surface is `automationWorkflowCreate` only. It creates a draft; it does not activate the workflow.

## Authorization boundary

Creating a workflow changes the target store. A direct request such as “create this workflow on my store” authorizes one creation attempt matching that request. A request for instructions, JSON, or an example does not authorize execution.

Before executing, know the `.myshopify.com` store domain and summarize the workflow name, trigger, and actions. If the store is missing, ask for it. Do not retry a mutation automatically after an ambiguous transport failure because the first request may have created a draft.

## Prerequisites

Authenticate the store with the internal `write_automations` scope:

```bash
shopify store auth \
  --store shop.myshopify.com \
  --scopes write_automations
```

Only first-party apps approved for `write_automations` can request it. If authorization reports `missing_shopify_permission: write_automations`, the production Shopify CLI Connector App needs that approval-gated scope; broader or guessed scopes do not substitute for it.

Always execute against `unstable`. The mutation is hidden on stable API versions.

## Build the configuration

Before authoring the JSON, read [references/workflow_structure_schema.json](references/workflow_structure_schema.json) completely and make the `configuration` value conform to it.

Important server requirements beyond the structural schema:

- Use `__metadata.version: 0.1`.
- Give every step a unique UUID in `step_id`.
- Include exactly one `TRIGGER` and at least one `ACTION` for an activatable draft.
- Include `task_id`, `task_version`, `task_type`, and `config_field_values` on every step.
- Connect steps through `root.links` and include `root.patched_fields`, using an empty array when none are needed.
- Treat each config-field `value` as a string. Values that represent arrays or objects are JSON encoded inside that string.
- Use task IDs, versions, and config-field IDs from an authoritative Shopify template, documentation source, or user-provided definition. Never invent task metadata. Structural schema validity does not prove a task is installed or its configuration is valid.

### Verified recipe: order created → add order tags

For requests equivalent to “when an order is created, add tags to the order,” read and adapt [references/order-created-add-order-tags.json](references/order-created-add-order-tags.json). Replace the workflow name, step UUIDs, and tags, but preserve the task IDs, versions, config-field IDs, and link ports.

If a request needs other tasks and no authoritative task metadata is available, stop before mutation and explain which trigger/action metadata is missing. Do not approximate it with a plausible-looking ID.

## Create the draft

Use this operation:

```graphql
mutation AutomationWorkflowCreate($configuration: JSON!) {
  automationWorkflowCreate(configuration: $configuration) {
    automationWorkflow {
      id
      name
      status
      version
      adminApiVersion
      configuration
      createdAt
      updatedAt
    }
    validationErrors {
      code
      message
      stepId
      configFieldId
    }
    userErrors {
      field
      message
      code
    }
  }
}
```

Put the operation and variables in temporary files, then execute the mutation explicitly:

```bash
shopify store execute \
  --store shop.myshopify.com \
  --version unstable \
  --allow-mutations \
  --query-file /tmp/automation-workflow-create.graphql \
  --variable-file /tmp/automation-workflow-create-variables.json \
  --json
```

The variables file wraps the workflow JSON under `configuration`:

```json
{
  "configuration": {
    "__metadata": { "version": 0.1 },
    "root": {
      "workflow_name": "Example workflow",
      "steps": [],
      "links": [],
      "patched_fields": []
    }
  }
}
```

Replace the empty example arrays with a schema-conforming workflow before execution. Never execute the empty skeleton as the requested workflow.

## Interpret the result

Success for a complete workflow means:

- `automationWorkflow` is non-null and has status `DRAFT`;
- `userErrors` is empty;
- `validationErrors` is empty.

The service can create a draft while returning `validationErrors`. Report that as “created but not activatable,” include every validation error, and do not silently create another draft. A non-empty `userErrors` response means the requested workflow was not created; surface each error verbatim.

Return the created workflow ID, name, status, and any errors to the user. The response ID is a GID such as `gid://shopify/AutomationWorkflow/<uuid>`.

## Current limits

Do not invent or call unshipped Flow Admin API fields. The current surface does not support:

- reading or listing workflows;
- updating, activating, deactivating, or deleting workflows;
- searching tasks, templates, or environment paths;
- validating without creating a draft.

If the user needs one of these operations, say it is not currently exposed through the Admin API.
