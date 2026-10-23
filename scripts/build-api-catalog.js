import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const source = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const option = name => {
    const index = process.argv.indexOf(name)
    return index >= 0 ? process.argv[index + 1] : null
}
const binary = resolve(root, option('--binary') || 'artifacts/mcp/easyproject-mcp.exe')
const manifestPath = resolve(root, option('--manifest') || 'artifacts/mcp/manifest.json')
if (Boolean(option('--binary')) !== Boolean(option('--manifest')))
    throw new Error('Custom binary requires its matching manifest')
const reuseTools = process.argv.includes('--reuse-tools')
const previous = reuseTools
    ? JSON.parse(readFileSync(resolve(root, 'docs/api/catalog.json'), 'utf8'))
    : null
const database = reuseTools ? null : process.argv[2]
if (!reuseTools && !database)
    throw new Error('Provide the existing database path; no mutations will be invoked')
const sha = value => createHash('sha256').update(value).digest('hex')
const binaryManifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (String(binaryManifest.sha256).toLowerCase() !== sha(readFileSync(binary)))
    throw new Error('Binary manifest digest mismatch')
if (reuseTools && previous.mcpBinary.sha256 !== sha(readFileSync(binary)))
    throw new Error('Previously verified MCP binary changed; cannot reuse tool inventory')
const before = reuseTools ? null : sha(readFileSync(database))
const input =
    [
        {
            jsonrpc: '2.0',
            id: 1,
            method: 'initialize',
            params: {
                protocolVersion: '2025-11-25',
                capabilities: {},
                clientInfo: { name: 'api-documentation', version: '1' }
            }
        },
        { jsonrpc: '2.0', method: 'notifications/initialized' },
        { jsonrpc: '2.0', id: 2, method: 'tools/list' }
    ]
        .map(message => JSON.stringify(message))
        .join('\n') + '\n'
const result = reuseTools
    ? { status: 0, stdout: JSON.stringify({ id: 2, result: { tools: previous.tools } }) }
    : spawnSync(binary, ['--database', database, '--allow-write', '--allow-delete'], {
          input,
          encoding: 'utf8',
          windowsHide: true,
          timeout: 10000
      })
if (result.status !== 0) throw new Error('MCP catalog discovery failed')
const tools = result.stdout
    .trim()
    .split('\n')
    .map(line => JSON.parse(line))
    .find(item => item.id === 2)?.result?.tools
if (tools?.length !== 23 || new Set(tools.map(tool => tool.name)).size !== 23)
    throw new Error('Expected twenty-three unique tools')
if (!reuseTools && before !== sha(readFileSync(database)))
    throw new Error('Database changed during discovery; review before documenting')
const sourceFiles = {
    project: 'project_service',
    task: 'task_service',
    member: 'member_service',
    project_member: 'project_member_service',
    task_dependency: 'task_dependency_service',
    data: 'data_service',
    calendar: 'calendar_service',
    plan_baseline: 'plan_baseline_service'
}
const actions = Object.fromEntries(
    Object.entries(sourceFiles).map(([model, file]) => {
        const text = readFileSync(resolve(root, `src-tauri/src/services/${file}.rs`), 'utf8')
            .split('pub fn handle_action')[1]
            ?.split('#[cfg(test)]')[0]
        if (!text) throw new Error(`Missing dispatcher ${model}`)
        const values = [...text.matchAll(/^\s{8}"([a-z_]+)"\s*=>/gm)].map(match => match[1])
        return [model, values]
    })
)
const statusSource = readFileSync(
    resolve(root, 'src-tauri/src/services/task_status_service.rs'),
    'utf8'
)
actions.task_status = ['get_all', 'get_usage', 'add', 'update', 'delete']
if (actions.task_status.some(action => !statusSource.includes(`"${action}"`)))
    throw new Error('Status dispatcher changed; review explicit inventory')
const entry = readFileSync(resolve(root, 'src-tauri/src/lib.rs'), 'utf8')
const commands = entry
    .split('.invoke_handler(generate_handler![')[1]
    .split('])')[0]
    .split(',')
    .map(name => name.trim().split('::').at(-1))
    .filter(Boolean)
if (commands.length !== 7 || Object.values(actions).flat().length !== 36)
    throw new Error('IPC inventory changed; review contract documentation')
const catalog = {
    sourceCommit: source,
    sourceNote:
        'Documentation source; unchanged MCP input schemas may be reused only when the previously verified binary digest matches. Binary provenance is separate; this generator does not rebuild or replace it.',
    mcpBinary: {
        sha256: sha(readFileSync(binary)),
        sourceCommit: binaryManifest.sourceCommit,
        worktreeDirty: Boolean(binaryManifest.worktreeDirty),
        buildKind: binaryManifest.buildKind || 'release'
    },
    transport: {
        mcp: 'stdio JSON-RPC; no HTTP listener',
        desktop: 'Tauri invoke; internal desktop only'
    },
    tools,
    commands,
    actions
}
mkdirSync(resolve(root, 'docs/api'), { recursive: true })
writeFileSync(resolve(root, 'docs/api/catalog.json'), JSON.stringify(catalog, null, 2) + '\n')
const modelNames = [
    'project',
    'task',
    'task_status',
    'member',
    'project_member',
    'task_dependency',
    'plan_baseline',
    'common'
]
const models =
    '# EasyProject模型与原生请求类型\n\n来源：' +
    source +
    '\n\n以下为真实Rust类型及serde默认属性。String不代表业务允许任意字符串；业务关系/范围以服务校验为准。MCP另有严格inputSchema和默认补齐，不能与桌面原生请求互换。\n\n' +
    modelNames
        .map(name => {
            const text = readFileSync(
                resolve(
                    root,
                    `src-tauri/src/${name === 'task_status' ? 'common' : 'models'}/${name}.rs`
                ),
                'utf8'
            )
            const structs = [...text.matchAll(/(?:#\[[^\n]+\]\s*)*pub struct [\s\S]*?^}/gm)].map(
                match => match[0]
            )
            return `## ${name}\n\n\`\`\`rust\n${structs.join('\n\n')}\n\`\`\`\n`
        })
        .join('\n')
writeFileSync(resolve(root, 'docs/api/MODELS.md'), models)
const overview = readFileSync(resolve(root, 'docs/api/OVERVIEW.md'), 'utf8')
const desktop = readFileSync(resolve(root, 'docs/api/DESKTOP_IPC.md'), 'utf8')
const provenance = `\n\n接口基线：${source}。候选MCP二进制源：${catalog.mcpBinary.sourceCommit}，worktreeDirty=${catalog.mcpBinary.worktreeDirty}，buildKind=${catalog.mcpBinary.buildKind}，SHA256：${catalog.mcpBinary.sha256}。文档维护不改变已安装程序或真实业务数据，schema7尚未部署。\n`
const documents = [
    { key: 'overview', name: 'EasyProject API / 协议与权限总览', content: overview + provenance },
    { key: 'models', name: 'EasyProject API / 模型与原生请求类型', content: models + provenance },
    ...tools.map(tool => {
        const action = tool.name.split('_').at(-1)
        const output =
            action === 'list'
                ? tool.name.includes('project_member') || tool.name.includes('task_status')
                    ? '{list}'
                    : '{list,total,pageIndex,pageSize,totalPage}'
                : action === 'get'
                  ? tool.name.includes('task_status')
                      ? '{record,usage:{list,total,pageIndex,pageSize}}；首50引用任务含软删除，IPC get_usage可继续分页'
                      : '当前活跃记录对象'
                  : '{record,operation_id,recovery_point}；删除的record={id,deleted:true}'
        return {
            key: tool.name,
            name: `MCP / ${tool.name}`,
            content: `# ${tool.name}\n\n协议：MCP JSON-RPC over stdio，非HTTP，无监听URL。\n\n${tool.description}\n\n## 权限\n${tool.annotations.readOnlyHint ? '查询，无权限开关也可发现。' : `必须--allow-write${action === 'delete' ? '并且--allow-delete' : ''}，按用户具体任务和客户端审批执行。写前恢复点/脱敏审计；删除为软删除且名称精确匹配/关联约束。`}\n\n## arguments JSON Schema\n\`\`\`json\n${JSON.stringify(tool.inputSchema, null, 2)}\n\`\`\`\n\n## 返回\n${output}。result同时包含content和structuredContent，成功isError=false；业务失败isError=true，协议错误为error。规则、握手与重试边界见项目协议总览。\n\n## 调用包装\n\`\`\`json\n${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: tool.name, arguments: {} } }, null, 2)}\n\`\`\`\n包装内arguments={}仅示意位置；应按上方required字段填写，不能对有必填字段的工具直接空参数调用。\n${provenance}`
        }
    }),
    ...commands.map(command => ({
        key: `tauri_${command}`,
        name: `Tauri IPC / ${command}`,
        content: `# ${command}\n\n本项为受控桌面内部Tauri invoke命令，不是HTTP，也不是对外MCP。参数、返回、调用窗口限制如下；统一crud_action包含全部36个model/action。\n\n${desktop}${provenance}`
    }))
]
writeFileSync(
    resolve(root, 'docs/api/apifox-documents.json'),
    JSON.stringify(documents, null, 2) + '\n'
)
console.log(
    JSON.stringify({
        tools: tools.length,
        commands: commands.length,
        actions: Object.values(actions).flat().length,
        source,
        reusedToolInventory: reuseTools,
        databaseUnchanged: reuseTools ? null : true
    })
)
