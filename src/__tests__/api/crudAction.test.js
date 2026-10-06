import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import {
    canRedo,
    canUndo,
    crudAction,
    enableHistory,
    redoLastAction,
    undoLastAction
} from '../../api'

vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn()
}))

vi.mock('../../i18n', () => ({
    i18n: { global: { t: () => 'Unknown error' } }
}))

const mockedInvoke = vi.mocked(invoke)

describe('crudAction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('passes model, action, and data to the Tauri command', async () => {
        mockedInvoke.mockResolvedValue({ success: true, data: { id: 'task-1' } })

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
        mockedInvoke.mockResolvedValue({ success: true })

        await expect(crudAction('task', 'delete')).resolves.toBeNull()
    })

    it('throws the backend business error message', async () => {
        mockedInvoke.mockResolvedValue({ success: false, message: 'Task has dependencies' })

        await expect(crudAction('task', 'delete', { ids: ['task-1'] })).rejects.toThrow(
            'Task has dependencies'
        )
    })

    it('uses a localized fallback and preserves transport failures', async () => {
        mockedInvoke.mockResolvedValueOnce({ success: false })
        await expect(crudAction('task', 'update')).rejects.toThrow('Unknown error')

        const transportError = new Error('IPC unavailable')
        mockedInvoke.mockRejectedValueOnce(transportError)
        await expect(crudAction('task', 'update')).rejects.toBe(transportError)
    })

    it('keeps undo and redo entries when snapshot export fails', async () => {
        enableHistory()
        mockedInvoke
            .mockResolvedValueOnce({ success: true, data: { state: 'before' } })
            .mockResolvedValueOnce({ success: true, data: { id: 'task-1' } })
        await crudAction('task', 'update', { id: 'task-1' })
        expect(canUndo.value).toBe(true)

        mockedInvoke.mockRejectedValueOnce(new Error('export unavailable'))
        await expect(undoLastAction()).rejects.toThrow('export unavailable')
        expect(canUndo.value).toBe(true)

        mockedInvoke
            .mockResolvedValueOnce({ success: true, data: { state: 'after' } })
            .mockResolvedValueOnce({ success: true })
        await expect(undoLastAction()).resolves.toBe('task.update')
        expect(canRedo.value).toBe(true)

        mockedInvoke.mockRejectedValueOnce(new Error('export unavailable'))
        await expect(redoLastAction()).rejects.toThrow('export unavailable')
        expect(canRedo.value).toBe(true)

        mockedInvoke
            .mockResolvedValueOnce({ success: true, data: { state: 'before' } })
            .mockResolvedValueOnce({ success: true })
        await expect(redoLastAction()).resolves.toBe('task.update')
        expect(canRedo.value).toBe(false)
    })
})
