const projects = [
    {
        id: 'demo-project',
        name: 'EasyProject 1.0 发布',
        version: 'v1.0',
        type: 'private',
        status: 'InProgress',
        owner: 'demo-alice',
        calendar_country: 'CN',
        calendar_region: '',
        weekend_days: '[0,6]',
        calendar_exceptions: '[]',
        update_time: '2026-07-21 09:00:00'
    }
]
const tasks = [
    {
        id: 'demo-1',
        project_id: 'demo-project',
        sort_order: 1,
        name: '需求与验收标准',
        start_time: '2026-07-01 00:00:00',
        end_time: '2026-07-03 00:00:00',
        type: 'Task',
        priority: '2',
        status: 'Done',
        progress: 100,
        effort_days: 3,
        assignee: 'demo-alice',
        comment: '明确发布范围和验收口径'
    },
    {
        id: 'demo-2',
        project_id: 'demo-project',
        sort_order: 2,
        name: '核心功能开发',
        start_time: '2026-07-06 00:00:00',
        end_time: '2026-07-14 00:00:00',
        type: 'Task',
        priority: '1',
        status: 'InProgress',
        progress: 65,
        effort_days: 7,
        assignee: 'demo-bob',
        comment: '完成任务、甘特图与数据恢复'
    },
    {
        id: 'demo-3',
        project_id: 'demo-project',
        sort_order: 3,
        name: '安装包验收',
        start_time: '2026-07-15 00:00:00',
        end_time: '2026-07-16 00:00:00',
        type: 'Task',
        priority: '2',
        status: 'InProgress',
        progress: 35,
        effort_days: 2,
        assignee: 'demo-alice',
        comment: 'Windows 与 macOS 冒烟测试'
    },
    {
        id: 'demo-4',
        project_id: 'demo-project',
        sort_order: 4,
        name: '正式发布',
        start_time: '2026-07-17 00:00:00',
        end_time: '2026-07-17 00:00:00',
        type: 'Milestone',
        priority: '1',
        status: 'Pending',
        progress: 0,
        effort_days: 1,
        assignee: 'demo-alice',
        comment: '发布 v1.0'
    }
]
const members = [
    { id: 'demo-alice', name: 'Alice', role: 'Project Manager', availability_exceptions: '[]' },
    { id: 'demo-bob', name: 'Bob', role: 'Developer', availability_exceptions: '[]' }
]
const dependencies = [
    {
        id: 'dep-1',
        predecessor_task_id: 'demo-1',
        successor_task_id: 'demo-2',
        dependency_type: 'FS'
    },
    {
        id: 'dep-2',
        predecessor_task_id: 'demo-2',
        successor_task_id: 'demo-3',
        dependency_type: 'FS'
    },
    {
        id: 'dep-3',
        predecessor_task_id: 'demo-3',
        successor_task_id: 'demo-4',
        dependency_type: 'FS'
    }
]

function collection(model) {
    return (
        { project: projects, task: tasks, member: members, task_dependency: dependencies }[model] ||
        []
    )
}

export async function demoAction(model, action, data = {}) {
    const items = collection(model)
    if (model === 'project' && action === 'create_from_template') {
        const id = `demo-project-${Date.now()}`
        projects.unshift({ id, ...structuredClone(data.project) })
        data.tasks.forEach((task, index) => {
            tasks.push({
                id: `demo-template-task-${Date.now()}-${index}`,
                project_id: id,
                sort_order: index,
                progress: 0,
                ...structuredClone(task)
            })
        })
        return { id, taskCount: data.tasks.length }
    }
    if (action === 'get_all') {
        const list = data.projectId
            ? items.filter(item => item.project_id === data.projectId)
            : items
        return { list: structuredClone(list), total: list.length }
    }
    if (model === 'project_member' && action === 'get_by_project') {
        return {
            list: members.map((member, index) => ({
                id: `demo-pm-${index}`,
                project_id: 'demo-project',
                member_id: member.id,
                role: index ? 'Developer' : 'Owner',
                member_name: member.name
            }))
        }
    }
    if (model === 'task_dependency' && action === 'get_all')
        return { list: structuredClone(dependencies), total: dependencies.length }
    if (model === 'plan_baseline' && action === 'get_by_project') return { list: [] }
    if (model === 'data' && action === 'list_backups') {
        return {
            directory: 'EasyProject/backups',
            list: [
                {
                    path: 'demo-backup.db',
                    name: 'easy-project-auto-20260721-090000.db',
                    reason: 'auto',
                    created_at: '2026-07-21T09:00:00+08:00',
                    size: 286720,
                    counts: { projects: 1, tasks: 4, members: 2, dependencies: 3, baselines: 0 }
                }
            ]
        }
    }
    if (action === 'update') {
        const item = items.find(value => value.id === data.id)
        if (item) Object.assign(item, data)
        return item ? structuredClone(item) : null
    }
    return null
}
