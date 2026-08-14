<template>
    <section class="panel" :class="{ embedded }">
        <!-- 非嵌入模式的头部和统计 -->
        <template v-if="!embedded">
            <header class="task-page-header">
                <div class="header-info">
                    <span class="eyebrow">{{ $t('tasks.eyebrow') }}</span>
                    <h2>{{ $t('tasks.title') }}</h2>
                    <p>{{ $t('tasks.viewCount', { count: tasks.length }) }}</p>
                </div>
                <div class="toolbar-actions">
                    <Select
                        v-model="selectedProjectId"
                        :options="projects"
                        optionLabel="name"
                        optionValue="id"
                        :placeholder="$t('tasks.allProjects')"
                        showClear
                        class="project-select"
                    />
                    <Button :label="$t('tasks.newTask')" icon="pi pi-plus" @click="addTask" />
                    <Button
                        :label="$t('tasks.delete')"
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        :disabled="selectedTasks.length === 0"
                        @click="deleteTask"
                    />
                </div>
            </header>

            <div class="task-stats">
                <div class="tstat-card">
                    <span class="tstat-icon total"><i class="pi pi-list"></i></span>
                    <div>
                        <strong>{{ taskStats.total }}</strong
                        ><small>{{ $t('tasks.total') }}</small>
                    </div>
                </div>
                <div class="tstat-card">
                    <span class="tstat-icon progress"><i class="pi pi-spin pi-spinner"></i></span>
                    <div>
                        <strong>{{ taskStats.inProgress }}</strong
                        ><small>{{ $t('tasks.inProgress') }}</small>
                    </div>
                </div>
                <div class="tstat-card">
                    <span class="tstat-icon done"><i class="pi pi-check-circle"></i></span>
                    <div>
                        <strong>{{ taskStats.done }}</strong
                        ><small>{{ $t('tasks.done') }}</small>
                    </div>
                </div>
                <div class="tstat-card">
                    <span class="tstat-icon pending"><i class="pi pi-clock"></i></span>
                    <div>
                        <strong>{{ taskStats.pending }}</strong
                        ><small>{{ $t('tasks.pending') }}</small>
                    </div>
                </div>
            </div>

            <div class="filter-card">
                <div class="filter-bar">
                    <InputText
                        v-model="keywordInput"
                        :placeholder="$t('tasks.searchPlaceholder')"
                        @keyup.enter="applySearch"
                    />
                    <Select
                        v-model="statusFilter"
                        :options="taskStatus"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="$t('tasks.allStatuses')"
                        showClear
                    />
                    <Select
                        v-model="priorityFilter"
                        :options="taskPriority"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="$t('tasks.allPriorities')"
                        showClear
                    />
                    <Select
                        v-model="sortBy"
                        :options="sortOptions"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="$t('tasks.sortBy')"
                    />
                    <Button
                        icon="pi pi-search"
                        :label="$t('tasks.searchBtn')"
                        outlined
                        @click="applySearch"
                    />
                    <Button :label="$t('tasks.clearBtn')" text @click="clearFilters" />
                </div>
            </div>
        </template>

        <template v-else>
            <header class="embedded-toolbar">
                <div class="embedded-toolbar-left">
                    <div class="view-summary">
                        <strong>{{ tasks.length }}</strong>
                        <span>{{ $t('tasks.unit') }}</span>
                    </div>
                    <InputText
                        v-model="keywordInput"
                        :placeholder="$t('tasks.searchTasks')"
                        class="embedded-search"
                        @keyup.enter="applySearch"
                    />
                    <Select
                        v-model="statusFilter"
                        :options="taskStatus"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="$t('tasks.status')"
                        showClear
                        class="embedded-filter"
                    />
                    <Select
                        v-model="sortBy"
                        :options="sortOptions"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="$t('tasks.sort')"
                        class="embedded-filter"
                    />
                </div>
                <div class="toolbar-actions">
                    <Button :label="$t('tasks.newTask')" icon="pi pi-plus" @click="addTask" />
                    <Button
                        :label="$t('tasks.delete')"
                        icon="pi pi-trash"
                        severity="danger"
                        outlined
                        :disabled="selectedTasks.length === 0"
                        @click="deleteTask"
                    />
                </div>
            </header>
        </template>
        <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
        <p v-if="successMessage" class="success-banner">{{ successMessage }}</p>
        <p v-if="!loading && projects.length === 0" class="empty-state">
            {{ $t('tasks.emptyState') }}
        </p>
        <div class="table-card">
            <DataTable
                v-model:selection="selectedTasks"
                v-model:editingRows="editingRows"
                :value="visibleTasks"
                :loading="loading"
                stripedRows
                paginator
                :lazy="!selectedProjectId"
                :totalRecords="selectedProjectId ? visibleTasks.length : totalRecords"
                :first="selectedProjectId ? 0 : (pageOption.pageIndex - 1) * pageOption.pageSize"
                scrollable
                scrollHeight="flex"
                :rows="pageOption.pageSize"
                :rows-per-page-options="pageOption.pageOptions"
                editMode="row"
                dataKey="id"
                :pt="{
                    root: { class: 'workspace-table' },
                    table: { style: 'min-width: 115rem' },
                    column: {
                        bodycell: ({ state }) => ({
                            style:
                                state['d_editing'] &&
                                'padding-top: 0.75rem; padding-bottom: 0.75rem'
                        })
                    }
                }"
                @row-edit-init="onRowEditInit"
                @row-edit-save="onRowEditSave"
                @row-edit-cancel="onRowEditCancel"
                @page="onPage"
            >
                <Column
                    selectionMode="multiple"
                    frozen
                    alignFrozen="left"
                    headerStyle="width: 3rem"
                />
                <Column field="name" :header="$t('tasks.columnName')">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" />
                    </template>
                    <template #body="{ data }">
                        <div
                            class="task-tree-name"
                            :class="{ 'drag-over': dragOverId === data.id }"
                            :style="{ paddingLeft: `${data._level * 1.25}rem` }"
                            :draggable="!editingRows.length"
                            @dragstart="onDragStart($event, data)"
                            @dragover.prevent="onDragOver($event, data)"
                            @dragleave="onDragLeave(data)"
                            @drop.prevent="onDrop(data)"
                            @dragend="onDragEnd"
                        >
                            <span class="drag-handle" :title="$t('tasks.dragToReorder')">
                                <i class="pi pi-grip-horizontal"></i>
                            </span>
                            <button
                                v-if="data._hasChildren"
                                class="tree-toggle"
                                :aria-label="
                                    isExpanded(data.id)
                                        ? $t('tasks.collapseTask')
                                        : $t('tasks.expandTask')
                                "
                                @click="toggleTask(data.id)"
                            >
                                <i
                                    :class="
                                        isExpanded(data.id)
                                            ? 'pi pi-chevron-down'
                                            : 'pi pi-chevron-right'
                                    "
                                ></i>
                            </button>
                            <span v-else class="tree-spacer"></span>
                            <span class="task-name-text">{{ data.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column v-if="!embedded" field="project_id" :header="$t('tasks.columnProject')">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="projects"
                            optionLabel="name"
                            optionValue="id"
                            :placeholder="$t('tasks.selectProject')"
                            fluid
                        />
                    </template>
                    <template #body="{ data }">
                        {{ getProjectName(data.project_id) }}
                    </template>
                </Column>
                <Column field="parent" :header="$t('tasks.columnParent')">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="parentOptions(data)"
                            optionLabel="name"
                            optionValue="id"
                            :placeholder="$t('tasks.noParent')"
                            showClear
                            fluid
                        />
                    </template>
                    <template #body="{ data }">
                        {{ getTaskName(data.parent) }}
                    </template>
                </Column>
                <Column
                    field="_predecessorIds"
                    :header="$t('tasks.columnPredecessors')"
                    style="min-width: 14rem"
                >
                    <template #editor="{ data, field }">
                        <select v-model="data[field]" multiple class="dependency-select">
                            <option
                                v-for="candidate in dependencyOptions(data)"
                                :key="candidate.id"
                                :value="candidate.id"
                            >
                                {{ candidate.name }}
                            </option>
                        </select>
                    </template>
                    <template #body="{ data }">{{
                        dependencyNames(data._predecessorIds)
                    }}</template>
                </Column>
                <Column
                    field="start_time"
                    :header="$t('tasks.columnStart')"
                    style="min-width: 14rem"
                >
                    <template #editor="{ data, field }">
                        <DateTimePickerString
                            v-model="data[field]"
                            :placeholder="$t('tasks.selectStart')"
                            @update:model-value="recalculateEnd(data)"
                        />
                    </template>
                    <template #body="{ data }">
                        {{ formatDisplayDate(data.start_time) }}
                    </template>
                </Column>
                <Column
                    field="effort_days"
                    :header="$t('tasks.columnEffort')"
                    style="min-width: 10rem"
                >
                    <template #editor="{ data, field }">
                        <input
                            v-model.number="data[field]"
                            type="number"
                            min="0"
                            step="0.5"
                            class="number-input"
                            :title="$t('tasks.effortHint')"
                            @input="recalculateEnd(data)"
                        />
                    </template>
                    <template #body="{ data }">
                        {{ data.effort_days > 0 ? data.effort_days : '-' }}
                    </template>
                </Column>
                <Column
                    field="schedule_mode"
                    :header="$t('tasks.columnScheduleMode')"
                    style="min-width: 11rem"
                >
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="scheduleModes"
                            optionLabel="label"
                            optionValue="value"
                            fluid
                            @change="recalculateEnd(data)"
                        />
                    </template>
                    <template #body="{ data }">
                        {{ scheduleModeLabel(data.schedule_mode) }}
                    </template>
                </Column>
                <Column field="end_time" :header="$t('tasks.columnEnd')" style="min-width: 14rem">
                    <template #editor="{ data, field }">
                        <DateTimePickerString
                            v-model="data[field]"
                            :placeholder="$t('tasks.selectEnd')"
                            @update:model-value="recalculateEffort(data)"
                        />
                    </template>
                    <template #body="{ data }">
                        {{ formatDisplayDate(data.end_time) }}
                    </template>
                </Column>
                <Column field="type" :header="$t('tasks.columnType')">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="taskTypes"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="$t('tasks.selectType')"
                            showClear
                            fluid
                        />
                    </template>
                </Column>
                <Column field="priority" :header="$t('tasks.columnPriority')">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="taskPriority"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="$t('tasks.selectPriority')"
                            showClear
                            fluid
                        />
                    </template>
                    <template #body="{ data, field }">
                        <span :class="['priority-badge', priorityClass(data[field])]">
                            {{ getPriorityLabel(data[field]) || '-' }}
                        </span>
                    </template>
                </Column>
                <Column field="status" :header="$t('tasks.columnStatus')">
                    <template #editor="{ data, field }">
                        <Select
                            v-model="data[field]"
                            :options="taskStatus"
                            optionLabel="label"
                            optionValue="value"
                            :placeholder="$t('tasks.selectStatus')"
                            showClear
                            fluid
                        />
                    </template>
                    <template #body="{ data }">
                        <span :class="['pill', statusPillClass(data.status)]">
                            <span class="pill-dot"></span>
                            {{ data.status || '-' }}
                        </span>
                    </template>
                </Column>
                <Column
                    field="progress"
                    :header="$t('tasks.columnProgress')"
                    style="min-width: 8rem"
                >
                    <template #editor="{ data, field }">
                        <input
                            v-model.number="data[field]"
                            type="number"
                            min="0"
                            max="100"
                            class="number-input"
                        />
                    </template>
                    <template #body="{ data }">
                        <div class="mini-progress">
                            <span class="mini-progress-bar">
                                <span :style="{ width: `${data.progress || 0}%` }"></span>
                            </span>
                            <small>{{ data.progress || 0 }}%</small>
                        </div>
                    </template>
                </Column>
                <Column field="comment" :header="$t('tasks.columnComment')">
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" />
                    </template>
                </Column>
                <Column
                    field="assignee"
                    :header="$t('tasks.columnAssignee')"
                    style="min-width: 11rem"
                >
                    <template #editor="{ data, field }">
                        <MemberSelect
                            v-model="data[field]"
                            :allowed-member-ids="teamMemberIdsByProject[data.project_id] || null"
                            placeholder="Select assignee"
                        />
                    </template>
                    <template #body="{ data }">
                        <span v-if="memberMap[data.assignee]" class="member-cell">
                            <span
                                class="member-avatar"
                                :style="{ background: avatarBg(memberMap[data.assignee].name) }"
                                >{{ avatarInitial(memberMap[data.assignee].name) }}</span
                            >
                            {{ memberMap[data.assignee].name }}
                        </span>
                        <span v-else class="no-value">{{
                            data.assignee || $t('common.unassigned')
                        }}</span>
                    </template>
                </Column>
                <Column :header="$t('tasks.columnOrder')" style="width: 7rem; min-width: 7rem">
                    <template #body="{ data }">
                        <div class="order-actions">
                            <Button
                                icon="pi pi-arrow-up"
                                text
                                rounded
                                size="small"
                                :aria-label="$t('tasks.moveUp')"
                                :disabled="!canMove(data, -1)"
                                @click="moveTask(data, -1)"
                            />
                            <Button
                                icon="pi pi-arrow-down"
                                text
                                rounded
                                size="small"
                                :aria-label="$t('tasks.moveDown')"
                                :disabled="!canMove(data, 1)"
                                @click="moveTask(data, 1)"
                            />
                        </div>
                    </template>
                </Column>
                <Column
                    :rowEditor="true"
                    frozen
                    alignFrozen="right"
                    style="width: 9rem; min-width: 9rem"
                    body-style="text-align:center"
                ></Column>
            </DataTable>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../../api'
import DateTimePickerString from './components/DateTimePickerString.vue'
import MemberSelect from '../../../member/components/MemberSelect.vue'
import { useMembers } from '../../../../composables/useMembers'
import { avatarBg, avatarInitial } from '../../../../composables/useAvatar'
import {
    calculateEndDate,
    countWorkingDays,
    dateKey
} from '../../../calendar/utils/workCalendar.js'
import { calculateDependencySchedule } from '../../../calendar/utils/scheduling.js'
import {
    canMoveTask,
    flattenTaskTree,
    getParentOptions,
    getTaskSiblings
} from '../../utils/taskTree.js'

const props = defineProps({
    initialProjectId: { type: String, default: '' },
    embedded: { type: Boolean, default: false }
})

const { t, locale } = useI18n()

function formatDisplayDate(value) {
    if (!value) return '-'
    const date = new Date(String(value).replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(locale.value, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}

const tasks = ref([])
const expandedTaskIds = ref(new Set())
const projects = ref([])
const { memberMap, loadMembers } = useMembers()
const selectedProjectId = ref(props.initialProjectId)
const selectedTasks = ref([])
const editingRows = ref([])
const editingCache = ref({})
const activeEditingId = ref('')
const teamMemberIdsByProject = ref({})
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const totalRecords = ref(0)
const dependencies = ref([])
const keywordInput = ref('')
const appliedKeyword = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const sortBy = ref('sort_order')
const embedded = computed(() => props.embedded)
const scheduleModes = computed(() => [
    { label: t('tasks.fixedEffort'), value: 'fixed_effort' },
    { label: t('tasks.fixedDates'), value: 'fixed_dates' }
])

// 拖拽排序状态
const draggingTask = ref(null)
const dragOverId = ref(null)

function getSiblings(task) {
    const parentId = task.parent
    return visibleTasks.value.filter(t => t.parent === parentId && t.project_id === task.project_id)
}

function onDragStart(event, task) {
    draggingTask.value = task
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
}

function onDragOver(event, task) {
    if (!draggingTask.value || draggingTask.value.id === task.id) return
    if (draggingTask.value.parent !== task.parent) return
    if (draggingTask.value.project_id !== task.project_id) return
    event.dataTransfer.dropEffect = 'move'
    dragOverId.value = task.id
}

function onDragLeave(task) {
    if (dragOverId.value === task.id) dragOverId.value = null
}

async function onDrop(targetTask) {
    dragOverId.value = null
    if (!draggingTask.value || draggingTask.value.id === targetTask.id) return
    if (draggingTask.value.parent !== targetTask.parent) return

    const src = draggingTask.value
    loading.value = true
    errorMessage.value = ''
    try {
        await Promise.all([
            crudAction('task', 'update', { id: src.id, sort_order: targetTask.sort_order }),
            crudAction('task', 'update', { id: targetTask.id, sort_order: src.sort_order })
        ])
        await init()
        successMessage.value = t('tasks.reordered', { name: src.name })
    } catch (error) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
        draggingTask.value = null
    }
}

function onDragEnd() {
    draggingTask.value = null
    dragOverId.value = null
}

const pageOption = reactive({
    pageIndex: 1,
    pageSize: 20,
    pageOptions: [20, 50, 100],
    fetchSize: 1000
})

const newTask = ref({
    name: '',
    project_id: '',
    parent: '',
    dependence: '',
    start_time: '',
    end_time: '',
    type: '',
    priority: '',
    status: '',
    progress: 0,
    effort_days: 0,
    schedule_mode: 'fixed_effort',
    comment: '',
    assignee: ''
})

// 固定
const taskTypes = computed(() => [
    { label: t('tasks.typeTask'), value: 'Task' },
    { label: t('tasks.typeMilestone'), value: 'Milestone' },
    { label: t('tasks.typeFile'), value: 'File' }
])

// 可编辑/远端请求
const taskStatus = computed(() => [
    { label: t('tasks.statusPending'), value: 'Pending' },
    { label: t('tasks.statusInProgress'), value: 'InProgress' },
    { label: t('tasks.statusDone'), value: 'Done' }
])

// 可编辑/远端请求
const taskPriority = computed(() => [
    { label: t('tasks.p5'), value: '5' },
    { label: t('tasks.p4'), value: '4' },
    { label: t('tasks.p3'), value: '3' },
    { label: t('tasks.p2'), value: '2' },
    { label: t('tasks.p1'), value: '1' }
])
const sortOptions = computed(() => [
    { label: t('tasks.sortManual'), value: 'sort_order' },
    { label: t('tasks.sortName'), value: 'name' },
    { label: t('tasks.sortPriority'), value: 'priority' },
    { label: t('tasks.sortStart'), value: 'start_time' },
    { label: t('tasks.sortEnd'), value: 'end_time' },
    { label: t('tasks.sortUpdated'), value: 'update_time' }
])

// 可编辑/远端请求

const getPriorityLabel = value => {
    const match = taskPriority.value.find(p => p.value === value)
    return match ? match.label : value
}

const taskStats = computed(() => ({
    total: tasks.value.length,
    inProgress: tasks.value.filter(t => t.status === 'InProgress').length,
    done: tasks.value.filter(t => t.status === 'Done').length,
    pending: tasks.value.filter(t => t.status === 'Pending').length
}))

function statusPillClass(status) {
    const map = { Pending: 'pill-draft', InProgress: 'pill-inprogress', Done: 'pill-done' }
    return map[status] || 'pill-draft'
}

function priorityClass(priority) {
    return `priority-p${priority || '5'}`
}

const visibleTasks = computed(() => flattenTaskTree(tasks.value, expandedTaskIds.value))

function toggleTask(taskId) {
    const next = new Set(expandedTaskIds.value)
    if (next.has(taskId)) next.delete(taskId)
    else next.add(taskId)
    expandedTaskIds.value = next
}

function isExpanded(taskId) {
    return expandedTaskIds.value.has(taskId)
}

function getTaskName(taskId) {
    return tasks.value.find(task => task.id === taskId)?.name || ''
}

function parentOptions(task) {
    return getParentOptions(tasks.value, task)
}

function taskSiblings(task) {
    return getTaskSiblings(tasks.value, task)
}

function canMove(task, direction) {
    return canMoveTask(tasks.value, task, direction)
}

async function moveTask(task, direction) {
    const siblings = taskSiblings(task)
    const index = siblings.findIndex(candidate => candidate.id === task.id)
    const target = siblings[index + direction]
    if (!target) return

    loading.value = true
    errorMessage.value = ''
    try {
        await Promise.all([
            crudAction('task', 'update', { id: task.id, sort_order: target.sort_order }),
            crudAction('task', 'update', { id: target.id, sort_order: task.sort_order })
        ])
        await init()
        successMessage.value = t('tasks.orderSaved')
    } catch (error) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}

function formatDateToString(date) {
    if (!date) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${d} ${h}:${min}:${s}`
}

function onDateChange(val, data, field) {
    data[field] = val instanceof Date ? formatDateToString(val) : val
}

function recalculateEnd(task) {
    const project = projects.value.find(item => item.id === task.project_id) || {}
    if ((task.schedule_mode || 'fixed_dates') === 'fixed_dates') {
        recalculateEffort(task)
        return
    }
    if (!task.start_time || Number(task.effort_days) <= 0) return
    const end = calculateEndDate(task.start_time, task.effort_days, project)
    if (end) task.end_time = `${dateKey(end)} 00:00:00`
}

function recalculateEffort(task) {
    if ((task.schedule_mode || 'fixed_dates') !== 'fixed_dates') return
    const project = projects.value.find(item => item.id === task.project_id) || {}
    if (task.start_time && task.end_time) {
        task.effort_days = countWorkingDays(task.start_time, task.end_time, project)
    }
}

function scheduleModeLabel(mode) {
    return mode === 'fixed_effort' ? t('tasks.fixedEffort') : t('tasks.fixedDates')
}

async function applyAutoSchedule() {
    if (!selectedProjectId.value) return { updates: [], conflicts: [] }
    const project = projects.value.find(item => item.id === selectedProjectId.value) || {}
    const result = calculateDependencySchedule(tasks.value, dependencies.value, project)
    for (const update of result.updates) {
        await crudAction('task', 'update', update)
    }
    if (result.updates.length) await init()
    return result
}

async function init() {
    loading.value = true
    errorMessage.value = ''
    try {
        const result = await crudAction('task', 'get_all', {
            pageIndex: selectedProjectId.value ? 1 : pageOption.pageIndex,
            pageSize: selectedProjectId.value ? pageOption.fetchSize : pageOption.pageSize,
            projectId: selectedProjectId.value,
            keyword: appliedKeyword.value,
            status: statusFilter.value,
            priority: priorityFilter.value,
            sortBy: sortBy.value,
            sortDirection: sortBy.value === 'update_time' ? 'desc' : 'asc'
        })
        tasks.value = result?.list || []
        totalRecords.value = result?.total || 0
        if (selectedProjectId.value) {
            const dependencyResult = await crudAction('task_dependency', 'get_all', {
                projectId: selectedProjectId.value
            })
            dependencies.value = dependencyResult?.list || []
        } else dependencies.value = []
        tasks.value = tasks.value.map(task => ({
            ...task,
            _predecessorIds: dependencies.value
                .filter(item => item.successor_task_id === task.id)
                .map(item => item.predecessor_task_id)
        }))
    } catch (error) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
}

function resetPageAndLoad() {
    pageOption.pageIndex = 1
    selectedTasks.value = []
    init()
}

function applySearch() {
    appliedKeyword.value = keywordInput.value.trim()
    resetPageAndLoad()
}

function clearFilters() {
    keywordInput.value = ''
    appliedKeyword.value = ''
    statusFilter.value = ''
    priorityFilter.value = ''
    sortBy.value = 'sort_order'
    resetPageAndLoad()
}

function onPage(event) {
    if (selectedProjectId.value) return
    pageOption.pageIndex = event.page + 1
    pageOption.pageSize = event.rows
    init()
}

async function loadProjects() {
    const result = await crudAction('project', 'get_all', { pageIndex: 1, pageSize: 100 })
    projects.value = result?.list || []
}

async function loadTeamMemberIds(projectId) {
    if (!projectId || Object.hasOwn(teamMemberIdsByProject.value, projectId)) return
    const result = await crudAction('project_member', 'get_by_project', { projectId })
    teamMemberIdsByProject.value = {
        ...teamMemberIdsByProject.value,
        [projectId]: (result?.list || []).map(item => item.member_id)
    }
}

function getProjectName(projectId) {
    return projects.value.find(project => project.id === projectId)?.name || 'Unassigned'
}

function dependencyOptions(task) {
    return tasks.value.filter(
        candidate => candidate.project_id === task.project_id && candidate.id !== task.id
    )
}

function dependencyNames(ids = []) {
    return ids.map(getTaskName).filter(Boolean).join(', ')
}

async function addTask() {
    if (!selectedProjectId.value) {
        errorMessage.value = t('tasks.selectProjectFirst')
        return
    }

    tasks.value = tasks.value.filter(task => !task.id.startsWith('NEWTASK:'))
    const newRow = {
        id: 'NEWTASK:' + Date.now(),
        name: '',
        project_id: selectedProjectId.value,
        parent: '',
        dependence: '',
        _predecessorIds: [],
        start_time: '',
        end_time: '',
        type: '',
        priority: '',
        status: '',
        progress: 0,
        effort_days: 1,
        schedule_mode: 'fixed_effort',
        comment: '',
        assignee: '',
        sort_order: 0
    }

    tasks.value = [newRow, ...tasks.value]

    editingRows.value = [newRow]
    activeEditingId.value = newRow.id
    const event = {
        type: newTask,
        data: newRow
    }
    onRowEditInit(event)
}

async function saveTask(newTask) {
    const { id, ...payload } = newTask
    delete payload._predecessorIds
    return crudAction('task', 'add', payload)
}

async function onRowEditSave(event) {
    const { newData } = event
    const oldData = editingCache.value[newData.id] || {}
    const changedFields = {}

    if (newData.name == '') {
        alert(t('tasks.nameEmpty'))
        editingRows.value = [newData]
        return
    }
    if (!newData.project_id) {
        errorMessage.value = t('tasks.mustBelong')
        editingRows.value = [newData]
        return
    }

    errorMessage.value = ''
    try {
        if (newData.id.startsWith('NEWTASK:')) {
            const result = await saveTask(newData)
            await crudAction('task_dependency', 'set_for_task', {
                taskId: result.id,
                predecessorIds: newData._predecessorIds || []
            })
        } else {
            const editableFields = [
                'project_id',
                'name',
                'parent',
                'dependence',
                'start_time',
                'end_time',
                'type',
                'priority',
                'status',
                'progress',
                'effort_days',
                'schedule_mode',
                'comment',
                'assignee',
                'sort_order'
            ]
            for (const key of editableFields) {
                if (newData[key] !== oldData[key]) {
                    changedFields[key] = newData[key] ?? ''
                }
            }

            const dependencyChanged =
                JSON.stringify(newData._predecessorIds || []) !==
                JSON.stringify(oldData._predecessorIds || [])
            if (Object.keys(changedFields).length > 0) {
                changedFields.id = newData.id
                await crudAction('task', 'update', changedFields)
            }
            if (dependencyChanged) {
                await crudAction('task_dependency', 'set_for_task', {
                    taskId: newData.id,
                    predecessorIds: newData._predecessorIds || []
                })
            }
        }

        await init()
        const scheduleResult = await applyAutoSchedule()
        successMessage.value = scheduleResult.updates.length
            ? t('tasks.savedAndScheduled', { count: scheduleResult.updates.length })
            : t('tasks.saved')
        if (scheduleResult.conflicts.length) {
            errorMessage.value = t('tasks.scheduleConflicts', {
                count: scheduleResult.conflicts.length
            })
        }
        activeEditingId.value = ''
    } catch (error) {
        errorMessage.value = error.message
        editingRows.value = [newData]
    }
}

async function onRowEditInit(event) {
    await loadTeamMemberIds(event.data.project_id)
    if (activeEditingId.value.startsWith('NEWTASK:') && activeEditingId.value !== event.data.id) {
        tasks.value = tasks.value.filter(task => task.id !== activeEditingId.value)
    }
    editingRows.value = [event.data]
    activeEditingId.value = event.data.id
    editingCache.value[event.data.id] = JSON.parse(JSON.stringify(event.data))
}

const onRowEditCancel = event => {
    const { newData } = event
    if (newData.id.startsWith('NEWTASK:')) {
        tasks.value = tasks.value.filter(t => t.id !== newData.id)
        delete editingCache.value[newData.id]
        activeEditingId.value = ''
        return
    }
    activeEditingId.value = ''
}

async function deleteTask() {
    const tasks = selectedTasks.value
    const ids = tasks.map(task => task.id)

    if (ids.length == 0) {
        confirm(t('tasks.selectToDelete'))
        return
    } else if (ids.length == 1) {
        if (!confirm(t('tasks.deleteOne', { name: tasks[0].name }))) return
    } else if (ids.length > 1) {
        if (!confirm(t('tasks.deleteMany', { count: ids.length, name: tasks[0].name }))) return
    }
    errorMessage.value = ''
    try {
        await crudAction('task', 'delete', { ids })
        selectedTasks.value = []
        await init()
        successMessage.value = t('tasks.deleted')
    } catch (error) {
        errorMessage.value = error.message
    }
}

watch(selectedProjectId, resetPageAndLoad)
watch(
    () => props.initialProjectId,
    value => {
        selectedProjectId.value = value
    }
)
watch([statusFilter, priorityFilter, sortBy], resetPageAndLoad)

onMounted(async () => {
    loading.value = true
    try {
        await loadProjects()
        await loadMembers()
        await init()
    } catch (error) {
        errorMessage.value = error.message
        loading.value = false
    }
})
</script>

<style scoped>
.panel {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px);
    padding: 1.5rem;
    overflow: hidden;
}
.panel.embedded {
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.view-summary {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    color: var(--color-text-secondary);
    white-space: nowrap;
}
.view-summary strong {
    color: var(--color-text);
    font-size: 1.1rem;
}
.error-banner {
    margin: 0 0 1rem;
    padding: 0.7rem 1rem;
    border-radius: var(--radius-md);
    color: var(--color-error-text);
    background: var(--color-error-bg);
    font-size: 0.85rem;
}
.success-banner {
    margin: 0 0 1rem;
    padding: 0.7rem 1rem;
    border-radius: var(--radius-md);
    color: var(--color-success-text);
    background: var(--color-success-bg);
    font-size: 0.85rem;
}

/* 嵌入模式工具栏 */
.embedded-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex: 0 0 auto;
    margin-bottom: 0.75rem;
    padding: 0.6rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: 0 2px 6px var(--color-card-shadow);
}
.embedded-toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    flex: 1 1 auto;
    min-width: 0;
}
.embedded-search {
    width: min(14rem, 30%);
}
.embedded-filter {
    width: min(8rem, 20%);
}
.project-select {
    width: min(22rem, 45vw);
}
.toolbar-actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
}

/* 任务头部 */
.task-page-header {
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

/* 统计卡片 */
.task-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--page-gap);
    flex: 0 0 auto;
    margin-bottom: 1rem;
}
.tstat-card {
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
.tstat-card:hover {
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}
.tstat-card strong {
    display: block;
    font-size: var(--stat-num-size);
    line-height: 1.2;
}
.tstat-card small {
    color: var(--color-text-secondary);
    font-size: var(--stat-label-size);
}
.tstat-icon {
    display: grid;
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    place-items: center;
    border-radius: var(--stat-icon-radius);
    font-size: var(--stat-icon-font);
    flex-shrink: 0;
}
.tstat-icon.total {
    color: #1d4ed8;
    background: #dbeafe;
}
.tstat-icon.progress {
    color: #c2410c;
    background: #ffedd5;
}
.tstat-icon.done {
    color: #15803d;
    background: #dcfce7;
}
.tstat-icon.pending {
    color: #475569;
    background: #f1f5f9;
}

/* 筛选卡片 */
.filter-card {
    flex: 0 0 auto;
    margin-bottom: 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: 0 2px 6px var(--color-card-shadow);
}
.filter-bar {
    display: grid;
    grid-template-columns: minmax(15rem, 1fr) repeat(3, minmax(9rem, auto)) auto auto;
    gap: 0.65rem;
}
:deep(.workspace-table) {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
}
:deep(.workspace-table .p-datatable-table-container) {
    flex: 1 1 auto;
}
:deep(.workspace-table .p-datatable-column-title) {
    white-space: nowrap;
    word-break: keep-all;
}
:deep(.workspace-table .p-paginator) {
    flex: 0 0 auto;
    border-top: 1px solid var(--color-border);
    background: var(--color-surface);
}
:deep(.p-datepicker) {
    width: 100%;
}
.task-tree-name {
    display: flex;
    align-items: center;
    min-width: 12rem;
    cursor: default;
}
.task-tree-name .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    cursor: grab;
    color: var(--color-text-muted);
    opacity: 0;
    transition: opacity 0.15s ease;
}
.task-tree-name:hover .drag-handle {
    opacity: 1;
}
.task-tree-name .drag-handle:active {
    cursor: grabbing;
}
.task-tree-name.drag-over {
    outline: 2px dashed var(--color-primary);
    outline-offset: -2px;
    background: var(--color-primary-light);
}
.tree-toggle {
    display: grid;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    place-items: center;
    border: 0;
    color: var(--color-text-muted);
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
}
.tree-toggle:hover {
    background: var(--color-subtle-hover);
}
.tree-spacer {
    width: 1.5rem;
}

/* 表格卡片容器 */
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

/* 优先级标签 */
.priority-badge {
    font-weight: 600;
    font-size: 0.8rem;
}

/* 迷你进度条 */
.mini-progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.mini-progress-bar {
    width: 3.5rem;
    height: 0.35rem;
    border-radius: 999px;
    background: var(--color-border);
    overflow: hidden;
}
.mini-progress-bar span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #2563eb, #22c55e);
    transition: width 0.3s ease;
}
.mini-progress small {
    font-size: 0.75rem;
    color: var(--color-text-muted);
}
.no-value {
    color: var(--color-text-muted);
    font-size: 0.85rem;
}
.member-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.member-avatar {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
}

.order-actions {
    display: flex;
}
.dependency-select {
    width: 100%;
    min-height: 5rem;
    padding: 0.35rem;
    border: 1px solid var(--color-border);
    border-radius: 0.45rem;
    color: var(--color-text);
    background: var(--color-surface);
}
.number-input {
    width: 100%;
    padding: 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 0.45rem;
    color: var(--color-text);
    background: var(--color-surface);
}
.empty-state {
    margin: 0 0 1rem;
    padding: 1rem;
    color: var(--color-text-muted);
    background: var(--color-surface);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
}

@media (max-width: 900px) {
    .panel {
        padding: 1rem;
    }
    .task-page-header {
        flex-direction: column;
    }
    .task-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    .filter-bar {
        grid-template-columns: 1fr 1fr;
    }
    .project-select {
        width: auto;
    }
}
</style>
