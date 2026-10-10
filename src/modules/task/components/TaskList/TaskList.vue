<template>
    <section class="panel" :class="{ embedded, 'workspace-page': !embedded }">
        <!-- 非嵌入模式的头部和统计 -->
        <template v-if="!embedded">
            <header class="task-page-header workspace-heading">
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

            <div class="task-stats workspace-stats">
                <div class="tstat-card">
                    <span class="tstat-icon total"><i class="pi pi-list"></i></span>
                    <div>
                        <strong>{{ taskStats.total }}</strong
                        ><small>{{ $t('tasks.total') }}</small>
                    </div>
                </div>
                <div class="tstat-card">
                    <span class="tstat-icon progress"><i class="pi pi-play-circle"></i></span>
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

            <div class="filter-card workspace-toolbar">
                <div class="filter-bar">
                    <div class="clearable-search">
                        <InputText
                            v-model="keywordInput"
                            :placeholder="$t('tasks.searchPlaceholder')"
                            @keyup.enter="applySearch"
                        />
                        <Button
                            v-if="keywordInput"
                            icon="pi pi-times"
                            text
                            rounded
                            :aria-label="$t('tasks.clearSearch')"
                            @click="clearSearch"
                        />
                    </div>
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
                    <MultiSelect
                        v-model="selectedColumns"
                        :options="columnOptions"
                        optionLabel="label"
                        optionValue="value"
                        :placeholder="$t('tasks.chooseColumns')"
                        :aria-label="$t('tasks.chooseColumns')"
                        :maxSelectedLabels="0"
                        :selectedItemsLabel="$t('tasks.selectedColumns', { count: '{0}' })"
                        class="column-picker"
                    />
                    <Button
                        icon="pi pi-refresh"
                        :title="$t('tasks.resetColumns')"
                        :aria-label="$t('tasks.resetColumns')"
                        text
                        @click="selectedColumns = [...defaultColumns]"
                    />
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
                    <div class="clearable-search embedded-search">
                        <InputText
                            v-model="keywordInput"
                            :placeholder="$t('tasks.searchTasks')"
                            @keyup.enter="applySearch"
                        />
                        <Button
                            v-if="keywordInput"
                            icon="pi pi-times"
                            text
                            rounded
                            :aria-label="$t('tasks.clearSearch')"
                            @click="clearSearch"
                        />
                    </div>
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
        <div v-if="embedded" class="column-toolbar">
            <span>{{ $t('tasks.columnHint') }}</span>
            <MultiSelect
                v-model="selectedColumns"
                :options="columnOptions"
                optionLabel="label"
                optionValue="value"
                :placeholder="$t('tasks.chooseColumns')"
                :aria-label="$t('tasks.chooseColumns')"
                :maxSelectedLabels="0"
                :selectedItemsLabel="$t('tasks.selectedColumns', { count: '{0}' })"
                class="column-picker"
            />
            <Button
                :label="$t('tasks.resetColumns')"
                text
                size="small"
                @click="selectedColumns = [...defaultColumns]"
            />
        </div>
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
                :loading="showLoading"
                :aria-busy="loading"
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
                    table: {
                        style: `table-layout: fixed; width: ${tableWidth}rem; min-width: 100%`
                    },
                    mask: { style: 'background: transparent' },
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
                    style="width: 3.5rem; min-width: 3.5rem"
                />
                <Column
                    field="name"
                    :header="$t('tasks.columnName')"
                    frozen
                    alignFrozen="left"
                    :style="columnStyle('name')"
                    class="name-column"
                >
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
                            <span class="task-name-text" :title="data.name">{{ data.name }}</span>
                        </div>
                    </template>
                </Column>
                <Column
                    v-if="!embedded && columnVisible('project_id')"
                    field="project_id"
                    :header="$t('tasks.columnProject')"
                    :style="columnStyle('project_id')"
                >
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
                        <span class="cell-ellipsis" :title="getProjectName(data.project_id)">{{
                            getProjectName(data.project_id)
                        }}</span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('parent')"
                    field="parent"
                    :header="$t('tasks.columnParent')"
                    :style="columnStyle('parent')"
                >
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
                        <span class="cell-ellipsis" :title="getTaskName(data.parent)">{{
                            getTaskName(data.parent) || '-'
                        }}</span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('_predecessorIds')"
                    field="_predecessorIds"
                    :header="$t('tasks.columnPredecessors')"
                    :style="columnStyle('_predecessorIds')"
                >
                    <template #editor="{ data, field }">
                        <MultiSelect
                            :modelValue="data[field] || []"
                            @update:modelValue="data[field] = $event || []"
                            :options="dependencyOptions(data)"
                            optionLabel="name"
                            optionValue="id"
                            :placeholder="$t('tasks.noPredecessors')"
                            :aria-label="$t('tasks.columnPredecessors')"
                            filter
                            showClear
                            fluid
                            :maxSelectedLabels="1"
                        />
                    </template>
                    <template #body="{ data }"
                        ><span
                            class="cell-ellipsis"
                            :title="dependencyNames(data._predecessorIds)"
                            >{{ dependencyNames(data._predecessorIds) || '-' }}</span
                        ></template
                    >
                </Column>
                <Column
                    v-if="columnVisible('start_time')"
                    field="start_time"
                    :header="$t('tasks.columnStart')"
                    :style="columnStyle('start_time')"
                >
                    <template #editor="{ data, field }">
                        <DateTimePickerString
                            v-model="data[field]"
                            :placeholder="$t('tasks.selectStart')"
                            @update:model-value="recalculateEnd(data)"
                        />
                    </template>
                    <template #body="{ data }">
                        <span class="cell-ellipsis" :title="data.start_time">{{
                            formatDisplayDate(data.start_time)
                        }}</span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('effort_days')"
                    field="effort_days"
                    :header="$t('tasks.columnEffort')"
                    :style="columnStyle('effort_days')"
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
                    v-if="columnVisible('schedule_mode')"
                    field="schedule_mode"
                    :header="$t('tasks.columnScheduleMode')"
                    :style="columnStyle('schedule_mode')"
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
                <Column
                    v-if="columnVisible('end_time')"
                    field="end_time"
                    :header="$t('tasks.columnEnd')"
                    :style="columnStyle('end_time')"
                >
                    <template #editor="{ data, field }">
                        <DateTimePickerString
                            v-model="data[field]"
                            :placeholder="$t('tasks.selectEnd')"
                            @update:model-value="recalculateEffort(data)"
                        />
                    </template>
                    <template #body="{ data }">
                        <span class="cell-ellipsis" :title="data.end_time">{{
                            formatDisplayDate(data.end_time)
                        }}</span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('type')"
                    field="type"
                    :header="$t('tasks.columnType')"
                    :style="columnStyle('type')"
                >
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
                <Column
                    v-if="columnVisible('priority')"
                    field="priority"
                    :header="$t('tasks.columnPriority')"
                    :style="columnStyle('priority')"
                >
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
                    <template #body="{ data }">
                        <span :class="['priority-badge', priorityClass(data.priority)]">
                            {{ getPriorityLabel(data.priority) || '-' }}
                        </span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('status')"
                    field="status"
                    :header="$t('tasks.columnStatus')"
                    :style="columnStyle('status')"
                >
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
                            {{ taskStatusLabel(data.status) }}
                        </span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('progress')"
                    field="progress"
                    :header="$t('tasks.columnProgress')"
                    :style="columnStyle('progress')"
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
                <Column
                    v-if="columnVisible('comment')"
                    field="comment"
                    :header="$t('tasks.columnComment')"
                    :style="columnStyle('comment')"
                >
                    <template #editor="{ data, field }">
                        <InputText v-model="data[field]" />
                    </template>
                    <template #body="{ data }"
                        ><span class="cell-ellipsis" :title="data.comment">{{
                            data.comment || '-'
                        }}</span></template
                    >
                </Column>
                <Column
                    v-if="columnVisible('assignee')"
                    field="assignee"
                    :header="$t('tasks.columnAssignee')"
                    :style="columnStyle('assignee')"
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
                            <span class="cell-ellipsis" :title="memberMap[data.assignee].name">{{
                                memberMap[data.assignee].name
                            }}</span>
                        </span>
                        <span v-else class="no-value">{{
                            data.assignee || $t('common.unassigned')
                        }}</span>
                    </template>
                </Column>
                <Column
                    v-if="columnVisible('order')"
                    :header="$t('tasks.columnOrder')"
                    :style="columnStyle('order')"
                >
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
                    style="width: 5rem; min-width: 5rem"
                    body-style="text-align:center"
                ></Column>
            </DataTable>
        </div>
        <Dialog
            v-model:visible="deleteDialogVisible"
            modal
            :header="$t('tasks.deleteTitle')"
            :style="{ width: '28rem', maxWidth: 'calc(100vw - 2rem)' }"
            :closable="!deleting"
            :closeOnEscape="!deleting"
            :draggable="false"
        >
            <p>{{ deleteMessage }}</p>
            <template #footer>
                <Button
                    :label="$t('common.cancel')"
                    text
                    :disabled="deleting"
                    @click="deleteDialogVisible = false"
                />
                <Button
                    :label="$t('common.delete')"
                    icon="pi pi-trash"
                    severity="danger"
                    :loading="deleting"
                    @click="confirmDeleteTask"
                />
            </template>
        </Dialog>
    </section>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Dialog from 'primevue/dialog'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../../api'
import DateTimePickerString from './components/DateTimePickerString.vue'
import MemberSelect from '../../../member/components/MemberSelect.vue'
import { useMembers } from '../../../../composables/useMembers'
import { useTaskReordering } from '../../composables/useTaskReordering.js'
import { useTaskListQuery } from '../../composables/useTaskListQuery.js'
import { useDelayedBusy } from '../../../../composables/useDelayedBusy.js'
import {
    defaultTaskColumns,
    taskColumnWidths,
    readTaskColumns,
    normalizeTaskColumns
} from '../../utils/taskColumns.js'
import { useTaskRowEditor } from '../../composables/useTaskRowEditor.js'
import { avatarBg, avatarInitial } from '../../../../composables/useAvatar'
import {
    calculateEndDate,
    countWorkingDays,
    dateKey
} from '../../../calendar/utils/workCalendar.js'
import { calculateDependencySchedule } from '../../../calendar/utils/scheduling.js'
import { flattenTaskTree, getParentOptions } from '../../utils/taskTree.js'

const props = defineProps({
    initialProjectId: { type: String, default: '' },
    embedded: { type: Boolean, default: false }
})

const { t, locale } = useI18n()
const {
    tasks,
    dependencies,
    relatedTasks,
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
    clearSearch,
    onPage
} = useTaskListQuery(props.initialProjectId)

const showLoading = useDelayedBusy(loading)
const columnStorageKey = props.embedded
    ? 'easyproject-task-columns-embedded-v1'
    : 'easyproject-task-columns-global-v1'
const applicableColumn = key => !props.embedded || key !== 'project_id'
const defaultColumns = defaultTaskColumns.filter(applicableColumn)
const selectedColumns = ref(
    readTaskColumns(localStorage, columnStorageKey).filter(applicableColumn)
)
const columnLabels = {
    project_id: 'columnProject',
    parent: 'columnParent',
    _predecessorIds: 'columnPredecessors',
    start_time: 'columnStart',
    effort_days: 'columnEffort',
    schedule_mode: 'columnScheduleMode',
    end_time: 'columnEnd',
    type: 'columnType',
    priority: 'columnPriority',
    status: 'columnStatus',
    progress: 'columnProgress',
    comment: 'columnComment',
    assignee: 'columnAssignee',
    order: 'columnOrder'
}
const columnOptions = computed(() =>
    Object.entries(columnLabels)
        .filter(([key]) => !props.embedded || key !== 'project_id')
        .map(([value, key]) => ({ value, label: t(`tasks.${key}`) }))
)
function columnVisible(key) {
    return editingRows.value.length > 0 || selectedColumns.value.includes(key)
}
function columnStyle(key) {
    return { width: `${taskColumnWidths[key]}rem`, minWidth: `${taskColumnWidths[key]}rem` }
}
const tableWidth = computed(
    () =>
        22.5 +
        columnOptions.value
            .filter(option => columnVisible(option.value))
            .reduce((sum, option) => sum + taskColumnWidths[option.value], 0)
)
watch(
    selectedColumns,
    value => {
        try {
            localStorage.setItem(columnStorageKey, JSON.stringify(normalizeTaskColumns(value)))
        } catch {
            /* Column preferences are optional when local storage is unavailable. */
        }
    },
    { deep: true }
)

const deleteDialogVisible = ref(false)
const deleting = ref(false)
const pendingDeleteTasks = ref([])
const deleteMessage = computed(() =>
    pendingDeleteTasks.value.length === 1
        ? t('tasks.deleteOne', { name: pendingDeleteTasks.value[0].name })
        : t('tasks.deleteMany', {
              count: pendingDeleteTasks.value.length,
              name: pendingDeleteTasks.value[0]?.name || ''
          })
)

function formatDisplayDate(value) {
    if (!value) return '-'
    const date = new Date(String(value).replace(' ', 'T'))
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(locale.value, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date)
}

const expandedTaskIds = ref(new Set())
const projects = ref([])
const successMessage = ref('')
const { memberMap, loadMembers } = useMembers()
const { editingRows, activeEditingId, onRowEditInit, onRowEditCancel, onRowEditSave } =
    useTaskRowEditor({
        tasks,
        errorMessage,
        successMessage,
        initChecked,
        applyAutoSchedule,
        loadTeamMemberIds,
        t
    })
const teamMemberIdsByProject = ref({})
const embedded = computed(() => props.embedded)
const scheduleModes = computed(() => [
    { label: t('tasks.fixedEffort'), value: 'fixed_effort' },
    { label: t('tasks.fixedDates'), value: 'fixed_dates' }
])

const { dragOverId, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, canMove, moveTask } =
    useTaskReordering({
        tasks,
        reload: initChecked,
        loading,
        errorMessage,
        successMessage,
        t
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

function taskStatusLabel(status) {
    return taskStatus.value.find(item => item.value === status)?.label || status || '-'
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
    return (
        [...tasks.value, ...relatedTasks.value].find(task => task.id === taskId)?.name ||
        taskId ||
        ''
    )
}

function parentOptions(task) {
    return getParentOptions(relatedTasks.value, task)
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
    if (result.updates.length) await initChecked()
    return result
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
    return relatedTasks.value.filter(
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
        data: newRow
    }
    onRowEditInit(event)
}

function deleteTask() {
    if (!selectedTasks.value.length || deleting.value) return
    pendingDeleteTasks.value = selectedTasks.value.map(task => ({ id: task.id, name: task.name }))
    deleteDialogVisible.value = true
}
async function confirmDeleteTask() {
    if (deleting.value || !pendingDeleteTasks.value.length) return
    deleting.value = true
    errorMessage.value = ''
    try {
        await crudAction('task', 'delete', { ids: pendingDeleteTasks.value.map(task => task.id) })
        deleteDialogVisible.value = false
        pendingDeleteTasks.value = []
        selectedTasks.value = []
        await initChecked()
        successMessage.value = t('tasks.deleted')
    } catch (error) {
        errorMessage.value = error.message
        deleteDialogVisible.value = false
    } finally {
        deleting.value = false
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
    height: calc(100vh - 88px - var(--window-titlebar-height, 0px));
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
    grid-template-columns: minmax(10rem, 1fr) repeat(3, minmax(7rem, 8.5rem)) auto auto 10rem auto;
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
    min-width: 0;
    justify-content: flex-start;
    width: 100%;
    cursor: default;
    position: relative;
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
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
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
.drag-handle,
.tree-toggle {
    flex-shrink: 0;
}
.task-name-text,
.cell-ellipsis {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}
.task-name-text {
    flex: 1 1 auto;
    padding-right: 1.5rem;
}
:deep(.workspace-table td),
:deep(.workspace-table th) {
    text-align: left;
}
:deep(.workspace-table td) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
:deep(.workspace-table td:first-child) {
    overflow: visible;
    text-overflow: clip;
}
:deep(.workspace-table td .p-inputtext),
:deep(.workspace-table td .p-select),
:deep(.workspace-table td .p-multiselect) {
    width: 100%;
    min-width: 0;
}
:deep(.workspace-table .p-select-label),
:deep(.workspace-table .p-multiselect-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.clearable-search {
    position: relative;
    min-width: 0;
}
.clearable-search > :deep(input) {
    width: 100%;
    padding-right: 2.5rem;
}
.clearable-search > :deep(button) {
    position: absolute;
    right: 0.2rem;
    top: 50%;
    transform: translateY(-50%);
    width: 2rem;
    height: 2rem;
}
.column-toolbar {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.65rem;
    flex: 0 0 auto;
}
.column-toolbar > span {
    margin-right: auto;
    font-size: 0.8rem;
    color: var(--color-text-muted);
}
.column-picker {
    width: 11rem;
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
