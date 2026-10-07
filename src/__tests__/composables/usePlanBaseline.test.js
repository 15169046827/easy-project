import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlanBaseline } from '../../modules/gantt/composables/usePlanBaseline.js'

const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))

function setup() {
    const context = {
        projectId: ref('p1'),
        datedTasks: ref([
            { id: 't1', name: 'Task', start_time: '2026-10-01', end_time: '2026-10-02' }
        ]),
        message: ref(''),
        messageType: ref('success'),
        t: vi.fn((key, values = { count: 0 }) => `${key}:${values.count}`)
    }
    return { ...context, ...usePlanBaseline(context) }
}

describe('plan baseline persistence', () => {
    beforeEach(() => {
        crudAction.mockReset()
    })

    it('reports success only after saving and reading the snapshot back', async () => {
        const state = setup()
        const entry = {
            task_id: 't1',
            task_name: 'Task',
            start_time: '2026-10-01',
            end_time: '2026-10-02'
        }
        crudAction.mockResolvedValueOnce({}).mockResolvedValueOnce({ list: [entry] })
        await state.saveBaseline()
        expect(crudAction.mock.calls).toEqual([
            ['plan_baseline', 'save', { project_id: 'p1', tasks: [entry] }],
            ['plan_baseline', 'get_by_project', { projectId: 'p1' }]
        ])
        expect(state.baseline.value).toEqual([entry])
        expect(state.showBaseline.value).toBe(true)
        expect(state.message.value).toBe('gantt.baselineSavedMsg:1')
        expect(state.savingBaseline.value).toBe(false)
    })

    it.each(['save', 'readback'])('does not announce success when %s fails', async stage => {
        const state = setup()
        if (stage === 'readback') crudAction.mockResolvedValueOnce({})
        crudAction.mockRejectedValueOnce(new Error('baseline unavailable'))
        await state.saveBaseline()
        expect(state.messageType.value).toBe('error')
        expect(state.message.value).toBe('baseline unavailable')
        expect(state.showBaseline.value).toBe(false)
        expect(state.savingBaseline.value).toBe(false)
    })

    it('propagates read failures to the parent load error handler', async () => {
        const state = setup()
        crudAction.mockRejectedValueOnce(new Error('read failed'))
        await expect(state.loadBaseline()).rejects.toThrow('read failed')
        expect(state.baseline.value).toEqual([])
    })

    it('preserves the displayed snapshot if clearing fails', async () => {
        const state = setup()
        state.showBaseline.value = true
        state.baseline.value = [{ task_id: 't1', task_name: 'Task', start_time: '', end_time: '' }]
        crudAction.mockRejectedValueOnce('clear failed')
        await state.clearBaseline()
        expect(state.baseline.value).toHaveLength(1)
        expect(state.showBaseline.value).toBe(true)
        expect(state.message.value).toBe('clear failed')
        expect(state.messageType.value).toBe('error')
        expect(state.savingBaseline.value).toBe(false)
    })

    it('clears a successfully removed snapshot', async () => {
        const state = setup()
        state.showBaseline.value = true
        crudAction.mockResolvedValueOnce({})
        await state.clearBaseline()
        expect(state.baseline.value).toEqual([])
        expect(state.showBaseline.value).toBe(false)
        expect(state.messageType.value).toBe('success')
    })

    it('does not apply an old project snapshot after selection changes', async () => {
        const state = setup()
        /** @type {(value: unknown) => void} */
        let finish = () => {
            throw new Error('Request did not start')
        }
        crudAction.mockImplementationOnce(
            () =>
                new Promise(resolve => {
                    finish = resolve
                })
        )
        const request = state.loadBaseline()
        state.projectId.value = 'p2'
        finish({ list: [{ task_id: 'old-task' }] })
        await request
        expect(state.baseline.value).toEqual([])
    })

    it('does not issue requests without a selected project', async () => {
        const state = setup()
        state.projectId.value = ''
        await state.loadBaseline()
        await state.saveBaseline()
        await state.clearBaseline()
        expect(crudAction).not.toHaveBeenCalled()
    })
})
