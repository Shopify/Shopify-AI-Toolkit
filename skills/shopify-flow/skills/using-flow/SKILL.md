---
name: using-flow
description: "Bootstrap skill for working with Shopify Flow from a BYO IDE host. Load whenever the user mentions Shopify Flow, workflows, triggers, conditions, actions, scenarios, runs, templates, or test events. Establishes the glossary, the Shopify CLI transport rule, the tool catalog, the never-fabricate discipline, and which other skills to load for which kind of work."
metadata:
  author: Shopify Flow
  version: "0.3.0"
---

You are helping a developer build, edit, debug, or reason about Shopify Flow workflows from their IDE. Flow is Shopify's automation product: a workflow is a directed acyclic graph of steps, started by a trigger, that runs against a shop's data.

## How you actually do anything

Every Flow Superpowers tool call goes through the bundled script:

```bash
scripts/call_tool.mjs --op <op> --store <shop.myshopify.com> --arguments '<json>'
```

Script paths are relative to this skill directory, matching the Shopify AI Toolkit convention.
Use `--arguments-file <path>` for large workflow payloads.

The script invokes Shopify CLI.
Never call Flow's HTTP API directly with `curl`. Never invent or paste a bearer token. Never decide which backend implements a tool.
The script and CLI own that boundary.

Do not teach users to scrape Shopify CLI session files. The CLI owns session lookup.

## When to invoke which command

- **Starting any Flow task** → make sure you have a target `--store <shop.myshopify.com>`. If the user has not given a shop domain and no host context provides one, ask.
- **Calling a known Flow op** → use `scripts/call_tool.mjs --op <op> --store <shop> --arguments='...'`.
- **Discovering what tools exist** → read the checked-in `ops/*.json` catalog. Each op file contains the agent-facing purpose, tool name, and argument schema.
- **Targeting a specific shop** → pass `--store <fqdn>`.
- **Doing work the catalog does not cover** → do not fall back to raw Flow GraphQL. Use the relevant Shopify AI Toolkit/Admin GraphQL skill if one is installed, or ask for the missing capability to be added to the Flow tool catalog.

## Named ops

The bundle ships checked-in JSON specs for common operations. Use the `tool` field from the matching op file.

| Op | Purpose |
|---|---|
| `template-search` | Search Flow templates by business goal. **Run before building any workflow from scratch.** |
| `task-search` | Find tasks by natural-language description. Step 1 of task discovery. |
| `task-configuration` | Get full config schema for one or more tasks. Step 2 — source of truth for `config_field_id` values. |
| `workflow-lookup` | Read a workflow's full JSON definition by ID. Use before updating. |
| `workflow-create-or-update` | Create new or update existing workflow from JSON. |
| `environment-paths-search` | Discover Flow environment field paths. **Verify every path before using it.** |
| `search-shop-resource` | Resolve a merchant resource by name to a GID. |
| `object-type-definition-search` | Inspect a GraphQL type's field structure and arguments — for `patched_fields`. |
| `shopifyql-query-fields` | Get column names a ShopifyQL query produces. |

The list can shift. Inspect `ops/*.json` to see what is actually shipped.

Example:

```bash
scripts/call_tool.mjs --op template-search \
  --store mystore.myshopify.com \
  --arguments '{"search_queries":["fraud prevention","high risk orders"]}'
```

The output is JSON. Read it before continuing. When the response contains errors, surface the embedded message to the user; do not paper over it.

## The discipline

This rule is load-bearing. Every other Flow skill depends on it.

> **Never invent workflow IDs, task IDs, step IDs, environment paths, scope strings, trigger handles, condition expressions, or field names. If you are not sure, run a tool.**

Concretely:

- Do not return a workflow ID to the user that did not come back from a tool response in this session.
- Do not write a trigger payload field that you have not seen in the trigger or task schema.
- Do not autocomplete a Liquid path you have not seen in the workflow's environment for that step. Use `environment-paths-search`.
- If you only have a partial answer from real data and a confident guess fills the gap, mark the guess explicitly and ask the user to confirm.

The single most common failure mode in Flow work is plausible fabrication: the model writes JSON that looks right but references a field that does not exist, and the merchant ships a workflow that silently misfires. The cost of running one extra tool is tiny. The cost of a hallucinated field name is a broken automation.

## Read-only versus mutating calls

- **Read-only** (`template-search`, `task-search`, `task-configuration`, `workflow-lookup`, `environment-paths-search`, `search-shop-resource`, `object-type-definition-search`, `shopifyql-query-fields`): run the call. No confirmation needed.
- **Mutating** (`workflow-create-or-update`, firing test events, activating/deactivating a workflow): summarize what you are about to do, including the exact CLI command and arguments, and ask the user to confirm before running.

## Which skill for which kind of work

Always-loaded with this skill:

- [`flow-best-practices`](../flow-best-practices/SKILL.md) — response format, when to inform the user, when to use placeholders.

Load on demand based on the task:

- **Building or editing a workflow** → [`building-workflows`](../building-workflows/SKILL.md).
- **Authoring step internals (env vars, conditions, Liquid)** → [`workflow-runtime`](../workflow-runtime/SKILL.md).
- **Configuring a Get Data task or Shopify search query** → [`shopify-search-syntax`](../shopify-search-syntax/SKILL.md).
- **Configuring a special task type** (scheduled trigger, Send Admin API Request, Send HTTP Request, sending email, ForEach, Run Code, metafields, fields with arguments, metaobjects, ShopifyQL) → [`special-tasks`](../special-tasks/SKILL.md).
- **Test events / scenarios** → [`running-test-events`](../running-test-events/SKILL.md).

## Glossary

- **Workflow** — a single named automation. Has a current workflow definition and a list of past versions.
- **Workflow definition** — the actual graph: steps + links + a state (`MAIN`, `DRAFT`, `DEPRECATED`).
- **Step** — a node in the graph. Carries workflow-specific configuration for a task.
- **Task** — workflow-independent unit of work. Flavours: `trigger`, `condition`, `action`, `wait`, `fetch`, `for-each`. A task added to a workflow becomes a step.
- **Trigger** — the entry point. Subscribes the workflow to an event stream and brings shop/event data into the environment.
- **Condition** — a branching step. Evaluates an expression and routes to one of several outputs.
- **Action** — a step that does something, such as sending email, calling Admin API, or running Liquid-templated code.
- **Link** — an edge from one step's output port to another step's input port.
- **Activation** — the on/off state for a workflow definition in some scope, usually a shop.
- **Workflow run** — one execution of a workflow against one event.
- **Step run** — one step's execution within a workflow run.
- **Event** — the thing that fires a trigger. Sources include Shopify webhooks, core Kafka, partner apps, and manual triggering.
- **Scenario / test event** — a trigger payload fired through a workflow during development. Load [`running-test-events`](../running-test-events/SKILL.md).
- **Connector** — a collection of triggers and actions integrating an external system.
- **Liquid in Flow** — Liquid templates evaluated against the current step's environment. Restricted — see [`workflow-runtime`](../workflow-runtime/SKILL.md).
- **Patched field** — a metafield or argument-bearing field declared at the workflow root so it is exposed as an environment variable.

## Flow phases

1. **Understand** — what trigger? What is the merchant trying to do? What edge cases matter?
2. **Inspect** — what does the shop already have? Read workflows, triggers, schemas, and available tasks before designing.
3. **Design** — sketch trigger → conditions → actions. Name the variables needed at each branch.
4. **Build** — one step at a time. After each step, re-fetch schemas/paths before configuring the next.
5. **Verify** — fire at least one test event end-to-end and read the run log. Static review is not verification.
6. **Ship** — turn the workflow on, but leave a recovery path.

## What never to do

- Never call Flow's API directly for a Superpowers tool.
- Never invent IDs, field names, enum values, or condition expressions. Run a tool.
- Never declare a workflow "done" without firing at least one test event.
- Never run a mutation without summarising and confirming first.
- Never paper over an error from `scripts/call_tool.mjs`. Surface the message and stop.
- Never use Title Case for `workflow_name`. Sentence case only.
- Never use Liquid syntax inside the condition DSL.
- Never reference a `<list>Foreachitem` outside the `loop_body` of its ForEach.
