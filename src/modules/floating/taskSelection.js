function deadline(task) {
    const value = Date.parse(String(task.end_time || '').replace(' ', 'T'))
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
}

export function activeFloatingTasks(tasks) {
    return tasks
        .filter(task => task.status !== 'Done' && task.status !== 'Archived')
        .sort(
            (left, right) => deadline(left) - deadline(right) || left.name.localeCompare(right.name)
        )
}

export function nearbyFloatingTasks(tasks) {
    return activeFloatingTasks(tasks)
        .filter(task => Number.isFinite(deadline(task)))
        .slice(0, 5)
}

export function taskProgress(task) {
    const value = Number(task?.progress)
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
}
