import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useGanttRowReordering } from '../../modules/gantt/composables/useGanttRowReordering.js'

describe('Gantt pointer ordering boundary', () => {
    let wrapper, start, context, point, original
    const source = { id: 'source' }
    const target = { id: 'target' }
    function event(type, values = {}) {
        const value = new Event(type)
        Object.assign(value, { pointerId: 1, clientX: 20, clientY: 0, ...values })
        window.dispatchEvent(value)
    }
    function press() {
        start(
            {
                button: 0,
                pointerType: 'mouse',
                pointerId: 1,
                clientX: 0,
                clientY: 0,
                currentTarget: wrapper.find('button').element,
                preventDefault: vi.fn()
            },
            source
        )
    }
    beforeEach(() => {
        context = {
            tasks: ref([source, target]),
            onDragStart: vi.fn(),
            onDragOver: vi.fn(),
            onDrop: vi.fn(),
            onDragEnd: vi.fn()
        }
        wrapper = mount(
            defineComponent({
                setup() {
                    start = useGanttRowReordering(context).startRowDrag
                    return () =>
                        h('section', { class: 'scroller-wrap' }, [
                            h('button'),
                            h('div', { class: 'gantt-row', 'data-row-task-id': 'target' }, [
                                h('div', { class: 'task-label' })
                            ])
                        ])
                }
            })
        )
        original = document.elementFromPoint
        point = vi.fn(() => wrapper.find('.task-label').element)
        document.elementFromPoint = point
    })
    afterEach(() => {
        wrapper?.unmount()
        document.elementFromPoint = original
    })
    it('handles a coalesced native gesture with no intermediate move', () => {
        press()
        event('pointerup')
        expect(context.onDragStart).toHaveBeenCalledWith({}, source)
        expect(context.onDrop).toHaveBeenCalledWith(target)
    })
    it('rejects stray release and sub-threshold movement', () => {
        event('pointerup')
        press()
        event('pointerup', { clientX: 3 })
        expect(context.onDrop).not.toHaveBeenCalled()
    })
    it('rejects another pointer and drops outside the originating chart', () => {
        press()
        event('pointerup', { pointerId: 2 })
        point.mockReturnValue(document.createElement('div'))
        event('pointerup')
        expect(context.onDrop).not.toHaveBeenCalled()
    })
    it('cancels on blur and removes listeners on unmount', () => {
        press()
        window.dispatchEvent(new Event('blur'))
        event('pointerup')
        press()
        wrapper.unmount()
        wrapper = null
        event('pointerup')
        expect(context.onDrop).not.toHaveBeenCalled()
    })
})
