import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { useDocumentDragListeners } from '../../modules/gantt/composables/useDocumentDragListeners.js'

function setup() {
    const target = document.implementation.createHTMLDocument()
    /** @type {{listeners?: ReturnType<typeof useDocumentDragListeners>}} */
    const state = {}
    const wrapper = mount(
        defineComponent({
            setup() {
                state.listeners = useDocumentDragListeners(target)
                return () => null
            }
        })
    )
    if (!state.listeners) throw new Error('Component setup did not initialize listeners')
    return { wrapper, target, listeners: state.listeners }
}

describe('Gantt document drag listener ownership', () => {
    it('removes all active callbacks when the component unmounts mid-drag', () => {
        const { wrapper, target, listeners } = setup()
        const move = vi.fn()
        const finish = vi.fn()
        listeners.addDocumentListener('mousemove', move)
        listeners.addDocumentListener('mouseup', finish)
        target.dispatchEvent(new MouseEvent('mousemove'))
        expect(move).toHaveBeenCalledOnce()
        wrapper.unmount()
        target.dispatchEvent(new MouseEvent('mousemove'))
        target.dispatchEvent(new MouseEvent('mouseup'))
        expect(move).toHaveBeenCalledOnce()
        expect(finish).not.toHaveBeenCalled()
    })

    it('supports normal mouseup cleanup and idempotent full cleanup', () => {
        const { wrapper, target, listeners } = setup()
        const finish = vi.fn()
        listeners.addDocumentListener('mouseup', finish)
        listeners.removeDocumentListener('mouseup', finish)
        listeners.clearDocumentListeners()
        listeners.clearDocumentListeners()
        target.dispatchEvent(new MouseEvent('mouseup'))
        expect(finish).not.toHaveBeenCalled()
        wrapper.unmount()
    })

    it('preserves independent drag handlers and avoids duplicate registration', () => {
        const { wrapper, target, listeners } = setup()
        const first = vi.fn()
        const second = vi.fn()
        listeners.addDocumentListener('mousemove', first)
        listeners.addDocumentListener('mousemove', first)
        listeners.addDocumentListener('mousemove', second)
        listeners.removeDocumentListener('mousemove', first)
        target.dispatchEvent(new MouseEvent('mousemove'))
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledOnce()
        wrapper.unmount()
    })
})
