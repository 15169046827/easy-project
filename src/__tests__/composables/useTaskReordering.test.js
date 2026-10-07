import { ref } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTaskReordering } from '../../modules/task/composables/useTaskReordering.js'

const { crudAction } = vi.hoisted(() => ({ crudAction: vi.fn() }))
vi.mock('../../api', () => ({ crudAction }))

const task = (id, order, project = 'p1', parent = '') => ({
    id,
    name: id,
    sort_order: order,
    project_id: project,
    parent
})
const event = () => /** @type {DragEvent} */ (new Event('dragstart'))

function setup() {
    const context = {
        tasks: ref([task('source', 1), task('target', 2)]),
        reload: vi.fn().mockResolvedValue(undefined),
        loading: ref(false),
        errorMessage: ref(''),
        successMessage: ref('old success'),
        t: vi.fn((key, values = { name: '' }) => `${key}:${values.name}`)
    }
    return { ...context, ...useTaskReordering(context) }
}

describe('task reordering boundaries', () => {
    beforeEach(() => {
        crudAction.mockReset().mockResolvedValue(undefined)
    })

    it.each([
        ['same task', task('source', 1)],
        ['different project', task('target', 2, 'p2')],
        ['different parent', task('target', 2, 'p1', 'parent')]
    ])('rejects %s in both hover and direct drop', async (_label, target) => {
        const reorder = setup()
        reorder.onDragStart(event(), task('source', 1))
        reorder.onDragOver(event(), target)
        expect(reorder.dragOverId.value).toBeNull()
        await reorder.onDrop(target)
        expect(crudAction).not.toHaveBeenCalled()
        expect(reorder.reload).not.toHaveBeenCalled()
        expect(reorder.loading.value).toBe(false)
    })

    it('ignores external drops without a source', async () => {
        const reorder = setup()
        await reorder.onDrop(task('target', 2))
        expect(crudAction).not.toHaveBeenCalled()
    })

    it('swaps only same-project siblings and refreshes before success', async () => {
        const reorder = setup()
        reorder.onDragStart(event(), task('source', 1))
        reorder.onDragOver(event(), task('target', 2))
        expect(reorder.dragOverId.value).toBe('target')
        await reorder.onDrop(task('target', 2))
        expect(crudAction.mock.calls).toEqual([
            ['task', 'swap_order', { source_id: 'source', target_id: 'target' }]
        ])
        expect(reorder.reload).toHaveBeenCalledOnce()
        expect(reorder.successMessage.value).toBe('tasks.reordered:source')
        expect(reorder.loading.value).toBe(false)
        await reorder.onDrop(task('third', 3))
        expect(crudAction).toHaveBeenCalledTimes(1)
    })

    it.each([new Error('failed'), 'failed'])(
        'clears stale success on failure %s',
        async failure => {
            crudAction.mockRejectedValueOnce(failure)
            const reorder = setup()
            reorder.onDragStart(event(), task('source', 1))
            await reorder.onDrop(task('target', 2))
            expect(reorder.errorMessage.value).toBe('failed')
            expect(reorder.successMessage.value).toBe('')
            expect(reorder.loading.value).toBe(false)
            expect(reorder.reload).not.toHaveBeenCalled()
        }
    )

    it('does not report success if refresh fails', async () => {
        const reorder = setup()
        reorder.reload.mockRejectedValueOnce(new Error('refresh failed'))
        reorder.onDragStart(event(), task('source', 1))
        await reorder.onDrop(task('target', 2))
        expect(reorder.errorMessage.value).toBe('refresh failed')
        expect(reorder.successMessage.value).toBe('')
    })

    it('rejects concurrent drops and new drags while writes are pending', async () => {
        /** @type {Array<() => void>} */
        const finish = []
        crudAction.mockImplementation(
            () =>
                new Promise(resolve => {
                    finish.push(() => resolve(undefined))
                })
        )
        const reorder = setup()
        reorder.onDragStart(event(), task('source', 1))
        const first = reorder.onDrop(task('target', 2))
        await reorder.onDrop(task('third', 3))
        reorder.onDragStart(event(), task('third', 3))
        expect(crudAction).toHaveBeenCalledTimes(1)
        reorder.onDragEnd()
        finish.forEach(resolve => resolve())
        await first
        expect(reorder.loading.value).toBe(false)
        expect(reorder.successMessage.value).toBe('tasks.reordered:source')
    })

    it('clears hover and drag state on leave/end and supports absent dataTransfer', async () => {
        const reorder = setup()
        reorder.onDragStart(event(), task('source', 1))
        reorder.onDragOver(event(), task('target', 2))
        reorder.onDragLeave(task('other', 3))
        expect(reorder.dragOverId.value).toBe('target')
        reorder.onDragLeave(task('target', 2))
        expect(reorder.dragOverId.value).toBeNull()
        reorder.onDragEnd()
        await reorder.onDrop(task('target', 2))
        expect(crudAction).not.toHaveBeenCalled()
    })

    it('uses the same atomic action for keyboard/button moves and rejects list boundaries', async () => {
        const reorder = setup()
        expect(reorder.canMove(task('source', 1), -1)).toBe(false)
        await reorder.moveTask(task('source', 1), -1)
        expect(crudAction).not.toHaveBeenCalled()
        expect(reorder.canMove(task('source', 1), 1)).toBe(true)
        await reorder.moveTask(task('source', 1), 1)
        expect(crudAction).toHaveBeenCalledExactlyOnceWith('task', 'swap_order', {
            source_id: 'source',
            target_id: 'target'
        })
        expect(reorder.successMessage.value).toBe('tasks.orderSaved:')
    })
})
