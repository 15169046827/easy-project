export const requiredTaskFields = {
    name: 'columnName',
    project_id: 'columnProject',
    type: 'columnType',
    priority: 'columnPriority',
    status_id: 'columnStatus',
    schedule_mode: 'columnScheduleMode'
}

export function validateTaskForm(task, t) {
    const errors = {}
    for (const [field, label] of Object.entries(requiredTaskFields)) {
        if (!String(task?.[field] ?? '').trim())
            errors[field] = t('tasks.requiredField', { field: t(`tasks.${label}`) })
    }
    return errors
}
