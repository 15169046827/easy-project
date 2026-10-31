<template>
    <section class="gantt-page" :class="{ embedded }">
        <header class="gantt-toolbar">
            <div v-if="!embedded" class="title-block">
                <span class="eyebrow">{{ $t('gantt.eyebrow') }}</span>
                <h2>{{ $t('gantt.title') }}</h2>
                <p>{{ $t('gantt.subtitle') }}</p>
            </div>
            <div class="actions">
                <Select
                    v-if="!embedded"
                    v-model="projectId"
                    :options="projects"
                    optionLabel="name"
                    optionValue="id"
                    :placeholder="$t('gantt.selectProject')"
                />
                <Button
                    :label="$t('gantt.today')"
                    outlined
                    :disabled="!projectId"
                    @click="scrollToday"
                />
                <Button
                    :label="showCritical ? $t('gantt.criticalOn') : $t('gantt.criticalOff')"
                    :severity="showCritical ? 'danger' : 'secondary'"
                    outlined
                    :disabled="!projectId || !datedTasks.length"
                    :title="
                        showCritical ? $t('gantt.criticalTitleOn') : $t('gantt.criticalTitleOff')
                    "
                    @click="showCritical = !showCritical"
                />
                <Button
                    :label="$t('gantt.saveBaseline')"
                    icon="pi pi-flag"
                    outlined
                    :loading="savingBaseline"
                    :disabled="!projectId || !datedTasks.length"
                    :title="$t('gantt.saveBaselineTitle')"
                    @click="saveBaseline"
                />
                <Button
                    :label="showBaseline ? $t('gantt.showBaselineOn') : $t('gantt.showBaselineOff')"
                    :severity="showBaseline ? 'warn' : 'secondary'"
                    outlined
                    :disabled="!projectId || !baseline.length"
                    :title="
                        showBaseline
                            ? $t('gantt.showBaselineTitleOn')
                            : $t('gantt.showBaselineTitleOff')
                    "
                    @click="showBaseline = !showBaseline"
                />
                <Button
                    icon="pi pi-refresh"
                    outlined
                    :loading="loading"
                    :disabled="!projectId"
                    @click="reload"
                />
                <span class="zoom-badge" :title="$t('gantt.zoomTitle')">🔍 {{ zoomLevel }}</span>
                <Button
                    icon="pi pi-download"
                    outlined
                    :disabled="!projectId || !datedTasks.length"
                    :title="$t('gantt.exportTitle')"
                    @click="exportImage"
                />
            </div>
        </header>

        <p v-if="message" class="gantt-banner" :class="messageType">{{ message }}</p>
        <p v-if="conflictMessage" class="gantt-banner warning">{{ conflictMessage }}</p>
        <p v-if="orderError" class="gantt-banner error">{{ orderError }}</p>

        <div v-if="showBaseline && baseline.length" class="baseline-summary">
            <span
                ><i class="pi pi-flag"></i>
                {{ $t('gantt.baselineSaved', { date: baselineSavedAt }) }}</span
            >
            <span v-if="delayedCount > 0" class="baseline-delayed">
                <i class="pi pi-exclamation-triangle"></i>
                {{ $t('gantt.baselineDelayed', { count: delayedCount }) }}
            </span>
            <span v-else class="baseline-ontrack">
                <i class="pi pi-check-circle"></i> {{ $t('gantt.baselineOnTrack') }}
            </span>
            <Button text severity="secondary" class="baseline-clear" @click="clearBaseline">
                {{ $t('gantt.baselineClear') }}
            </Button>
        </div>

        <div
            v-if="projectId"
            class="scroller-wrap"
            :style="{
                '--name-width': `${nameWidth}px`,
                '--nav-midpoint': `${headerHeight + (rows.length * rowHeight) / 2}px`
            }"
        >
            <Button
                text
                severity="secondary"
                class="timeline-nav timeline-nav-left"
                :title="$t('gantt.scrollLeft')"
                @click="scrollDays(-14)"
            >
                ◀
            </Button>
            <Button
                text
                severity="secondary"
                class="timeline-nav timeline-nav-right"
                :title="$t('gantt.scrollRight')"
                @click="scrollDays(14)"
            >
                ▶
            </Button>
            <div ref="scroller" class="gantt-scroller" @wheel.prevent="onWheel">
                <div
                    class="gantt"
                    :style="{
                        '--dw': `${dayWidth}px`,
                        width: `${nameWidth + days.length * dayWidth}px`,
                        height: `${headerHeight + (rows.length + 1) * rowHeight}px`
                    }"
                >
                    <div class="gantt-header">
                        <!-- 左上角 -->
                        <div class="corner" :style="{ width: `${nameWidth}px` }">
                            <div class="corner-month">{{ $t('gantt.cornerPeriod') }}</div>
                            <div class="corner-day">{{ $t('gantt.cornerTask') }}</div>
                        </div>

                        <!-- 年月行 -->
                        <div class="months-row" :style="{ left: `${nameWidth}px` }">
                            <div
                                v-for="m in months"
                                :key="m.key"
                                class="month-cell"
                                :title="m.label"
                                v-tooltip.top="m.label"
                                :class="{ today: m.containsToday }"
                                :style="{ width: `${m.count * dayWidth}px` }"
                            >
                                {{ m.label }}
                            </div>
                        </div>

                        <!-- 日期行 -->
                        <div class="dates" :style="{ left: `${nameWidth}px` }">
                            <div
                                v-for="day in days"
                                :key="day.key"
                                class="date-cell"
                                :class="{ today: day.today, 'non-working': !day.working }"
                                :title="day.name"
                            >
                                <strong>{{ day.day }}</strong>
                                <small>{{ day.weekday }}</small>
                            </div>
                        </div>
                    </div>

                    <!-- 任务行 -->
                    <div
                        v-for="(task, index) in rows"
                        :key="task.id"
                        class="gantt-row"
                        :data-row-task-id="task.id"
                        :class="{
                            'schedule-conflict': conflictIds.has(task.id),
                            'order-target': dragOverId === task.id,
                            'tree-child': task.level > 0,
                            'row-drag-source': rowGesture?.id === task.id,
                            [`drop-${rowTarget?.position}`]: rowTarget?.id === task.id
                        }"
                        :style="{ top: `${headerHeight + index * rowHeight}px` }"
                    >
                        <div
                            class="task-label"
                            @pointerdown="startRowDrag($event, task)"
                            @keydown.alt.up.prevent="moveTask(task, -1)"
                            @keydown.alt.down.prevent="moveTask(task, 1)"
                            :style="{
                                width: `${nameWidth}px`,
                                paddingLeft: `${12 + task.level * 16}px`
                            }"
                        >
                            <span v-if="task.level" class="tree-branch" aria-hidden="true">└</span>
                            <Button
                                v-if="task.hasChildren"
                                class="tree-toggle"
                                text
                                :icon="
                                    collapsed.has(task.id)
                                        ? 'pi pi-chevron-right'
                                        : 'pi pi-chevron-down'
                                "
                                :aria-label="
                                    collapsed.has(task.id)
                                        ? $t('tasks.expandTask')
                                        : $t('tasks.collapseTask')
                                "
                                :aria-expanded="!collapsed.has(task.id)"
                                @click="toggleTask(task.id)"
                            />
                            <Button
                                text
                                class="task-label-text"
                                :title="task.name"
                                v-tooltip.top="{ value: task.name, class: 'task-content-tooltip' }"
                                @click="!ignoreRowClick() && openEditor(task)"
                            >
                                {{ task.type === 'Milestone' ? '◆ ' : '' }}{{ task.name }}
                            </Button>
                            <span class="date-actions">
                                <Button
                                    text
                                    severity="secondary"
                                    :title="$t('gantt.moveEarlier')"
                                    icon="pi pi-angle-left"
                                    :disabled="task.hasChildren || !parse(task.start_time)"
                                    @click="shift(task, -1)"
                                />
                                <Button
                                    text
                                    severity="secondary"
                                    :title="$t('gantt.moveLater')"
                                    icon="pi pi-angle-right"
                                    :disabled="task.hasChildren || !parse(task.start_time)"
                                    @click="shift(task, 1)"
                                />
                            </span>
                        </div>
                        <div
                            class="row-grid"
                            :style="{ left: `${nameWidth}px` }"
                            @mousedown="onGridMouseDown($event, task, index)"
                        >
                            <span
                                v-for="day in days"
                                :key="day.key"
                                :class="{ today: day.today, 'non-working': !day.working }"
                                :title="day.name"
                            ></span>
                        </div>
                        <div
                            v-if="parse(task.start_time)"
                            class="task-bar"
                            :data-task-id="task.id"
                            :class="{
                                milestone: task.type === 'Milestone',
                                done: isTaskCompleted(task),
                                dragging: dragState?.active && dragState.task.id === task.id,
                                resizing:
                                    dragState?.active &&
                                    dragState.task.id === task.id &&
                                    dragState.mode !== 'move',
                                critical: showCritical && criticalData.critical.has(task.id),
                                'availability-conflict': availabilityInfo(task).conflict
                            }"
                            :style="barStyle(task)"
                            v-tooltip.top="{
                                value:
                                    taskTip(task) +
                                    '\n' +
                                    $t(
                                        task.summary?.has_children
                                            ? 'gantt.barReadOnlyHint'
                                            : 'gantt.barInteractionHint'
                                    ),
                                disabled: Boolean(dragState?.active || createDrag),
                                class: 'task-content-tooltip'
                            }"
                            :aria-label="
                                taskTip(task) +
                                '. ' +
                                $t(
                                    task.summary?.has_children
                                        ? 'gantt.barReadOnlyHint'
                                        : 'gantt.barInteractionHint'
                                )
                            "
                            tabindex="0"
                            @dblclick.stop="onBarEdit(task, $event)"
                            @keydown.enter.prevent="onBarEdit(task, $event)"
                            @mousedown.left="onBarMouseDown(task, $event, 'move')"
                        >
                            <Button
                                text
                                severity="secondary"
                                v-if="task.type !== 'Milestone' && !task.summary?.has_children"
                                type="button"
                                class="resize-handle resize-left"
                                :title="$t('gantt.labelStart')"
                                :aria-label="$t('gantt.labelStart')"
                                @mousedown.stop="onBarMouseDown(task, $event, 'resize-left')"
                            ></Button>
                            <span
                                v-if="task.type !== 'Milestone'"
                                :style="{ width: `${task.progress || 0}%` }"
                            ></span>
                            <em v-if="task.type !== 'Milestone'">
                                <small class="bar-dates">{{ fmtShortRange(task) }}</small>
                                {{ task.progress || 0 }}%
                            </em>
                            <Button
                                text
                                severity="secondary"
                                v-if="task.type !== 'Milestone' && !task.summary?.has_children"
                                type="button"
                                class="resize-handle resize-right"
                                :title="$t('gantt.labelEnd')"
                                :aria-label="$t('gantt.labelEnd')"
                                @mousedown.stop="onBarMouseDown(task, $event, 'resize-right')"
                            ></Button>
                            <span
                                v-if="task.type !== 'Milestone'"
                                class="link-handle"
                                :title="$t('gantt.linkTitle')"
                                @mousedown.stop="startLink(task, $event)"
                            ></span>
                        </div>
                        <div
                            v-if="showBaseline && baselineStyle(task)"
                            class="baseline-bar"
                            :class="{
                                milestone: task.type === 'Milestone',
                                delayed: baselineDelayed(task)
                            }"
                            :style="baselineStyle(task)"
                            :title="baselineTip(task)"
                        ></div>
                    </div>

                    <div
                        class="gantt-row add-task-row"
                        :style="{ top: `${headerHeight + rows.length * rowHeight}px` }"
                    >
                        <div class="task-label" :style="{ width: `${nameWidth}px` }">
                            <Button
                                text
                                icon="pi pi-plus"
                                :aria-label="$t('tasks.newTask')"
                                @click="openCreateEditor()"
                            />
                        </div>
                        <div
                            class="row-grid"
                            :style="{ left: `${nameWidth}px` }"
                            @mousedown="onGridMouseDown($event, null, rows.length)"
                        >
                            <span
                                v-for="day in days"
                                :key="day.key"
                                :class="{ today: day.today, 'non-working': !day.working }"
                            ></span>
                        </div>
                    </div>
                    <Button
                        v-if="pendingSelection"
                        class="pending-schedule"
                        icon="pi pi-plus"
                        :style="pendingStyle"
                        :aria-label="$t('gantt.confirmSchedule')"
                        v-tooltip.top="$t('gantt.confirmSchedule')"
                        @click="confirmPending"
                    />

                    <!-- 依赖连线 -->
                    <div
                        v-if="rowGesture"
                        class="row-drag-ghost"
                        :style="{ left: `${rowGesture.x + 12}px`, top: `${rowGesture.y + 12}px` }"
                    >
                        {{ rowGesture.name }}
                        <small v-if="rowTarget">
                            ·
                            {{
                                $t(
                                    `gantt.drop${rowTarget.position[0].toUpperCase()}${rowTarget.position.slice(1)}`
                                )
                            }}</small
                        >
                    </div>
                    <svg
                        class="dependency-layer"
                        :style="{
                            left: `${nameWidth}px`,
                            width: `${days.length * dayWidth}px`,
                            height: `${headerHeight + rows.length * rowHeight}px`
                        }"
                    >
                        <path
                            v-for="edge in dependencyPaths"
                            :key="edge.id"
                            :class="{ critical: edge.critical }"
                            :d="edge.path"
                        />
                    </svg>

                    <!-- 新建任务预览条 -->
                    <div v-if="createDrag" class="create-preview" :style="createPreviewStyle"></div>

                    <!-- 依赖链接临时线 -->
                    <svg
                        v-if="linking"
                        class="link-temp-layer"
                        :style="{
                            left: `${nameWidth}px`,
                            width: `${days.length * dayWidth}px`,
                            height: `${headerHeight + rows.length * rowHeight}px`
                        }"
                    >
                        <line
                            :x1="linkLine.x1"
                            :y1="linkLine.y1"
                            :x2="linkLine.x2"
                            :y2="linkLine.y2"
                        />
                    </svg>
                </div>
            </div>
        </div>

        <div v-else class="empty">
            <span class="empty-icon"><i class="pi pi-chart-bar"></i></span>
            <strong>{{ projectId ? $t('gantt.emptyNoTasks') : $t('gantt.emptyNoProject') }}</strong>
            <span>{{
                projectId ? $t('gantt.emptyAddDates') : $t('gantt.emptyChooseProject')
            }}</span>
        </div>

        <GanttTaskDialog
            v-model="createForm"
            :projectId="projectId"
            :visible="creatingTask"
            creating
            :saving="savingTask"
            :error="createError"
            :memberIds="projectMemberIds"
            @close="closeCreateEditor"
            @save="saveCreate"
            @recalculate-end="recalculateCreateEnd"
            @recalculate-effort="recalculateCreateEffort"
        />
        <GanttTaskDialog
            v-model="editForm"
            :projectId="projectId"
            :visible="Boolean(editingTask)"
            :memberIds="projectMemberIds"
            @close="closeEditor"
            @save="saveEdit"
            @recalculate-end="recalculateEditEnd"
            @recalculate-effort="recalculateEditEffort"
        />
    </section>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, nextTick, ref, watch } from 'vue'
import { useTaskReordering } from '../../task/composables/useTaskReordering.js'
import { useGanttRowReordering } from '../composables/useGanttRowReordering.js'
import Button from 'primevue/button'
import Select from 'primevue/select'
import GanttTaskDialog from './GanttTaskDialog.vue'
import { isTaskCompleted } from '../../../utils/taskStatus.js'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import MemberSelect from '../../member/components/MemberSelect.vue'
import { usePlanBaseline } from '../composables/usePlanBaseline.js'
import { useGanttCreateEditor } from '../composables/useGanttCreateEditor.js'
import { useGanttEditEditor } from '../composables/useGanttEditEditor.js'
import { useGanttViewport } from '../composables/useGanttViewport.js'
import { useGanttNavigation } from '../composables/useGanttNavigation.js'
import { useGanttTaskDragging } from '../composables/useGanttTaskDragging.js'
import { useGanttDependencyDragging } from '../composables/useGanttDependencyDragging.js'
import { useGanttPresentation } from '../composables/useGanttPresentation.js'
import { useGanttCreationDragging } from '../composables/useGanttCreationDragging.js'
import { useGanttProjectData } from '../composables/useGanttProjectData.js'
import {
    baselineDeviation,
    baselineBarStyle,
    baselineTooltip
} from '../utils/baselinePresentation.js'
import { dateKey } from '../../calendar/utils/workCalendar.js'
import { calculateDependencySchedule } from '../../calendar/utils/scheduling.js'

const { t } = useI18n()
const { members, loadMembers } = useMembers()

const props = defineProps({
    initialProjectId: { type: String, default: '' },
    embedded: { type: Boolean, default: false }
})

const projectId = ref(props.initialProjectId)
const message = ref('')
const messageType = ref('success')
const { projects, tasks, dependencies, projectMemberIds, loading, load, loadChecked } =
    useGanttProjectData({
        projectId,
        message,
        messageType,
        initViewRange: () => initViewRange(),
        loadBaseline: () => loadBaseline()
    })
const embedded = computed(() => props.embedded)
const activeProject = computed(() => projects.value.find(item => item.id === projectId.value) || {})
const scroller = ref(null)
const conflicts = computed(
    () =>
        calculateDependencySchedule(tasks.value, dependencies.value, activeProject.value).conflicts
)
const conflictIds = computed(() => new Set(conflicts.value.map(item => item.taskId)))
const conflictMessage = computed(() =>
    conflicts.value.length
        ? `${t('tasks.scheduleConflicts', { count: conflicts.value.length })}: ${conflicts.value.map(item => tasks.value.find(task => task.id === item.taskId)?.name || item.taskId).join(' / ')}`
        : ''
)
const orderError = ref('')
const orderSuccess = ref('')
const { dragOverId, onDragStart, onDragOver, onDrop, onDragEnd, moveTask } = useTaskReordering({
    tasks,
    reload: loadChecked,
    loading,
    errorMessage: orderError,
    successMessage: orderSuccess,
    t
})
const { startRowDrag, rowGesture, rowTarget, ignoreRowClick } = useGanttRowReordering({
    tasks,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    async onPlace(source, target, placement) {
        if (loading.value) return
        loading.value = true
        orderError.value = ''
        try {
            await crudAction('task', 'update', {
                id: source.id,
                parent: placement.parent,
                order_placement: { target_id: target.id, position: placement.position }
            })
            await loadChecked()
            collapsed.value = new Set([...collapsed.value].filter(id => id !== placement.parent))
        } catch (error) {
            orderError.value = error instanceof Error ? error.message : String(error)
        } finally {
            loading.value = false
        }
    }
})
const {
    creatingTask,
    savingTask,
    createError,
    createForm,
    openCreateEditor,
    recalculateCreateEnd,
    recalculateCreateEffort,
    closeCreateEditor,
    saveCreate
} = useGanttCreateEditor({ projectId, activeProject, message, messageType, load: loadChecked, t })
const {
    editingTask,
    editForm,
    openEditor,
    recalculateEditEnd,
    recalculateEditEffort,
    closeEditor,
    saveEdit
} = useGanttEditEditor({
    activeProject,
    message,
    messageType,
    load: loadChecked,
    applyAutoSchedule,
    t
})
const showCritical = ref(false) // 关键路径高亮开关

// 布局常量
const nameWidth = 280
const rowHeight = 48
const monthHeaderH = 24
const dayHeaderH = 38
const headerHeight = monthHeaderH + dayHeaderH // 62

// 清空消息
function clearMessage() {
    message.value = ''
}

// 手动刷新（带反馈）
async function reload() {
    message.value = ''
    const loaded = await load()
    if (loaded && !message.value) {
        messageType.value = 'success'
        message.value = t('gantt.dataRefreshed')
    }
}

// ---------- 日期工具 ----------
const parse = value => {
    const d = new Date(String(value || '').replace(' ', 'T'))
    return Number.isNaN(d.getTime()) ? null : d
}
const dayStart = date => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const format = date =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 00:00:00`
const viewport = useGanttViewport({ tasks, activeProject, parse, dayStart, t })
const { dayWidth, days, months, zoomLevel, offset, initViewRange } = viewport
const { scrollToday, scrollDays, onWheel } = useGanttNavigation({
    scroller,
    viewport,
    nameWidth,
    message,
    messageType,
    t,
    clearMessage,
    dayStart
})
const { dragState, dragCursorX, onBarMouseDown, onBarEdit } = useGanttTaskDragging({
    scroller,
    viewRange: viewport.viewRange,
    nameWidth,
    headerHeight,
    dayWidth,
    openEditor,
    activeProject,
    parse,
    format,
    message,
    messageType,
    t,
    load: loadChecked,
    applyAutoSchedule
})
const {
    datedTasks,
    rows,
    collapsed,
    toggleTask,
    fmtShortRange,
    barStyle,
    dependencyPaths,
    criticalData,
    availabilityInfo,
    taskTip
} = useGanttPresentation({
    tasks,
    parse,
    dragState,
    dragCursorX,
    dayWidth,
    dayStart,
    nameWidth,
    offset,
    dependencies,
    headerHeight,
    rowHeight,
    showCritical,
    activeProject,
    members,
    t
})

let calendarObserver
async function fillCalendar() {
    await nextTick()
    if (!scroller.value) return
    const needed = Math.ceil((scroller.value.clientWidth - nameWidth) / dayWidth.value)
    if (needed > days.value.length) {
        const end = new Date(viewport.viewRange.value.start)
        end.setDate(end.getDate() + needed - 1)
        viewport.viewRange.value = { ...viewport.viewRange.value, end }
    }
}
watch([scroller, dayWidth, days], fillCalendar)
watch(scroller, element => {
    calendarObserver?.disconnect()
    if (element) {
        calendarObserver = new ResizeObserver(fillCalendar)
        calendarObserver.observe(element)
    }
})
onBeforeUnmount(() => calendarObserver?.disconnect())

// ---------- 计划基线 ----------
const { baseline, showBaseline, savingBaseline, loadBaseline, saveBaseline, clearBaseline } =
    usePlanBaseline({ projectId, datedTasks, message, messageType, t })
const baselineMap = computed(() => new Map(baseline.value.map(entry => [entry.task_id, entry])))
const baselineSavedAt = computed(() => {
    const timestamp = baseline.value[0]?.created_at || ''
    return dateKey(timestamp) || timestamp
})
const baselineInfo = task =>
    baselineDeviation(baselineMap.value.get(task.id), task, activeProject.value, parse)
const delayedCount = computed(
    () => datedTasks.value.filter(task => baselineInfo(task)?.delayed).length
)
const baselineDelayed = task => Boolean(baselineInfo(task)?.delayed)
const baselineStyle = task =>
    baselineBarStyle(baselineMap.value.get(task.id), task, {
        parse,
        offset,
        nameWidth,
        dayWidth: dayWidth.value
    })
const baselineTip = task =>
    baselineTooltip(baselineMap.value.get(task.id), task, baselineInfo(task), t)

async function applyAutoSchedule() {
    const result = calculateDependencySchedule(tasks.value, dependencies.value, activeProject.value)
    for (const update of result.updates) {
        await crudAction('task', 'update', update)
    }
    if (result.updates.length) await loadChecked()
    if (result.conflicts.length) {
        messageType.value = 'warning'
        message.value = '' // The reactive conflict banner includes the current task names.
    }
    return result
}

// ---------- 平移任务日期 ----------
async function shift(task, delta) {
    const start = parse(task.start_time)
    const end = parse(task.end_time)
    if (!start || !end) return
    start.setDate(start.getDate() + delta)
    end.setDate(end.getDate() + delta)
    try {
        await crudAction('task', 'update', {
            id: task.id,
            start_time: format(start),
            end_time: format(end)
        })
        messageType.value = 'success'
        message.value = t('gantt.shifted', { name: task.name, delta })
        await loadChecked()
        await applyAutoSchedule()
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    }
}

const {
    createDrag,
    createPreviewStyle,
    pendingSelection,
    pendingStyle,
    confirmPending,
    onGridMouseDown
} = useGanttCreationDragging({
    scroller,
    viewRange: viewport.viewRange,
    days,
    dayWidth,
    nameWidth,
    headerHeight,
    rows,
    rowHeight,
    confirmSelection(task, start, end) {
        if (!task) return openCreateEditor(start, end)
        openEditor(task)
        editForm.value.start_time = dateKey(start)
        editForm.value.end_time = dateKey(end)
        editForm.value.schedule_mode = 'fixed_dates'
    }
})

const { linking, linkLine, startLink } = useGanttDependencyDragging({
    datedTasks: rows,
    dependencies,
    parse,
    offset,
    dayWidth,
    nameWidth,
    headerHeight,
    rowHeight,
    message,
    messageType,
    load: loadChecked,
    applyAutoSchedule,
    t
})

// ---------- 导出图片 ----------
async function exportImage() {
    if (!scroller.value) return
    const ganttEl = scroller.value.querySelector('.gantt')
    if (!ganttEl) return
    try {
        const { default: html2canvas } = await import('html2canvas')
        const canvas = await html2canvas(ganttEl, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true
        })
        const link = document.createElement('a')
        link.download = `gantt-${projectId.value}-${new Date().toISOString().slice(0, 10)}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        messageType.value = 'success'
        message.value = t('gantt.exported')
        setTimeout(clearMessage, 3000)
    } catch (err) {
        messageType.value = 'error'
        message.value = t('gantt.exportFailed', { msg: err.message })
    }
}

// ---------- 响应式 ----------
watch(projectId, () => {
    clearMessage()
    load()
})
watch(
    () => props.initialProjectId,
    value => {
        if (value) {
            projectId.value = value
        }
    }
)

onMounted(async () => {
    await loadMembers()
    if (props.embedded) {
        await load()
        return
    }
    const p = await crudAction('project', 'get_all', { pageIndex: 1, pageSize: 1000 })
    projects.value = p?.list || []
    projectId.value = projects.value[0]?.id || ''
})
</script>

<style scoped>
.schedule-conflict .task-label {
    box-shadow: inset 4px 0 var(--color-warning-text);
    background: var(--color-warning-bg);
}
.schedule-conflict .task-bar {
    outline: 3px solid var(--color-warning-text);
    outline-offset: 2px;
}
.order-target .task-label {
    outline: 2px dashed var(--color-primary);
}
.task-label > .p-button:not(.task-label-text) {
    flex: 0 0 1.5rem;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
}
.gantt-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px - var(--window-titlebar-height, 0px));
    padding: 1.5rem;
    overflow: hidden;
}
.gantt-page.embedded {
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0;
}
.gantt-page.embedded .gantt-toolbar {
    justify-content: flex-end;
    min-height: 2.7rem;
    margin-bottom: 0.75rem;
    padding: 0.5rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: 0 2px 6px var(--color-card-shadow);
}
.gantt-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex: 0 0 auto;
    margin-bottom: 0.75rem;
}
.gantt-toolbar h2 {
    margin: 0.15rem 0 0;
    font-size: 1.6rem;
    font-weight: 700;
}
.gantt-toolbar p {
    margin: 0.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}
.actions {
    display: flex;
    align-items: center;
    gap: 0.65rem;
}
.actions :deep(.p-select) {
    width: min(22rem, 34vw);
}
.title-block .eyebrow {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}

/* ---------- 缩放标签 ---------- */
.zoom-badge {
    font-size: 0.75rem;
    color: var(--color-text-secondary);
    padding: 0.35rem 0.7rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-subtle);
    white-space: nowrap;
    user-select: none;
}

/* ---------- 滚动容器 ---------- */
.scroller-wrap {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
}
.gantt-scroller {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    overflow-x: auto;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) var(--color-surface);
}
.gantt-scroller::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
.gantt-scroller::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 6px;
}

/* ---------- 时间轴导航按钮 ---------- */
.timeline-nav {
    position: absolute;
    top: min(50%, var(--nav-midpoint));
    z-index: 10;
    width: 36px;
    height: 36px;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    cursor: pointer;
    display: grid;
    place-items: center;
    box-shadow: 0 2px 8px rgb(15 23 42 / 12%);
    transition:
        color 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
    transform: translateY(-50%);
}
.timeline-nav:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
    box-shadow: 0 4px 14px rgb(37 99 235 / 20%);
}
.timeline-nav-left {
    left: calc(var(--name-width) + 8px);
}
.timeline-nav-right {
    right: 8px;
}

/* ---------- 主体 ---------- */
.gantt {
    position: relative;
    min-height: 100%;
}

/* ---------- 左上角 ---------- */
.gantt-header {
    position: sticky;
    top: 0;
    z-index: 8;
    height: 62px;
}
.corner {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 5;
    height: 62px; /* headerHeight */
    background: var(--color-subtle);
    border-right: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
}
.corner-month {
    height: 24px; /* monthHeaderH */
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1px solid var(--color-border);
}
.corner-day {
    height: 38px; /* dayHeaderH */
    display: flex;
    align-items: center;
    padding: 0 14px;
    font-weight: 700;
}

/* ---------- 年月行 ---------- */
.months-row {
    position: absolute;
    top: 0;
    display: flex;
    height: 24px; /* monthHeaderH */
}
.month-cell {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    background: var(--color-subtle);
    border-right: 1px solid var(--color-border);
    box-shadow: inset 0 -1px var(--color-border);
    white-space: nowrap;
    overflow: hidden;
}
.month-cell.today {
    color: var(--color-primary-text);
}

/* ---------- 日期行 ---------- */
.dates {
    position: absolute;
    display: flex;
    top: 24px; /* monthHeaderH */
    height: 38px; /* dayHeaderH */
}
.date-cell {
    width: var(--dw);
    flex: 0 0 var(--dw);
    text-align: center;
    padding: 6px 0;
    border-right: 1px solid var(--color-border);
    background: var(--color-subtle);
    box-shadow: inset 0 -1px var(--color-border);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 26px;
}
.date-cell strong,
.date-cell small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
}
.date-cell strong {
    font-size: 0.85rem;
    font-weight: 600;
}
.date-cell small {
    font-size: 0.62rem;
    color: var(--color-text-secondary);
}
.date-cell.non-working {
    color: var(--color-error-text);
    background: repeating-linear-gradient(
        -45deg,
        var(--color-error-bg),
        var(--color-error-bg) 5px,
        color-mix(in srgb, var(--color-error-bg) 60%, var(--color-surface)) 5px,
        color-mix(in srgb, var(--color-error-bg) 60%, var(--color-surface)) 10px
    );
}
.today {
    background: color-mix(in srgb, var(--color-primary) 16%, var(--color-surface)) !important;
    color: var(--color-primary-text);
}

/* ---------- 任务行 ---------- */
.gantt-row {
    position: absolute;
    left: 0;
    right: 0;
    height: 48px;
    border-top: 1px solid var(--color-border);
}
.task-label {
    position: sticky;
    z-index: 7;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    background: var(--color-surface);
    border-right: 1px solid var(--color-border);
    overflow: hidden;
    box-shadow: 5px 0 12px rgb(15 23 42 / 4%);
}
.task-label-text {
    flex: 1 1 auto;
    min-width: 0;
    display: block;
    text-align: left;
    color: var(--color-text);
    padding: 0 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.875rem;
}
.date-actions {
    display: flex;
    padding-right: 6px;
    flex-shrink: 0;
}
.date-actions button {
    width: 1.55rem;
    height: 1.55rem;
    border: 1px solid #dbeafe;
    border-radius: 0.35rem;
    background: var(--color-surface);
    color: #1d4ed8;
    cursor: pointer;
    font-size: 1rem;
    display: grid;
    place-items: center;
    padding: 0;
    line-height: 1;
}
.date-actions button:hover {
    background: #dbeafe;
}
.row-grid {
    position: absolute;
    display: flex;
    top: 0;
    height: 48px;
}
.row-grid span {
    width: var(--dw);
    flex: 0 0 var(--dw);
    border-right: 1px solid var(--color-border-light);
}
.row-grid span.non-working {
    background: rgb(244 63 94 / 6%);
}

/* ---------- 任务条 ---------- */
.task-bar {
    position: absolute;
    z-index: 2;
    height: 26px;
    min-width: 2px;
    overflow: hidden;
    border: 0;
    border-radius: 5px;
    color: #fff;
    background: #60a5fa;
    box-shadow: 0 3px 8px rgb(37 99 235 / 24%);
    cursor: grab;
    display: flex;
    align-items: center;
    padding: 0 12px;
    transition:
        filter 0.15s ease,
        box-shadow 0.15s ease;
    user-select: none;
}
.task-bar:hover {
    filter: brightness(1.1);
}
.task-bar:active {
    cursor: grabbing;
}
.task-bar > span:not(.link-handle) {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: #2563eb;
    pointer-events: none;
}
.task-bar em {
    position: relative;
    font-size: 0.68rem;
    font-style: normal;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 600;
}
.task-bar em small.bar-dates {
    font-size: 0.6rem;
    font-weight: 400;
    opacity: 0.9;
    white-space: nowrap;
}
.task-bar.done {
    background: #22c55e;
}
.task-bar.done > span:not(.link-handle) {
    background: #166534;
}
.task-bar.milestone {
    width: 16px;
    height: 16px;
    min-width: 16px;
    transform: rotate(45deg);
    border-radius: 2px;
    background: #f59e0b;
    padding: 0;
}
.task-bar.dragging {
    opacity: 0.82;
    box-shadow: 0 6px 18px rgb(37 99 235 / 36%);
    z-index: 6;
}
.task-bar:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.task-bar.dragging .resize-handle {
    display: block;
}

/* ---------- 关键路径 ---------- */
.task-bar.critical {
    background: #ef4444;
    box-shadow: 0 3px 10px rgb(239 68 68 / 36%);
}
.task-bar.critical span {
    background: #b91c1c;
}
.task-bar.critical.milestone {
    background: #ef4444;
}
.task-bar.availability-conflict {
    outline: 3px solid #f97316;
    outline-offset: 2px;
}
.task-bar.availability-conflict::after {
    content: '!';
    position: absolute;
    top: -9px;
    right: -7px;
    display: grid;
    width: 16px;
    height: 16px;
    place-items: center;
    border: 2px solid var(--color-surface);
    border-radius: 50%;
    color: #fff;
    background: #f97316;
    font-size: 0.65rem;
    font-weight: 800;
}
.dependency-layer path.critical {
    stroke: #ef4444;
    stroke-width: 2.4;
}

/* ---------- 计划基线 ---------- */
.baseline-bar {
    position: absolute;
    z-index: 1;
    height: 10px;
    border: 2px dashed #f59e0b;
    border-radius: 3px;
    background: rgb(245 158 11 / 12%);
    pointer-events: auto;
}
.baseline-bar.delayed {
    border-color: #ef4444;
    background: rgb(239 68 68 / 12%);
}
.baseline-bar.milestone {
    width: 14px !important;
    height: 14px !important;
    transform: rotate(45deg);
    border-style: solid;
    background: transparent;
}
.baseline-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 0 0 auto;
    margin-bottom: 0.75rem;
    padding: 0.6rem 0.9rem;
    border-radius: var(--radius-md);
    font-size: 0.82rem;
    color: var(--color-text-secondary);
    background: #fff7ed;
    border: 1px solid #fed7aa;
    flex-wrap: wrap;
}
.baseline-summary i {
    margin-right: 0.3rem;
}
.baseline-delayed {
    color: #b91c1c;
    font-weight: 600;
}
.baseline-ontrack {
    color: #166534;
    font-weight: 600;
}
.baseline-clear {
    margin-left: auto;
    border: 1px solid var(--color-border);
    border-radius: 0.4rem;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    font-size: 0.78rem;
    color: var(--color-text);
    background: var(--color-surface);
}
.baseline-clear:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
}

/* ---------- 拖拽调整手柄 ---------- */
.resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 12px;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: ew-resize;
    z-index: 4;
}
.resize-handle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: rgb(255 255 255 / 85%);
    box-shadow: 0 0 0 1px rgb(15 23 42 / 14%);
    opacity: 0;
    transition: opacity 0.15s;
}
.task-bar:hover .resize-handle::after,
.task-bar.resizing .resize-handle::after,
.resize-handle:focus-visible::after {
    opacity: 1;
}
.resize-handle:hover::after {
    transform: translate(-50%, -50%) scaleX(1.35);
}
.resize-handle:focus-visible {
    outline: 2px solid #fff;
    outline-offset: -3px;
}
.resize-left {
    left: 0;
    border-radius: 5px 0 0 5px;
}
.resize-right {
    left: auto;
    right: 0;
    border-radius: 0 5px 5px 0;
}

/* ---------- 依赖链接手柄 ---------- */
.link-handle {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #7c3aed;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgb(0 0 0 / 25%);
    cursor: crosshair;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.15s;
}
.task-bar:hover .link-handle {
    opacity: 1;
}
.link-temp-layer {
    position: absolute;
    z-index: 5;
    top: 0;
    pointer-events: none;
    overflow: visible;
}
.link-temp-layer line {
    stroke: #7c3aed;
    stroke-width: 2;
    stroke-dasharray: 6 3;
}

/* ---------- 新建任务预览 ---------- */
.create-preview {
    position: absolute;
    z-index: 2;
    border-radius: 5px;
    background: rgb(37 99 235 / 18%);
    border: 2px dashed #2563eb;
    pointer-events: none;
}
.pending-schedule {
    position: absolute;
    z-index: 3;
    padding: 0;
    min-width: 2px;
    border-radius: 5px;
    background: #3b82f6;
    color: #fff;
}
.add-task-row .task-label {
    justify-content: center;
}
.task-label {
    cursor: grab;
    user-select: none;
}
.tree-child .task-label {
    background: var(--color-subtle);
}
.tree-branch {
    color: var(--color-text-secondary);
    margin-right: 4px;
}
.gantt-row {
    transition: transform 0.15s ease;
}
.row-drag-source .task-label {
    opacity: 0.45;
}
.drop-before .task-label {
    box-shadow: inset 0 3px var(--color-primary);
    transform: translateY(3px);
}
.drop-after .task-label {
    box-shadow: inset 0 -3px var(--color-primary);
    transform: translateY(-3px);
}
.drop-inside .task-label {
    outline: 2px solid var(--color-primary);
    outline-offset: -3px;
}
.row-drag-ghost {
    position: fixed;
    z-index: 100;
    pointer-events: none;
    max-width: 260px;
    padding: 8px 12px;
    border: 1px solid var(--color-primary);
    border-radius: 6px;
    color: var(--color-text);
    background: var(--color-surface);
    box-shadow: 0 6px 18px rgb(15 23 42 / 20%);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
@media (prefers-reduced-motion: reduce) {
    .gantt-row {
        transition: none;
    }
}

/* ---------- 依赖连线 ---------- */
.dependency-layer {
    position: absolute;
    z-index: 1;
    top: 0;
    pointer-events: none;
    overflow: visible;
}
.dependency-layer path {
    fill: none;
    stroke: #7c3aed;
    stroke-width: 1.5;
}

/* ---------- 空状态 ---------- */
.empty {
    display: flex;
    flex: 1 1 auto;
    min-height: 16rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    padding: 3rem;
    text-align: center;
    color: var(--color-text-secondary);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
.empty strong {
    color: var(--color-text);
    font-size: 1.05rem;
}
.empty-icon {
    display: grid;
    width: 3rem;
    height: 3rem;
    margin-bottom: 0.25rem;
    place-items: center;
    border-radius: 0.8rem;
    color: var(--color-primary);
    background: #dbeafe;
    font-size: 1.25rem;
}

/* ---------- 消息横幅 ---------- */
.gantt-banner {
    padding: 0.7rem 1rem;
    margin-bottom: 0.75rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    flex: 0 0 auto;
}
.gantt-banner.success {
    color: var(--color-success-text);
    background: var(--color-success-bg);
}
.gantt-banner.error {
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
.gantt-banner.warning {
    color: var(--color-warning-text);
    background: var(--color-warning-bg);
}

/* ---------- 编辑面板 ---------- */
.gantt-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgb(0 0 0 / 35%);
    display: flex;
    align-items: center;
    justify-content: center;
}
.edit-panel {
    width: 380px;
    max-width: 92vw;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: 0 12px 40px rgb(0 0 0 / 25%);
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}
.create-panel {
    width: 520px;
}
.edit-panel h3 {
    margin: 0 0 0.35rem;
    font-size: 1.15rem;
    font-weight: 700;
}
.panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}
.panel-heading h3 {
    margin-bottom: 0;
}
.panel-eyebrow {
    color: var(--color-primary-text);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
}
.panel-close {
    display: grid;
    width: 2rem;
    height: 2rem;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 50%;
    color: var(--color-text-secondary);
    background: var(--color-subtle);
    cursor: pointer;
}
.create-error {
    margin: 0;
    padding: 0.55rem 0.7rem;
    border-radius: 0.45rem;
    color: var(--color-error-text);
    background: var(--color-error-bg);
    font-size: 0.8rem;
}
.edit-panel label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-top: 0.2rem;
}
.edit-input {
    width: 100%;
    padding: 0.5rem 0.6rem;
    border: 1px solid var(--color-border);
    border-radius: 0.45rem;
    font-size: 0.875rem;
    background: var(--color-subtle);
    color: var(--color-text);
    outline: none;
}
.edit-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgb(37 99 235 / 12%);
}
.edit-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}
.edit-row label {
    flex: 0 0 auto;
    margin: 0;
}
.edit-row .edit-input {
    flex: 1 1 auto;
    min-width: 0;
}
.edit-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}
.edit-field label {
    margin: 0;
}
.edit-range {
    flex: 1 1 auto;
    accent-color: var(--color-primary);
}
.progress-val {
    flex: 0 0 3rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: right;
}
.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
}
.edit-actions button {
    padding: 0.5rem 1.25rem;
    border-radius: 0.45rem;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
}
.btn-cancel {
    background: var(--color-subtle);
    color: var(--color-text-secondary);
    border-color: var(--color-border) !important;
}
.btn-cancel:hover {
    background: #e5e7eb;
}
.btn-save {
    background: var(--color-primary);
    color: #fff;
}
.btn-save:hover {
    filter: brightness(1.1);
}
.btn-save:disabled {
    cursor: wait;
    opacity: 0.65;
}

/* ---------- 响应式 ---------- */
@media (max-width: 820px) {
    .gantt-page {
        height: calc(100vh - 132px - var(--window-titlebar-height, 0px));
        padding: 1rem;
    }
    .gantt-toolbar {
        align-items: stretch;
        flex-direction: column;
    }
    .actions :deep(.p-select) {
        width: auto;
        flex: 1 1 auto;
    }
}
</style>
