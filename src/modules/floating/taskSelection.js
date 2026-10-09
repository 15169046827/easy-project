export const SELECTED_TASK_KEY = 'easyproject-floating-task'

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

export function chooseFloatingTask(tasks, preferredId) {
    return tasks.find(task => task.id === preferredId) || tasks[0] || null
}

export function taskProgress(task) {
    const value = Number(task?.progress)
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0
}
