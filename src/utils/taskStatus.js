// Explicit dictionary semantics take precedence over historical labels.
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
