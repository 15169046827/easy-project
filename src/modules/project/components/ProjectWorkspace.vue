<template>
    <section class="project-workspace">
        <!-- 项目信息头部 -->
        <header class="workspace-banner">
            <div class="banner-left">
                <button
                    class="back-button"
                    :aria-label="$t('project.back')"
                    @click="go('/projects')"
                >
                    <i class="pi pi-arrow-left"></i>
                </button>
                <div class="project-meta">
                    <span class="workspace-eyebrow">{{ $t('project.eyebrow') }}</span>
                    <div class="title-line">
                        <h2>{{ project?.name || $t('project.defaultName') }}</h2>
                        <span v-if="project" :class="['pill', statusPillClass(project.status)]">
                            <span class="pill-dot"></span>{{ projectStatusLabel(project.status) }}
                        </span>
                    </div>
                    <p v-if="project">
                        <span class="meta-owner">
                            <span
                                v-if="memberMap[project.owner]"
                                class="mini-avatar"
                                :style="{ background: avatarBg(memberMap[project.owner].name) }"
                                >{{ avatarInitial(memberMap[project.owner].name) }}</span
                            >
                            <span v-else class="mini-avatar">{{
                                (project.owner || '?')[0].toUpperCase()
                            }}</span>
                            {{
                                memberMap[project.owner]?.name ||
                                project.owner ||
                                $t('common.noOwner')
                            }}
                        </span>
                        <span class="meta-sep">·</span>
                        <span class="meta-version">{{
                            project.version || $t('common.noVersion')
                        }}</span>
                    </p>
                </div>
            </div>
            <div class="view-switch" aria-label="Project views">
                <button :class="{ active: view === 'tasks' }" @click="view = 'tasks'">
                    <i class="pi pi-list-check"></i> {{ $t('project.viewTasks') }}
                </button>
                <button :class="{ active: view === 'gantt' }" @click="view = 'gantt'">
                    <i class="pi pi-chart-bar"></i> {{ $t('project.viewGantt') }}
                </button>
                <button :class="{ active: view === 'board' }" @click="view = 'board'">
                    <i class="pi pi-th-large"></i> {{ $t('project.viewBoard') }}
                </button>
                <button :class="{ active: view === 'team' }" @click="view = 'team'">
                    <i class="pi pi-users"></i> {{ $t('project.viewTeam') }}
                </button>
                <button :class="{ active: view === 'calendar' }" @click="view = 'calendar'">
                    <i class="pi pi-calendar"></i> {{ $t('project.viewCalendar') }}
                </button>
            </div>
        </header>

        <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

        <div class="workspace-content">
            <TaskList v-if="view === 'tasks'" :initial-project-id="projectId" embedded />
            <GanttView v-else-if="view === 'gantt'" :initial-project-id="projectId" embedded />
            <TaskBoard
                v-else-if="view === 'board'"
                :tasks="projectTasks"
                :members="members"
                @updated="loadProjectTasks"
            />
            <div v-else-if="view === 'team'" class="team-view">
                <ResourceLoadPanel
                    :title="$t('resourceLoad.title')"
                    :tasks="projectTasks"
                    :members="members"
                    :threshold="3"
                    :project="project"
                />
                <ProjectMemberPanel :project-id="projectId" />
            </div>
            <div v-else-if="project" class="calendar-view">
                <WorkCalendarSettings :project="project" @saved="project = $event" />
                <CalendarSyncPanel
                    :project="project"
                    :tasks="projectTasks"
                    :members="members"
                    @imported="loadMembers({ force: true })"
                />
            </div>
        </div>
    </section>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import { useStatusLabels } from '../../../composables/useStatusLabels'
import { avatarBg, avatarInitial } from '../../../composables/useAvatar'
import TaskList from '../../task/components/TaskList/TaskList.vue'
import GanttView from '../../gantt/components/GanttView.vue'
import TaskBoard from '../../task/components/TaskBoard.vue'
import ProjectMemberPanel from './ProjectMemberPanel.vue'
import ResourceLoadPanel from '../../../components/ResourceLoadPanel.vue'
import WorkCalendarSettings from '../../calendar/components/WorkCalendarSettings.vue'
import CalendarSyncPanel from '../../calendar/components/CalendarSyncPanel.vue'

const props = defineProps({ projectId: { type: String, required: true } })
const router = useRouter()
const { t } = useI18n()
function go(path) {
    router.push(path)
}
const project = ref(null)
const view = ref('tasks')
const errorMessage = ref('')
const projectTasks = ref([])
const { members, memberMap, loadMembers } = useMembers()
const { projectStatusLabel } = useStatusLabels()

function statusPillClass(status) {
    const map = {
        Draft: 'pill-draft',
        InProgress: 'pill-inprogress',
        Paused: 'pill-paused',
        Done: 'pill-done',
        Archived: 'pill-archived'
    }
    return map[status] || 'pill-draft'
}

async function loadProject() {
    errorMessage.value = ''
    try {
        const result = await crudAction('project', 'get_all', { pageIndex: 1, pageSize: 1000 })
        project.value = (result?.list || []).find(item => item.id === props.projectId) || null
        await loadMembers()
        if (!project.value) errorMessage.value = t('project.notFound')
    } catch (error) {
        errorMessage.value = error.message
    }
}

async function loadProjectTasks() {
    try {
        const result = await crudAction('task', 'get_all', {
            projectId: props.projectId,
            pageSize: 1000
        })
        projectTasks.value = result?.list || []
    } catch (error) {
        projectTasks.value = []
    }
}

watch(
    () => props.projectId,
    () => {
        loadProject()
        loadProjectTasks()
    }
)
watch(view, nextView => {
    if (['board', 'team', 'calendar'].includes(nextView)) {
        loadProjectTasks()
    }
})
onMounted(() => {
    loadProject()
    loadProjectTasks()
})
</script>

<style scoped>
.project-workspace {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px - var(--window-titlebar-height, 0px));
    padding: 1.5rem;
    overflow: hidden;
}

/* 顶部横幅 */
.workspace-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex: 0 0 auto;
    margin-bottom: 1.25rem;
    padding: 1.25rem 1.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.04), rgba(37, 99, 235, 0.01));
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
.banner-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
}
.back-button {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    place-items: center;
    border: 1px solid var(--color-border);
    border-radius: 0.65rem;
    color: var(--color-text);
    background: var(--color-surface);
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s ease;
}
.back-button:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.12);
}
.workspace-eyebrow {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.title-line {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}
.title-line h2 {
    margin: 0.1rem 0 0;
    font-size: 1.45rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}
.project-meta p {
    margin: 0.3rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}
.meta-owner {
    display: flex;
    align-items: center;
    gap: 0.35rem;
}
.mini-avatar {
    display: grid;
    width: 1.3rem;
    height: 1.3rem;
    place-items: center;
    border-radius: 50%;
    background: var(--color-primary-light);
    color: var(--color-primary-text);
    font-size: 0.6rem;
    font-weight: 700;
    flex-shrink: 0;
}
.meta-sep {
    color: var(--color-border);
}
.meta-version {
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    padding: 0.1rem 0.45rem;
    border-radius: 4px;
    background: var(--color-subtle);
    font-size: 0.75rem;
}

/* 视图切换 */
.view-switch {
    display: flex;
    padding: 0.25rem;
    border: 1px solid var(--color-border);
    border-radius: 0.7rem;
    background: var(--color-surface);
    flex-shrink: 0;
}
.view-switch button {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.58rem 0.9rem;
    border: 0;
    border-radius: 0.5rem;
    color: var(--color-text-secondary);
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
}
.view-switch button:hover {
    color: var(--color-text);
}
.view-switch button.active {
    color: #fff;
    background: var(--color-primary);
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}
.view-switch button i {
    font-size: 0.9rem;
}

/* 内容区 */
.workspace-content {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}

.team-view {
    display: grid;
    gap: 1rem;
    height: 100%;
    overflow-y: auto;
    padding-right: 0.25rem;
}
.calendar-view {
    display: grid;
    gap: 1rem;
    height: 100%;
    overflow-y: auto;
    padding-right: 0.25rem;
}
.calendar-view > :deep(.calendar-settings) {
    height: auto;
    overflow: visible;
}
.team-view > :deep(.resource-load),
.team-view > :deep(section) {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
    padding: 1.2rem;
}

.error-banner {
    padding: 0.7rem 1rem;
    color: var(--color-error-text);
    background: var(--color-error-bg);
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
    font-size: 0.85rem;
}

@media (max-width: 900px) {
    .project-workspace {
        padding: 1rem;
    }
    .workspace-banner {
        align-items: stretch;
        flex-direction: column;
    }
    .view-switch {
        align-self: flex-start;
    }
    .view-switch button {
        flex: 1 1 50%;
        justify-content: center;
    }
}
</style>
