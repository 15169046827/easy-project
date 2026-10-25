import { ref } from 'vue'
import { crudAction } from '../../../api'
import { createTaskEditPayload } from '../utils/interaction.js'
import { recalculateFormEnd, recalculateFormEffort } from '../utils/taskFormSchedule.js'

/** @typedef {{id: string, name?: string, start_time?: string, end_time?: string, effort_days?: number,
 * schedule_mode?: string, type?: string, status?: string, status_id?: string, progress?: number, assignee?: string, effort_state?: string, summary?: {has_children?: boolean}}} EditableTask */
/**
 * @param {{activeProject: import('vue').Ref<object>, message: import('vue').Ref<string>,
 * messageType: import('vue').Ref<string>, load: () => Promise<void>,
 * applyAutoSchedule: () => Promise<unknown>, t: (key: string, values: {name: string}) => string}} context
 */
export function useGanttEditEditor({
    activeProject,
    message,
    messageType,
    load,
    applyAutoSchedule,
    t
}) {
    /** @type {import('vue').Ref<EditableTask | null>} */
    const editingTask = ref(null)
    const editForm = ref({
        name: '',
        start_time: '',
        end_time: '',
        effort_days: 0,
        effort_state: 'unestimated',
        derived: false,
        schedule_mode: 'fixed_dates',
        type: 'Task',
        status: 'Pending',
        status_id: '',
        progress: 0,
        assignee: ''
    })
    let saving = false

    /** @param {EditableTask} task */
    function openEditor(task) {
        if (saving) return
        editingTask.value = task
        editForm.value = {
            name: task.name || '',
            start_time: (task.start_time || '').replace(' ', 'T').slice(0, 10),
            end_time: (task.end_time || '').replace(' ', 'T').slice(0, 10),
            effort_days: task.effort_days || 0,
            effort_state: task.effort_state || 'estimated',
            derived: Boolean(task.summary?.has_children),
            schedule_mode: task.schedule_mode || 'fixed_dates',
            type: task.type || 'Task',
            status: task.status || 'Pending',
            status_id: task.status_id || '',
            progress: task.progress || 0,
            assignee: task.assignee || ''
        }
    }

    function recalculateEditEnd() {
        recalculateFormEnd(editForm.value, activeProject.value)
    }
    function recalculateEditEffort() {
        recalculateFormEffort(editForm.value, activeProject.value)
    }
    function closeEditor() {
        if (!saving) editingTask.value = null
    }

    async function saveEdit() {
        const task = editingTask.value
        if (!task || saving) return
        if (!editForm.value.status_id) {
            messageType.value = 'error'
            message.value = t('taskStatuses.select', { name: '' })
            return
        }
        saving = true
        try {
            const payload = createTaskEditPayload(task.id, editForm.value)
            if (editForm.value.derived) {
                for (const key of [
                    'progress',
                    'effort_days',
                    'effort_state',
                    'start_time',
                    'end_time'
                ])
                    delete payload[key]
            } else if (payload.effort_state === 'legacy_unknown') {
                delete payload.effort_state
                delete payload.effort_days
            }
            await crudAction('task', 'update', payload)
            messageType.value = 'success'
            message.value = t('gantt.taskUpdated', { name: editForm.value.name })
            editingTask.value = null
            await load()
            await applyAutoSchedule()
        } catch (error) {
            messageType.value = 'error'
            message.value = error instanceof Error ? error.message : String(error)
        } finally {
            saving = false
        }
    }

    return {
        editingTask,
        editForm,
        openEditor,
        recalculateEditEnd,
        recalculateEditEffort,
        closeEditor,
        saveEdit
    }
}
