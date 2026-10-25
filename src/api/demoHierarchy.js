// Presentation-only demo data. Real writes and rollups remain authoritative in Rust.
export function decorateDemoTasks(tasks) {
    const rows = structuredClone(tasks).map(task => ({
        ...task,
        parent: task.parent || '',
        effort_state: task.effort_state || 'estimated'
    }))
    const byId = new Map(rows.map(task => [task.id, task]))
    const children = new Map(
        rows.map(task => [task.id, rows.filter(child => child.parent === task.id)])
    )
    const remaining = new Map(rows.map(task => [task.id, children.get(task.id).length]))
    const queue = rows.filter(task => !remaining.get(task.id))
    for (let index = 0; index < queue.length; index++) {
        const task = queue[index],
            items = children.get(task.id)
        const summary = {
            has_children: Boolean(items.length),
            direct_child_count: items.length,
            completed_child_count: items.filter(child => child.is_completed).length,
            effort_days: 0,
            progress: null,
            unestimated_count: 0,
            legacy_unknown_count: 0,
            start_time: '',
            end_time: '',
            schedule_incomplete: false
        }
        if (items.length) {
            for (const child of items) {
                const value = child.summary
                summary.effort_days += value.effort_days
                summary.unestimated_count += value.unestimated_count
                summary.legacy_unknown_count += value.legacy_unknown_count
                summary.schedule_incomplete ||= value.schedule_incomplete
                if (
                    value.start_time &&
                    (!summary.start_time || value.start_time < summary.start_time)
                )
                    summary.start_time = value.start_time
                if (value.end_time > summary.end_time) summary.end_time = value.end_time
            }
            summary.progress =
                summary.effort_days > 0
                    ? items.reduce(
                          (sum, child) =>
                              sum + child.summary.effort_days * (child.summary.progress || 0),
                          0
                      ) / summary.effort_days
                    : null
            Object.assign(task, {
                effort_days: summary.effort_days,
                progress: Math.round(summary.progress || 0),
                start_time: summary.start_time,
                end_time: summary.end_time
            })
        } else
            Object.assign(summary, {
                effort_days: task.effort_state === 'estimated' ? Number(task.effort_days) || 0 : 0,
                progress: Number(task.progress) || 0,
                unestimated_count: Number(task.effort_state === 'unestimated'),
                legacy_unknown_count: Number(task.effort_state === 'legacy_unknown'),
                start_time: task.start_time || '',
                end_time: task.end_time || task.start_time || '',
                schedule_incomplete: !task.start_time
            })
        task.summary = summary
        const parent = byId.get(task.parent)
        if (parent) {
            remaining.set(parent.id, remaining.get(parent.id) - 1)
            if (!remaining.get(parent.id)) queue.push(parent)
        }
    }
    return rows
}

export function demoTreePage(scope, matched, statuses, query) {
    const byId = new Map(scope.map(task => [task.id, task])),
        matches = new Set(matched.map(task => task.id)),
        included = new Set()
    for (const task of matched) {
        let cursor = task
        while (cursor && !included.has(cursor.id)) {
            included.add(cursor.id)
            cursor = byId.get(cursor.parent)
        }
    }
    const roots = scope.filter(task => !task.parent && included.has(task.id)),
        size = query.pageSize || 20,
        page = query.pageIndex || 1
    const selected = new Set(roots.slice((page - 1) * size, page * size).map(task => task.id))
    const list = scope
        .filter(task => {
            if (!included.has(task.id)) return false
            let cursor = task
            while (byId.has(cursor.parent)) cursor = byId.get(cursor.parent)
            return selected.has(cursor.id)
        })
        .map(task => ({ ...task, context_only: !matches.has(task.id) }))
    const statistics = source => ({
        total: source.length,
        statuses: statuses
            .filter(state => !query.projectId || state.project_id === query.projectId)
            .map(state => ({
                ...state,
                count: source.filter(task => task.status_id === state.id).length
            }))
    })
    return {
        list,
        total: roots.length,
        pageIndex: page,
        pageSize: size,
        statistics: { top_level: statistics(roots), all_tasks: statistics(matched) }
    }
}
