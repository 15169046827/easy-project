import { ref } from 'vue'
import { crudAction } from '../../../api'
import { canMoveTask, getTaskSiblings } from '../utils/taskTree.js'

/** @typedef {{ id: string, name: string, parent: string, project_id: string, sort_order: number }} ReorderTask */

/**
 * @param {{ tasks: import('vue').Ref<ReorderTask[]>, reload: () => Promise<void>, loading: import('vue').Ref<boolean>,
 * errorMessage: import('vue').Ref<string>, successMessage: import('vue').Ref<string>,
 * t: (key: string, values?: { name: string }) => string }} context
 */
export function useTaskReordering({ tasks, reload, loading, errorMessage, successMessage, t }) {
    /** @type {import('vue').Ref<ReorderTask | null>} */
    const draggingTask = ref(null)
    /** @type {import('vue').Ref<string | null>} */
    const dragOverId = ref(null)
    let pending = false

    /** @param {ReorderTask} target */
    function canDrop(target) {
        const source = draggingTask.value
        return (
            !pending &&
            !!source &&
            source.id !== target.id &&
            source.parent === target.parent &&
            source.project_id === target.project_id
        )
    }

    /** @param {DragEvent} event @param {ReorderTask} task */
    function onDragStart(event, task) {
        if (pending || loading.value) return
        draggingTask.value = task
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', task.id)
        }
    }

    /** @param {DragEvent} event @param {ReorderTask} task */
    function onDragOver(event, task) {
        dragOverId.value = canDrop(task) ? task.id : null
        if (event.dataTransfer) event.dataTransfer.dropEffect = canDrop(task) ? 'move' : 'none'
    }

    /** @param {ReorderTask} task */
    function onDragLeave(task) {
        if (dragOverId.value === task.id) dragOverId.value = null
    }

    /** @param {ReorderTask} target */
    async function onDrop(target) {
        dragOverId.value = null
        if (!canDrop(target)) return
        const source = draggingTask.value
        await reorder(source, target, t('tasks.reordered', { name: source.name }))
    }

    /** @param {ReorderTask} source @param {ReorderTask} target @param {string} message */
    async function reorder(source, target, message) {
        if (pending || loading.value) return
        pending = true
        loading.value = true
        errorMessage.value = ''
        successMessage.value = ''
        try {
            await crudAction('task', 'swap_order', { source_id: source.id, target_id: target.id })
            await reload()
            successMessage.value = message
        } catch (error) {
            errorMessage.value = error instanceof Error ? error.message : String(error)
        } finally {
            pending = false
            loading.value = false
            draggingTask.value = null
        }
    }

    function onDragEnd() {
        draggingTask.value = null
        dragOverId.value = null
    }

    /** @param {ReorderTask} task @param {number} direction */
    function canMove(task, direction) {
        return !pending && !loading.value && canMoveTask(tasks.value, task, direction)
    }

    /** @param {ReorderTask} task @param {number} direction */
    async function moveTask(task, direction) {
        if (!canMove(task, direction)) return
        const siblings = getTaskSiblings(tasks.value, task)
        const index = siblings.findIndex(candidate => candidate.id === task.id)
        await reorder(task, siblings[index + direction], t('tasks.orderSaved'))
    }

    return {
        dragOverId,
        onDragStart,
        onDragOver,
        onDragLeave,
        onDrop,
        onDragEnd,
        canMove,
        moveTask
    }
}
