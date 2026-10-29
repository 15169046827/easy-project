import { reactive, ref } from 'vue'
import { crudAction } from '../../../api'
import { loadAllTasks } from '../../../api/taskCatalog.js'
import { groupStatusStatistics } from '../utils/statusGroups.js'

async function loadTaskSnapshot(query) {
    const result = await crudAction('task', 'get_all', query)
    const rows = result?.list || []
    const projectIds = query.projectId
        ? [query.projectId]
        : [...new Set(rows.map(task => task.project_id).filter(Boolean))]
    const catalogs = await Promise.all(
        projectIds.map(async projectId => {
            const relations = await crudAction('task_dependency', 'get_all', { projectId })
            // Related names and edit options must not disappear across filters or pages.
            const completeProject =
                !query.hierarchy &&
                query.projectId &&
                !query.keyword &&
                !query.status &&
                !query.statusIds &&
                !query.priority &&
                rows.length >= (result?.total || 0)
            const related = completeProject ? rows : await loadAllTasks({ projectId })
            return { related, dependencies: relations?.list || [] }
        })
    )
    const dependencies = catalogs.flatMap(catalog => catalog.dependencies)
    const relatedTasks = catalogs.flatMap(catalog => catalog.related)
    const tasks = (result?.list || []).map(task => ({
        ...task,
        _predecessorIds: dependencies
            .filter(item => item.successor_task_id === task.id)
            .map(item => item.predecessor_task_id)
    }))
    return {
        tasks,
        dependencies,
        relatedTasks,
        total: result?.total || 0,
        statistics: result?.statistics || null
    }
}

async function loadTaskPage(query) {
    // Status selection only filters rows, not sibling cards/counts. Retain
    // project, search and priority dimensions; the overview needs just one row.
    const [result, overview] = await Promise.all([
        loadTaskSnapshot(query),
        query.status || query.statusIds
            ? crudAction('task', 'get_all', {
                  ...query,
                  status: '',
                  statusIds: undefined,
                  pageIndex: 1,
                  pageSize: 1
              })
            : Promise.resolve(null)
    ])
    return { ...result, statistics: overview?.statistics || result.statistics }
}

function createPageOption() {
    return reactive({ pageIndex: 1, pageSize: 20, pageOptions: [20, 50, 100], fetchSize: 1000 })
}

async function requireTaskRefresh(init, errorMessage) {
    if (!(await init())) throw new Error(errorMessage.value || 'Task refresh was superseded')
}
function clearFilterValues(fields) {
    for (const field of fields) field.value = ''
}

function resolveStatusQuery(query, statistics) {
    if (!query.projectId && /^(builtin:|name:)/.test(query.status)) {
        const groups = groupStatusStatistics(statistics?.all_tasks || { statuses: [] })
        return {
            ...query,
            status: '',
            statusIds: groups.statuses.find(group => group.id === query.status)?.statusIds || []
        }
    }
    return query
}

function taskPageQuery(page, projectId, keyword, status, statusScope, priority, sortBy) {
    return {
        pageIndex: page.pageIndex,
        pageSize: page.pageSize,
        hierarchy: true,
        projectId,
        keyword,
        status,
        statusScope,
        priority,
        sortBy,
        sortDirection: sortBy === 'update_time' ? 'desc' : 'asc'
    }
}

export function useTaskListQuery(initialProjectId = '') {
    const tasks = ref([])
    const dependencies = ref([])
    const relatedTasks = ref([])
    const selectedProjectId = ref(initialProjectId)
    const selectedTasks = ref([])
    const loading = ref(false)
    const errorMessage = ref('')
    const totalRecords = ref(0)
    const statistics = ref(null)
    const keywordInput = ref('')
    const appliedKeyword = ref('')
    const statusFilter = ref('')
    const statusScope = ref('top_level')
    const priorityFilter = ref('')
    const sortBy = ref('sort_order')
    const pageOption = createPageOption()
    let requestSequence = 0

    async function init() {
        const request = ++requestSequence
        const projectId = selectedProjectId.value
        loading.value = true
        errorMessage.value = ''
        try {
            const query = taskPageQuery(
                pageOption,
                projectId,
                appliedKeyword.value,
                statusFilter.value,
                statusScope.value,
                priorityFilter.value,
                sortBy.value
            )
            const result = await loadTaskPage(resolveStatusQuery(query, statistics.value))
            if (request !== requestSequence || projectId !== selectedProjectId.value) return false
            dependencies.value = result.dependencies
            relatedTasks.value = result.relatedTasks
            tasks.value = result.tasks
            totalRecords.value = result.total
            statistics.value = result.statistics
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

    const initChecked = () => requireTaskRefresh(init, errorMessage)

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
        clearFilterValues([keywordInput, appliedKeyword, statusFilter, priorityFilter])
        sortBy.value = 'sort_order'
        return resetPageAndLoad()
    }
    function clearSearch() {
        keywordInput.value = ''
        return applySearch()
    }
    /** @param {{page: number, rows: number}} event */
    function onPage(event) {
        pageOption.pageIndex = event.page + 1
        pageOption.pageSize = event.rows
        return init()
    }
    return {
        tasks,
        dependencies,
        relatedTasks,
        selectedProjectId,
        selectedTasks,
        loading,
        errorMessage,
        totalRecords,
        statistics,
        keywordInput,
        appliedKeyword,
        statusFilter,
        statusScope,
        priorityFilter,
        sortBy,
        pageOption,
        init,
        initChecked,
        resetPageAndLoad,
        applySearch,
        clearFilters,
        clearSearch,
        onPage
    }
}
