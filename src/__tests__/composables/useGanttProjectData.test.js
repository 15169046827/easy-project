import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGanttProjectData } from '../../modules/gantt/composables/useGanttProjectData.js'
const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))
function setup() {
    const context = {
        projectId: ref('p1'),
        message: ref(''),
        messageType: ref('success'),
        initViewRange: vi.fn(),
        loadBaseline: vi.fn().mockResolvedValue(undefined)
    }
    return { ...context, ...useGanttProjectData(context) }
}
const snapshot = (_model, _action, query) =>
    Promise.resolve({ list: [{ id: query.projectId, member_id: query.projectId }] })
describe('Gantt project snapshot isolation', () => {
    beforeEach(() => {
        crudAction.mockReset().mockImplementation(snapshot)
    })
    it('loads the current complete snapshot before range and baseline refresh', async () => {
        const state = setup()
        expect(await state.load()).toBe(true)
        expect(state.tasks.value[0].id).toBe('p1')
        expect(state.projectMemberIds.value).toEqual(['p1'])
        expect(state.initViewRange).toHaveBeenCalledOnce()
        expect(state.loadBaseline).toHaveBeenCalledOnce()
        expect(state.loading.value).toBe(false)
    })
    it('does not commit partial data after an endpoint failure', async () => {
        const state = setup()
        crudAction.mockRejectedValueOnce(new Error('tasks unavailable'))
        expect(await state.load()).toBe(false)
        expect(state.tasks.value).toEqual([])
        expect(state.messageType.value).toBe('error')
        expect(state.message.value).toBe('tasks unavailable')
        expect(state.loadBaseline).not.toHaveBeenCalled()
    })
    it('propagates baseline readback failure through checked loading', async () => {
        const state = setup()
        state.loadBaseline.mockRejectedValueOnce(new Error('baseline unavailable'))
        await expect(state.loadChecked()).rejects.toThrow('baseline unavailable')
        expect(state.messageType.value).toBe('error')
        expect(state.loading.value).toBe(false)
    })
    it('rejects an old project response after a newer selection completes', async () => {
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
        const old = state.load()
        state.projectId.value = 'p2'
        expect(await state.load()).toBe(true)
        finish({ list: [{ id: 'old-project-task' }] })
        expect(await old).toBe(false)
        expect(state.tasks.value[0].id).toBe('p2')
        expect(state.projectMemberIds.value).toEqual(['p2'])
        expect(state.loadBaseline).toHaveBeenCalledOnce()
    })
    it('rejects a changed project even before its next reload begins', async () => {
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
        const old = state.load()
        state.projectId.value = 'p2'
        finish({ list: [{ id: 'old-project-task' }] })
        expect(await old).toBe(false)
        expect(state.tasks.value).toEqual([])
        expect(state.initViewRange).not.toHaveBeenCalled()
    })
    it('does not turn an existing success message into a checked-refresh error', async () => {
        const state = setup()
        state.projectId.value = ''
        state.message.value = 'Task updated'
        await expect(state.loadChecked()).rejects.toThrow('Project refresh was superseded')
        expect(crudAction).not.toHaveBeenCalled()
    })
})
