import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTaskListQuery } from '../../modules/task/composables/useTaskListQuery.js'

const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))
const task = id => ({ id, name: id, project_id: 'p1', parent: '', sort_order: 1 })

describe('task query state ownership', () => {
    beforeEach(() => {
        crudAction.mockReset()
    })
    it('queries a project with complete dependency decoration', async () => {
        crudAction
            .mockResolvedValueOnce({ list: [task('a')], total: 1 })
            .mockResolvedValueOnce({ list: [{ successor_task_id: 'a', predecessor_task_id: 'b' }] })
        const state = useTaskListQuery('p1')
        expect(await state.init()).toBe(true)
        expect(state.tasks.value[0]._predecessorIds).toEqual(['b'])
        expect(crudAction.mock.calls[0][2]).toMatchObject({
            pageIndex: 1,
            pageSize: 1000,
            projectId: 'p1'
        })
        expect(state.totalRecords.value).toBe(1)
        expect(state.loading.value).toBe(false)
    })
    it('does not request project dependencies on the global paginated page', async () => {
        crudAction.mockResolvedValueOnce({ list: [task('a')], total: 1 })
        const state = useTaskListQuery()
        state.pageOption.pageIndex = 3
        state.sortBy.value = 'update_time'
        await state.init()
        expect(crudAction).toHaveBeenCalledOnce()
        expect(crudAction.mock.calls[0][2]).toMatchObject({
            pageIndex: 3,
            pageSize: 20,
            projectId: '',
            sortDirection: 'desc'
        })
    })
    it('returns an explicit failure and prevents checked reload from reporting success', async () => {
        const state = useTaskListQuery()
        crudAction
            .mockRejectedValueOnce('query failed')
            .mockRejectedValueOnce(new Error('query failed'))
        expect(await state.init()).toBe(false)
        await expect(state.initChecked()).rejects.toThrow('query failed')
        expect(state.errorMessage.value).toBe('query failed')
        expect(state.loading.value).toBe(false)
    })
    it('rejects partial data when dependency loading fails', async () => {
        const state = useTaskListQuery('p1')
        crudAction
            .mockResolvedValueOnce({ list: [task('a')], total: 1 })
            .mockRejectedValueOnce(new Error('relations failed'))
        expect(await state.init()).toBe(false)
        expect(state.tasks.value).toEqual([])
        expect(state.errorMessage.value).toBe('relations failed')
    })
    it('keeps the newest response when older requests finish later', async () => {
        const state = useTaskListQuery()
        /** @type {(value: unknown) => void} */
        let finish = () => {
            throw new Error('Request did not start')
        }
        crudAction
            .mockImplementationOnce(
                () =>
                    new Promise(resolve => {
                        finish = resolve
                    })
            )
            .mockResolvedValueOnce({ list: [task('new')], total: 1 })
        const oldRequest = state.init()
        await state.init()
        finish({ list: [task('old')], total: 99 })
        expect(await oldRequest).toBe(false)
        expect(state.tasks.value[0].id).toBe('new')
        expect(state.totalRecords.value).toBe(1)
    })
    it('does not commit data for a project changed during loading', async () => {
        const state = useTaskListQuery()
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
        const request = state.init()
        state.selectedProjectId.value = 'p2'
        finish({ list: [task('old')], total: 1 })
        expect(await request).toBe(false)
        expect(state.tasks.value).toEqual([])
    })
    it('trims search and clears selection while resetting the page', async () => {
        crudAction.mockResolvedValue({ list: [], total: 0 })
        const state = useTaskListQuery()
        state.keywordInput.value = '  name  '
        state.pageOption.pageIndex = 5
        state.selectedTasks.value = [task('a')]
        await state.applySearch()
        expect(state.appliedKeyword.value).toBe('name')
        expect(state.selectedTasks.value).toEqual([])
        expect(state.pageOption.pageIndex).toBe(1)
        await state.clearFilters()
        expect(state.appliedKeyword.value).toBe('')
        expect(state.sortBy.value).toBe('sort_order')
    })
})
