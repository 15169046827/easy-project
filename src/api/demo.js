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
const statuses = []
function seedStatuses(projectId) {
    if (statuses.some(state => state.project_id === projectId)) return
    ;['Pending', 'InProgress', 'Done'].forEach((key, index) =>
        statuses.push({
            id: `demo-status-${projectId}-${key}`,
            project_id: projectId,
            name: key,
            builtin_key: key,
            color: ['#64748b', '#3b82f6', '#22c55e'][index],
            sort_order: index,
            is_default: index === 0,
            is_completed: key === 'Done'
        })
    )
}
function assignStatus(task) {
    seedStatuses(task.project_id)
    const state = statuses.find(
        state =>
            state.project_id === task.project_id &&
            (task.status_id
                ? state.id === task.status_id
                : state.builtin_key ===
                  (task.status === 'Todo' ? 'Pending' : task.status || 'Pending'))
    )
    if (!state) throw new Error('Existing project status required')
    Object.assign(task, {
        status_id: state.id,
        status: state.name,
        status_builtin_key: state.builtin_key,
        is_completed: state.is_completed,
        ...(state.is_completed ? { progress: 100 } : {})
    })
    return task
}
projects.forEach(project => seedStatuses(project.id))
tasks.forEach(assignStatus)
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
        {
            project: projects,
            task: tasks,
            member: members,
            task_dependency: dependencies,
            task_status: statuses
        }[model] || []
    )
}

export async function demoAction(model, action, data = {}) {
    const items = collection(model)
    if (model === 'project' && action === 'create_from_template') {
        const id = `demo-project-${Date.now()}`
        projects.unshift({ id, ...structuredClone(data.project) })
        seedStatuses(id)
        data.tasks.forEach((task, index) => {
            tasks.push(
                assignStatus({
                    id: `demo-template-task-${Date.now()}-${index}`,
                    project_id: id,
                    sort_order: index,
                    progress: 0,
                    ...structuredClone(task)
                })
            )
        })
        return { id, taskCount: data.tasks.length }
    }
    if (model === 'task_status') {
        if (action === 'get_usage') {
            const list = tasks.filter(task => task.status_id === data.id),
                pageIndex = data.pageIndex || 1
            return {
                list: structuredClone(list.slice((pageIndex - 1) * 50, pageIndex * 50)),
                total: list.length,
                pageIndex,
                pageSize: 50
            }
        }
        if (action === 'add' || action === 'update') {
            const current =
                action === 'update' ? statuses.find(state => state.id === data.id) : null
            if (action === 'update' && !current) throw new Error('Status not found')
            const projectId = current?.project_id || data.project_id
            if (!projects.some(project => project.id === projectId))
                throw new Error('Project required')
            if (
                !data.name?.trim() ||
                statuses.some(
                    state =>
                        state.project_id === projectId &&
                        state.name === data.name.trim() &&
                        state.id !== data.id
                )
            )
                throw new Error('Unique status name required')
            const next = {
                id: `demo-status-${crypto.randomUUID()}`,
                project_id: projectId,
                color: '#64748b',
                sort_order: 100,
                is_default: false,
                is_completed: false,
                builtin_key: '',
                ...current,
                ...structuredClone(data),
                name: data.name.trim()
            }
            if (current?.is_default && !next.is_default)
                throw new Error('Choose another default first')
            if (next.is_default)
                statuses
                    .filter(state => state.project_id === projectId)
                    .forEach(state => {
                        state.is_default = false
                    })
            if (current) {
                if (current.name !== next.name) next.builtin_key = ''
                Object.assign(current, next)
            } else statuses.push(next)
            tasks.filter(task => task.status_id === next.id).forEach(assignStatus)
            return { id: next.id }
        }
        if (action === 'delete') {
            const index = statuses.findIndex(state => state.id === data.id),
                state = statuses[index]
            if (
                !state ||
                state.is_default ||
                statuses.filter(item => item.project_id === state.project_id).length <= 1 ||
                tasks.some(task => task.status_id === data.id)
            )
                throw new Error('Referenced, default or final status cannot be deleted')
            statuses.splice(index, 1)
            return { id: data.id, deleted: true }
        }
    }
    if (action === 'get_all') {
        let list = data.projectId ? items.filter(item => item.project_id === data.projectId) : items
        if (model === 'task' && data.status)
            list = list.filter(item => {
                if (data.status === 'Pending') return item.status_builtin_key === 'Pending'
                if (data.status === 'Done') return item.is_completed
                if (data.status === 'Overdue')
                    return (
                        !item.is_completed &&
                        Boolean(item.end_time) &&
                        new Date(item.end_time) < new Date()
                    )
                return item.status_id === data.status || item.status === data.status
            })
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
        if (item) Object.assign(item, model === 'task' ? assignStatus({ ...item, ...data }) : data)
        return item ? structuredClone(item) : null
    }
    if (model === 'task' && action === 'add') {
        const item = assignStatus({
            id: `demo-task-${crypto.randomUUID()}`,
            ...structuredClone(data)
        })
        tasks.push(item)
        return { id: item.id }
    }
    if (model === 'task' && action === 'swap_order') {
        const source = tasks.find(task => task.id === data.source_id)
        const target = tasks.find(task => task.id === data.target_id)
        if (
            !source ||
            !target ||
            source === target ||
            source.project_id !== target.project_id ||
            (source.parent || '') !== (target.parent || '')
        ) {
            throw new Error('Only sibling tasks in the same project can be reordered')
        }
        const order = source.sort_order
        source.sort_order = target.sort_order
        target.sort_order = order
        return {}
    }
    return null
}
