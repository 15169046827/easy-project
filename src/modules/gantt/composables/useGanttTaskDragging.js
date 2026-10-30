import { onBeforeUnmount, ref } from 'vue'
import { crudAction } from '../../../api'
import { countWorkingDays } from '../../calendar/utils/workCalendar.js'
import { calculateDragDelta, calculateDragUpdate } from '../utils/interaction.js'
import { useDocumentDragListeners } from './useDocumentDragListeners.js'
import { useGanttEdgeScrolling } from './useGanttEdgeScrolling.js'
import { isDragGesture } from '../utils/dragCoordinates.js'

async function finishTaskDrag(context, state, cursorX) {
    const { dayWidth, activeProject, format, message, messageType, t, load, applyAutoSchedule } =
        context
    const delta = calculateDragDelta(state.startX, cursorX, dayWidth.value)
    const update = calculateDragUpdate(state.origStart, state.origEnd, delta, state.mode)
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

/** @typedef {{task: {id: string, name: string, start_time: string, end_time: string, summary?: {has_children?: boolean}},
 * mode: string, startX: number, startClientX: number, startClientY: number,
 * active: boolean, origStart: Date, origEnd: Date}} TaskDrag */
export function useGanttTaskDragging(context) {
    /** @type {import('vue').Ref<TaskDrag | null>} */
    const dragState = ref(null)
    const dragCursorX = ref(0)
    const { addDocumentListener, removeDocumentListener } = useDocumentDragListeners()
    let suppressEditUntil = 0
    const edge = useGanttEdgeScrolling({
        scroller: context.scroller,
        viewRange: context.viewRange,
        dayWidth: context.dayWidth,
        nameWidth: context.nameWidth,
        headerHeight: context.headerHeight,
        onScroll: x => {
            if (dragState.value) dragCursorX.value = edge.position(x)
        },
        onCancel: cancelDrag
    })
    function cancelDrag() {
        removeDocumentListener('mousemove', onDocMouseMove)
        removeDocumentListener('mouseup', onDocMouseUp)
        if (dragState.value?.active) suppressEditUntil = performance.now() + 650
        dragState.value = null
        edge.stop()
    }
    const onDocMouseMove = event => {
        const state = dragState.value
        if (!state) return
        state.active ||= isDragGesture(state, event)
        dragCursorX.value = edge.position(event.clientX)
        edge.update(event, state.active)
    }
    async function onDocMouseUp(event) {
        if (event.button !== 0) return
        onDocMouseMove(event)
        const state = dragState.value
        cancelDrag()
        if (state?.active) await finishTaskDrag(context, state, dragCursorX.value)
    }
    /** @param {TaskDrag['task']} task @param {MouseEvent} event */
    function onBarMouseDown(task, event, mode = 'move') {
        if (event.button !== 0) return
        event.preventDefault()
        event.stopPropagation()
        if (task.summary?.has_children) return
        cancelDrag()
        const start = context.parse(task.start_time)
        const end = context.parse(task.end_time)
        if (!start || !end) return
        dragState.value = {
            task,
            mode,
            startX: edge.position(event.clientX),
            startClientX: event.clientX,
            startClientY: event.clientY,
            active: false,
            origStart: new Date(start),
            origEnd: new Date(end)
        }
        dragCursorX.value = dragState.value.startX
        edge.start(event)
        addDocumentListener('mousemove', onDocMouseMove)
        addDocumentListener('mouseup', onDocMouseUp)
    }
    function onBarEdit(task, event) {
        if (dragState.value || event?.target?.closest?.('.resize-handle, .link-handle')) return
        if (event?.type !== 'keydown' && performance.now() < suppressEditUntil) return
        context.openEditor(task)
    }
    onBeforeUnmount(cancelDrag)
    return { dragState, dragCursorX, onBarMouseDown, onBarEdit }
}
