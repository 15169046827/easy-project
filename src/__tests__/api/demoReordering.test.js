import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('demo task reordering parity', () => {
    beforeEach(() => vi.resetModules())

    it('exchanges sibling orders with the same atomic action as the native backend', async () => {
        const { demoAction } = await import('../../api/demo.js')
        await demoAction('task', 'swap_order', { source_id: 'demo-1', target_id: 'demo-2' })
        const { list } = await demoAction('task', 'get_all')
        expect(list.find(task => task.id === 'demo-1').sort_order).toBe(2)
        expect(list.find(task => task.id === 'demo-2').sort_order).toBe(1)
    })

    it('does not modify either task for invalid pairs', async () => {
        const { demoAction } = await import('../../api/demo.js')
        await demoAction('task', 'update', { id: 'demo-2', project_id: 'other-project' })
        const before = await demoAction('task', 'get_all')
        for (const target of ['demo-1', 'demo-2', 'missing']) {
            await expect(
                demoAction('task', 'swap_order', {
                    source_id: 'demo-1',
                    target_id: target
                })
            ).rejects.toThrow('Only sibling tasks')
        }
        expect(await demoAction('task', 'get_all')).toEqual(before)
    })
})
