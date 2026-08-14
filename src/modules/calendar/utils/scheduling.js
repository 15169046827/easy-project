import { calculateEndDate, countWorkingDays, dateKey, nextWorkingDay } from './workCalendar.js'

function scheduleDate(value) {
    const key = dateKey(value)
    return key ? `${key} 00:00:00` : ''
}

function effectiveEffort(task, project) {
    const configured = Number(task.effort_days)
    if (Number.isFinite(configured) && configured > 0) return configured
    return Math.max(1, countWorkingDays(task.start_time, task.end_time, project))
}

export function calculateDependencySchedule(tasks = [], dependencies = [], project = {}) {
    const taskMap = new Map(tasks.map(task => [task.id, { ...task }]))
    const incoming = new Map(tasks.map(task => [task.id, []]))
    const outgoing = new Map(tasks.map(task => [task.id, []]))
    const indegree = new Map(tasks.map(task => [task.id, 0]))

    dependencies.forEach(dependency => {
        const predecessor = taskMap.get(dependency.predecessor_task_id)
        const successor = taskMap.get(dependency.successor_task_id)
        if (!predecessor || !successor || dependency.dependency_type === 'SS') return
        incoming.get(successor.id).push(dependency)
        outgoing.get(predecessor.id).push(successor.id)
        indegree.set(successor.id, indegree.get(successor.id) + 1)
    })

    const queue = tasks.filter(task => indegree.get(task.id) === 0).map(task => task.id)
    const ordered = []
    while (queue.length) {
        const id = queue.shift()
        ordered.push(id)
        outgoing.get(id).forEach(successorId => {
            const next = indegree.get(successorId) - 1
            indegree.set(successorId, next)
            if (next === 0) queue.push(successorId)
        })
    }

    const hasCycle = ordered.length !== tasks.length
    if (hasCycle) return { updates: [], conflicts: [], hasCycle: true }

    const updates = []
    const conflicts = []
    ordered.forEach(taskId => {
        const task = taskMap.get(taskId)
        const constraints = incoming.get(taskId)
        if (!constraints.length) return

        let requiredStart = null
        constraints.forEach(dependency => {
            const predecessor = taskMap.get(dependency.predecessor_task_id)
            const lagDays = Math.ceil(Math.max(0, Number(dependency.lag_minutes) || 0) / 1440)
            const candidate = nextWorkingDay(predecessor.end_time, project, lagDays)
            if (candidate && (!requiredStart || candidate > requiredStart))
                requiredStart = candidate
        })
        if (!requiredStart) return

        const requiredStartText = scheduleDate(requiredStart)
        if ((task.schedule_mode || 'fixed_dates') === 'fixed_dates') {
            if (dateKey(task.start_time) < dateKey(requiredStart)) {
                conflicts.push({ taskId, requiredStart: requiredStartText })
            }
            return
        }

        const effort = effectiveEffort(task, project)
        const end =
            task.type === 'Milestone'
                ? requiredStart
                : calculateEndDate(requiredStart, effort, project)
        const endText = scheduleDate(end)
        if (!endText) return
        if (
            dateKey(task.start_time) !== dateKey(requiredStart) ||
            dateKey(task.end_time) !== dateKey(end)
        ) {
            updates.push({ id: task.id, start_time: requiredStartText, end_time: endText })
            task.start_time = requiredStartText
            task.end_time = endText
        }
    })

    return { updates, conflicts, hasCycle: false }
}
