export const taskColumnWidths = {
    name: 14,
    project_id: 11,
    parent: 8,
    _predecessorIds: 10,
    start_time: 9,
    effort_days: 8,
    schedule_mode: 9,
    end_time: 8,
    type: 7,
    priority: 7,
    status: 7,
    progress: 6,
    comment: 14,
    assignee: 9,
    order: 6
}
export const defaultTaskColumns = [
    'project_id',
    'parent',
    '_predecessorIds',
    'end_time',
    'status',
    'progress'
]

export function normalizeTaskColumns(value) {
    return Array.isArray(value)
        ? [...new Set(value.filter(key => key !== 'name' && Object.hasOwn(taskColumnWidths, key)))]
        : [...defaultTaskColumns]
}

export function readTaskColumns(storage, key) {
    try {
        const saved = storage.getItem(key)
        return saved === null ? [...defaultTaskColumns] : normalizeTaskColumns(JSON.parse(saved))
    } catch {
        return [...defaultTaskColumns]
    }
}
