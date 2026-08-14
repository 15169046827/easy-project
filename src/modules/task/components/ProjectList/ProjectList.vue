<template>
    <section class="projects-page">
        <!-- 头部 -->
        <header class="page-header">
            <div class="header-info">
                <span class="eyebrow">{{ $t('projects.eyebrow') }}</span>
                <h2>{{ $t('projects.title') }}</h2>
                <p>{{ $t('projects.subtitle') }}</p>
            </div>
            <div class="header-actions">
                <span class="search-box">
                    <i class="pi pi-search"></i>
                    <input v-model="searchQuery" :placeholder="$t('projects.searchPlaceholder')" />
                    <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                        <i class="pi pi-times"></i>
                    </button>
                </span>
                <Button
                    :label="$t('projects.newProject')"
                    icon="pi pi-plus"
                    @click="openTemplateDialog"
                />
                <Button
                    :label="$t('projects.delete')"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    :disabled="selectedProjects.length === 0"
                    @click="deleteProjects"
                />
            </div>
        </header>

        <!-- 统计卡片 -->
        <div class="stats-row">
            <div class="stat-card">
                <span class="stat-icon total"><i class="pi pi-folder"></i></span>
                <div>
                    <strong>{{ stats.total }}</strong>
                    <small>{{ $t('projects.statTotal') }}</small>
                </div>
            </div>
            <div class="stat-card">
                <span class="stat-icon active"><i class="pi pi-play-circle"></i></span>
                <div>
                    <strong>{{ stats.inProgress }}</strong>
                    <small>{{ $t('projects.statActive') }}</small>
                </div>
            </div>
            <div class="stat-card">
                <span class="stat-icon draft"><i class="pi pi-pencil"></i></span>
                <div>
                    <strong>{{ stats.draft }}</strong>
                    <small>{{ $t('projects.statDraft') }}</small>
                </div>
            </div>
            <div class="stat-card">
                <span class="stat-icon done"><i class="pi pi-check-circle"></i></span>
                <div>
                    <strong>{{ stats.done }}</strong>
                    <small>{{ $t('projects.statDone') }}</small>
                </div>
            </div>
        </div>

        <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

        <!-- 表格容器 -->
        <div class="table-card">
            <DataTable
                v-model:selection="selectedProjects"
                v-model:editingRows="editingRows"
                :value="filteredProjects"
                :loading="loading"
                dataKey="id"
                editMode="row"
                stripedRows
                paginator
                scrollable
                scrollHeight="flex"
                :rows="20"
                :rows-per-page-options="[20, 50, 100]"
                :pt="{
                    root: { class: 'workspace-table' },
                    table: { style: 'min-width: 60rem' }
                }"
                @row-edit-init="cacheRow"
                @row-edit-save="saveRow"
                @row-edit-cancel="cancelRow"
            >
                <Column selectionMode="multiple" frozen style="width: 3rem" />
                <Column field="name" :header="$t('projects.columnName')">
                    <template #editor="{ data, field }">
                        <InputText
                            v-model="data[field]"
                            :placeholder="$t('projects.namePlaceholder')"
                        />
                    </template>
                    <template #body="{ data }">
                        <button class="project-link" @click="openProject(data.id)">
                            <i class="pi pi-folder"></i>
                            {{ data.name || $t('projects.untitled') }}
                        </button>
                    </template>
                </Column>
                <Column field="version" :header="$t('projects.columnVersion')" style="width: 6rem">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" />
                    </template>
                    <template #body="{ data }">
                        <span class="version-tag">{{ data.version || '-' }}</span>
                    </template>
                </Column>
                <Column field="type" :header="$t('projects.columnType')" style="width: 6rem">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="projectTypes"
                            optionLabel="label"
                            optionValue="value"
                            fluid
                        />
                    </template>
                    <template #body="{ data }">
                        <span :class="['type-badge', data.type]">
                            <i :class="data.type === 'public' ? 'pi pi-globe' : 'pi pi-lock'"></i>
                            {{
                                data.type === 'public'
                                    ? $t('projects.typePublic')
                                    : $t('projects.typePrivate')
                            }}
                        </span>
                    </template>
                </Column>
                <Column field="status" :header="$t('projects.columnStatus')" style="width: 7rem">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="projectStatuses"
                            optionLabel="label"
                            optionValue="value"
                            fluid
                        />
                    </template>
                    <template #body="{ data }">
                        <span :class="['pill', statusPillClass(data.status)]">
                            <span class="pill-dot"></span>
                            {{ projectStatusLabel(data.status) }}
                        </span>
                    </template>
                </Column>
                <Column field="owner" :header="$t('projects.columnOwner')">
                    <template #editor="{ data, field }">
                        <MemberSelect
                            v-model="data[field]"
                            :placeholder="$t('projects.ownerPlaceholder')"
                        />
                    </template>
                    <template #body="{ data }">
                        <span v-if="memberMap[data.owner]" class="owner-cell">
                            <span
                                class="owner-avatar"
                                :style="{ background: avatarBg(memberMap[data.owner].name) }"
                                >{{ avatarInitial(memberMap[data.owner].name) }}</span
                            >
                            {{ memberMap[data.owner].name }}
                        </span>
                        <span v-else class="owner-cell">
                            <span class="owner-avatar">{{
                                (data.owner || '?')[0].toUpperCase()
                            }}</span>
                            {{ data.owner || $t('projects.noOwner') }}
                        </span>
                    </template>
                </Column>
                <Column
                    field="update_time"
                    :header="$t('projects.columnUpdated')"
                    style="width: 8rem"
                >
                    <template #body="{ data }">
                        <span class="time-cell">{{ formatTime(data.update_time) }}</span>
                    </template>
                </Column>
                <Column :rowEditor="true" frozen alignFrozen="right" style="width: 8rem" />
            </DataTable>
        </div>
        <ProjectTemplateDialog
            v-model:visible="templateDialogVisible"
            :busy="templateCreating"
            :error="templateError"
            @create="createProjectFromTemplate"
        />
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { crudAction } from '../../../../api'
import MemberSelect from '../../../member/components/MemberSelect.vue'
import ProjectTemplateDialog from '../../../project/components/ProjectTemplateDialog.vue'
import { useMembers } from '../../../../composables/useMembers'
import { useStatusLabels } from '../../../../composables/useStatusLabels'
import { avatarBg, avatarInitial } from '../../../../composables/useAvatar'

const router = useRouter()
const { t } = useI18n()
function openProject(id) {
    router.push('/project/' + id)
}

const projects = ref([])
const selectedProjects = ref([])
const editingRows = ref([])
const editingCache = ref({})
const activeEditingId = ref('')
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const templateDialogVisible = ref(false)
const templateCreating = ref(false)
const templateError = ref('')
const { memberMap, loadMembers } = useMembers()
const { projectStatusLabel } = useStatusLabels()

const projectTypes = computed(() => [
    { label: t('projects.typePrivate'), value: 'private' },
    { label: t('projects.typePublic'), value: 'public' }
])
const projectStatuses = computed(() => [
    { label: t('projects.statusDraft'), value: 'Draft' },
    { label: t('projects.statusInProgress'), value: 'InProgress' },
    { label: t('projects.statusPaused'), value: 'Paused' },
    { label: t('projects.statusDone'), value: 'Done' },
    { label: t('projects.statusArchived'), value: 'Archived' }
])

const stats = computed(() => ({
    total: projects.value.length,
    inProgress: projects.value.filter(p => p.status === 'InProgress').length,
    draft: projects.value.filter(p => p.status === 'Draft').length,
    done: projects.value.filter(p => p.status === 'Done').length
}))

const filteredProjects = computed(() => {
    if (!searchQuery.value.trim()) return projects.value
    const q = searchQuery.value.toLowerCase()
    return projects.value.filter(
        p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.owner || '').toLowerCase().includes(q) ||
            (p.version || '').toLowerCase().includes(q)
    )
})

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

function formatTime(val) {
    if (!val) return '-'
    const d = new Date(String(val).replace(' ', 'T'))
    if (Number.isNaN(d.getTime())) return val
    const now = new Date()
    const diffMs = now - d
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return t('common.justNow')
    if (diffMin < 60) return t('common.minutesAgo', { n: diffMin })
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return t('common.hoursAgo', { n: diffHr })
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return t('common.daysAgo', { n: diffDay })
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

async function loadProjects() {
    loading.value = true
    errorMessage.value = ''
    try {
        const result = await crudAction('project', 'get_all', { pageIndex: 1, pageSize: 100 })
        projects.value = result?.list ?? []
        await loadMembers()
    } catch (error) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}

function openTemplateDialog() {
    templateError.value = ''
    templateDialogVisible.value = true
}

async function createProjectFromTemplate(payload) {
    templateCreating.value = true
    templateError.value = ''
    try {
        const result = await crudAction('project', 'create_from_template', payload)
        templateDialogVisible.value = false
        await loadProjects()
        if (result?.id) await router.push(`/project/${result.id}`)
    } catch (error) {
        templateError.value = error.message
    } finally {
        templateCreating.value = false
    }
}

function cacheRow({ data }) {
    if (activeEditingId.value.startsWith('NEWPROJECT:') && activeEditingId.value !== data.id) {
        projects.value = projects.value.filter(project => project.id !== activeEditingId.value)
    }
    editingRows.value = [data]
    activeEditingId.value = data.id
    editingCache.value[data.id] = structuredClone(data)
}

async function saveRow({ newData }) {
    if (!newData.name.trim()) {
        errorMessage.value = t('projects.nameRequired')
        editingRows.value = [newData]
        return
    }

    loading.value = true
    errorMessage.value = ''
    try {
        if (newData.id.startsWith('NEWPROJECT:')) {
            const { id, ...payload } = newData
            await crudAction('project', 'add', payload)
        } else {
            const previous = editingCache.value[newData.id] ?? {}
            const editableFields = ['name', 'version', 'type', 'status', 'owner']
            const changes = Object.fromEntries(
                editableFields
                    .filter(key => newData[key] !== previous[key])
                    .map(key => [key, newData[key] ?? ''])
            )
            if (Object.keys(changes).length) {
                await crudAction('project', 'update', { id: newData.id, ...changes })
            }
        }
        await loadProjects()
        activeEditingId.value = ''
    } catch (error) {
        errorMessage.value = error.message
        editingRows.value = [newData]
    } finally {
        loading.value = false
    }
}

function cancelRow({ data }) {
    if (data.id.startsWith('NEWPROJECT:')) {
        projects.value = projects.value.filter(project => project.id !== data.id)
    }
    delete editingCache.value[data.id]
    activeEditingId.value = ''
}

async function deleteProjects() {
    const names = selectedProjects.value.map(project => project.name).join(', ')
    if (!confirm(t('projects.deleteConfirm', { names }))) return
    loading.value = true
    errorMessage.value = ''
    try {
        await crudAction('project', 'delete', {
            ids: selectedProjects.value.map(project => project.id)
        })
        selectedProjects.value = []
        await loadProjects()
    } catch (error) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}

onMounted(loadProjects)
</script>

<style scoped>
.projects-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px);
    padding: 1.5rem;
    overflow: hidden;
}
.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex: 0 0 auto;
    margin-bottom: 1.25rem;
    gap: 1rem;
}
.eyebrow {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.header-info h2 {
    margin: 0.15rem 0 0;
    font-size: 1.6rem;
    font-weight: 700;
}
.header-info p {
    margin: 0.2rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}
.header-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex-wrap: wrap;
}
.search-box {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.5rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast);
    min-width: 14rem;
}
.search-box:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.search-box i {
    color: var(--color-text-muted);
    font-size: 0.85rem;
}
.search-box input {
    border: 0;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 0.875rem;
    width: 100%;
}
.search-box input::placeholder {
    color: var(--color-text-muted);
}
.search-clear {
    border: 0;
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 0.15rem;
    border-radius: 50%;
}
.search-clear:hover {
    color: var(--color-text);
    background: var(--color-subtle-hover);
}

.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--page-gap);
    flex: 0 0 auto;
    margin-bottom: 1rem;
}
.stat-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: var(--card-padding);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: 0 2px 6px var(--color-card-shadow);
    transition: box-shadow var(--transition-fast);
}
.stat-card:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}
.stat-card strong {
    display: block;
    font-size: var(--stat-num-size);
    line-height: 1.2;
}
.stat-card small {
    color: var(--color-text-secondary);
    font-size: var(--stat-label-size);
}
.stat-icon {
    display: grid;
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    place-items: center;
    border-radius: var(--stat-icon-radius);
    font-size: var(--stat-icon-font);
    flex-shrink: 0;
}
.stat-icon.total {
    color: #1d4ed8;
    background: #dbeafe;
}
.stat-icon.active {
    color: #c2410c;
    background: #ffedd5;
}
.stat-icon.draft {
    color: #475569;
    background: #f1f5f9;
}
.stat-icon.done {
    color: #15803d;
    background: #dcfce7;
}

.error-banner {
    padding: 0.7rem 1rem;
    border-radius: var(--radius-md);
    color: var(--color-error-text);
    background: var(--color-error-bg);
    margin: 0 0 1rem;
    font-size: 0.85rem;
}

.table-card {
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
    overflow: hidden;
}
::deep(.workspace-table) {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
}
::deep(.workspace-table .p-datatable-table-container) {
    flex: 1 1 auto;
}
::deep(.workspace-table .p-paginator) {
    flex: 0 0 auto;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
}

.project-link {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0;
    border: 0;
    color: var(--color-text);
    background: transparent;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.15s ease;
}
.project-link i {
    color: var(--color-primary);
    font-size: 0.85rem;
}
.project-link:hover {
    color: var(--color-primary);
}
.version-tag {
    display: inline-block;
    padding: 0.1rem 0.45rem;
    border-radius: 4px;
    background: var(--color-subtle);
    color: var(--color-text-muted);
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 0.78rem;
}
.type-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
}
.type-badge.private {
    color: #475569;
    background: #f1f5f9;
}
.type-badge.public {
    color: #1d4ed8;
    background: #dbeafe;
}
.type-badge i {
    font-size: 0.65rem;
}

.owner-cell {
    display: flex;
    align-items: center;
    gap: 0.45rem;
}
.owner-avatar {
    display: grid;
    width: 1.55rem;
    height: 1.55rem;
    place-items: center;
    border-radius: 50%;
    background: var(--color-primary-light);
    color: var(--color-primary-text);
    font-size: 0.65rem;
    font-weight: 700;
    flex-shrink: 0;
}
.time-cell {
    color: var(--color-text-muted);
    font-size: 0.8rem;
}

@media (max-width: 900px) {
    .projects-page {
        padding: 1rem;
    }
    .page-header {
        flex-direction: column;
    }
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }
    .search-box {
        min-width: auto;
    }
    .header-actions {
        width: 100%;
    }
}
</style>
