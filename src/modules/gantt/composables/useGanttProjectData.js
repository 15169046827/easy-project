import { ref } from 'vue'
import { crudAction } from '../../../api'

async function projectSnapshot(projectId) {
    const [tasks, dependencies, projects, team] = await Promise.all([
        crudAction('task', 'get_all', { pageIndex: 1, pageSize: 1000, projectId }),
        crudAction('task_dependency', 'get_all', { projectId }),
        crudAction('project', 'get_all', { pageIndex: 1, pageSize: 1000 }),
        crudAction('project_member', 'get_by_project', { projectId })
    ])
    return {
        tasks: tasks?.list || [],
        dependencies: dependencies?.list || [],
        projects: projects?.list,
        team: (team?.list || []).map(member => member.member_id)
    }
}

export function useGanttProjectData({
    projectId,
    message,
    messageType,
    initViewRange,
    loadBaseline
}) {
    const projects = ref([])
    const tasks = ref([])
    const dependencies = ref([])
    const projectMemberIds = ref([])
    const loading = ref(false)
    let sequence = 0
    let failure = ''
    async function load() {
        const id = projectId.value
        const request = ++sequence
        failure = ''
        if (!id) {
            loading.value = false
            return false
        }
        loading.value = true
        try {
            const snapshot = await projectSnapshot(id)
            if (request !== sequence || id !== projectId.value) return false
            tasks.value = snapshot.tasks
            dependencies.value = snapshot.dependencies
            projects.value = snapshot.projects || projects.value
            projectMemberIds.value = snapshot.team
            initViewRange()
            await loadBaseline()
            return request === sequence && id === projectId.value
        } catch (error) {
            if (request === sequence && id === projectId.value) {
                messageType.value = 'error'
                message.value = error instanceof Error ? error.message : String(error)
                failure = message.value
            }
            return false
        } finally {
            if (request === sequence) loading.value = false
        }
    }
    async function loadChecked() {
        if (!(await load())) throw new Error(failure || 'Project refresh was superseded')
    }
    return { projects, tasks, dependencies, projectMemberIds, loading, load, loadChecked }
}
