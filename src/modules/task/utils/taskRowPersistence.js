import { crudAction } from '../../../api'

const editableFields = [
    'project_id',
    'name',
    'parent',
    'dependence',
    'start_time',
    'end_time',
    'type',
    'priority',
    'status',
    'progress',
    'effort_days',
    'schedule_mode',
    'comment',
    'assignee',
    'sort_order'
]

export async function persistTaskRow(newData, oldData, onCreated) {
    if (newData.id.startsWith('NEWTASK:')) {
        const { id, _predecessorIds, ...payload } = newData
        const result = await crudAction('task', 'add', payload)
        if (!result?.id || typeof result.id !== 'string')
            throw new Error('Task creation returned no ID')
        onCreated(result.id)
        await crudAction('task_dependency', 'set_for_task', {
            taskId: result.id,
            predecessorIds: newData._predecessorIds || []
        })
        return
    }

    const changedFields = {}
    for (const key of editableFields) {
        if (newData[key] !== oldData[key]) changedFields[key] = newData[key] ?? ''
    }
    if (Object.keys(changedFields).length) {
        await crudAction('task', 'update', { ...changedFields, id: newData.id })
    }
    if (
        JSON.stringify(newData._predecessorIds || []) !==
        JSON.stringify(oldData._predecessorIds || [])
    ) {
        await crudAction('task_dependency', 'set_for_task', {
            taskId: newData.id,
            predecessorIds: newData._predecessorIds || []
        })
    }
}
