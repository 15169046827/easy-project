function compareTasks(left, right) {
    const orderDifference = Number(left.sort_order || 0) - Number(right.sort_order || 0)
    if (orderDifference !== 0) return orderDifference
    return String(left.name || '').localeCompare(String(right.name || ''))
}

function normalizedParentId(task, taskById) {
    const parentId = task.parent || ''
    const parent = taskById.get(parentId)
    if (!parent || parent.project_id !== task.project_id || parentId === task.id) return ''

    const visited = new Set([task.id])
    let current = parent
    while (current) {
        if (visited.has(current.id)) return ''
        visited.add(current.id)

        const next = taskById.get(current.parent)
        if (!next || next.project_id !== task.project_id) break
        current = next
    }
    return parentId
}

export function flattenTaskTree(tasks = [], expandedTaskIds = new Set()) {
    const taskById = new Map(tasks.map(task => [task.id, task]))
    const byParent = new Map()

    for (const task of tasks) {
        const parentId = normalizedParentId(task, taskById)
        if (!byParent.has(parentId)) byParent.set(parentId, [])
        byParent.get(parentId).push(task)
    }
    for (const children of byParent.values()) children.sort(compareTasks)

    const expanded = expandedTaskIds instanceof Set ? expandedTaskIds : new Set(expandedTaskIds)
    const result = []
    const appended = new Set()
    const append = (parentId, level) => {
        for (const task of byParent.get(parentId) || []) {
            if (appended.has(task.id)) continue
            appended.add(task.id)
            const hasChildren = (byParent.get(task.id) || []).length > 0
            result.push({ ...task, _level: level, _hasChildren: hasChildren })
            if (hasChildren && expanded.has(task.id)) append(task.id, level + 1)
        }
    }

    append('', 0)
    return result
}

export function getDescendantIds(tasks = [], taskId, projectId) {
    const childrenByParent = new Map()
    for (const task of tasks) {
        if (projectId && task.project_id !== projectId) continue
        if (!childrenByParent.has(task.parent)) childrenByParent.set(task.parent, [])
        childrenByParent.get(task.parent).push(task.id)
    }

    const descendants = new Set()
    const pending = [...(childrenByParent.get(taskId) || [])]
    while (pending.length) {
        const id = pending.pop()
        if (!id || id === taskId || descendants.has(id)) continue
        descendants.add(id)
        pending.push(...(childrenByParent.get(id) || []))
    }
    return descendants
}

export function getParentOptions(tasks = [], task) {
    const excluded = getDescendantIds(tasks, task.id, task.project_id)
    excluded.add(task.id)
    return tasks
        .filter(
            candidate => candidate.project_id === task.project_id && !excluded.has(candidate.id)
        )
        .sort(compareTasks)
}

export function getTaskSiblings(tasks = [], task) {
    return tasks
        .filter(
            candidate =>
                candidate.project_id === task.project_id && candidate.parent === task.parent
        )
        .sort(compareTasks)
}

export function canMoveTask(tasks, task, direction) {
    const siblings = getTaskSiblings(tasks, task)
    const index = siblings.findIndex(candidate => candidate.id === task.id)
    const targetIndex = index + direction
    return index >= 0 && targetIndex >= 0 && targetIndex < siblings.length
}
