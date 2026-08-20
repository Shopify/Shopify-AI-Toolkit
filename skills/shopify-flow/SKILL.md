---
name: shopify-flow
description: "Inspect Shopify Flow automation workflows on a store through the **Admin GraphQL API**, run with plain Shopify CLI (`shopify store auth`, `shopify store execute`). Use when the user wants to read a workflow's status, version, trigger, or definition JSON by ID. There is no Flow-specific CLI: every operation is an Admin GraphQL query executed by the normal `store execute` command. Read-only — no automation mutations exist yet. Skip for authoring workflow JSON offline with no store access."
compatibility: Requires Node.js
metadata:
  author: Shopify
  version: "1.0.0"
---

You are helping a developer inspect Shopify Flow automation workflows on a store.

Flow is Shopify's automation product: a workflow is a directed graph of triggers, conditions, actions, waits, and loops that runs against a shop's data.

**Flow is reached through the Admin GraphQL API, using the plain Shopify CLI.** There is no `shopify flow …` command group and no Flow-specific helper script. Every operation in this skill is an ordinary Admin API query run with `shopify store execute` — the same command any other Admin API call uses. Do not call Flow, Sidekick, or any internal HTTP endpoint directly.

## Prerequisites

Two things are non-obvious and both are mandatory. Get them wrong and the query returns `null` or an access error rather than a useful message.

### 1. Authenticate with the `write_automations` scope

`--scopes` is required on `store auth`:

```bash
shopify store auth --store shop.myshopify.com --scopes write_automations
```

`write_automations` is an **internal** scope. Only first-party apps that have been granted it — the Shopify CLI app among them — can request it. If `store auth` rejects the scope, that is the reason: the app you are authenticating as does not hold the grant. Do not retry with guessed scope names (`read_automations`, `read_flow`, `write_flow` do not exist), and do not fall back to a broader scope hoping it covers automations.

Re-run `store auth` if the stored token is missing, expired, or was created without this scope.

### 2. Query against `unstable`

The automation fields are hidden on every stable API version. They are public only on the `automation_workflow_api` change, whose version handle is `unstable`, so `--version unstable` is required:

```bash
shopify store execute --store shop.myshopify.com --version unstable --query '…'
```

Without it the field is not in the schema and the query fails to validate. Omitting `--version` defaults to the latest *stable* version, which does not expose these fields.

## Workflow IDs

Flow identifies a workflow by a **bare UUID** — that is the form you get from Flow URLs, workflow JSON, and lockfiles:

```
0191d649-8d00-76ee-8f9b-320fa3433012
```

The Admin API argument is a GID, so **construct it yourself** by prefixing the typename:

```
gid://shopify/AutomationWorkflow/0191d649-8d00-76ee-8f9b-320fa3433012
```

Do this silently — do not ask the user to convert an ID they already gave you. Do not pass the bare UUID: the `id` argument is typed to `AutomationWorkflow`, so an unwrapped UUID, or a GID carrying a different typename, fails argument coercion before the query ever runs. The `id` in the response comes back as the GID, not the UUID.

A workflow **version** is a separate identifier with a different shape — a ULID such as `01J8ZQ3K2M4P6R8T0V2X4Z6B8D`, never a UUID and never wrapped in a GID. Don't pass a version where a workflow ID belongs, or vice versa.

## Reading a workflow

`automationWorkflow(id:)` is the only automation entry point. It takes a workflow GID and returns the workflow, or `null` if no workflow matches — including when the workflow exists but is hidden, since hidden workflows are never returned.

```bash
shopify store execute \
  --store shop.myshopify.com \
  --version unstable \
  --query '
    query AutomationWorkflow($id: ID!) {
      automationWorkflow(id: $id) {
        id
        name
        status
        currentVersion
        adminApiVersion
        createdAt
        updatedAt
        trigger {
          task {
            taskId
            version
            label
          }
        }
      }
    }
  ' \
  --variables '{"id":"gid://shopify/AutomationWorkflow/0191d649-8d00-76ee-8f9b-320fa3433012"}'
```

Field reference for `AutomationWorkflow`:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | `ID!` | Node ID. |
| `name` | `String!` | The workflow name. |
| `status` | `AutomationWorkflowStatus!` | `ACTIVE`, `DRAFT` (has unapplied draft changes), or `INACTIVE`. |
| `currentVersion` | `String!` | Version identifier of the current definition. |
| `adminApiVersion` | `String` | The Admin API version the workflow is pinned to. Nullable. |
| `createdAt` / `updatedAt` | `DateTime!` | |
| `trigger` | `AutomationTrigger` | Nullable. `trigger.task` gives `taskId`, `version`, `label`. |
| `definition(version: String)` | `JSON!` | The workflow graph. See below. |

### The definition JSON

`definition` is a `JSON` scalar holding the whole workflow graph, and it takes an optional `version` argument to read a past version instead of the current one:

```bash
shopify store execute \
  --store shop.myshopify.com \
  --version unstable \
  --query '
    query WorkflowDefinition($id: ID!, $version: String) {
      automationWorkflow(id: $id) {
        name
        currentVersion
        definition(version: $version)
      }
    }
  ' \
  --variables '{"id":"gid://shopify/AutomationWorkflow/0191d649-8d00-76ee-8f9b-320fa3433012","version":null}'
```

Pass `version: null` (or omit it) for the current definition; pass a version identifier from `currentVersion` or a prior read to fetch that revision.

Because it is one opaque scalar, `definition` is large. Select it only when the task actually needs the graph — for "is this workflow on?" or "when did it change?", the scalar fields above are enough. Use `--output-file` rather than STDOUT when you intend to read the graph, and `--json` when you want the full structured envelope:

```bash
shopify store execute --store shop.myshopify.com --version unstable \
  --query-file ./workflow.graphql --variables '{"id":"gid://shopify/AutomationWorkflow/…"}' \
  --json --output-file ./workflow.json
```

## Read-only today

There are **no** automation mutations in the Admin API yet. Never pass `--allow-mutations` for Flow work, and never invent a mutation name — `automationWorkflowCreate`, `automationWorkflowUpdate`, `automationWorkflowActivate` and similar do not exist on any version.

Concretely, these are **not** reachable through the Admin API, and you should say so plainly rather than approximating them:

- creating, updating, pushing, or pulling a workflow
- activating or deactivating a workflow
- listing all workflows on a shop (the only lookup is by ID)
- validating a workflow definition against the server
- searching templates, tasks, or environment field paths
- resolving ShopifyQL columns
- creating or firing test events

If the user needs one of those, tell them it is not exposed yet. Do not substitute a direct call to Flow's own endpoints, and do not reach for a Flow CLI — there isn't one.

## Rules

- Always know the store. `--store` is required on both `store auth` and `store execute`; ask if the user hasn't said which shop.
- Always pass `--version unstable`. Omitting it silently drops the automation fields from the schema.
- Authenticate before executing. If `store execute` fails on auth, run the printed `store auth …` command with `--scopes write_automations` and retry once.
- `automationWorkflow` takes a GID. Given a bare UUID, wrap it as `gid://shopify/AutomationWorkflow/<uuid>` yourself. If you have no workflow ID at all, ask — there is no list or search to discover one.
- A `null` result means "no visible workflow with that ID" — a wrong ID, a different shop, or a hidden workflow. It does not mean the query was malformed; check the ID before rewriting the query.
- Surface errors verbatim. Do not retry with guessed scopes, versions, field names, or enum values.
- Read-only. No `--allow-mutations`.

## Related skills

- `shopify-use-shopify-cli` — Shopify CLI setup, upgrades, auth troubleshooting, and `store auth` / `store execute` mechanics in general.
- `shopify-admin` — authoring and explaining Admin GraphQL operations, with doc search and validation.
