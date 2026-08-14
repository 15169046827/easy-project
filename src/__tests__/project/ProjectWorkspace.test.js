import { computed, ref } from 'vue'
import { flushPromises, shallowMount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProjectWorkspace from '../../modules/project/components/ProjectWorkspace.vue'
import { crudAction } from '../../api'

const push = vi.fn()
const loadMembers = vi.fn(() => Promise.resolve())

vi.mock('vue-router', () => ({
    useRouter: () => ({ push })
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: key => key })
}))

vi.mock('../../api', () => ({
    crudAction: vi.fn()
}))

vi.mock('../../composables/useMembers', () => ({
    useMembers: () => ({
        members: ref([]),
        memberMap: computed(() => ({})),
        loadMembers
    })
}))

vi.mock('../../composables/useStatusLabels', () => ({
    useStatusLabels: () => ({ projectStatusLabel: status => status })
}))

function mountWorkspace(projectId = 'project-1') {
    return shallowMount(ProjectWorkspace, {
        props: { projectId },
        global: {
            mocks: { $t: key => key }
        }
    })
}

describe('ProjectWorkspace', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        crudAction.mockImplementation(model => {
            if (model === 'project') {
                return Promise.resolve({
                    list: [
                        { id: 'project-1', name: 'Alpha', status: 'InProgress' },
                        { id: 'project-2', name: 'Beta', status: 'Draft' }
                    ]
                })
            }
            if (model === 'task') return Promise.resolve({ list: [] })
            return Promise.resolve(null)
        })
    })

    it("loads only the selected project's tasks and opens in task view", async () => {
        const wrapper = mountWorkspace()
        await flushPromises()

        expect(crudAction).toHaveBeenCalledWith('task', 'get_all', {
            projectId: 'project-1',
            pageSize: 1000
        })
        expect(wrapper.text()).toContain('Alpha')

        const taskList = wrapper.findComponent({ name: 'TaskList' })
        expect(taskList.exists()).toBe(true)
        expect(taskList.props('initialProjectId')).toBe('project-1')
        expect(taskList.props('embedded')).toBe(true)
    })

    it('switches between task and Gantt views without losing project context', async () => {
        const wrapper = mountWorkspace()
        await flushPromises()

        await wrapper.findAll('.view-switch button')[1].trigger('click')
        const gantt = wrapper.findComponent({ name: 'GanttView' })

        expect(gantt.exists()).toBe(true)
        expect(gantt.props('initialProjectId')).toBe('project-1')
        expect(gantt.props('embedded')).toBe(true)
        expect(wrapper.findComponent({ name: 'TaskList' }).exists()).toBe(false)
    })

    it('reloads project tasks when opening the board so recent task changes are visible', async () => {
        const wrapper = mountWorkspace()
        await flushPromises()
        crudAction.mockClear()

        await wrapper.findAll('.view-switch button')[2].trigger('click')
        await flushPromises()

        expect(crudAction).toHaveBeenCalledWith('task', 'get_all', {
            projectId: 'project-1',
            pageSize: 1000
        })
        expect(wrapper.findComponent({ name: 'TaskBoard' }).exists()).toBe(true)
    })

    it('reloads project-scoped data when the route project changes', async () => {
        const wrapper = mountWorkspace()
        await flushPromises()
        crudAction.mockClear()

        await wrapper.setProps({ projectId: 'project-2' })
        await flushPromises()

        expect(crudAction).toHaveBeenCalledWith('task', 'get_all', {
            projectId: 'project-2',
            pageSize: 1000
        })
        expect(wrapper.text()).toContain('Beta')
    })
})
