// Explicit dictionary semantics take precedence over historical labels.
export function statusNameKeys(name, builtin = '') {
    const aliases = {
        Pending: ['Pending', '待办'],
        InProgress: ['InProgress', 'In Progress', '进行中'],
        Done: ['Done', '已完成']
    }
    return [name, ...(aliases[builtin] || [])].map(value =>
        String(value || '')
            .trim()
            .toLowerCase()
    )
}
export function findStatusNameConflict(states, name, excludingId = '') {
    const keys = statusNameKeys(name)
    return states.find(
        state =>
            state.id !== excludingId &&
            statusNameKeys(state.name, state.builtin_key).some(key => keys.includes(key))
    )
}
export function isTaskCompleted(task) {
    return typeof task.is_completed === 'boolean'
        ? task.is_completed
        : ['Done', 'Archived'].includes(task.status)
}
export function taskBuiltinKey(task) {
    return task.status_id
        ? task.status_builtin_key || ''
        : task.status === 'Todo'
          ? 'Pending'
          : task.status
}
