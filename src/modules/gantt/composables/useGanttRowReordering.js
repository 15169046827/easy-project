import { onBeforeUnmount } from 'vue'

// Pointer gestures avoid WebView native HTML-drag interception. Only a press on
// the dedicated internal handle can start ordering; shared sibling checks remain.
export function useGanttRowReordering({ tasks, onDragStart, onDragOver, onDrop, onDragEnd }) {
    let pointer = null
    function finish() {
        pointer = null
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', end)
        window.removeEventListener('pointercancel', finish)
        window.removeEventListener('blur', finish)
        onDragEnd()
    }
    function targetAt(event) {
        const label = document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest('.task-label')
        if (!label || !pointer.root?.contains(label)) return null
        const id = label.closest('.gantt-row')?.getAttribute('data-row-task-id')
        return tasks.value.find(task => task.id === id) || null
    }
    function beginGesture(event) {
        if (!pointer || event.pointerId !== pointer.id) return false
        if (!pointer.started) {
            if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 8) return false
            pointer.started = true
            onDragStart({}, pointer.task)
        }
        return true
    }
    function move(event) {
        if (!beginGesture(event)) return
        const target = targetAt(event)
        if (target) onDragOver(event, target)
    }
    function end(event) {
        // Coalesced native move events still require the original handle press
        // and threshold; arbitrary pointerup events cannot cause writes.
        if (!pointer || event.pointerId !== pointer.id) return
        const target = beginGesture(event) ? targetAt(event) : null
        if (target) void onDrop(target)
        finish()
    }
    function startRowDrag(event, task) {
        if (event.button !== 0 || (event.pointerType && event.pointerType !== 'mouse')) return
        finish()
        event.preventDefault()
        event.currentTarget.focus({ preventScroll: true })
        pointer = {
            id: event.pointerId,
            task,
            x: event.clientX,
            y: event.clientY,
            root: event.currentTarget.closest('.scroller-wrap'),
            started: false
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', end)
        window.addEventListener('pointercancel', finish)
        window.addEventListener('blur', finish)
    }
    onBeforeUnmount(finish)
    return { startRowDrag }
}
