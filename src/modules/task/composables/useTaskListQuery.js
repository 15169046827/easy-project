import { reactive, ref } from 'vue'
import { crudAction } from '../../../api'

async function loadTaskSnapshot(query) {
    const result = await crudAction('task', 'get_all', query)
    const relations = query.projectId
        ? await crudAction('task_dependency', 'get_all', { projectId: query.projectId })
        : { list: [] }
    const dependencies = relations?.list || []
    const tasks = (result?.list || []).map(task => ({
        ...task,
        _predecessorIds: dependencies
            .filter(item => item.successor_task_id === task.id)
            .map(item => item.predecessor_task_id)
    }))
    return { tasks, dependencies, total: result?.total || 0 }
}

export function useTaskListQuery(initialProjectId = '') {
    const tasks = ref([])
    const dependencies = ref([])
    const selectedProjectId = ref(initialProjectId)
    const selectedTasks = ref([])
    const loading = ref(false)
    const errorMessage = ref('')
    const totalRecords = ref(0)
    const keywordInput = ref('')
    const appliedKeyword = ref('')
    const statusFilter = ref('')
    const priorityFilter = ref('')
    const sortBy = ref('sort_order')
    const pageOption = reactive({
        pageIndex: 1,
        pageSize: 20,
        pageOptions: [20, 50, 100],
        fetchSize: 1000
    })
    let requestSequence = 0

    async function init() {
        const request = ++requestSequence
        const projectId = selectedProjectId.value
        loading.value = true
        errorMessage.value = ''
        try {
            const result = await loadTaskSnapshot({
                pageIndex: projectId ? 1 : pageOption.pageIndex,
                pageSize: projectId ? pageOption.fetchSize : pageOption.pageSize,
                projectId,
                keyword: appliedKeyword.value,
                status: statusFilter.value,
                priority: priorityFilter.value,
                sortBy: sortBy.value,
                sortDirection: sortBy.value === 'update_time' ? 'desc' : 'asc'
            })
            if (request !== requestSequence || projectId !== selectedProjectId.value) return false
            dependencies.value = result.dependencies
            tasks.value = result.tasks
            totalRecords.value = result.total
            return true
        } catch (error) {
            if (request === requestSequence) {
                errorMessage.value = error instanceof Error ? error.message : String(error)
            }
            return false
        } finally {
            if (request === requestSequence) loading.value = false
        }
    }

    async function initChecked() {
        if (!(await init())) throw new Error(errorMessage.value || 'Task refresh was superseded')
    }

    function resetPageAndLoad() {
        pageOption.pageIndex = 1
        selectedTasks.value = []
        return init()
    }
    function applySearch() {
        appliedKeyword.value = keywordInput.value.trim()
        return resetPageAndLoad()
    }
    function clearFilters() {
        keywordInput.value = ''
        appliedKeyword.value = ''
        statusFilter.value = ''
        priorityFilter.value = ''
        sortBy.value = 'sort_order'
        return resetPageAndLoad()
    }
    /** @param {{page: number, rows: number}} event */
    function onPage(event) {
        if (selectedProjectId.value) return
        pageOption.pageIndex = event.page + 1
        pageOption.pageSize = event.rows
        return init()
    }
    return {
        tasks,
        dependencies,
        selectedProjectId,
        selectedTasks,
        loading,
        errorMessage,
        totalRecords,
        keywordInput,
        appliedKeyword,
        statusFilter,
        priorityFilter,
        sortBy,
        pageOption,
        init,
        initChecked,
        resetPageAndLoad,
        applySearch,
        clearFilters,
        onPage
    }
}
