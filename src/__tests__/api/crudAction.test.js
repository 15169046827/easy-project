import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { crudAction } from '../../api'

vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn()
}))

vi.mock('../../i18n', () => ({
    i18n: { global: { t: () => 'Unknown error' } }
}))

describe('crudAction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('passes model, action, and data to the Tauri command', async () => {
        invoke.mockResolvedValue({ success: true, data: { id: 'task-1' } })

        await expect(crudAction('task', 'get', { id: 'task-1' })).resolves.toEqual({
            id: 'task-1'
        })
        expect(invoke).toHaveBeenCalledWith('crud_action', {
            model: 'task',
            action: 'get',
            data: { id: 'task-1' }
        })
    })

    it('normalizes successful responses without data to null', async () => {
        invoke.mockResolvedValue({ success: true })

        await expect(crudAction('task', 'delete')).resolves.toBeNull()
    })

    it('throws the backend business error message', async () => {
        invoke.mockResolvedValue({ success: false, message: 'Task has dependencies' })

        await expect(crudAction('task', 'delete', { ids: ['task-1'] })).rejects.toThrow(
            'Task has dependencies'
        )
    })

    it('uses a localized fallback and preserves transport failures', async () => {
        invoke.mockResolvedValueOnce({ success: false })
        await expect(crudAction('task', 'update')).rejects.toThrow('Unknown error')

        const transportError = new Error('IPC unavailable')
        invoke.mockRejectedValueOnce(transportError)
        await expect(crudAction('task', 'update')).rejects.toBe(transportError)
    })
})
