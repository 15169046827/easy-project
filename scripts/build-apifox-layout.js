import { readFileSync, writeFileSync } from 'node:fs'

const catalog = JSON.parse(readFileSync('docs/api/catalog.json', 'utf8'))
const documents = JSON.parse(readFileSync('docs/api/apifox-documents.json', 'utf8'))
const desktop = readFileSync('docs/api/DESKTOP_IPC.md', 'utf8')
const models = {
    project: '项目',
    task: '任务',
    member: '人员',
    project_member: '项目团队',
    task_dependency: '任务依赖',
    plan_baseline: '计划基线',
    data: '数据与备份',
    calendar: '工作日历'
}
const operations = {
    list: '列表',
    get: '详情',
    create: '新建',
    update: '修改',
    delete: '删除',
    add: '新建',
    get_all: '列表',
    create_from_template: '从模板创建',
    swap_order: '交换排序',
    search: '搜索',
    get_by_member: '按人员查询',
    get_by_project: '按项目查询',
    set_for_task: '设置前置任务',
    save: '保存',
    clear: '清除',
    export_json: '导出JSON',
    import_json: '导入JSON',
    backup: '创建备份',
    list_backups: '备份列表',
    preview_backup: '预览备份',
    restore: '恢复备份',
    fetch_ics: '获取ICS'
}
const commands = {
    crud_action: ['统一业务分发', 'ipc', desktop],
    open_task_window: [
        '打开任务悬浮窗',
        'ipc.window',
        '无参数；仅main窗口允许。返回void。复用task-floating单实例，已存在时显示并聚焦；不接受任意URL或新窗口标签。'
    ],
    show_main_window: [
        '返回主窗口并打开项目',
        'ipc.window',
        '参数`{projectId:string}`；仅task-floating窗口允许。返回void，显示/恢复/聚焦main，并发送easyproject:open-project事件。'
    ],
    storage_info: [
        '查询存储位置',
        'ipc.storage',
        '无参数；仅main窗口允许。返回StorageInfo：ready、activeDir、databasePath、defaultDir、profileDir、configPath、pendingDir、error。'
    ],
    set_data_directory: [
        '设置下次启动的数据目录',
        'ipc.storage',
        '参数`{directory:string}`；仅main窗口允许。非C盘本地绝对新/空目录，拒绝链接、网络与父子重叠；返回StorageInfo。只记录pending，重启复制核验后切换，不删除源或失败后建空替代库。'
    ],
    reveal_backup_directory: [
        '打开受管备份目录',
        'ipc.storage',
        '无参数；仅main窗口允许，返回void。固定当前库同侧backups目录，不接受任意路径。'
    ]
}
const folders = [
    { key: 'mcp', name: '01 MCP 对外接口' },
    ...Object.entries(models)
        .filter(([key]) => ['project', 'task', 'member', 'project_member'].includes(key))
        .map(([key, name]) => ({ key: `mcp.${key}`, name, parent: 'mcp' })),
    { key: 'ipc', name: '02 桌面 IPC 内部接口' },
    ...Object.entries(models).map(([key, name]) => ({ key: `ipc.${key}`, name, parent: 'ipc' })),
    { key: 'ipc.window', name: '窗口与悬浮窗', parent: 'ipc' },
    { key: 'ipc.storage', name: '存储位置', parent: 'ipc' },
    { key: 'guide', name: '03 接入规范与模型' },
    { key: 'archive', name: '99 历史文档快照' },
    { key: 'archive.mcp', name: 'MCP 原文快照', parent: 'archive' },
    { key: 'archive.ipc', name: 'IPC 原文快照', parent: 'archive' }
]
const interfaces = catalog.tools.map(tool => {
    const [model, action] = tool.name.slice('easyproject_'.length).split(/_(?=[^_]+$)/)
    return {
        key: tool.name,
        name: `${models[model]}${operations[action]}`,
        protocol: 'MCP stdio',
        path: tool.name,
        group: `mcp.${model}`,
        content: documents.find(doc => doc.key === tool.name).content
    }
})
for (const command of catalog.commands) {
    const [name, group, description] = commands[command]
    interfaces.push({
        key: `tauri_${command}`,
        name,
        protocol: 'Tauri IPC',
        path: command,
        group,
        content: `# ${command}\n\n内部Tauri invoke接口，非HTTP，不能作为外部MCP工具直接调用。\n\n${description}\n\n来源：${catalog.sourceCommit}。内部返回失败须同时处理ApiResponse.success=false和invoke reject，窗口命令错误reject字符串。`
    })
}
for (const [model, actions] of Object.entries(catalog.actions)) {
    for (const action of actions) {
        const row = desktop.split('\n').find(line => {
            const cells = line.split('|').map(cell => cell.trim())
            return cells[1] === model && cells[2] === action
        })
        if (!row) throw new Error(`Missing documented action: ${model}.${action}`)
        const details = row.split('|').slice(3, -1).join('|').trim()
        interfaces.push({
            key: `ipc_${model}_${action}`,
            name: `${models[model]}·${operations[action]}`,
            protocol: 'Tauri IPC',
            path: `crud_action.${model}.${action}`,
            group: `ipc.${model}`,
            content: `# ${model}.${action}\n\n协议：桌面内部Tauri invoke；不是HTTP，不存在此路径的REST服务。\n\n## 调用\n\`invoke('crud_action', {model:'${model}',action:'${action}',data:{...}})\`\n\ndata的实际参数与规则：${details}\n\n原生请求类型与serde默认见“接入规范与模型”，不能套用MCP默认补齐；data:{...}是占位说明而非可直接执行JSON。\n\n## 返回和失败\n正常返回{success:boolean,message:string,data:object|null}；详情按上方动作说明。业务失败可能success=false，解析/数据库异常可能invoke reject，调用方都应处理。服务端事务/字段和关系约束不能绕过。\n\n来源：${catalog.sourceCommit}，services/${model}_service.rs。本轮仅维护契约，没有操作真实业务记录。`
        })
    }
}
if (interfaces.length !== 55 || new Set(interfaces.map(item => item.key)).size !== 55)
    throw new Error('Interface inventory mismatch')
writeFileSync(
    'docs/api/apifox-layout.json',
    JSON.stringify({ rootFolderId: 97870489, folders, interfaces }, null, 2) + '\n'
)
console.log(
    JSON.stringify({
        folders: folders.length,
        interfaces: interfaces.length,
        protocols: ['MCP stdio', 'Tauri IPC']
    })
)
