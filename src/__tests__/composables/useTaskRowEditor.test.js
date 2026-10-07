import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTaskRowEditor } from '../../modules/task/composables/useTaskRowEditor.js'
const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))
const row = () => ({ id: 'NEWTASK:1', name: 'Task', project_id: 'p1', _predecessorIds: ['parent'] })
function setup() {
    const context = {
        tasks: ref([row()]),
        errorMessage: ref(''),
        successMessage: ref('stale success'),
        initChecked: vi.fn().mockResolvedValue(undefined),
        applyAutoSchedule: vi.fn().mockResolvedValue({ updates: [], conflicts: [] }),
        loadTeamMemberIds: vi.fn().mockResolvedValue(undefined),
        t: vi.fn((key, values = {}) => key + JSON.stringify(values))
    }
    return { ...context, ...useTaskRowEditor(context) }
}
describe('task row save recovery', () => {
    beforeEach(() => {
        crudAction.mockReset()
    })
    it('adopts a created task ID before a dependency failure and retries without another add', async () => {
        const state = setup()
        const newData = row()
        await state.onRowEditInit({ data: newData })
        crudAction
            .mockResolvedValueOnce({ id: 'real-task' })
            .mockRejectedValueOnce(new Error('dependency failed'))
        await state.onRowEditSave({ newData })
        expect(newData.id).toBe('real-task')
        expect(state.tasks.value[0].id).toBe('real-task')
        expect(state.activeEditingId.value).toBe('real-task')
        expect(state.errorMessage.value).toContain('tasks.createdButIncomplete')
        expect(state.successMessage.value).toBe('')
        crudAction.mockResolvedValueOnce({})
        await state.onRowEditSave({ newData })
        expect(crudAction.mock.calls.filter(([, action]) => action === 'add')).toHaveLength(1)
        expect(
            crudAction.mock.calls.filter(([, action]) => action === 'set_for_task')
        ).toHaveLength(2)
        expect(state.activeEditingId.value).toBe('')
    })
    it('keeps the temporary identity when creation itself fails', async () => {
        const state = setup()
        const newData = row()
        crudAction.mockRejectedValueOnce(new Error('create failed'))
        await state.onRowEditSave({ newData })
        expect(newData.id).toBe('NEWTASK:1')
        expect(state.errorMessage.value).toBe('create failed')
    })
    it('does not announce save success after a query refresh failure', async () => {
        const state = setup()
        const newData = { ...row(), id: 'real-task' }
        await state.onRowEditInit({ data: newData })
        state.initChecked.mockRejectedValueOnce(new Error('query failed'))
        await state.onRowEditSave({ newData })
        expect(state.successMessage.value).toBe('')
        expect(state.errorMessage.value).toBe('query failed')
        expect(state.applyAutoSchedule).not.toHaveBeenCalled()
    })
    it.each([
        { ...row(), name: ' ' },
        { ...row(), project_id: '' }
    ])('validates required row fields before saving', async newData => {
        const state = setup()
        await state.onRowEditSave({ newData })
        expect(crudAction).not.toHaveBeenCalled()
        expect(state.editingRows.value).toEqual([newData])
    })
    it('cancels only temporary rows and retains already persisted tasks', () => {
        const state = setup()
        state.onRowEditCancel({ newData: row() })
        expect(state.tasks.value).toEqual([])
        const persisted = { ...row(), id: 'real-task' }
        state.tasks.value = [persisted]
        state.onRowEditCancel({ newData: persisted })
        expect(state.tasks.value).toEqual([persisted])
    })
    it('surfaces team loading failure without an unhandled rejection', async () => {
        const state = setup()
        state.loadTeamMemberIds.mockRejectedValueOnce(new Error('team failed'))
        await state.onRowEditInit({ data: row() })
        expect(state.errorMessage.value).toBe('team failed')
        expect(state.activeEditingId.value).toBe('')
    })
})
