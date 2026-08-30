<template>
    <section class="dashboard">
        <header class="dashboard-header">
            <div>
                <span class="eyebrow">{{ $t('dashboard.eyebrow') }}</span>
                <h2>{{ $t('dashboard.title') }}</h2>
                <p>{{ $t('dashboard.subtitle') }}</p>
            </div>
            <Button
                :label="$t('common.refresh')"
                icon="pi pi-refresh"
                outlined
                :loading="loading"
                @click="loadDashboard"
            />
        </header>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <div class="metrics" aria-label="Workspace metrics">
            <button class="metric-card" @click="go('/projects')">
                <span class="metric-icon blue"><i class="pi pi-folder"></i></span>
                <span
                    ><strong>{{ metrics.projects }}</strong
                    ><small>{{ $t('dashboard.activeProjects') }}</small></span
                >
            </button>
            <button class="metric-card" @click="go('/tasks')">
                <span class="metric-icon indigo"><i class="pi pi-list-check"></i></span>
                <span
                    ><strong>{{ metrics.tasks }}</strong
                    ><small>{{ $t('dashboard.totalTasks') }}</small></span
                >
            </button>
            <div class="metric-card">
                <span class="metric-icon green"><i class="pi pi-check-circle"></i></span>
                <span
                    ><strong>{{ metrics.completed }}</strong
                    ><small>{{ $t('dashboard.completedTasks') }}</small></span
                >
            </div>
            <div class="metric-card" :class="{ warning: metrics.overdue > 0 }">
                <span class="metric-icon red"><i class="pi pi-exclamation-circle"></i></span>
                <span
                    ><strong>{{ metrics.overdue }}</strong
                    ><small>{{ $t('dashboard.overdueTasks') }}</small></span
                >
            </div>
        </div>

        <div class="dashboard-grid">
            <article class="dashboard-card status-card">
                <header>
                    <h3>{{ $t('dashboard.taskStatus') }}</h3>
                    <span>{{ completionRate }}% {{ $t('dashboard.complete') }}</span>
                </header>
                <div class="progress-track">
                    <span :style="{ width: `${completionRate}%` }"></span>
                </div>
                <div class="status-list">
                    <div v-for="item in statusSummary" :key="item.label">
                        <span><i :class="item.className"></i>{{ item.label }}</span
                        ><strong>{{ item.value }}</strong>
                    </div>
                </div>
            </article>

            <article class="dashboard-card attention-card">
                <header>
                    <h3>{{ $t('dashboard.needsAttention') }}</h3>
                    <span>{{ $t('dashboard.next7days') }}</span>
                </header>
                <div v-if="attentionTasks.length" class="attention-list">
                    <button
                        v-for="task in attentionTasks"
                        :key="task.id"
                        @click="openProject(task.project_id)"
                    >
                        <span class="task-name">{{ task.name }}</span>
                        <span class="task-project">{{ projectName(task.project_id) }}</span>
                        <time :class="{ overdue: isOverdue(task) }">{{
                            formatDate(task.end_time)
                        }}</time>
                    </button>
                </div>
                <p v-else class="empty">{{ $t('dashboard.noAttention') }}</p>
            </article>

            <article class="dashboard-card recent-card">
                <header>
                    <h3>{{ $t('dashboard.recentProjects') }}</h3>
                    <button @click="go('/projects')">{{ $t('dashboard.viewAll') }}</button>
                </header>
                <div v-if="recentProjects.length" class="recent-list">
                    <button
                        v-for="project in recentProjects"
                        :key="project.id"
                        @click="openProject(project.id)"
                    >
                        <span
                            ><strong>{{ project.name }}</strong
                            ><small>{{
                                memberMap[project.owner]?.name ||
                                project.owner ||
                                $t('common.noOwner')
                            }}</small></span
                        >
                        <span class="status-pill">{{ projectStatusLabel(project.status) }}</span>
                    </button>
                </div>
                <p v-else class="empty">{{ $t('dashboard.createFirst') }}</p>
            </article>

            <div class="workload-wrap">
                <ResourceLoadPanel
                    :title="$t('resourceLoad.title')"
                    :tasks="tasks"
                    :members="members"
                    :threshold="3"
                />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import { useStatusLabels } from '../../../composables/useStatusLabels'
import { avatarBg, avatarInitial } from '../../../composables/useAvatar'
import ResourceLoadPanel from '../../../components/ResourceLoadPanel.vue'

const router = useRouter()
const { t } = useI18n()
function go(path) {
    router.push(path)
}
function openProject(id) {
    router.push('/project/' + id)
}
const projects = ref([])
const tasks = ref([])
const loading = ref(false)
const errorMessage = ref('')
const { members, memberMap, loadMembers } = useMembers()
const { projectStatusLabel } = useStatusLabels()

const metrics = computed(() => ({
    projects: projects.value.length,
    tasks: tasks.value.length,
    completed: tasks.value.filter(task => task.status === 'Done').length,
    overdue: tasks.value.filter(isOverdue).length
}))

const completionRate = computed(() =>
    metrics.value.tasks ? Math.round((metrics.value.completed / metrics.value.tasks) * 100) : 0
)

const statusSummary = computed(() => [
    {
        label: t('common.pending'),
        value: tasks.value.filter(task => task.status === 'Pending').length,
        className: 'dot gray'
    },
    {
        label: t('common.active'),
        value: tasks.value.filter(task => task.status === 'InProgress').length,
        className: 'dot blue'
    },
    { label: t('common.done'), value: metrics.value.completed, className: 'dot green' }
])

const attentionTasks = computed(() => {
    const now = new Date()
    const horizon = new Date(now)
    horizon.setDate(horizon.getDate() + 7)
    return tasks.value
        .filter(task => {
            const end = parseDate(task.end_time)
            return end && task.status !== 'Done' && end <= horizon
        })
        .sort((left, right) => parseDate(left.end_time) - parseDate(right.end_time))
        .slice(0, 6)
})

const recentProjects = computed(() =>
    [...projects.value]
        .sort((left, right) => parseDate(right.update_time) - parseDate(left.update_time))
        .slice(0, 5)
)

function parseDate(value) {
    if (!value) return null
    const parsed = new Date(String(value).replace(' ', 'T'))
    return Number.isNaN(parsed.getTime()) ? null : parsed
}

function isOverdue(task) {
    const end = parseDate(task.end_time)
    return Boolean(end && task.status !== 'Done' && end < new Date())
}

function formatDate(value) {
    const date = parseDate(value)
    return date
        ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : t('common.noDate')
}

function projectName(projectId) {
    return (
        projects.value.find(project => project.id === projectId)?.name || t('common.unknownProject')
    )
}

async function loadDashboard() {
    loading.value = true
    errorMessage.value = ''
    try {
        const [projectResult, taskResult] = await Promise.all([
            crudAction('project', 'get_all', { pageIndex: 1, pageSize: 1000 }),
            crudAction('task', 'get_all', { pageIndex: 1, pageSize: 1000 })
        ])
        projects.value = projectResult?.list || []
        tasks.value = taskResult?.list || []
        await loadMembers()
    } catch (error) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}

onMounted(loadDashboard)
</script>

<style scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px - var(--window-titlebar-height, 0px));
    padding: 1.5rem;
    overflow: hidden;
}
.dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    margin-bottom: var(--header-mb);
}
.dashboard-header h2 {
    margin: 0.15rem 0 0;
    font-size: 1.6rem;
    font-weight: 700;
}
.dashboard-header p {
    margin: 0.2rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}
.eyebrow {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.metrics {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--page-gap);
    flex: 0 0 auto;
}
.metric-card {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    min-height: 7rem;
    padding: 1.1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    color: var(--color-text);
    background: var(--color-surface);
    font: inherit;
    text-align: left;
    box-shadow: 0 2px 8px var(--color-card-shadow);
    transition:
        box-shadow var(--transition-fast),
        border-color var(--transition-fast);
}
.metric-card:hover {
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}
button.metric-card {
    cursor: pointer;
}
.metric-card.warning {
    border-color: #fecaca;
}
.metric-card strong {
    display: block;
    font-size: 1.75rem;
}
.metric-card small {
    color: var(--color-text-secondary);
    font-size: var(--stat-label-size);
    line-height: 1.35;
}
.metric-icon {
    display: grid;
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    place-items: center;
    border-radius: 0.65rem;
    font-size: 1.15rem;
    flex-shrink: 0;
}
.metric-icon.blue {
    color: #1d4ed8;
    background: #dbeafe;
}
.metric-icon.indigo {
    color: #4338ca;
    background: #e0e7ff;
}
.metric-icon.green {
    color: #15803d;
    background: #dcfce7;
}
.metric-icon.red {
    color: #b91c1c;
    background: #fee2e2;
}
.dashboard-grid {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 1rem;
    margin-top: 1rem;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    align-content: start;
}
.dashboard-card {
    padding: 1.2rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
.dashboard-card header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}
.dashboard-card h3 {
    margin: 0;
    font-size: 1rem;
}
.dashboard-card header span {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
}
.progress-track {
    height: 0.55rem;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color-border);
}
.progress-track span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2563eb, #22c55e);
}
.status-list {
    display: grid;
    gap: 0.8rem;
    margin-top: 1.2rem;
}
.status-list div {
    display: flex;
    justify-content: space-between;
}
.status-list span {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--color-text-muted);
}
.dot {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
}
.dot.gray {
    background: #94a3b8;
}
.dot.blue {
    background: #2563eb;
}
.dot.green {
    background: #22c55e;
}
.attention-list,
.recent-list {
    display: grid;
}
.attention-list button,
.recent-list button {
    display: grid;
    align-items: center;
    width: 100%;
    padding: 0.8rem 0;
    border: 0;
    border-bottom: 1px solid var(--color-border-light);
    color: var(--color-text);
    background: transparent;
    text-align: left;
    cursor: pointer;
}
.attention-list button {
    grid-template-columns: 1fr 0.8fr auto;
    gap: 1rem;
}
.task-name {
    font-weight: 600;
}
.task-project {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}
time {
    color: var(--color-text-muted);
    font-size: 0.8rem;
}
time.overdue {
    color: #b91c1c;
    font-weight: 700;
}
.recent-card {
    grid-column: 1 / -1;
}
.recent-card header button {
    border: 0;
    color: var(--color-primary-text);
    background: transparent;
    cursor: pointer;
}
.recent-list button {
    grid-template-columns: 1fr auto;
}
.recent-list strong,
.recent-list small {
    display: block;
}
.recent-list small {
    margin-top: 0.2rem;
    color: var(--color-text-secondary);
}
.status-pill {
    padding: 0.25rem 0.55rem;
    border-radius: 999px;
    color: var(--color-primary-text);
    background: var(--color-primary-light);
    font-size: 0.75rem;
}
.empty {
    color: var(--color-text-secondary);
}
.workload-wrap {
    grid-column: 1 / -1;
    padding: 1.2rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
.workload-list {
    display: grid;
    gap: 0.5rem;
}
.workload-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.45rem 0.2rem;
    border: 0;
    border-bottom: 1px solid var(--color-border-light);
    color: var(--color-text);
    background: transparent;
    text-align: left;
    cursor: pointer;
}
.workload-row:hover {
    background: var(--color-subtle-hover);
}
.workload-avatar {
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
}
.workload-name {
    font-weight: 600;
    min-width: 7rem;
}
.workload-bar {
    flex: 1 1 auto;
    height: 0.5rem;
    border-radius: 999px;
    background: var(--color-border);
    overflow: hidden;
}
.workload-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2563eb, #22c55e);
    transition: width 0.3s ease;
}
.workload-count {
    margin-left: 0.5rem;
}
.error {
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
@media (max-width: 900px) {
    .metrics {
        grid-template-columns: repeat(2, 1fr);
    }
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    .recent-card {
        grid-column: auto;
    }
}
</style>
