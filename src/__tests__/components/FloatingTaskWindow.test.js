import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FloatingTaskWindow from '../../modules/floating/FloatingTaskWindow.vue'
import { i18n } from '../../i18n'
import {
    activeFloatingTasks,
    chooseFloatingTask,
    taskProgress
} from '../../modules/floating/taskSelection'

const mocks = vi.hoisted(() => ({ crud: vi.fn(), resize: vi.fn(), top: vi.fn(), main: vi.fn() }))
vi.mock('../../api', () => ({ crudAction: mocks.crud }))
vi.mock('../../modules/floating/windowActions', () => ({
    isFloatingNative: () => true,
    closeFloatingWindow: vi.fn(),
    resizeFloatingWindow: mocks.resize,
    returnToMain: mocks.main,
    setFloatingOnTop: mocks.top
}))
vi.mock('../../composables/useTheme', () => ({ useTheme: vi.fn() }))

const tasks = [
    {
        id: 'late',
        name: 'Late task',
        end_time: '2026-10-10',
        status: 'InProgress',
        project_id: 'p1',
        progress: 25
    },
    {
        id: 'early',
        name: 'Early task',
        end_time: '2026-10-09',
        status: 'Draft',
        project_id: 'p1',
        progress: 50
    },
    { id: 'done', name: 'Finished', status: 'Done' }
]
describe('task floating window', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.removeItem('easyproject-floating-task')
        mocks.resize.mockResolvedValue(undefined)
        mocks.crud.mockImplementation(async model => ({
            list: model === 'task' ? tasks : [{ id: 'p1', name: 'Alpha' }]
        }))
    })
    it('selects unfinished tasks by due date and retains a valid preference', () => {
        const active = activeFloatingTasks(tasks)
        expect(active.map(item => item.id)).toEqual(['early', 'late'])
        expect(chooseFloatingTask(active, 'late').id).toBe('late')
        expect(chooseFloatingTask(active, 'deleted').id).toBe('early')
        expect(chooseFloatingTask([], '')).toBeNull()
        expect(taskProgress({ progress: 200 })).toBe(100)
        expect(taskProgress({ progress: 'bad' })).toBe(0)
    })
    it('expands, switches task, and opens its project without changing business data', async () => {
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n] } })
        await flushPromises()
        await wrapper.get('button[aria-expanded]').trigger('click')
        await flushPromises()
        expect(mocks.resize).toHaveBeenCalledWith(true)
        expect(wrapper.get('h2').text()).toBe('Early task')
        await wrapper.get('select').setValue('late')
        expect(wrapper.get('h2').text()).toBe('Late task')
        expect(localStorage.getItem('easyproject-floating-task')).toBe('late')
        await wrapper.findAll('footer button')[2].trigger('click')
        expect(mocks.main).toHaveBeenCalledWith('p1')
        expect(mocks.crud.mock.calls.every(([, action]) => action === 'get_all')).toBe(true)
        wrapper.unmount()
    })
    it('shows native resize failures without losing the collapsed state', async () => {
        mocks.resize.mockRejectedValueOnce(new Error('Resize refused'))
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n] } })
        await flushPromises()
        await wrapper.get('button[aria-expanded]').trigger('click')
        await flushPromises()
        expect(wrapper.classes()).not.toContain('expanded')
        expect(wrapper.find('[role="alert"]').exists()).toBe(true)
        wrapper.unmount()
    })
    it('rejects stale data after a newer refresh', async () => {
        /** @type {(result: any) => void} */
        let resolveOld = _result => {
            throw new Error('Pending request was not captured')
        }
        mocks.crud.mockImplementation(async model => {
            if (model === 'project') return { list: [] }
            return new Promise(resolve => {
                resolveOld = resolve
            })
        })
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n] } })
        await flushPromises()
        mocks.crud.mockImplementation(async model => ({ list: model === 'task' ? tasks : [] }))
        window.dispatchEvent(new Event('focus'))
        await flushPromises()
        resolveOld({ list: [] })
        await flushPromises()
        expect(wrapper.text()).toContain('Early task')
        wrapper.unmount()
    })
})
