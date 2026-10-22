# Flow workflows

---
# Shopify Flow

Build and manage workflows through the Admin GraphQL API and run store operations with Shopify CLI. Use the CLI guidance for setup/execution and Admin guidance for ordinary resource queries. There is no `shopify flow` command.

## Access and operations

Use `unstable`. Reads and writes require approved `write_automations` access and a user context. Ask for the store domain when needed to run an operation.

```bash
shopify store auth --store example.myshopify.com --scopes write_automations
```

`missing_shopify_permission: write_automations` means the CLI Connector App needs approval for that scope. A broader scope will not fix it.

Follow CLI execution rules. Instructions or draft JSON do not authorize store changes; creating a draft does not authorize activation. Before a mutation, state the target store/workflow.

The Flow operations can be missing from public reference pages and from the bundled Admin schema. Before the first Flow operation, run one authenticated introspection query against the store's `unstable` endpoint for the Flow root fields, arguments, enums, and payload types you need, then reuse the result for the session. Use the [unstable Admin reference](https://shopify.dev/docs/api/admin-graphql/unstable) only when it lists them. Validate operations against Admin `unstable`; the Admin validator does not check workflow JSON. Report operations as unchecked when the validation schema lacks them, and do not treat a pass against another version as validation.

| Read | Purpose |
| --- | --- |
| `automationWorkflows` | Search by name, `status:ACTIVE`/`status:INACTIVE`, or `trigger:"<task ID>"`, combined with `AND`. |
| `automationWorkflow(id:, version:)` | Read a workflow; omit version for latest draft, or main if no draft exists. |
| `automationTasks` | Search by text and optional `taskType`. |
| `automationTask(id:)` | Look up a returned versioned task GID. |
| `automationTemplates` | Search by text and select `configuration`; also available through `node(id:)`. |
| `automationEnvironmentPaths` | Find data paths with required `rootType` and natural-language `query`. |
| `automationFlowFileParse(flowFileContent:)` | Parse complete `.flow` contents into `name` and `configuration` without saving. |

Task/workflow connections support forward/backward pagination and `reverse`, up to 100 results per page. Templates use connection pagination too. Environment search defaults to 10, maximum 40. Select `pageInfo { hasNextPage endCursor }` for forward searches.

Selection sets that match the schema:

```graphql
query FindTasks($query: String!) {
  automationTasks(first: 10, query: $query) {
    nodes { id taskId version label taskType state connector { name installed installUrl } }
    pageInfo { hasNextPage endCursor }
  }
}
```

```graphql
query ConfigureTask($id: ID!) {
  automationTask(id: $id) {
    taskId version outputPortIds
    configFields { ...FlowTaskConfigField }
    returnFields { name description type typeDefinitions }
  }
}
```

```graphql
query ReadWorkflow($id: ID!, $version: String) {
  automationWorkflow(id: $id, version: $version) {
    id name version versionState activeVersion adminApiVersion tags note configuration
    validationErrors { code message stepId configFieldId }
  }
}
```

Templates select `nodes { id title description configuration }`; the parser selects `name configuration`. Tasks have no `publisher` or input-port field, and `automationTask` takes no `version` argument.

| Mutation | Arguments |
| --- | --- |
| `automationWorkflowCreate` | Required `name`, `configuration`; optional `tags`, `note`. |
| `automationWorkflowUpdate` | Required `id`, `version`; optional `name`, `configuration`, `tags`, `note`. |
| `automationWorkflowActivate` / `automationWorkflowDeactivate` | Required `id`, `version`. |
| `automationWorkflowDelete` | Required `id`; deletes the whole workflow. |

Select `userErrors { field message code }` on every mutation. Read the returned workflow's ID/version, activation state, and `validationErrors { code message stepId configFieldId }` where available. Delete returns `deletedAutomationWorkflowId`.

```graphql
mutation CreateWorkflow($name: String!, $configuration: JSON!) {
  automationWorkflowCreate(name: $name, configuration: $configuration) {
    automationWorkflow {
      id
      version
      activeVersion
      validationErrors { code message stepId configFieldId }
    }
    userErrors { field message code }
  }
}
```

Put the configuration object directly under the variables' `configuration` key. Write the operation and variables to files, then execute:

```bash
shopify store execute \
  --store example.myshopify.com \
  --version unstable \
  --query-file /tmp/flow-operation.graphql \
  --variable-file /tmp/flow-variables.json \
  --allow-mutations \
  --json
```

Omit `--allow-mutations` for reads. Give the parser original `.flow` contents including the checksum; do not decode the export yourself. A malformed or unsupported file fails with a GraphQL error rather than a null result. Check connectors, tasks, resource IDs, and timezone before saving on another store. These APIs do not expose export, history, audit events, manual runs, or validation without saving.

## Discover tasks and fields

Look up tasks and paths only when creating a workflow or changing its logic. Listing, renaming, activating, deactivating, and deleting need only the operations above.

1. Search templates for the merchant's goal, such as “fraud prevention”, and adapt a suitable configuration before building from scratch.
2. Discover trigger/actions through tasks. Prefer installed connectors and `MAIN` task versions. Read chosen tasks' `configFields`, `outputPortIds`, and `returnFields`. Use their GraphQL `id` for lookup; write `taskId`/`version` into `task_id`/`task_version`. Installation is `connector.installed`; task states are `MAIN`, `DEPRECATED`, or `DRAFT`.
3. Discover environment paths before writing conditions, Liquid, path inputs, loops, or Run Code inputs. Look up shop resources and timezone through Admin queries. Preserve verified paths from existing workflows/templates.

Read the first task/environment page. Refine off-target searches; paginate relevant results with `after: endCursor` when a suitable match is missing and `hasNextPage` is true. Keep query, filters, and schema context unchanged while following a cursor. Stop once enough verified information is available.

Request config fields' shared and type-specific metadata: validations, options, Liquid/secrets support, allowed resource/path types, query filters, units, and defaults. Validations include allowed values, numeric ranges, and JavaScript regex patterns/flags; `subfield` identifies the value part checked.

When bundled files are available, append the relevant definitions from `assets/flow/task-config-fields.graphql` to the query and spread `FlowTaskConfigField` under `configFields`. For validation-only queries include only the validation fragment. The config fragment aliases `possibleUnits` as `durationUnits`/`weightUnits`.

Flow loads the trigger fields used by the workflow. Get Data is for additional records. Prefer dedicated tasks over API requests and conditions/Sum/Count over Run Code where suitable. If discovery is unavailable, use supplied task/template definitions and identify gaps; do not guess metadata.

## Environment search and scope

Pass the Admin type supplied by the trigger/earlier action as `rootType`, such as `Order`, rather than runtime names such as `order` or `getOrderData`. Search from the root available in this workflow: finding a field under `Customer` does not establish a standalone `customer` variable in an order workflow.

```graphql
query FindFields($workflowId: ID, $version: String) {
  automationEnvironmentPaths(
    rootType: "Order"
    query: "customer email"
    workflowId: $workflowId
    version: $version
    first: 10
  ) {
    nodes { path description leafType pathElementsTypes searchCategories }
    pageInfo { hasNextPage endCursor }
  }
}
```

For existing workflows, pass `workflowId` and the version being edited; omit both for new workflows. `version` requires `workflowId`. Batch independent searches with aliases, one root/query per field.

`dataTypeFilter` accepts `ALL`, `LIST`, `SCALAR`, `SCALAR_IN_LIST`, or `SCALAR_OR_SCALAR_IN_LIST`. Start with `ALL` for unknown shapes; use `LIST` for loop inputs and `SCALAR` for paths without lists. Optional `scalarTypes` names scalars/enums; it cannot be empty or combined with `LIST`. Match task `allowedTypes` against results.

Translate merchant words into a few candidate searches: cost → `totalPrice`, `subtotalPrice`, `currentTotalPrice`; location → `defaultAddress`, `shippingAddress`, `country`; purchases → `lineItems`, `product`, `variant`, `quantity`; discounts → `discountCode`, `discountApplications`; stock → `inventoryLevel`, `inventoryQuantity`; timing → `createdAt`, `processedAt`. Read descriptions to distinguish meanings such as original/current totals. Interpret `path`, `leafType`, `pathElementsTypes`, and `searchCategories` together: scalar leaves can sit inside lists. `SCALAR_IN_LIST` needs list operators; `LIST` needs iteration; `ALL` alone can require checking nested lists. Segment types omit full list/nullability signatures.

Search discovers schema paths, not records or step scope. Confirm the trigger/earlier action supplies the root on the same branch. Action outputs depend on return metadata, configuration, and the step's actual output name; preserve names and verify suffixes for repeated tasks. Search does not establish Run Code fields, analytics columns, or patches. Results such as `order.metafield` need arguments configured before use.

Runtime paths are direct camelCase fields, without `edges`/`nodes`/`node`. Output names commonly follow the step, such as `getOrderData`, `sendAdminApiRequest`, `count`, `sum`, and `runCode`; repeated tasks can take numeric suffixes. ForEach item variables exist only within `loop_body`, never through `after` or another branch; `order.lineItems` commonly binds `lineItemsForeachitem`, and a `getOrderData` list binds `getOrderDataForeachitem`. Unknown-path errors need a fresh search plus checks of root, list traversal, outputs, and patches; leave unverifiable fields unfinished.

## Configuration

Read the [workflow JSON schema](https://shopify.dev/flow/workflow-configuration/unstable/schema.json) before authoring. When bundled files are available, use its local copy at `assets/flow/workflow_structure_schema.json`. Validate structure locally; task values, links/ports, scope, and other server rules need separate checks.

- Keep `__metadata.version` at `0.1`. Include `root.steps`, `root.links`, and `root.patched_fields`. Workflow `name`, `tags`, and definition `note` are separate mutation arguments.
- Give steps unique readable string IDs such as `order_created`, `add_vip_tags`, and `add_review_tags`. Distinguish repeated uses of the same task by purpose. Include discovered `task_id`, `task_version`, uppercase `task_type`, and `config_field_values`. Omit step `name`, or match the task label with an optional `(n)` suffix. Preserve IDs on edits; a step ID reused for a different task is rejected, so replacing a task needs a new ID and updated links. The server lays out steps itself and keeps each existing step's description and note by step ID.
- Links use `from_step_id`, `from_port_id`, `to_step_id`, `to_port_id`. Reference real steps and discovered output ports: ordinarily `output`, conditions `true`/`false`, ForEach `loop_body`/`after`; destinations use `input`.
- Config values are strings; JSON-encode arrays/objects inside them. A path input can use `order.id` without Liquid. Follow field metadata and preserve unrelated null/default values.
- A complete workflow needs one trigger and a reachable action. Incomplete drafts can save with validation errors.

For example, Add order tags can use `{"config_field_id":"order_id","value":"order.id"}` and `{"config_field_id":"tags","value":"[\"vip\"]"}` after checking metadata. Bundled examples are `assets/flow/order-created-add-order-tags.json` and `assets/flow/order-created-conditional-tags.json`; verify versions and connector availability before execution.

## Conditions, Liquid, and patches

Conditions use Flow's DSL in the string `condition` config field, with paths/literals and parentheses. Reads omit a blank condition; omit the entry rather than sending an empty string, which is rejected. Operators:

- Scalars: `==`, `!=`, `>`, `>=`, `<`, `<=`.
- Strings: `start_with?`, `end_with?`, `include?` and their `not_` forms; `in?`/`not_in?` for comma-separated literals.
- Missing values: `empty_or_nil?`/`not_empty_and_not_nil?` for strings; `nil?`/`not_nil?` for other scalars.
- Lists: `any?`, `all?`, `none?`; combinations: `&&`, `||`.

String comparisons ignore case. `include?` and the other string operators test one string, never a list; test list membership with `any?`, `all?`, or `none?` over the items. Use numeric/boolean literals and ISO 8601 dates. `in?`/`not_in?` take one quoted string: a JSON array such as `'["1","2"]'`, which is the form reads return, or a comma-separated list such as `'1,2,3'`. Numbers compare numerically. Use one kind of logical operator at the top level, either `&&` or `||`; split mixed AND/OR logic into separate conditions. Do not put Liquid or JavaScript in conditions.

```text
(order.totalPrice > 100)
(order.note include? 'urgent')
(order.name in? '#1001,#1002')
(order.customer.firstName not_empty_and_not_nil?)
(order.tags any? |tags_item| (tags_item == 'vip'))
(order.lineItems any? |lineItems_item| (lineItems_item.product.tags any? |tags_item| (tags_item == 'presale')))
```

Use Liquid only in fields whose metadata supports it. Flow's Liquid data model differs from theme Liquid, and the theme Liquid validator does not check Flow paths or scope. Output scalar properties and iterate object lists with `{% for item in order.lineItems %}`. Do not serialize whole Flow objects with `| json`, index lists with `[0]`, or use `.first`, `.last`, `.empty?`, or `.size` shortcuts. Count projected scalars: `{{ order.lineItems.id | size }}`. Assign filtered values before `if` comparisons; escape scalar values correctly in JSON.

Liquid supports `date_minus`/`date_plus` with day, week, month, or year units, for example `{{ scheduledAt | date_minus: "1 day" }}`; these are not condition operators. Look up the shop timezone. Hash filters include `md5`, `sha1`, `sha256`, `blake3`, `hmac_sha1`, `hmac_sha256`; use supported secret handling for HMAC keys.

Use `root.patched_fields` for fields with arguments. Look up signatures and reuse equivalent patches:

```json
{"field":"metafield","arguments":{"namespace":"custom","key":"loyalty_tier"},"handle":"loyaltyTier","patched_type":"CUSTOMER","merchant_configured":true}
```

The handle becomes `customer.loyaltyTier.value`. Variant patches use `PRODUCT_VARIANT`. Preserve verified existing types; distinguish metaobject definition IDs from entry IDs/handles using task metadata. Use the Custom Data guidance when creating or changing definitions is part of the work.

## Task patterns

- **Scheduled time:** recurrence is a JSON-encoded array of RRULE strings with a future `DTSTART` and IANA timezone. Decoded form: `DTSTART;TZID=America/Toronto:YYYYMMDDTHHMMSS\nRRULE:FREQ=DAILY;INTERVAL=1;WKST=MO`. Replace placeholders with a future start and preserve the newline through both JSON layers. Intervals range from 10 minutes to one year; follow field constraints.
- **Get Data:** returns a list of at most 100 records, even for one expected match. More can match than it returns, so do not treat the list as every matching record. Iterate it with ForEach or list operators; do not assume one object or select `[0]`. Use discovered `queryFilters`, presets, sort/limit rules; unsupported filters can be ignored and broaden results. Check resource-specific search/ID formats, quote values with spaces, and use ISO dates.
- **ForEach:** standard input is `listpath`, a verified list path without Liquid braces. `loop_body` enters iteration; `after` runs after completion. Verify item names/scope.
- **Send Admin API Request:** verify the mutation at the workflow's `adminApiVersion`, which can differ from the `unstable` endpoint used to manage it. Its config value is a JSON-encoded object with mutation `name` and JSON argument text in `blob`, e.g. `{"name":"customerUpdate","blob":"{\"input\":{\"id\":\"{{ order.customer.id }}\",\"note\":\"Reviewed\"}}"}`. Serialize that object as the config string; it is not a full GraphQL operation. Begin/edit/commit calls need separate ordered actions with verified returned IDs; use ForEach `after` when commit must follow all iterations.
- **HTTP:** follow metadata for URL, method, body, and retry/fail/ignore behavior. Headers are a JSON-encoded array of pairs, e.g. `[["Content-Type","application/json"]]`. Identify missing endpoints/credentials in the draft and keep the workflow inactive until they are filled in.
- **Email:** internal email is for staff; customer email needs a suitable connector. Do not substitute a staff email for a customer email or install an app without authorization. Report required installation or manual marketing-template setup instead of repeatedly editing the draft. Use task-supplied defaults for hardcoded fields.
- **Run Code:** `input` is a GraphQL query against Flow's environment; `script` is synchronous JavaScript exporting `default function main(input)`; `output_schema` is SDL defining `Output`. For example, select `order { lineItems { quantity } }`, return `{total: input.order.lineItems.reduce((n, item) => n + item.quantity, 0)}`, and define `type Output { total: Int! }`. Verify paths/output names, e.g. `runCode.total`. Admin/Functions validators do not check it. No async, promises, timers, fetch, or imports. The clock is fixed; `Date.now()`/`new Date()` are not current time. Supply a timestamp matching the requirement through the input query.
- **Analytics:** use ShopifyQL guidance. Results are a `rows` list; loop before reading row fields. Verify columns for the exact query through metadata, a template, or results. Generic task return fields and the Admin schema do not establish columns.

## Editing and activation

Fetch current configuration before editing logic. Configuration is a full replacement: preserve unrelated steps, links, patches, names, and manual edits. Metadata-only edits need ID/version and relevant metadata.

Update requires the version being edited. Metadata/draft edits retain it; replacing main configuration creates a draft and returns its version. Use returned versions. On stale-version errors, reread and reapply if still appropriate. Draft versions can stay unchanged across edits, so reread just before replacement to preserve concurrent work.

Omitted/null `tags` preserves them; `[]` clears them; a list replaces them. Omitted `note` preserves it; explicit null clears it. Send only requested metadata changes.

- **Create:** saves a draft; return ID/version and fix errors by updating that draft.
- **Activate:** targets exact main/latest-draft version, only when requested. Activating main preserves a newer draft; activating an already active version is a no-op. For `NO_ACTIVATION_WITH_WORKFLOW_VALIDATION_ERRORS`, read/fix workflow errors before retrying; for `INVALID_WORKFLOW_VERSION_STATE`, reread current definitions.
- **Deactivate:** target `activeVersion`, which can differ from latest draft. It cancels that version's runs; an executing action can finish. An inactive version does not stop another active version. Confirm `activeVersion` is null before reporting the workflow is off.
- **Delete:** requires an inactive workflow and deletes the whole workflow. Obtain authorization for required deactivation under CLI execution rules.

`versionState` (`DRAFT`, `MAIN`, `SUPERSEDED`) describes definitions independently of activation. A definition is active when its `version` equals nullable `activeVersion`. Active main can coexist with a newer inactive draft. Workflow status filters describe overall activation.

Check transport failures, GraphQL errors, `userErrors`, and workflow `validationErrors` separately. Saving does not establish readiness to activate. `ENTITY_ALREADY_LOCKED` means another operation holds the workflow: wait briefly, reread, and retry once if still needed. If a timeout/connection failure leaves the outcome unclear, read store state before retrying. Do not repeat creation automatically, delete a resource as compensation, or report activation without the returned `activeVersion`. Check deletion's returned `deletedAutomationWorkflowId` and `userErrors`.

Report what changed, workflow ID/version, whether the result is draft JSON, a saved draft, or active, and remaining errors/setup. State what was validated. Order, draft order, product, and customer created triggers can be tested from the resource's **More actions → Run Flow Automation** menu; this executes real actions.
