import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadAllTasks } from '../../api/taskCatalog.js'
const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api/index.js', () => ({ crudAction }))
describe('complete flat task catalogs', () => {
    beforeEach(() => crudAction.mockReset())
    it('loads descendants after the first 1000 rows without changing scope', async () => {
        const first = Array.from({ length: 1000 }, (_, n) => ({ id: `t${n}` }))
        crudAction
            .mockResolvedValueOnce({ list: first, total: 1001 })
            .mockResolvedValueOnce({ list: [{ id: 'last-child' }], total: 1001 })
        expect(await loadAllTasks({ projectId: 'p' })).toHaveLength(1001)
        expect(crudAction.mock.calls[1][2]).toEqual({
            projectId: 'p',
            hierarchy: false,
            pageIndex: 2,
            pageSize: 1000
        })
    })
    it('rejects duplicate, incomplete and concurrently changed page sets', async () => {
        for (const second of [
            { list: [{ id: 'same' }], total: 2 },
            { list: [], total: 2 },
            { list: [{ id: 'other' }], total: 3 }
        ]) {
            crudAction
                .mockReset()
                .mockResolvedValueOnce({ list: [{ id: 'same' }], total: 2 })
                .mockResolvedValueOnce(second)
            await expect(loadAllTasks()).rejects.toThrow()
        }
    })
})
