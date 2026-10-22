import { defineComponent, h, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import WorkspaceRouteView from '../../components/WorkspaceRouteView.vue'

async function setup(component) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/projects', component: { template: '<h2>Project list</h2>' } },
            { path: '/project/:id', component }
        ]
    })
    await router.push('/projects')
    await router.isReady()
    const wrapper = mount(WorkspaceRouteView, {
        global: {
            plugins: [router],
            mocks: { $t: key => key },
            stubs: {
                Button: {
                    props: ['label'],
                    template: '<button>{{ label }}</button>'
                },
                Message: { template: '<div role="alert"><slot /></div>' }
            }
        }
    })
    return { router, wrapper }
}

describe('workspace route recovery', () => {
    it('shows a safe error instead of a blank area when a lazy page cannot load', async () => {
        const { router, wrapper } = await setup(() =>
            Promise.reject(new Error('private URL / account detail must not be displayed'))
        )
        await expect(
            router.push('/project/PROJECT:0123456789abcdef0123456789abcdef')
        ).rejects.toThrow()
        await nextTick()
        expect(wrapper.get('[role="alert"]').text()).toContain('PAGE_MODULE_LOAD_FAILED')
        expect(wrapper.text()).not.toContain('private URL')
        await wrapper.findAll('button')[1].trigger('click')
        await flushPromises()
        expect(wrapper.text()).toBe('Project list')
        wrapper.unmount()
    })

    it('retries a failed render without reloading the application or replacing session state', async () => {
        let shouldFail = true
        const component = defineComponent({
            setup() {
                if (shouldFail) throw new Error('Synthetic render failure')
                return () => h('h2', 'Associated tasks')
            }
        })
        const { router, wrapper } = await setup(component)
        await router.push('/project/PROJECT:0123456789abcdef0123456789abcdef')
        await flushPromises()
        expect(wrapper.get('[role="alert"]').text()).toContain('PAGE_RENDER_FAILED')
        shouldFail = false
        await wrapper.find('button').trigger('click')
        await flushPromises()
        expect(wrapper.text()).toBe('Associated tasks')
        expect(router.currentRoute.value.params.id).toBe('PROJECT:0123456789abcdef0123456789abcdef')
        wrapper.unmount()
    })
})
