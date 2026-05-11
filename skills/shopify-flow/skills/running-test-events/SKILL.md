---
name: running-test-events
description: "Run test events through a Shopify Flow workflow during development. Use when the user wants to verify a workflow works, debug why a step is firing or not firing, generate a representative trigger payload, or build up a sample-data session for a workflow. The discipline is **never fabricate, verify literally** — every field of an event must come from the real trigger schema, never from memory."
metadata:
  author: Shopify Flow
  version: "0.1.0"
---

A test event is a single trigger payload fed through a workflow during development to confirm it behaves as expected. The model for this in Flow is the **sample-data session**: a workflow has zero or one sample-data session, the session has zero or more events, and each event is either captured (from a real run) or custom (synthetic). All the test-event work in this skill goes through that session model.

This skill assumes you have already loaded `using-flow`. If you have not, load it now — that skill establishes the CLI transport rule and the never-fabricate rule that this skill leans on.

## The two literal failure modes you are guarding against

1. **Field-name fabrication.** You write `customer_id` in the event payload when the trigger's schema actually says `customerId`, and the workflow happily evaluates conditions against `null`. Validation passes; behavior is wrong.
2. **Premature "verified".** You fire one event that takes the happy path through every condition and call the workflow done. The condition the merchant actually cares about — the one that gates whether the action fires — was never exercised.

The rule that prevents both: get the real schema first, then construct the event, then exercise the conditions you care about (not the easy ones).

## The discipline

1. **Get the real trigger schema.** Before constructing any payload, fetch the JSON schema for the workflow's trigger through the Flow tool catalog once the test-event tools are exposed. Do not work from memory or from the trigger's name alone.
2. **Use real captured events when available.** If the workflow already has captured events on its session, prefer cloning one of those over building from the schema cold — the captured event has the actual shape and value distribution from the merchant's store.
3. **Mark every value you made up.** When the schema requires a field whose specific value you had to invent (an ID, a timestamp, an email), flag it explicitly in the response to the user. Do not let them assume a synthetic value is realistic.
4. **Fire the event end-to-end and read the run output.** A passing event is not the same as a correct workflow. Always check what each step actually emitted, not what you expected it to emit.
5. **Hit the conditions the merchant cares about.** A test event that takes the workflow's happy path tells you almost nothing about the conditions. Pick payloads that exercise the branches that gate the actions, not the default path.

## Auth and transport

Same rule as `using-flow`: every call goes through `scripts/call_tool.mjs`. Never call Flow's HTTP API directly.

For every call, pass `--store <shop.myshopify.com>`. If the user has not given you a shop domain, ask — do not guess.

## Worked sequence: build and verify a custom event

The synthetic-event tools are not in the V0 op catalog yet. When they are exposed, they should follow the same shape as the rest of the bundle: checked-in JSON specs under `ops/` and calls through `scripts/call_tool.mjs --op <op>`.

**1. Look up the workflow you are working with.** Get its ID and its current trigger.

```bash
scripts/call_tool.mjs --op workflow-lookup \
  --store <shop.myshopify.com> \
  --arguments '{"workflow_id":"<workflow id from the user or prior lookup>"}'
```

**2. Get the trigger schema for that workflow.** This tells you exactly what fields a custom event payload must contain.

```bash
scripts/call_tool.mjs --op <test-event-schema-op> \
  --store <shop.myshopify.com> \
  --arguments '{"workflow_id":"<workflow id>"}'
```

If a test-event schema tool is not available in `ops/`, stop and say the tool catalog does not expose synthetic-event tooling yet. Do not iterate by guessing.

**3. Read the existing sample-data session.** If there are captured events, prefer one of them as a starting point.

```bash
scripts/call_tool.mjs --op <test-events-list-op> \
  --store <shop.myshopify.com> \
  --arguments '{"workflow_id":"<workflow id>"}'
```

**4. Create a custom event.** Save the arguments to a file when the payload is non-trivial.

```bash
scripts/call_tool.mjs --op <test-events-create-op> \
  --store <shop.myshopify.com> \
  --arguments-file /tmp/flow-test-event.json
```

Variables (saved to a file because they are non-trivial):

```json
{
  "workflow_id": "<from step 1>",
  "events": [{
    "event_name": "high-value-international-order",
    "trigger_params": { "<...real fields from step 2's schema...>" }
  }]
}
```

Mark every invented value before sending. Do not silently generate timestamps or IDs.

**5. Fire the event and read the run.**

```bash
scripts/call_tool.mjs --op <test-event-run-op> \
  --store <shop.myshopify.com> \
  --arguments '{"workflow_id":"<workflow id>","event_id":"<event id>"}'
```

After firing, walk the resulting workflow-run / step-run records — every step's actual outputs, not just whether the run succeeded. If the tool catalog does not expose a run/read tool yet, stop and say so.

## What "never fabricate" means here, concretely

- If the trigger schema says `currency: String!` with an enum-like description, list the valid values from the schema and pick one. Do not write `"USD"` because it is the most common.
- If the schema says a field is one of an `enum`, list the enum members from the IDL and pick one. Do not write `"FULFILLED"` when the real values are lowercase or vice versa.
- If the schema describes nested objects (line items, addresses, metafields), construct each nested object the same way: real schema, real shape, marked guesses.
- If the workflow's conditions reference an optional field, include it in the payload. Flow evaluates `null` and `missing` differently than the merchant likely expects, and that gap is a common silent-failure mode.

## When the user asks for "a quick test event"

There is no quick test event for a workflow that branches on a real condition. A payload that takes the happy path through every condition exercises nothing of value.

Ask: "which condition do you most need this to exercise?" Then construct a payload that fails that condition and one that passes it, and fire both. If the workflow has multiple conditions, expect to fire several events, not one.

## Failure modes worth flagging back to the user

- **Run completes, no action fired.** Almost always a condition evaluated against a missing or wrongly-named field. Diff the event payload against the condition's expression — and against the trigger schema — before retrying.
- **Run completes, action fired on the wrong data.** The action's Liquid is reading a different path than the condition tested. Re-fetch the trigger schema, then walk both the condition and the action against it.
- **Workflow ran twice in production but not in test.** Test events do not catch update-vs-transition triggers. If the trigger config is "on every update," say so explicitly to the user — this class of bug only surfaces in real traffic.

## What this skill never does

- Construct a test event without the real trigger schema in hand.
- Declare a workflow verified after one happy-path test event.
- Fabricate an enum value, a field name, or a workflow ID. Every such value comes from a real query or is explicitly marked as a guess.
- Run a mutation (creating events, firing events, deleting events) without summarising and confirming with the user first.
