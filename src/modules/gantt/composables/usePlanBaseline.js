import { ref } from 'vue'
import { crudAction } from '../../../api'

/** @typedef {{task_id: string, task_name: string, start_time: string, end_time: string, created_at?: string}} BaselineEntry */
/**
 * @param {{projectId: import('vue').Ref<string>,
 * datedTasks: import('vue').Ref<Array<{id: string, name: string, start_time: string, end_time: string}>>,
 * message: import('vue').Ref<string>, messageType: import('vue').Ref<string>,
 * t: (key: string, values?: {count: number}) => string}} context
 */
export function usePlanBaseline({ projectId, datedTasks, message, messageType, t }) {
    /** @type {import('vue').Ref<BaselineEntry[]>} */
    const baseline = ref([])
    const showBaseline = ref(false)
    const savingBaseline = ref(false)

    async function loadBaseline() {
        const id = projectId.value
        if (!id) {
            baseline.value = []
            return
        }
        try {
            const result = await crudAction('plan_baseline', 'get_by_project', { projectId: id })
            if (id === projectId.value) baseline.value = result?.list || []
        } catch (error) {
            if (id === projectId.value) baseline.value = []
            throw error
        }
    }

    async function saveBaseline() {
        const id = projectId.value
        if (!id || savingBaseline.value) return
        savingBaseline.value = true
        try {
            const inputs = datedTasks.value.map(task => ({
                task_id: task.id,
                task_name: task.name,
                start_time: task.start_time,
                end_time: task.end_time
            }))
            await crudAction('plan_baseline', 'save', { project_id: id, tasks: inputs })
            if (id !== projectId.value) return
            await loadBaseline()
            if (id !== projectId.value) return
            showBaseline.value = true
            messageType.value = 'success'
            message.value = t('gantt.baselineSavedMsg', { count: inputs.length })
        } catch (error) {
            if (id === projectId.value) {
                messageType.value = 'error'
                message.value = error instanceof Error ? error.message : String(error)
            }
        } finally {
            savingBaseline.value = false
        }
    }

    async function clearBaseline() {
        const id = projectId.value
        if (!id || savingBaseline.value) return
        savingBaseline.value = true
        try {
            await crudAction('plan_baseline', 'clear', { projectId: id })
            if (id !== projectId.value) return
            baseline.value = []
            showBaseline.value = false
            messageType.value = 'success'
            message.value = t('gantt.baselineCleared')
        } catch (error) {
            if (id === projectId.value) {
                messageType.value = 'error'
                message.value = error instanceof Error ? error.message : String(error)
            }
        } finally {
            savingBaseline.value = false
        }
    }

    return { baseline, showBaseline, savingBaseline, loadBaseline, saveBaseline, clearBaseline }
}
