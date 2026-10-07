import { computed, ref } from 'vue'
import { crudAction } from '../../../api'
import { evaluateDependency } from '../utils/interaction.js'
import { useDocumentDragListeners } from './useDocumentDragListeners.js'

export function useGanttDependencyDragging(context) {
    const {
        datedTasks,
        dependencies,
        parse,
        offset,
        dayWidth,
        nameWidth,
        headerHeight,
        rowHeight,
        message,
        messageType,
        load,
        applyAutoSchedule,
        t
    } = context
    const linking = ref(null)
    const { addDocumentListener, removeDocumentListener } = useDocumentDragListeners()
    const linkLine = computed(() => {
        const link = linking.value
        if (!link) return { x1: 0, y1: 0, x2: 0, y2: 0 }
        const index = datedTasks.value.findIndex(task => task.id === link.fromTask.id)
        return {
            x1: (offset(parse(link.fromTask.end_time)) + 1) * dayWidth.value - 5,
            y1: headerHeight + index * rowHeight + 24,
            x2: link.cursorX - link.ganttRect.left - nameWidth,
            y2: link.cursorY - link.ganttRect.top
        }
    })
    async function createDependency(from, to) {
        try {
            const evaluation = evaluateDependency(dependencies.value, from.id, to.id)
            if (!evaluation.allowed) {
                const reason = evaluation.reason
                messageType.value = 'error'
                message.value = t(`gantt.dependency${reason[0].toUpperCase()}${reason.slice(1)}`)
                return
            }
            await crudAction('task_dependency', 'set_for_task', {
                taskId: to.id,
                predecessorIds: evaluation.predecessorIds
            })
            await load()
            messageType.value = 'success'
            message.value = t('gantt.dependencyCreated', { from: from.name, to: to.name })
            await applyAutoSchedule()
        } catch (error) {
            messageType.value = 'error'
            message.value = error instanceof Error ? error.message : String(error)
        }
    }
    function onLinkMove(event) {
        if (!linking.value) return
        linking.value.cursorX = event.clientX
        linking.value.cursorY = event.clientY
    }
    async function onLinkUp(event) {
        removeDocumentListener('mousemove', onLinkMove)
        removeDocumentListener('mouseup', onLinkUp)
        const link = linking.value
        linking.value = null
        if (!link) return
        const target = document.elementFromPoint(event.clientX, event.clientY)
        const bar = target?.closest?.('.task-bar')
        if (!(bar instanceof HTMLElement)) return
        const match = datedTasks.value.find(task => task.id === bar.dataset.taskId)
        if (!match || match.id === link.fromTask.id) return
        await createDependency(link.fromTask, match)
    }
    function startLink(task, event) {
        event.preventDefault()
        event.stopPropagation()
        const gantt = event.currentTarget.closest('.gantt')
        if (!gantt) return
        linking.value = {
            fromTask: task,
            cursorX: event.clientX,
            cursorY: event.clientY,
            ganttRect: gantt.getBoundingClientRect()
        }
        addDocumentListener('mousemove', onLinkMove)
        addDocumentListener('mouseup', onLinkUp)
    }
    return { linking, linkLine, startLink }
}
