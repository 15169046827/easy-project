// Derive a stable tree without changing stored dates, order or parent IDs.
export function ganttTaskRows(tasks, parse, collapsed = new Set()) {
    const byId = new Map(tasks.map(task => [task.id, task]))
    const children = new Map()
    for (const task of tasks) {
        const parent = byId.has(task.parent) ? task.parent : ''
        if (!children.has(parent)) children.set(parent, [])
        children.get(parent).push(task)
    }
    for (const siblings of children.values()) {
        siblings.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }
    const visited = new Set()
    const rows = []
    function visit(task, level, hidden, path = new Set()) {
        if (path.has(task.id)) return null
        const next = new Set(path).add(task.id)
        visited.add(task.id)
        const descendants = children.get(task.id) || []
        const row = { ...task, level, hasChildren: descendants.length > 0 }
        if (!hidden) rows.push(row)
        const dates = descendants
            .map(child => visit(child, level + 1, hidden || collapsed.has(task.id), next))
            .filter(Boolean)
        if (descendants.length) {
            row.start_time = dates.length ? dates.map(d => d.start_time).sort()[0] : ''
            row.end_time = dates.length
                ? dates
                      .map(d => d.end_time)
                      .sort()
                      .at(-1)
                : ''
            row.summary = { ...task.summary, has_children: true }
        } else if (parse(row.start_time)) {
            row.end_time = parse(row.end_time) ? row.end_time : row.start_time
        }
        return parse(row.start_time) ? row : null
    }
    for (const task of children.get('') || []) visit(task, 0, false)
    // Do not silently drop malformed cyclic/imported branches.
    for (const task of tasks) if (!visited.has(task.id)) visit(task, 0, false)
    return rows
}
