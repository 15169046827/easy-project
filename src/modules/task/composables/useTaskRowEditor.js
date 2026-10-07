import { ref } from 'vue'
import { persistTaskRow } from '../utils/taskRowPersistence.js'

export function useTaskRowEditor({
    tasks,
    errorMessage,
    successMessage,
    initChecked,
    applyAutoSchedule,
    loadTeamMemberIds,
    t
}) {
    const editingRows = ref([])
    const editingCache = ref({})
    const activeEditingId = ref('')
    let saving = false

    async function onRowEditInit(event) {
        if (saving) return
        try {
            await loadTeamMemberIds(event.data.project_id)
        } catch (error) {
            errorMessage.value = error instanceof Error ? error.message : String(error)
            return
        }
        if (
            activeEditingId.value.startsWith('NEWTASK:') &&
            activeEditingId.value !== event.data.id
        ) {
            tasks.value = tasks.value.filter(task => task.id !== activeEditingId.value)
        }
        editingRows.value = [event.data]
        activeEditingId.value = event.data.id
        editingCache.value[event.data.id] = JSON.parse(JSON.stringify(event.data))
    }

    function onRowEditCancel({ newData }) {
        if (saving) return
        if (newData.id.startsWith('NEWTASK:')) {
            tasks.value = tasks.value.filter(task => task.id !== newData.id)
            delete editingCache.value[newData.id]
        }
        activeEditingId.value = ''
    }

    function adoptCreatedTask(newData, id) {
        const temporaryId = newData.id
        newData.id = id
        tasks.value = tasks.value.map(task => (task.id === temporaryId ? { ...newData } : task))
        delete editingCache.value[temporaryId]
        editingCache.value[id] = { ...newData, _predecessorIds: [] }
        activeEditingId.value = id
        editingRows.value = [newData]
    }

    async function onRowEditSave({ newData }) {
        if (saving) return
        if (!newData.name.trim()) {
            errorMessage.value = t('tasks.nameEmpty')
            editingRows.value = [newData]
            return
        }
        if (!newData.project_id) {
            errorMessage.value = t('tasks.mustBelong')
            editingRows.value = [newData]
            return
        }
        saving = true
        errorMessage.value = ''
        successMessage.value = ''
        let created = false
        try {
            await persistTaskRow(newData, editingCache.value[newData.id] || {}, id => {
                adoptCreatedTask(newData, id)
                created = true
            })
            await initChecked()
            const result = await applyAutoSchedule()
            successMessage.value = result.updates.length
                ? t('tasks.savedAndScheduled', { count: result.updates.length })
                : t('tasks.saved')
            if (result.conflicts.length)
                errorMessage.value = t('tasks.scheduleConflicts', {
                    count: result.conflicts.length
                })
            activeEditingId.value = ''
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error)
            errorMessage.value = created
                ? t('tasks.createdButIncomplete', { message: detail })
                : detail
            editingRows.value = [newData]
        } finally {
            saving = false
        }
    }
    return {
        editingRows,
        editingCache,
        activeEditingId,
        onRowEditInit,
        onRowEditCancel,
        onRowEditSave
    }
}
