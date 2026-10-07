import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGanttCreateEditor } from '../../modules/gantt/composables/useGanttCreateEditor.js'
import { useGanttEditEditor } from '../../modules/gantt/composables/useGanttEditEditor.js'

const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))

function context() {
    return {
        projectId: ref('p1'),
        activeProject: ref({ calendar_country: 'US', weekend_days: '[0,6]' }),
        message: ref(''),
        messageType: ref('success'),
        load: vi.fn().mockResolvedValue(undefined),
        applyAutoSchedule: vi.fn().mockResolvedValue(undefined),
        t: vi.fn((key, values = { name: '' }) => `${key}:${values.name}`)
    }
}
const task = {
    id: 't1',
    name: 'Task',
    start_time: '2026-11-02 00:00:00',
    end_time: '2026-11-03 00:00:00',
    effort_days: 2,
    schedule_mode: 'fixed_dates',
    progress: 50
}

describe('Gantt task editor responsibilities', () => {
    beforeEach(() => {
        crudAction.mockReset().mockResolvedValue({})
    })

    it('initializes a creation range and resets stale fields', () => {
        const state = useGanttCreateEditor(context())
        state.createForm.value.name = 'stale'
        state.openCreateEditor(new Date(2026, 10, 2), new Date(2026, 10, 3))
        expect(state.createForm.value).toMatchObject({
            name: '',
            start_time: '2026-11-02',
            end_time: '2026-11-03',
            effort_days: 2
        })
        expect(state.creatingTask.value).toBe(true)
    })

    it('requires a nonblank name without issuing a mutation', async () => {
        const state = useGanttCreateEditor(context())
        state.createForm.value.name = ' '
        await state.saveCreate()
        expect(state.createError.value).toContain('common.required')
        expect(crudAction).not.toHaveBeenCalled()
        expect(state.savingTask.value).toBe(false)
    })

    it('creates the complete payload and refreshes once', async () => {
        const ctx = context()
        const state = useGanttCreateEditor(ctx)
        state.openCreateEditor(new Date(2026, 10, 2), new Date(2026, 10, 3))
        state.createForm.value.name = ' New task '
        state.createForm.value.comment = ' note '
        await state.saveCreate()
        expect(crudAction).toHaveBeenCalledExactlyOnceWith(
            'task',
            'add',
            expect.objectContaining({
                project_id: 'p1',
                name: 'New task',
                comment: 'note',
                start_time: task.start_time,
                end_time: task.end_time
            })
        )
        expect(ctx.load).toHaveBeenCalledOnce()
        expect(state.creatingTask.value).toBe(false)
        expect(ctx.messageType.value).toBe('success')
    })

    it('keeps the creation form open after an API failure and releases its lock', async () => {
        const ctx = context()
        const state = useGanttCreateEditor(ctx)
        state.openCreateEditor(new Date(2026, 10, 2), new Date(2026, 10, 3))
        state.createForm.value.name = 'Task'
        crudAction.mockRejectedValueOnce('create failed')
        await state.saveCreate()
        expect(state.creatingTask.value).toBe(true)
        expect(state.createError.value).toBe('create failed')
        expect(state.savingTask.value).toBe(false)
        expect(ctx.load).not.toHaveBeenCalled()
    })

    it('loads an isolated editing form and preserves the original task', () => {
        const state = useGanttEditEditor(context())
        state.openEditor(task)
        state.editForm.value.name = 'Changed'
        expect(task.name).toBe('Task')
        expect(state.editForm.value.start_time).toBe('2026-11-02')
        expect(state.editForm.value.progress).toBe(50)
        state.closeEditor()
        expect(state.editingTask.value).toBeNull()
    })

    it('saves the editing payload before reload and dependency scheduling', async () => {
        const ctx = context()
        const state = useGanttEditEditor(ctx)
        state.openEditor(task)
        await state.saveEdit()
        expect(crudAction).toHaveBeenCalledExactlyOnceWith(
            'task',
            'update',
            expect.objectContaining({
                id: 't1',
                start_time: task.start_time,
                end_time: task.end_time,
                progress: 50
            })
        )
        expect(ctx.load).toHaveBeenCalledOnce()
        expect(ctx.applyAutoSchedule).toHaveBeenCalledOnce()
        expect(ctx.load.mock.invocationCallOrder[0]).toBeLessThan(
            ctx.applyAutoSchedule.mock.invocationCallOrder[0]
        )
        expect(state.editingTask.value).toBeNull()
    })

    it('preserves editing values after failure and allows retry', async () => {
        const ctx = context()
        const state = useGanttEditEditor(ctx)
        state.openEditor(task)
        crudAction.mockRejectedValueOnce(new Error('edit failed'))
        await state.saveEdit()
        expect(ctx.message.value).toBe('edit failed')
        expect(state.editingTask.value.id).toBe('t1')
        await state.saveEdit()
        expect(crudAction).toHaveBeenCalledTimes(2)
        expect(state.editingTask.value).toBeNull()
    })

    it('ignores save without an active editing task', async () => {
        const state = useGanttEditEditor(context())
        await state.saveEdit()
        expect(crudAction).not.toHaveBeenCalled()
    })

    it('prevents double submission and closing a pending creation form', async () => {
        const state = useGanttCreateEditor(context())
        state.openCreateEditor(new Date(2026, 10, 2), new Date(2026, 10, 3))
        state.createForm.value.name = 'Task'
        /** @type {(value?: unknown) => void} */
        let finish = () => {
            throw new Error('Request did not start')
        }
        crudAction.mockImplementationOnce(
            () =>
                new Promise(resolve => {
                    finish = resolve
                })
        )
        const first = state.saveCreate()
        await state.saveCreate()
        state.closeCreateEditor()
        expect(state.creatingTask.value).toBe(true)
        expect(crudAction).toHaveBeenCalledOnce()
        finish({})
        await first
        expect(state.savingTask.value).toBe(false)
    })
})
