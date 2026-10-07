import { onBeforeUnmount } from 'vue'

/** @param {Document} target */
export function useDocumentDragListeners(target = document) {
    /** @type {Map<'mousemove' | 'mouseup', Set<(event: MouseEvent) => unknown>>} */
    const listeners = new Map()

    /** @param {'mousemove' | 'mouseup'} type @param {(event: MouseEvent) => unknown} handler */
    function addDocumentListener(type, handler) {
        if (!listeners.has(type)) listeners.set(type, new Set())
        listeners.get(type).add(handler)
        target.addEventListener(type, handler)
    }

    /** @param {'mousemove' | 'mouseup'} type @param {(event: MouseEvent) => unknown} handler */
    function removeDocumentListener(type, handler) {
        listeners.get(type)?.delete(handler)
        target.removeEventListener(type, handler)
    }

    function clearDocumentListeners() {
        for (const [type, handlers] of listeners) {
            for (const handler of handlers) target.removeEventListener(type, handler)
        }
        listeners.clear()
    }

    onBeforeUnmount(clearDocumentListeners)
    return { addDocumentListener, removeDocumentListener, clearDocumentListeners }
}
