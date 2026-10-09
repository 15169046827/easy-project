import { computed, onMounted, onUnmounted, ref } from 'vue'
import { crudAction } from '../../api'
import { activeFloatingTasks, chooseFloatingTask, SELECTED_TASK_KEY } from './taskSelection'

export function useFloatingTasks() {
    const tasks = ref([])
    const projects = ref([])
    const selectedId = ref('')
    const error = ref('')
    let generation = 0
    let disposed = false
    let timer
    try {
        selectedId.value = localStorage.getItem(SELECTED_TASK_KEY) || ''
    } catch {
        // Selection is optional; blocked storage must not prevent loading tasks.
    }
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
        try {
            const [nextTasks, nextProjects] = await Promise.all([
                fetchAll('task', request),
                fetchAll('project', request)
            ])
            if (disposed || request !== generation) return
            tasks.value = activeFloatingTasks(nextTasks)
            projects.value = nextProjects
            error.value = ''
        } catch (cause) {
            if (!disposed && request === generation) error.value = String(cause?.message || cause)
        }
    }
    function selectTask(id) {
        selectedId.value = id
        try {
            localStorage.setItem(SELECTED_TASK_KEY, id)
        } catch {
            // Keep the current selection for this session.
        }
    }
    const task = computed(() => chooseFloatingTask(tasks.value, selectedId.value))
    const project = computed(() => projects.value.find(item => item.id === task.value?.project_id))
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
    return { tasks, task, project, error, selectTask, refresh }
}
