import { computed, onMounted, onUnmounted, ref } from 'vue'
import { crudAction } from '../../api'
import { nearbyFloatingTasks } from './taskSelection'

export function useFloatingTasks() {
    const tasks = ref([])
    const projects = ref([])
    const error = ref('')
    const loading = ref(true)
    const initialized = ref(false)
    let generation = 0
    let disposed = false
    let timer
    async function fetchAll(model, request) {
        const result = await crudAction(model, 'get_all', { pageIndex: 1, pageSize: 1000 })
        const list = [...(result?.list || [])]
        const pages = Number(result?.totalPage ?? 1)
        if (!Number.isSafeInteger(pages) || pages < 0) {
            throw new Error('Invalid pagination response')
        }
        for (let pageIndex = 2; pageIndex <= pages; pageIndex++) {
            if (disposed || request !== generation) return []
            const page = await crudAction(model, 'get_all', { pageIndex, pageSize: 1000 })
            list.push(...(page?.list || []))
        }
        return list
    }
    async function refresh() {
        const request = ++generation
        loading.value = true
        try {
            const [nextTasks, nextProjects] = await Promise.all([
                fetchAll('task', request),
                fetchAll('project', request)
            ])
            if (disposed || request !== generation) return
            tasks.value = nearbyFloatingTasks(nextTasks)
            projects.value = nextProjects
            error.value = ''
        } catch (cause) {
            if (!disposed && request === generation) error.value = String(cause?.message || cause)
        } finally {
            if (!disposed && request === generation) {
                loading.value = false
                initialized.value = true
            }
        }
    }
    const initialLoading = computed(() => loading.value && !initialized.value)
    const projectNames = computed(() => new Map(projects.value.map(item => [item.id, item.name])))
    onMounted(() => {
        refresh()
        window.addEventListener('focus', refresh)
        timer = setInterval(refresh, 30000)
    })
    onUnmounted(() => {
        disposed = true
        generation++
        clearInterval(timer)
        window.removeEventListener('focus', refresh)
    })
    return { tasks, projectNames, error, loading, initialLoading, refresh }
}
