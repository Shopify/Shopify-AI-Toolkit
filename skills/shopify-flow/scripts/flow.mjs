#!/usr/bin/env node
/**
 * flow.mjs — standalone Flow CLI script for the shopify-flow skill.
 *
 * No install required. Shipped with the skill and called directly:
 *   node scripts/flow.mjs workflow list --store my-store.myshopify.com
 *
 * Auth: requires SHOPIFY_FLOW_TOKEN (Identity OAuth token with
 * https://api.shopify.com/auth/flow.workflows.manage scope).
 * Obtain it once via: shopify store info --store <store> then copy the
 * identity token from ~/.local/share/shopify/session.json (or equivalent).
 *
 * Paired with the flow-standalone-cli branch of the Shopify CLI repo,
 * which provides the TypeScript source for bundling this script.
 */

import {parseArgs} from 'util'
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'fs'
import {createHash} from 'crypto'
import {dirname, resolve, join, basename} from 'path'
import {fileURLToPath} from 'url'

// ---------------------------------------------------------------------------
// Arg parsing
// ---------------------------------------------------------------------------

const {positionals, values: flags} = parseArgs({
  allowPositionals: true,
  options: {
    store: {type: 'string', short: 's'},
    token: {type: 'string'},
    'workflow-id': {type: 'string'},
    'workflow-version': {type: 'string'},
    'use-latest': {type: 'boolean'},
    'include-hidden': {type: 'boolean'},
    all: {type: 'boolean'},
    force: {type: 'boolean'},
    out: {type: 'string'},
    as: {type: 'string'},
    limit: {type: 'string'},
    type: {type: 'string'},
    json: {type: 'boolean', short: 'j'},
    verbose: {type: 'boolean'},
  },
})

const [topic, command, ...rest] = positionals

// ---------------------------------------------------------------------------
// Config / auth
// ---------------------------------------------------------------------------

function getStore() {
  if (flags.store) return flags.store

  // Fall back to flow.toml in cwd or any ancestor
  let dir = process.cwd()
  while (true) {
    const toml = join(dir, 'flow.toml')
    if (existsSync(toml)) {
      const content = readFileSync(toml, 'utf8')
      const match = content.match(/^store\s*=\s*"([^"]+)"/m)
      if (match) return match[1]
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  fatal('No store specified. Pass --store or run inside a project with flow.toml.')
}

function getToken() {
  const token = flags.token ?? process.env.SHOPIFY_FLOW_TOKEN
  if (!token) {
    fatal(
      'No auth token found.\n' +
        'Set SHOPIFY_FLOW_TOKEN to an Identity OAuth token with scope:\n' +
        '  https://api.shopify.com/auth/flow.workflows.manage\n\n' +
        'Obtain one by running: shopify store info --store <store>\n' +
        'then copying the identity token from the CLI session store.',
    )
  }
  return token
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

const FLOW_ENDPOINT =
  process.env.SHOPIFY_SERVICE_ENV === 'local'
    ? 'https://flow.shop.dev/flow-core/tool_call'
    : 'https://flow.shopifycloud.com/flow-core/tool_call'

const SK_ENDPOINT =
  process.env.SHOPIFY_SERVICE_ENV === 'local'
    ? 'https://agent-server.shop.dev/tools/call'
    : 'https://sidekick.shopify.ai/tools/call'

async function dispatch(toolName, args, {source = 'flow', isEval = false} = {}) {
  const token = getToken()
  const store = getStore()
  const endpoint = source === 'flow' ? FLOW_ENDPOINT : SK_ENDPOINT

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Shopify-Shop-Domain': store,
  }
  if (isEval) headers['X-Shopify-Is-Eval'] = 'true'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({tool: toolName, arguments: args}),
  })

  const text = await response.text()
  let body
  try {
    body = JSON.parse(text)
  } catch {
    body = {raw: text}
  }

  if (!response.ok) {
    const detail = flags.verbose ? body : stripBacktraces(body)
    fatal(
      `Flow tool request failed with HTTP ${response.status}.\n` +
        JSON.stringify(detail, null, 2) +
        (flags.verbose ? '' : '\n\nRe-run with --verbose to see full backtraces.'),
    )
  }

  return body
}

function stripBacktraces(value) {
  if (Array.isArray(value)) return value.map(stripBacktraces)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => k !== 'error_backtrace')
        .map(([k, v]) => [k, stripBacktraces(v)]),
    )
  }
  return value
}

function unwrap(body) {
  if (!body?.data) fatal('Unexpected response shape:\n' + JSON.stringify(body, null, 2))
  return body.data
}

// ---------------------------------------------------------------------------
// Workflow file helpers
// ---------------------------------------------------------------------------

function lockfilePath(filePath) {
  return filePath.replace(/\.flow\.json$/, '.flow.lock.json')
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, sortKeys(v)]),
    )
  }
  return value
}

function normalizeWorkflow(payload) {
  return JSON.stringify(sortKeys(payload), null, 2) + '\n'
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex')
}

function readWorkflowFile(filePath) {
  if (!existsSync(filePath)) fatal(`Workflow file not found: ${filePath}`)
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch (err) {
    fatal(`Failed to parse workflow JSON: ${err.message}`)
  }
}

function readLockfile(filePath) {
  const lockPath = lockfilePath(filePath)
  if (!existsSync(lockPath)) return null
  try {
    return JSON.parse(readFileSync(lockPath, 'utf8'))
  } catch {
    return null
  }
}

function writeLockfile(filePath, data) {
  writeFileSync(lockfilePath(filePath), JSON.stringify(data, null, 2) + '\n')
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function out(data) {
  if (flags.json) {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n')
  } else if (typeof data === 'string') {
    process.stdout.write(data + '\n')
  } else {
    process.stdout.write(JSON.stringify(data, null, 2) + '\n')
  }
}

function fatal(message) {
  process.stderr.write('Error: ' + message + '\n')
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function cmdWorkflowList() {
  const body = await dispatch('flow_app_agent_list_workflows', {
    include_hidden: flags['include-hidden'] ?? false,
  })
  const data = unwrap(body)
  if (flags.json) {
    out(data)
    return
  }
  const workflows = data.workflows ?? []
  if (!workflows.length) {
    out('No workflows found.')
    return
  }
  const rows = workflows.map((w) => `${w.workflow_id}\t${w.title ?? '(untitled)'}\t${w.updated_at ?? ''}`)
  out(['ID\tTitle\tUpdated', ...rows].join('\n'))
}

async function cmdWorkflowShow() {
  const id = rest[0] ?? flags['workflow-id']
  if (!id) fatal('Usage: flow workflow show <id>')

  const body = await dispatch('flow_app_agent_workflow_lookup', {workflow_id: id})
  const data = unwrap(body)
  out(flags.json ? data : normalizeWorkflow(data.workflow_definition ?? data))
}

async function cmdWorkflowPull() {
  const store = getStore()

  if (flags.all) {
    const body = await dispatch('flow_app_agent_list_workflows', {include_hidden: flags['include-hidden'] ?? false})
    const data = unwrap(body)
    const workflows = data.workflows ?? []
    const workflowsDir = getWorkflowsDir()
    let written = 0
    for (const w of workflows) {
      const slug = slugify(w.title ?? w.workflow_id)
      const dir = join(workflowsDir, slug)
      const filePath = join(dir, 'workflow.flow.json')
      if (existsSync(filePath) && !flags.force) continue
      const detail = await dispatch('flow_app_agent_workflow_lookup', {workflow_id: w.workflow_id})
      const detailData = unwrap(detail)
      const normalized = normalizeWorkflow(detailData.workflow_definition ?? detailData)
      mkdirSync(dir, {recursive: true})
      writeFileSync(filePath, normalized)
      writeLockfile(filePath, {
        workflow_id: w.workflow_id,
        workflow_definition_version: detailData.workflow_version ?? detailData.workflow_definition_version ?? '',
        payload_sha256: sha256(normalized),
        store,
        pushed_at: new Date().toISOString(),
      })
      written++
      process.stderr.write(`Pulled ${slug}\n`)
    }
    out(`Pulled ${written} workflow(s).`)
    return
  }

  const id = flags['workflow-id']
  if (!id) fatal('Pass --workflow-id <id> or --all')

  const body = await dispatch('flow_app_agent_workflow_lookup', {workflow_id: id})
  const data = unwrap(body)
  const normalized = normalizeWorkflow(data.workflow_definition ?? data)

  const outPath = flags.out ?? `workflow-${id}.flow.json`
  writeFileSync(outPath, normalized)
  writeLockfile(outPath, {
    workflow_id: id,
    workflow_definition_version: data.workflow_version ?? data.workflow_definition_version ?? '',
    payload_sha256: sha256(normalized),
    store,
    pushed_at: new Date().toISOString(),
  })
  out(`Pulled workflow ${id} → ${outPath}`)
}

async function cmdWorkflowPush() {
  const filePath = rest[0]
  if (!filePath) fatal('Usage: flow workflow push <file>')

  const store = getStore()
  const payload = readWorkflowFile(filePath)
  const normalized = normalizeWorkflow(payload)

  const body = await dispatch('flow_app_agent_create_or_update_workflow_from_json', {
    workflow_json: JSON.parse(normalized),
    hidden: false,
  })
  const data = unwrap(body)

  if (data.validation_errors?.length) {
    fatal('Validation errors:\n' + JSON.stringify(data.validation_errors, null, 2))
  }

  const newNormalized = normalizeWorkflow(data.workflow_definition ?? payload)
  writeFileSync(filePath, newNormalized)
  writeLockfile(filePath, {
    workflow_id: data.workflow_id,
    workflow_definition_version: data.workflow_definition_version ?? '',
    payload_sha256: sha256(newNormalized),
    store,
    pushed_at: new Date().toISOString(),
  })

  out(`Pushed ${basename(filePath)} → workflow ${data.workflow_id} (version ${data.workflow_definition_version}).`)
}

async function cmdWorkflowValidate() {
  const filePath = rest[0]
  if (!filePath) fatal('Usage: flow workflow validate <file>')

  const payload = readWorkflowFile(filePath)

  const body = await dispatch(
    'flow_app_agent_create_or_update_workflow_from_json',
    {workflow_json: payload, hidden: false},
    {isEval: true},
  )
  const data = unwrap(body)

  if (data.validation_errors?.length) {
    fatal('Validation errors:\n' + JSON.stringify(data.validation_errors, null, 2))
  }
  out('Workflow is valid.')
}

async function cmdWorkflowDiff() {
  const filePath = rest[0]
  if (!filePath) fatal('Usage: flow workflow diff <file>')

  const lock = readLockfile(filePath)
  if (!lock) fatal(`No lockfile found for ${filePath}. Run push first.`)

  const body = await dispatch('flow_app_agent_workflow_lookup', {workflow_id: lock.workflow_id})
  const data = unwrap(body)

  const remote = normalizeWorkflow(data.workflow_definition ?? data)
  const local = normalizeWorkflow(readWorkflowFile(filePath))

  if (remote === local) {
    out('No differences.')
    process.exit(0)
  }

  // Simple line diff output
  const remoteLines = remote.split('\n')
  const localLines = local.split('\n')
  const maxLen = Math.max(remoteLines.length, localLines.length)
  const diffLines = []
  for (let i = 0; i < maxLen; i++) {
    const r = remoteLines[i] ?? ''
    const l = localLines[i] ?? ''
    if (r !== l) {
      if (r) diffLines.push(`- ${r}`)
      if (l) diffLines.push(`+ ${l}`)
    }
  }
  out(diffLines.join('\n'))
  process.exit(1)
}

async function cmdWorkflowActivate() {
  const filePath = rest[0]
  const store = getStore()

  let workflowId = flags['workflow-id']
  let workflowVersion = flags['workflow-version']

  if (filePath && !workflowId) {
    const lock = readLockfile(filePath)
    if (!lock) fatal(`No lockfile found for ${filePath}. Run push first.`)
    workflowId = lock.workflow_id
    workflowVersion = lock.workflow_definition_version
  }

  if (!workflowId) fatal('Pass a workflow file (with lockfile) or --workflow-id + --workflow-version / --use-latest')

  if (flags['use-latest']) {
    const body = await dispatch('flow_app_agent_workflow_lookup', {workflow_id: workflowId})
    const data = unwrap(body)
    workflowVersion = data.workflow_version ?? data.workflow_definition_version
  }

  if (!workflowVersion) fatal('--workflow-version is required (or pass --use-latest)')

  await dispatch('flow_app_agent_activate_workflow', {
    workflow_id: workflowId,
    workflow_definition_version: workflowVersion,
  })
  out(`Activated workflow ${workflowId} (version ${workflowVersion}).`)
}

async function cmdWorkflowDeactivate() {
  const filePath = rest[0]
  let workflowId = flags['workflow-id']

  if (filePath && !workflowId) {
    const lock = readLockfile(filePath)
    if (!lock) fatal(`No lockfile found for ${filePath}. Run push first.`)
    workflowId = lock.workflow_id
  }

  if (!workflowId) fatal('Pass a workflow file (with lockfile) or --workflow-id')

  await dispatch('flow_app_agent_deactivate_workflow', {workflow_id: workflowId})
  out(`Deactivated workflow ${workflowId}.`)
}

async function cmdWorkflowStatus() {
  const workflowsDir = getWorkflowsDir()
  if (!existsSync(workflowsDir)) fatal(`Workflows directory not found: ${workflowsDir}`)

  const {readdirSync, statSync} = await import('fs')
  const remoteBody = await dispatch('flow_app_agent_list_workflows', {include_hidden: true})
  const remoteData = unwrap(remoteBody)
  const remoteById = Object.fromEntries((remoteData.workflows ?? []).map((w) => [w.workflow_id, w]))

  const dirs = readdirSync(workflowsDir).filter((d) => statSync(join(workflowsDir, d)).isDirectory())

  const results = []
  const trackedIds = new Set()

  for (const dir of dirs) {
    const filePath = join(workflowsDir, dir, 'workflow.flow.json')
    if (!existsSync(filePath)) continue
    const lock = readLockfile(filePath)
    if (!lock) {
      results.push({path: filePath, status: 'new'})
      continue
    }
    trackedIds.add(lock.workflow_id)
    if (!remoteById[lock.workflow_id]) {
      results.push({path: filePath, status: 'orphaned', workflow_id: lock.workflow_id})
      continue
    }
    const normalized = normalizeWorkflow(readWorkflowFile(filePath))
    const currentSha = sha256(normalized)
    results.push({
      path: filePath,
      status: currentSha === lock.payload_sha256 ? 'clean' : 'drifted',
      workflow_id: lock.workflow_id,
    })
  }

  const unknown = Object.keys(remoteById).filter((id) => !trackedIds.has(id))
  for (const id of unknown) {
    results.push({status: 'unknown', workflow_id: id, title: remoteById[id].title})
  }

  if (flags.json) {
    out(results)
    return
  }

  for (const r of results) {
    const label = r.path ?? r.workflow_id
    out(`${r.status.padEnd(10)} ${label}`)
  }

  const hasDrift = results.some((r) => r.status !== 'clean')
  if (hasDrift) process.exit(1)
}

async function cmdTemplateSearch() {
  const queries = rest.length ? rest : [rest[0]]
  if (!queries.length) fatal('Usage: flow template search <query> [<query2> ...]')

  const body = await dispatch('flow_app_agent_search_templates', {search_queries: queries}, {source: 'sk'})
  const data = unwrap(body)
  out(flags.json ? data : formatResults(data.templates ?? data, ['template_id', 'title', 'description']))
}

async function cmdTemplateSave() {
  const templateId = rest[0]
  if (!templateId) fatal('Usage: flow template save <template_id> --as <slug>')
  const slug = flags.as ?? slugify(templateId)
  const workflowsDir = getWorkflowsDir()
  const dir = join(workflowsDir, slug)

  const body = await dispatch('flow_app_agent_get_template', {template_id: templateId}, {source: 'sk'})
  const data = unwrap(body)

  mkdirSync(dir, {recursive: true})
  const filePath = join(dir, 'workflow.flow.json')
  writeFileSync(filePath, normalizeWorkflow(data.workflow_json ?? data))
  out(`Saved template ${templateId} → ${filePath}`)
}

async function cmdTaskSearch() {
  const queries = rest
  if (!queries.length) fatal('Usage: flow task search <query> [--type trigger|action|condition]')

  const args = {search_queries: queries}
  if (flags.type) args.type = flags.type

  const body = await dispatch('flow_app_agent_search_tasks', args, {source: 'sk'})
  const data = unwrap(body)
  out(flags.json ? data : formatResults(data.tasks ?? data, ['task_name', 'type', 'title']))
}

async function cmdTaskDescribe() {
  const taskName = rest[0]
  if (!taskName) fatal('Usage: flow task describe <task_name>')

  const body = await dispatch('flow_app_agent_describe_task', {task_name: taskName}, {source: 'sk'})
  const data = unwrap(body)
  out(flags.json ? data : JSON.stringify(data, null, 2))
}

async function cmdEnvSearch() {
  const [rootType, ...searchTerms] = rest
  if (!rootType) fatal('Usage: flow env search <RootType> <query> [<query2> ...]')

  const body = await dispatch(
    'flow_app_agent_search_environment_fields',
    {root_type: rootType, search_queries: searchTerms},
    {source: 'sk'},
  )
  const data = unwrap(body)
  out(flags.json ? data : formatResults(data.fields ?? data, ['path', 'type', 'description']))
}

async function cmdShopifyqlColumns() {
  const query = rest[0]
  if (!query) fatal('Usage: flow shopifyql columns "<query>"')

  const body = await dispatch('flow_app_agent_get_shopifyql_columns', {query}, {source: 'sk'})
  const data = unwrap(body)
  out(flags.json ? data : formatResults(data.columns ?? data, ['name', 'type']))
}

async function cmdResourceSearch() {
  const [resourceType, ...terms] = rest
  if (!resourceType) fatal('Usage: flow resource search <ResourceType> <query> [--limit N]')

  const body = await dispatch(
    'flow_app_agent_search_resources',
    {resource_type: resourceType, search_queries: terms, limit: flags.limit ? Number(flags.limit) : undefined},
    {source: 'sk'},
  )
  const data = unwrap(body)
  out(flags.json ? data : formatResults(data.resources ?? data, ['id', 'title']))
}

async function cmdTypeShow() {
  const typeName = rest[0]
  if (!typeName) fatal('Usage: flow type show <TypeName>')

  const body = await dispatch('flow_app_agent_describe_type', {type_name: typeName}, {source: 'sk'})
  const data = unwrap(body)
  out(flags.json ? data : JSON.stringify(data, null, 2))
}

async function cmdInit() {
  const targetDir = rest[0] ? resolve(rest[0]) : process.cwd()
  const store = getStore()

  mkdirSync(join(targetDir, 'workflows'), {recursive: true})
  const tomlPath = join(targetDir, 'flow.toml')
  if (existsSync(tomlPath) && !flags.force) fatal(`flow.toml already exists at ${tomlPath}. Pass --force to overwrite.`)

  writeFileSync(tomlPath, `store = "${store}"\n\n[workflows]\ndir = "workflows"\n`)
  out(`Initialized Flow IaC project at ${targetDir}`)
  out(`  store: ${store}`)
  out(`Next: node scripts/flow.mjs workflow pull --all`)
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getWorkflowsDir() {
  // Read from flow.toml if present
  let dir = process.cwd()
  while (true) {
    const toml = join(dir, 'flow.toml')
    if (existsSync(toml)) {
      const content = readFileSync(toml, 'utf8')
      const dirMatch = content.match(/^\s*dir\s*=\s*"([^"]+)"/m)
      const workflowsDir = dirMatch ? dirMatch[1] : 'workflows'
      return join(dir, workflowsDir)
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return join(process.cwd(), 'workflows')
}

function formatResults(items, fields) {
  if (!Array.isArray(items) || !items.length) return '(no results)'
  const header = fields.join('\t')
  const rows = items.map((item) => fields.map((f) => item[f] ?? '').join('\t'))
  return [header, ...rows].join('\n')
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

const COMMANDS = {
  workflow: {
    list: cmdWorkflowList,
    show: cmdWorkflowShow,
    pull: cmdWorkflowPull,
    push: cmdWorkflowPush,
    validate: cmdWorkflowValidate,
    diff: cmdWorkflowDiff,
    activate: cmdWorkflowActivate,
    deactivate: cmdWorkflowDeactivate,
    status: cmdWorkflowStatus,
  },
  template: {
    search: cmdTemplateSearch,
    save: cmdTemplateSave,
  },
  task: {
    search: cmdTaskSearch,
    describe: cmdTaskDescribe,
  },
  env: {
    search: cmdEnvSearch,
  },
  shopifyql: {
    columns: cmdShopifyqlColumns,
  },
  resource: {
    search: cmdResourceSearch,
  },
  type: {
    show: cmdTypeShow,
  },
  init: {_self: cmdInit},
}

function printHelp() {
  out(`flow.mjs — Shopify Flow CLI

Usage: node scripts/flow.mjs <topic> <command> [options]

Topics:
  workflow  list | show | pull | push | validate | diff | activate | deactivate | status
  template  search | save
  task      search | describe
  env       search
  shopifyql columns
  resource  search
  type      show
  init      (no subcommand)

Global flags:
  --store, -s   Store domain (or set in flow.toml)
  --token       Identity OAuth token (or set SHOPIFY_FLOW_TOKEN)
  --json, -j    Output raw JSON
  --verbose     Include full error backtraces
`)
}

async function main() {
  if (!topic || topic === '--help' || topic === '-h') {
    printHelp()
    return
  }

  const topicCmds = COMMANDS[topic]
  if (!topicCmds) fatal(`Unknown topic: ${topic}\nRun with --help to see available commands.`)

  // 'init' has no subcommand
  if (topicCmds._self) {
    await topicCmds._self()
    return
  }

  if (!command) {
    out(`Available commands for '${topic}': ${Object.keys(topicCmds).join(', ')}`)
    return
  }

  const fn = topicCmds[command]
  if (!fn) fatal(`Unknown command: ${topic} ${command}\nRun with --help to see available commands.`)

  await fn()
}

main().catch((err) => {
  process.stderr.write((err.stack ?? err.message ?? String(err)) + '\n')
  process.exit(1)
})
