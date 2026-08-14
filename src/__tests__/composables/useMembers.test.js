import { beforeEach, describe, expect, test, vi } from 'vitest'

const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))

vi.mock('../../api', () => ({ crudAction }))

describe('useMembers', () => {
    beforeEach(() => {
        vi.resetModules()
        crudAction.mockReset()
    })

    test('shares cached members and supports an explicit refresh', async () => {
        crudAction
            .mockResolvedValueOnce({ list: [{ id: 'member-1', name: 'Alice' }] })
            .mockResolvedValueOnce({ list: [{ id: 'member-2', name: 'Bob' }] })

        const { useMembers } = await import('../../composables/useMembers')
        const firstConsumer = useMembers()
        const secondConsumer = useMembers()

        await firstConsumer.loadMembers()
        await secondConsumer.loadMembers()

        expect(crudAction).toHaveBeenCalledTimes(1)
        expect(secondConsumer.members.value).toEqual([{ id: 'member-1', name: 'Alice' }])

        await secondConsumer.loadMembers({ force: true })

        expect(crudAction).toHaveBeenCalledTimes(2)
        expect(firstConsumer.members.value).toEqual([{ id: 'member-2', name: 'Bob' }])
    })
})
