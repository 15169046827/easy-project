import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useGanttPresentation } from '../../modules/gantt/composables/useGanttPresentation.js'

const first = {
    id: 'first',
    name: 'First',
    parent: '',
    start_time: '2026-07-01',
    end_time: '2026-07-03',
    type: 'Task',
    status: 'Pending'
}
function setup() {
    const context = {
        tasks: ref([first, { ...first, id: 'second', parent: 'first' }]),
        parse: value => {
            const date = new Date(value)
            return Number.isNaN(date.getTime()) ? null : date
        },
        dragState: ref(null),
        dragCursorX: ref(0),
        dayWidth: ref(42),
        dayStart: date => new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        nameWidth: 280,
        offset: date => date.getDate() - 1,
        dependencies: ref([]),
        headerHeight: 62,
        rowHeight: 48,
        showCritical: ref(false),
        activeProject: ref({ calendar_country: 'US' }),
        members: ref([]),
        t: key => key
    }
    return { context, view: useGanttPresentation(context) }
}
describe('Gantt presentation boundary', () => {
    it('filters undated tasks and derives hierarchy levels', () => {
        const { context, view } = setup()
        context.tasks.value.push({ ...first, id: 'undated', start_time: '' })
        expect(view.datedTasks.value.map(task => [task.id, task.level])).toEqual([
            ['first', 0],
            ['second', 1]
        ])
    })
    it('preserves task bar and milestone geometry', () => {
        const { view } = setup()
        expect(view.barStyle(first)).toEqual({ left: '286px', width: '114px', top: '11px' })
        expect(view.barStyle({ ...first, type: 'Milestone' })).toEqual({
            left: '299px',
            top: '16px'
        })
        expect(view.fmtShortRange(first)).toBe('7/1 – 7/3')
    })
    it('updates the task preview during a move without mutating task data', () => {
        const { context, view } = setup()
        context.dragState.value = {
            task: first,
            startX: 100,
            mode: 'move',
            origStart: new Date(2026, 6, 1),
            origEnd: new Date(2026, 6, 3)
        }
        context.dragCursorX.value = 184
        expect(view.barStyle(first).left).toBe('370px')
        expect(view.fmtShortRange(first)).toBe('7/3 – 7/5')
        expect(first.start_time).toBe('2026-07-01')
    })
    it('omits dangling dependency paths and keeps row geometry', () => {
        const { context, view } = setup()
        context.dependencies.value = [
            { id: 'valid', predecessor_task_id: 'first', successor_task_id: 'second' },
            { id: 'missing', predecessor_task_id: 'first', successor_task_id: 'absent' }
        ]
        expect(view.dependencyPaths.value).toEqual([
            { id: 'valid', path: 'M 121 86 H 133 V 134 H 5', critical: false }
        ])
    })
})
