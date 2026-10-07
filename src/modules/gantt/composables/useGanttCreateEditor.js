import { ref } from 'vue'
import { crudAction } from '../../../api'
import { countWorkingDays, dateKey } from '../../calendar/utils/workCalendar.js'
import { createTaskCreatePayload } from '../utils/interaction.js'
import { recalculateFormEnd, recalculateFormEffort } from '../utils/taskFormSchedule.js'

/**
 * @param {{projectId: import('vue').Ref<string>, activeProject: import('vue').Ref<object>,
 * message: import('vue').Ref<string>, messageType: import('vue').Ref<string>,
 * load: () => Promise<void>, t: (key: string, values?: {name: string}) => string}} context
 */
export function useGanttCreateEditor({ projectId, activeProject, message, messageType, load, t }) {
    const creatingTask = ref(false)
    const savingTask = ref(false)
    const createError = ref('')
    const defaults = () => ({
        name: '',
        start_time: '',
        end_time: '',
        effort_days: 1,
        schedule_mode: 'fixed_effort',
        type: 'Task',
        priority: '3',
        status: 'Pending',
        assignee: '',
        comment: ''
    })
    const createForm = ref(defaults())

    /** @param {Date} startDate @param {Date} endDate */
    function openCreateEditor(startDate, endDate) {
        if (savingTask.value) return
        createError.value = ''
        createForm.value = {
            ...defaults(),
            start_time: dateKey(startDate),
            end_time: dateKey(endDate),
            effort_days: Math.max(1, countWorkingDays(startDate, endDate, activeProject.value))
        }
        creatingTask.value = true
    }

    function recalculateCreateEnd() {
        recalculateFormEnd(createForm.value, activeProject.value)
    }
    function recalculateCreateEffort() {
        recalculateFormEffort(createForm.value, activeProject.value)
    }

    function closeCreateEditor() {
        if (savingTask.value) return
        creatingTask.value = false
        createError.value = ''
    }

    async function saveCreate() {
        if (savingTask.value) return
        if (!createForm.value.name.trim()) {
            createError.value = `${t('tasks.columnName')} ${t('common.required')}`
            return
        }
        savingTask.value = true
        createError.value = ''
        try {
            const payload = createTaskCreatePayload(projectId.value, createForm.value)
            await crudAction('task', 'add', payload)
            messageType.value = 'success'
            message.value = t('gantt.taskCreated', { name: payload.name })
            creatingTask.value = false
            await load()
        } catch (error) {
            messageType.value = 'error'
            message.value = error instanceof Error ? error.message : String(error)
            createError.value = message.value
        } finally {
            savingTask.value = false
        }
    }

    return {
        creatingTask,
        savingTask,
        createError,
        createForm,
        openCreateEditor,
        recalculateCreateEnd,
        recalculateCreateEffort,
        closeCreateEditor,
        saveCreate
    }
}
