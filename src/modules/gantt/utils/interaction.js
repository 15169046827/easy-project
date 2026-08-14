function validDate(value) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

function addCalendarDays(date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

export function calculateDragDelta(startX, endX, dayWidth) {
    if (!Number.isFinite(dayWidth) || dayWidth <= 0) return 0
    return Math.round((Number(endX) - Number(startX)) / dayWidth)
}

export function calculateDragUpdate(origStart, origEnd, deltaDays, mode = 'move') {
    const start = validDate(origStart)
    const end = validDate(origEnd)
    if (!start || !end || !Number.isFinite(deltaDays)) return null
    if (mode === 'move' && deltaDays === 0) return { kind: 'edit' }

    let nextStart = start
    let nextEnd = end
    if (mode === 'move') {
        nextStart = addCalendarDays(start, deltaDays)
        nextEnd = addCalendarDays(end, deltaDays)
    } else if (mode === 'resize-left') {
        nextStart = addCalendarDays(start, deltaDays)
    } else if (mode === 'resize-right') {
        nextEnd = addCalendarDays(end, deltaDays)
    } else {
        return null
    }

    const startsAfterEnd = nextStart.getTime() > nextEnd.getTime()
    const collapsedByResize = mode !== 'move' && nextStart.getTime() === nextEnd.getTime()
    if (startsAfterEnd || collapsedByResize) return null
    return { kind: 'update', start: nextStart, end: nextEnd }
}

export function createTaskEditPayload(taskId, form) {
    return {
        id: taskId,
        name: form.name,
        start_time: `${form.start_time} 00:00:00`,
        end_time: `${form.end_time} 00:00:00`,
        type: form.type,
        status: form.status,
        progress: Number(form.progress),
        effort_days: Number(form.effort_days) || 0,
        schedule_mode: form.schedule_mode || 'fixed_effort',
        assignee: form.assignee || ''
    }
}

export function createTaskCreatePayload(projectId, form) {
    return {
        project_id: projectId,
        name: form.name.trim(),
        parent: '',
        dependence: '',
        start_time: `${form.start_time} 00:00:00`,
        end_time: `${form.end_time} 00:00:00`,
        type: form.type,
        priority: form.priority,
        status: form.status,
        progress: 0,
        effort_days: Number(form.effort_days) || 0,
        schedule_mode: form.schedule_mode || 'fixed_effort',
        comment: form.comment.trim(),
        assignee: form.assignee || ''
    }
}

export function evaluateDependency(dependencies = [], predecessorId, successorId) {
    const existingPredecessors = [
        ...new Set(
            dependencies
                .filter(dependency => dependency.successor_task_id === successorId)
                .map(dependency => dependency.predecessor_task_id)
                .filter(Boolean)
        )
    ]

    if (!predecessorId || !successorId || predecessorId === successorId) {
        return { allowed: false, reason: 'self', predecessorIds: existingPredecessors }
    }
    if (existingPredecessors.includes(predecessorId)) {
        return { allowed: false, reason: 'duplicate', predecessorIds: existingPredecessors }
    }

    const successorsByTask = new Map()
    for (const dependency of dependencies) {
        const from = dependency.predecessor_task_id
        const to = dependency.successor_task_id
        if (!from || !to) continue
        if (!successorsByTask.has(from)) successorsByTask.set(from, [])
        successorsByTask.get(from).push(to)
    }

    const pending = [successorId]
    const visited = new Set()
    while (pending.length) {
        const taskId = pending.pop()
        if (taskId === predecessorId) {
            return { allowed: false, reason: 'cycle', predecessorIds: existingPredecessors }
        }
        if (visited.has(taskId)) continue
        visited.add(taskId)
        pending.push(...(successorsByTask.get(taskId) || []))
    }

    return {
        allowed: true,
        reason: null,
        predecessorIds: [...existingPredecessors, predecessorId]
    }
}
