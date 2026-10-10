import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FloatingTaskWindow from '../../modules/floating/FloatingTaskWindow.vue'
import { i18n } from '../../i18n'
import PrimeVue from 'primevue/config'
import {
    activeFloatingTasks,
    nearbyFloatingTasks,
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
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            }))
        )
        vi.clearAllMocks()
        localStorage.removeItem('easyproject-floating-task')
        mocks.resize.mockResolvedValue(undefined)
        mocks.crud.mockImplementation(async model => ({
            list: model === 'task' ? tasks : [{ id: 'p1', name: 'Alpha' }]
        }))
    })
    it('shows the nearest five dated unfinished tasks, including overdue tasks', () => {
        const active = activeFloatingTasks(tasks)
        expect(active.map(item => item.id)).toEqual(['early', 'late'])
        expect(
            nearbyFloatingTasks([...tasks, { id: 'undated', name: 'Undated' }]).map(task => task.id)
        ).toEqual(['early', 'late'])
        expect(
            nearbyFloatingTasks(
                Array.from({ length: 8 }, (_, i) => ({
                    id: i,
                    name: String(i),
                    end_time: `2026-10-${10 + i}`
                }))
            )
        ).toHaveLength(5)
        expect(nearbyFloatingTasks([])).toEqual([])
        expect(taskProgress({ progress: 200 })).toBe(100)
        expect(taskProgress({ progress: 'bad' })).toBe(0)
    })
    it('lists tasks and opens their project without selecting or changing business data', async () => {
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n, PrimeVue] } })
        await flushPromises()
        expect(wrapper.findAll('h2').map(node => node.text())).toEqual(['Early task', 'Late task'])
        expect(wrapper.find('[role="combobox"]').exists()).toBe(false)
        await wrapper.get('.floating-project').trigger('click')
        expect(mocks.main).toHaveBeenCalledWith('p1')
        expect(mocks.crud.mock.calls.every(([, action]) => action === 'get_all')).toBe(true)
        wrapper.unmount()
    })
    it('distinguishes loading, failure and empty results', async () => {
        mocks.crud.mockRejectedValue(new Error('Database unavailable'))
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n, PrimeVue] } })
        expect(wrapper.find('[role="status"]').exists()).toBe(true)
        await flushPromises()
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
        expect(wrapper.get('[role="alert"]').text()).toContain('Database unavailable')
        mocks.crud.mockResolvedValue({ list: [] })
        await wrapper.findAll('footer button')[1].trigger('click')
        await flushPromises()
        expect(wrapper.find('[role="alert"]').exists()).toBe(false)
        expect(wrapper.find('h2').exists()).toBe(false)
        wrapper.unmount()
    })
    it('loads Todo tasks from later pages and supports collapse and expand', async () => {
        mocks.crud.mockImplementation(async (model, _action, query) => {
            if (model === 'project') return { list: [], totalPage: 1 }
            return query.pageIndex === 1
                ? { list: [{ id: 'done', status: 'Done' }], totalPage: 2 }
                : {
                      list: [
                          { id: 'todo', name: 'Todo task', status: 'Todo', end_time: '2026-10-12' }
                      ],
                      totalPage: 2
                  }
        })
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n, PrimeVue] } })
        await flushPromises()
        expect(wrapper.get('h2').text()).toBe('Todo task')
        expect(wrapper.find('select, progress').exists()).toBe(false)
        await wrapper.get('button[aria-expanded]').trigger('click')
        await flushPromises()
        expect(mocks.resize).toHaveBeenLastCalledWith(false)
        expect(wrapper.find('.floating-content').exists()).toBe(false)
        await wrapper.get('button[aria-expanded]').trigger('click')
        await flushPromises()
        expect(mocks.resize).toHaveBeenLastCalledWith(true)
        expect(wrapper.get('h2').text()).toBe('Todo task')
        wrapper.unmount()
    })
    it('shows native resize failures without losing the expanded state', async () => {
        mocks.resize.mockRejectedValueOnce(new Error('Resize refused'))
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n, PrimeVue] } })
        await flushPromises()
        await wrapper.get('button[aria-expanded]').trigger('click')
        await flushPromises()
        expect(wrapper.classes()).toContain('expanded')
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
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n, PrimeVue] } })
        await flushPromises()
        mocks.crud.mockImplementation(async model => ({ list: model === 'task' ? tasks : [] }))
        window.dispatchEvent(new Event('focus'))
        await flushPromises()
        resolveOld({ list: [] })
        await flushPromises()
        expect(wrapper.text()).toContain('Early task')
        wrapper.unmount()
    })
    it('keeps task nodes visible during background refresh without resizing or focusing windows', async () => {
        const wrapper = mount(FloatingTaskWindow, { global: { plugins: [i18n, PrimeVue] } })
        await flushPromises()
        const first = wrapper.get('.floating-task').element
        /** @type {(result: any) => void} */
        let resolveTasks = _result => {
            throw new Error('Pending refresh was not captured')
        }
        mocks.crud.mockImplementation(model =>
            model === 'task'
                ? new Promise(resolve => {
                      resolveTasks = resolve
                  })
                : Promise.resolve({ list: [{ id: 'p1', name: 'Alpha' }] })
        )
        await wrapper.findAll('footer button')[1].trigger('click')
        expect(wrapper.find('[role="status"]').exists()).toBe(false)
        expect(wrapper.get('.floating-task').element).toBe(first)
        resolveTasks({ list: tasks })
        await flushPromises()
        expect(wrapper.get('.floating-task').element).toBe(first)
        expect(mocks.resize).not.toHaveBeenCalled()
        expect(mocks.main).not.toHaveBeenCalled()
        expect(mocks.top).not.toHaveBeenCalled()
        wrapper.unmount()
    })
})
