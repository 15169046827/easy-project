<template>
    <section class="members-page">
        <!-- 头部 -->
        <header class="page-header">
            <div class="header-info">
                <span class="eyebrow">{{ $t('members.eyebrow') }}</span>
                <h2>{{ $t('members.title') }}</h2>
                <p>{{ $t('members.subtitle') }}</p>
            </div>
            <div class="header-actions">
                <span class="search-box">
                    <i class="pi pi-search"></i>
                    <input v-model="searchQuery" :placeholder="$t('members.searchPlaceholder')" />
                    <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
                        <i class="pi pi-times"></i>
                    </button>
                </span>
                <Button :label="$t('members.addMember')" icon="pi pi-plus" @click="openAddDialog" />
                <Button
                    :label="$t('members.delete')"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    :disabled="selectedMembers.length === 0"
                    @click="deleteMembers"
                />
            </div>
        </header>

        <!-- 统计卡片 -->
        <div class="stats-row">
            <div class="stat-card">
                <span class="stat-icon total"><i class="pi pi-users"></i></span>
                <div>
                    <strong>{{ stats.total }}</strong>
                    <small>{{ $t('members.statTotal') }}</small>
                </div>
            </div>
            <div class="stat-card">
                <span class="stat-icon role"><i class="pi pi-briefcase"></i></span>
                <div>
                    <strong>{{ stats.roles }}</strong>
                    <small>{{ $t('members.statRoles') }}</small>
                </div>
            </div>
            <div class="stat-card">
                <span class="stat-icon dev"><i class="pi pi-code"></i></span>
                <div>
                    <strong>{{ stats.developers }}</strong>
                    <small>{{ $t('members.statDevelopers') }}</small>
                </div>
            </div>
            <div class="stat-card">
                <span class="stat-icon other"><i class="pi pi-user-plus"></i></span>
                <div>
                    <strong>{{ stats.others }}</strong>
                    <small>{{ $t('members.statOthers') }}</small>
                </div>
            </div>
        </div>

        <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

        <!-- 表格 -->
        <div class="table-card">
            <DataTable
                v-model:selection="selectedMembers"
                v-model:editingRows="editingRows"
                :value="filteredMembers"
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
                    table: { style: 'min-width: 50rem' }
                }"
                @row-edit-init="cacheRow"
                @row-edit-save="saveRow"
                @row-edit-cancel="cancelRow"
            >
                <Column selectionMode="multiple" frozen style="width: 3rem" />
                <Column field="name" :header="$t('members.columnName')" style="min-width: 10rem">
                    <template #editor="{ data, field }">
                        <InputText
                            v-model="data[field]"
                            :placeholder="$t('members.namePlaceholder')"
                        />
                    </template>
                    <template #body="{ data }">
                        <div class="member-name-cell">
                            <button class="member-trigger" @click="openDetail(data)">
                                <span
                                    class="avatar-circle"
                                    :style="{ background: avatarBg(data.name) }"
                                >
                                    {{ avatarInitial(data.name) }}
                                </span>
                                <span class="member-name">{{
                                    data.name || $t('members.untitled')
                                }}</span>
                            </button>
                        </div>
                    </template>
                </Column>
                <Column field="email" :header="$t('members.columnEmail')" style="min-width: 12rem">
                    <template #editor="{ data, field }">
                        <InputText
                            v-model="data[field]"
                            :placeholder="$t('members.emailPlaceholder')"
                        />
                    </template>
                    <template #body="{ data }">
                        <a v-if="data.email" :href="'mailto:' + data.email" class="email-link">{{
                            data.email
                        }}</a>
                        <span v-else class="text-muted">—</span>
                    </template>
                </Column>
                <Column field="phone" :header="$t('members.columnPhone')" style="width: 8rem">
                    <template #editor="{ data, field }">
                        <InputText
                            v-model="data[field]"
                            :placeholder="$t('members.phonePlaceholder')"
                        />
                    </template>
                    <template #body="{ data }">
                        {{ data.phone || '—' }}
                    </template>
                </Column>
                <Column field="role" :header="$t('members.columnRole')" style="width: 9rem">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="roleOptions"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="$t('members.rolePlaceholder')"
                        />
                    </template>
                    <template #body="{ data }">
                        <span class="role-pill" :class="roleClass(data.role)">{{
                            data.role || $t('members.roleDeveloper')
                        }}</span>
                    </template>
                </Column>
                <Column
                    field="update_time"
                    :header="$t('members.columnUpdated')"
                    style="width: 9rem"
                >
                    <template #body="{ data }">
                        {{ fmtDate(data.update_time) }}
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- 新增/编辑弹窗 -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="editingMember ? $t('members.dialogEditTitle') : $t('members.dialogAddTitle')"
            :modal="true"
            :style="{ width: '460px' }"
            @hide="resetForm"
        >
            <div class="dialog-form">
                <label>{{ $t('members.labelName') }} <span class="required">*</span></label>
                <InputText
                    v-model="form.name"
                    :placeholder="$t('members.namePlaceholder')"
                    class="w-full"
                />

                <label>{{ $t('members.labelEmail') }}</label>
                <InputText
                    v-model="form.email"
                    :placeholder="$t('members.emailPlaceholder')"
                    class="w-full"
                />

                <label>{{ $t('members.labelPhone') }}</label>
                <InputText
                    v-model="form.phone"
                    :placeholder="$t('members.phonePlaceholder')"
                    class="w-full"
                />

                <label>{{ $t('members.labelRole') }}</label>
                <Select
                    v-model="form.role"
                    :options="roleOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="$t('members.rolePlaceholder')"
                    class="w-full"
                />

                <label>{{ $t('members.labelAvatar') }}</label>
                <InputText
                    v-model="form.avatar"
                    :placeholder="$t('members.avatarPlaceholder')"
                    class="w-full"
                />
            </div>
            <template #footer>
                <Button :label="$t('common.cancel')" outlined @click="dialogVisible = false" />
                <Button
                    :label="$t('common.save')"
                    @click="submitForm"
                    :disabled="!form.name.trim()"
                />
            </template>
        </Dialog>

        <!-- 成员详情抽屉 -->
        <Drawer
            v-model:visible="drawerVisible"
            position="right"
            :style="{ width: '440px' }"
            :header="selectedMember?.name || $t('members.title')"
        >
            <div v-if="selectedMember" class="member-detail">
                <div class="detail-head">
                    <span
                        class="detail-avatar"
                        :style="{ background: avatarBg(selectedMember.name) }"
                        >{{ avatarInitial(selectedMember.name) }}</span
                    >
                    <div class="detail-head-info">
                        <strong>{{ selectedMember.name }}</strong>
                        <span class="role-pill" :class="roleClass(selectedMember.role)">{{
                            selectedMember.role
                        }}</span>
                        <div class="detail-email" v-if="selectedMember.email">
                            {{ selectedMember.email }}
                        </div>
                    </div>
                </div>

                <section class="detail-section availability-section">
                    <div class="detail-section-title">
                        <h4>{{ $t('members.availabilityTitle') }}</h4>
                        <span>{{ $t('members.availabilityHint') }}</span>
                    </div>
                    <div class="availability-form">
                        <InputText
                            v-model="availabilityDraft.name"
                            :placeholder="$t('members.availabilityName')"
                        />
                        <input v-model="availabilityDraft.start_date" type="date" />
                        <span>—</span>
                        <input v-model="availabilityDraft.end_date" type="date" />
                        <Button
                            icon="pi pi-plus"
                            :label="$t('members.availabilityAdd')"
                            size="small"
                            :disabled="!canAddAvailability"
                            @click="addAvailability"
                        />
                    </div>
                    <ul v-if="availabilityItems.length" class="availability-list">
                        <li
                            v-for="(item, index) in availabilityItems"
                            :key="`${item.start_date}-${index}`"
                        >
                            <span>
                                <strong>{{
                                    item.name || $t('members.availabilityDefaultName')
                                }}</strong>
                                {{ item.start_date }} → {{ item.end_date }}
                            </span>
                            <button
                                type="button"
                                :aria-label="$t('common.delete')"
                                @click="removeAvailability(index)"
                            >
                                <i class="pi pi-times"></i>
                            </button>
                        </li>
                    </ul>
                    <p v-else class="detail-empty">{{ $t('members.availabilityEmpty') }}</p>
                </section>

                <section class="detail-section">
                    <h4>{{ $t('members.detailResponsible', { count: detailTasks.length }) }}</h4>
                    <ul v-if="detailTasks.length" class="detail-list">
                        <li v-for="t in detailTasks" :key="t.id">
                            <span class="d-task-name">{{ t.name }}</span>
                            <span :class="['pill', statusPillClass(t.status)]">
                                <span class="pill-dot"></span>{{ t.status }}
                            </span>
                        </li>
                    </ul>
                    <p v-else class="detail-empty">{{ $t('members.detailNoTasks') }}</p>
                </section>

                <section class="detail-section">
                    <h4>{{ $t('members.detailProjects', { count: detailProjects.length }) }}</h4>
                    <ul v-if="detailProjects.length" class="detail-list">
                        <li v-for="pm in detailProjects" :key="pm.id">
                            <span class="d-proj-name">{{ pm.project_name }}</span>
                            <span class="d-pm-role">{{ pm.role }}</span>
                            <span class="d-proj-status">{{ pm.project_status }}</span>
                        </li>
                    </ul>
                    <p v-else class="detail-empty">{{ $t('members.detailNoProjects') }}</p>
                </section>

                <section class="detail-section">
                    <h4>{{ $t('members.detailOwned', { count: ownedProjects.length }) }}</h4>
                    <ul v-if="ownedProjects.length" class="detail-list">
                        <li v-for="p in ownedProjects" :key="p.id">
                            <span class="d-proj-name">{{ p.name }}</span>
                            <span class="d-proj-status">{{ p.status }}</span>
                        </li>
                    </ul>
                    <p v-else class="detail-empty">{{ $t('members.detailNoOwned') }}</p>
                </section>
            </div>
        </Drawer>
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Dialog from 'primevue/dialog'
import { useI18n } from 'vue-i18n'
import { parseAvailabilityExceptions } from '../../calendar/utils/memberAvailability.js'

const { t } = useI18n()
const { members, loadMembers } = useMembers()
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedMembers = ref([])
const editingRows = ref([])

// 弹窗
const dialogVisible = ref(false)
const editingMember = ref(null)
const form = ref({ name: '', email: '', phone: '', role: 'Developer', avatar: '' })

const roleOptions = computed(() => [
    { label: t('members.roleManager'), value: 'Manager' },
    { label: t('members.roleDeveloper'), value: 'Developer' },
    { label: t('members.roleDesigner'), value: 'Designer' },
    { label: t('members.roleQA'), value: 'QA' },
    { label: t('members.rolePM'), value: 'PM' },
    { label: t('members.roleDevOps'), value: 'DevOps' },
    { label: t('members.roleOther'), value: 'Other' }
])

// 缓存行数据用于取消编辑
const cachedRow = ref(null)
function cacheRow(e) {
    cachedRow.value = { ...e.data }
}
function cancelRow(e) {
    if (cachedRow.value) {
        Object.assign(e.data, cachedRow.value)
    }
}

// 统计
const stats = computed(() => {
    const list = members.value
    const roles = new Set(list.map(m => m.role).filter(Boolean))
    return {
        total: list.length,
        roles: roles.size,
        developers: list.filter(m => m.role === 'Developer').length,
        others: list.length - list.filter(m => m.role === 'Developer').length
    }
})

// 搜索过滤
const filteredMembers = computed(() => {
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return members.value
    return members.value.filter(
        m =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.email || '').toLowerCase().includes(q) ||
            (m.role || '').toLowerCase().includes(q) ||
            (m.phone || '').toLowerCase().includes(q)
    )
})

// 头像
function avatarInitial(name) {
    return (name || '?').charAt(0).toUpperCase()
}
const colorPalette = [
    '#2563eb',
    '#7c3aed',
    '#db2777',
    '#ea580c',
    '#16a34a',
    '#0891b2',
    '#4f46e5',
    '#b91c1c'
]
function avatarBg(name) {
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return colorPalette[Math.abs(hash) % colorPalette.length]
}

function roleClass(role) {
    switch (role) {
        case 'Manager':
            return 'role-manager'
        case 'Developer':
            return 'role-developer'
        case 'Designer':
            return 'role-designer'
        case 'QA':
            return 'role-qa'
        case 'PM':
            return 'role-pm'
        case 'DevOps':
            return 'role-devops'
        default:
            return 'role-other'
    }
}

function fmtDate(date) {
    if (!date) return '—'
    return new Date(date.replace(' ', 'T')).toLocaleDateString()
}

// 加载数据
async function load() {
    loading.value = true
    errorMessage.value = ''
    try {
        await loadMembers({ force: true })
    } catch (e) {
        errorMessage.value = e.message
    } finally {
        loading.value = false
    }
}

// 行内编辑保存
async function saveRow(e) {
    const { newData, data: oldData } = e
    const id = oldData.id
    // 只提交变化字段
    const payload = { id }
    const fields = ['name', 'email', 'phone', 'role', 'avatar']
    for (const f of fields) {
        if (newData[f] !== oldData[f]) {
            payload[f] = newData[f] || ''
        }
    }
    if (Object.keys(payload).length === 1) return // 没有变化
    try {
        await crudAction('member', 'update', payload)
        await load()
    } catch (err) {
        errorMessage.value = err.message
        if (cachedRow.value) Object.assign(e.data, cachedRow.value)
    }
}

// 新增弹窗
function openAddDialog() {
    editingMember.value = null
    form.value = { name: '', email: '', phone: '', role: 'Developer', avatar: '' }
    dialogVisible.value = true
}

function resetForm() {
    editingMember.value = null
}

async function submitForm() {
    if (!form.value.name.trim()) return
    try {
        await crudAction('member', 'add', {
            name: form.value.name.trim(),
            email: form.value.email || '',
            phone: form.value.phone || '',
            role: form.value.role || 'Developer',
            avatar: form.value.avatar || ''
        })
        dialogVisible.value = false
        await load()
    } catch (e) {
        errorMessage.value = e.message
    }
}

// 删除
async function deleteMembers() {
    if (selectedMembers.value.length === 0) return
    const names = selectedMembers.value.map(m => m.name).join(', ')
    if (!confirm(t('members.deleteConfirm', { names }))) return
    try {
        await crudAction('member', 'delete', { ids: selectedMembers.value.map(m => m.id) })
        selectedMembers.value = []
        await load()
    } catch (e) {
        errorMessage.value = e.message
    }
}

// 成员详情抽屉
const drawerVisible = ref(false)
const selectedMember = ref(null)
const detailTasks = ref([])
const detailProjects = ref([])
const ownedProjects = ref([])
const detailLoading = ref(false)
const availabilityItems = ref([])
const availabilityDraft = ref({ name: '', start_date: '', end_date: '' })
const canAddAvailability = computed(
    () =>
        availabilityDraft.value.start_date &&
        availabilityDraft.value.end_date &&
        availabilityDraft.value.start_date <= availabilityDraft.value.end_date
)

async function persistAvailability(items) {
    if (!selectedMember.value) return
    await crudAction('member', 'update', {
        id: selectedMember.value.id,
        availability_exceptions: JSON.stringify(items)
    })
    availabilityItems.value = items
    await loadMembers({ force: true })
    selectedMember.value =
        members.value.find(item => item.id === selectedMember.value.id) || selectedMember.value
}

async function addAvailability() {
    if (!canAddAvailability.value) return
    const next = [
        ...availabilityItems.value,
        {
            name: availabilityDraft.value.name.trim(),
            start_date: availabilityDraft.value.start_date,
            end_date: availabilityDraft.value.end_date,
            type: 'leave'
        }
    ].sort((left, right) => left.start_date.localeCompare(right.start_date))
    try {
        await persistAvailability(next)
        availabilityDraft.value = { name: '', start_date: '', end_date: '' }
    } catch (error) {
        errorMessage.value = error.message
    }
}

async function removeAvailability(index) {
    try {
        await persistAvailability(
            availabilityItems.value.filter((_, itemIndex) => itemIndex !== index)
        )
    } catch (error) {
        errorMessage.value = error.message
    }
}

function statusPillClass(status) {
    const map = { Pending: 'pill-draft', InProgress: 'pill-inprogress', Done: 'pill-done' }
    return map[status] || 'pill-draft'
}

async function openDetail(member) {
    selectedMember.value = member
    availabilityItems.value = parseAvailabilityExceptions(member)
    availabilityDraft.value = { name: '', start_date: '', end_date: '' }
    drawerVisible.value = true
    detailLoading.value = true
    detailTasks.value = []
    detailProjects.value = []
    ownedProjects.value = []
    try {
        const [taskRes, pmRes, projectRes] = await Promise.all([
            crudAction('task', 'get_all', { assignee: member.id, pageSize: 1000 }),
            crudAction('project_member', 'get_by_member', { memberId: member.id }),
            crudAction('project', 'get_all', { pageIndex: 1, pageSize: 1000 })
        ])
        detailTasks.value = taskRes?.list || []
        detailProjects.value = pmRes?.list || []
        ownedProjects.value = (projectRes?.list || []).filter(p => p.owner === member.id)
    } catch (e) {
        errorMessage.value = e.message
    } finally {
        detailLoading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.members-page {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1rem;
    height: calc(100vh - 88px - var(--window-titlebar-height, 0px));
    overflow: hidden;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex: 0 0 auto;
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

/* 统计卡片 */
.stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--page-gap);
    flex: 0 0 auto;
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
.stat-icon {
    display: grid;
    place-items: center;
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    border-radius: var(--stat-icon-radius);
    font-size: var(--stat-icon-font);
    flex-shrink: 0;
}
.stat-icon.total {
    color: #1d4ed8;
    background: #dbeafe;
}
.stat-icon.role {
    color: #7c3aed;
    background: #ede9fe;
}
.stat-icon.dev {
    color: #16a34a;
    background: #dcfce7;
}
.stat-icon.other {
    color: #ea580c;
    background: #ffedd5;
}
.stat-card div {
    display: flex;
    flex-direction: column;
}
.stat-card strong {
    font-size: var(--stat-num-size);
    line-height: 1.2;
}
.stat-card small {
    color: var(--color-text-secondary);
    font-size: var(--stat-label-size);
}

/* 表格 */
.table-card {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
:deep(.workspace-table) {
    height: 100%;
}

/* 成员名称 */
.member-name-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.avatar-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
}
.member-name {
    font-weight: 600;
}
.email-link {
    color: var(--color-primary);
    text-decoration: none;
}
.email-link:hover {
    text-decoration: underline;
}
.text-muted {
    color: var(--color-text-secondary);
}

/* 角色标签 */
.role-pill {
    display: inline-block;
    white-space: nowrap;
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
}
.role-manager {
    background: #dbeafe;
    color: #1d4ed8;
}
.role-developer {
    background: #dcfce7;
    color: #166534;
}
.role-designer {
    background: #fce7f3;
    color: #9d174d;
}
.role-qa {
    background: #fef3c7;
    color: #92400e;
}
.role-pm {
    background: #e0e7ff;
    color: #3730a3;
}
.role-devops {
    background: #e0f2fe;
    color: #075985;
}
.role-other {
    background: #f1f5f9;
    color: #475569;
}

/* 对话框 */
.dialog-form {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}
.dialog-form label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-secondary);
}
.dialog-form .required {
    color: #ef4444;
}
.w-full {
    width: 100%;
}

.error-banner {
    padding: 0.7rem 1rem;
    border-radius: var(--radius-md);
    color: var(--color-error-text);
    background: var(--color-error-bg);
    font-size: 0.85rem;
    flex: 0 0 auto;
    margin: 0;
}

/* 成员名称可点击 */
.member-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
}
.member-trigger:hover .member-name {
    color: var(--color-primary);
    text-decoration: underline;
}

/* 成员详情抽屉 */
.member-detail {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}
.detail-head {
    display: flex;
    align-items: center;
    gap: 0.85rem;
}
.detail-avatar {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 1.2rem;
    font-weight: 700;
    flex-shrink: 0;
}
.detail-head-info {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}
.detail-head-info strong {
    font-size: 1.1rem;
}
.detail-email {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
}
.detail-section h4 {
    margin: 0 0 0.6rem;
    font-size: 0.9rem;
    color: var(--color-text-secondary);
}
.detail-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.4rem;
}
.detail-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
    font-size: 0.82rem;
}
.d-task-name {
    flex: 1 1 auto;
    font-weight: 500;
}
.d-proj-name {
    flex: 1 1 auto;
    font-weight: 500;
}
.d-pm-role {
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    background: var(--color-subtle);
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
}
.d-proj-status {
    font-size: 0.72rem;
    color: var(--color-text-secondary);
}
.detail-empty {
    margin: 0;
    font-size: 0.82rem;
    color: var(--color-text-muted);
}
.detail-section-title {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
}
.detail-section-title h4 {
    margin: 0;
}
.detail-section-title span {
    color: var(--color-text-muted);
    font-size: 0.72rem;
    text-align: right;
}
.availability-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.5rem;
    align-items: center;
}
.availability-form > :deep(.p-inputtext),
.availability-form > :deep(.p-button) {
    grid-column: 1 / -1;
    width: 100%;
}
.availability-form > input[type='date'] {
    min-width: 0;
    padding: 0.55rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface-raised);
}
.availability-form > span {
    display: none;
}
.availability-list {
    display: grid;
    gap: 0.4rem;
    padding: 0;
    margin: 0.7rem 0 0;
    list-style: none;
}
.availability-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.55rem 0.7rem;
    border-radius: var(--radius-md);
    color: #9a3412;
    background: #fff7ed;
    font-size: 0.78rem;
}
.availability-list li span,
.availability-list li strong {
    display: block;
}
.availability-list button {
    border: 0;
    color: #c2410c;
    background: transparent;
    cursor: pointer;
}

@media (max-width: 900px) {
    .members-page {
        padding: 1rem;
    }
    .page-header {
        flex-direction: column;
    }
    .stats-row {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>
