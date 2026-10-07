import { ref } from 'vue'
import { crudAction } from '../../../api'
import { countWorkingDays } from '../../calendar/utils/workCalendar.js'
import { calculateDragDelta, calculateDragUpdate } from '../utils/interaction.js'
import { useDocumentDragListeners } from './useDocumentDragListeners.js'

async function finishTaskDrag(context, state, cursorX) {
    const {
        dayWidth,
        openEditor,
        activeProject,
        format,
        message,
        messageType,
        t,
        load,
        applyAutoSchedule
    } = context
    const delta = calculateDragDelta(state.startX, cursorX, dayWidth.value)
    const update = calculateDragUpdate(state.origStart, state.origEnd, delta, state.mode)
    if (update?.kind === 'edit') {
        openEditor(state.task)
        return
    }
    if (!update) return
    try {
        await crudAction('task', 'update', {
            id: state.task.id,
            start_time: format(update.start),
            end_time: format(update.end),
            ...(state.mode === 'move'
                ? {}
                : { effort_days: countWorkingDays(update.start, update.end, activeProject.value) })
        })
        messageType.value = 'success'
        message.value = t('gantt.taskUpdated', { name: state.task.name })
        await load()
        await applyAutoSchedule()
    } catch (error) {
        messageType.value = 'error'
        message.value = error instanceof Error ? error.message : String(error)
    }
}

/** @typedef {{task: {id: string, name: string, start_time: string, end_time: string},
 * mode: string, startX: number, origStart: Date, origEnd: Date}} TaskDrag */
export function useGanttTaskDragging(context) {
    /** @type {import('vue').Ref<TaskDrag | null>} */
    const dragState = ref(null)
    const dragCursorX = ref(0)
    const { addDocumentListener, removeDocumentListener } = useDocumentDragListeners()
    const onDocMouseMove = event => {
        if (dragState.value) dragCursorX.value = event.clientX
    }
    async function onDocMouseUp() {
        removeDocumentListener('mousemove', onDocMouseMove)
        removeDocumentListener('mouseup', onDocMouseUp)
        const state = dragState.value
        dragState.value = null
        if (state) await finishTaskDrag(context, state, dragCursorX.value)
    }
    /** @param {TaskDrag['task']} task @param {MouseEvent} event */
    function onBarMouseDown(task, event, mode = 'move') {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        const start = context.parse(task.start_time)
        const end = context.parse(task.end_time)
        if (!start || !end) return
        dragState.value = {
            task,
            mode,
            startX: event.clientX,
            origStart: new Date(start),
            origEnd: new Date(end)
        }
        dragCursorX.value = event.clientX
        addDocumentListener('mousemove', onDocMouseMove)
        addDocumentListener('mouseup', onDocMouseUp)
    }
    return { dragState, dragCursorX, onBarMouseDown }
}
