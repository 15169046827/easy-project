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
            <button class="baseline-clear" @click="clearBaseline">
                {{ $t('gantt.baselineClear') }}
            </button>
        </div>

        <div v-if="projectId && datedTasks.length" class="scroller-wrap">
            <button
                class="timeline-nav timeline-nav-left"
                :title="$t('gantt.scrollLeft')"
                @click="scrollDays(-14)"
            >
                ◀
            </button>
            <button
                class="timeline-nav timeline-nav-right"
                :title="$t('gantt.scrollRight')"
                @click="scrollDays(14)"
            >
                ▶
            </button>
            <div ref="scroller" class="gantt-scroller" @wheel.prevent="onWheel">
                <div
                    class="gantt"
                    :style="{
                        '--dw': `${dayWidth}px`,
                        width: `${nameWidth + days.length * dayWidth}px`,
                        height: `${headerHeight + datedTasks.length * rowHeight}px`
                    }"
                >
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

                    <!-- 任务行 -->
                    <div
                        v-for="(task, index) in datedTasks"
                        :key="task.id"
                        class="gantt-row"
                        :style="{ top: `${headerHeight + index * rowHeight}px` }"
                    >
                        <div
                            class="task-label"
                            :style="{
                                width: `${nameWidth}px`,
                                paddingLeft: `${12 + task.level * 16}px`
                            }"
                        >
                            <span class="task-label-text">
                                {{ task.type === 'Milestone' ? '◆ ' : '' }}{{ task.name }}
                            </span>
                            <span class="date-actions">
                                <button :title="$t('gantt.moveEarlier')" @click="shift(task, -1)">
                                    ‹
                                </button>
                                <button :title="$t('gantt.moveLater')" @click="shift(task, 1)">
                                    ›
                                </button>
                            </span>
                        </div>
                        <div
                            class="row-grid"
                            :style="{ left: `${nameWidth}px` }"
                            @mousedown="onGridMouseDown"
                        >
                            <span
                                v-for="day in days"
                                :key="day.key"
                                :class="{ today: day.today, 'non-working': !day.working }"
                                :title="day.name"
                            ></span>
                        </div>
                        <div
                            class="task-bar"
                            :class="{
                                milestone: task.type === 'Milestone',
                                done: task.status === 'Done',
                                dragging: dragState && dragState.task.id === task.id,
                                resizing:
                                    dragState &&
                                    dragState.task.id === task.id &&
                                    dragState.mode !== 'move',
                                critical: showCritical && criticalData.critical.has(task.id),
                                'availability-conflict': availabilityInfo(task).conflict
                            }"
                            :style="barStyle(task)"
                            :title="taskTip(task)"
                            @mousedown.left="onBarMouseDown(task, $event, 'move')"
                        >
                            <button
                                v-if="task.type !== 'Milestone'"
                                type="button"
                                class="resize-handle resize-left"
                                :title="$t('gantt.labelStart')"
                                :aria-label="$t('gantt.labelStart')"
                                @mousedown.stop="onBarMouseDown(task, $event, 'resize-left')"
                            ></button>
                            <span
                                v-if="task.type !== 'Milestone'"
                                :style="{ width: `${task.progress || 0}%` }"
                            ></span>
                            <em v-if="task.type !== 'Milestone'">
                                <small class="bar-dates">{{ fmtShortRange(task) }}</small>
                                {{ task.progress || 0 }}%
                            </em>
                            <button
                                v-if="task.type !== 'Milestone'"
                                type="button"
                                class="resize-handle resize-right"
                                :title="$t('gantt.labelEnd')"
                                :aria-label="$t('gantt.labelEnd')"
                                @mousedown.stop="onBarMouseDown(task, $event, 'resize-right')"
                            ></button>
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

                    <!-- 依赖连线 -->
                    <svg
                        class="dependency-layer"
                        :style="{
                            left: `${nameWidth}px`,
                            width: `${days.length * dayWidth}px`,
                            height: `${headerHeight + datedTasks.length * rowHeight}px`
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
                            height: `${headerHeight + datedTasks.length * rowHeight}px`
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

        <!-- 编辑任务面板 -->
        <Teleport to="body">
            <div v-if="creatingTask" class="gantt-overlay" @click.self="closeCreateEditor">
                <form class="edit-panel create-panel" @submit.prevent="saveCreate">
                    <div class="panel-heading">
                        <div>
                            <span class="panel-eyebrow">{{ $t('gantt.title') }}</span>
                            <h3>{{ $t('tasks.newTask') }}</h3>
                        </div>
                        <button
                            type="button"
                            class="panel-close"
                            :aria-label="$t('gantt.btnCancel')"
                            @click="closeCreateEditor"
                        >
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                    <p v-if="createError" class="create-error">{{ createError }}</p>
                    <div class="edit-field">
                        <label>{{ $t('gantt.labelName') }}</label>
                        <input v-model="createForm.name" class="edit-input create-name" autofocus />
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelStart') }}</label>
                        <input
                            v-model="createForm.start_time"
                            type="date"
                            class="edit-input"
                            @change="recalculateCreateEnd"
                        />
                        <label>{{ $t('tasks.columnEffort') }}</label>
                        <input
                            v-model.number="createForm.effort_days"
                            type="number"
                            min="0"
                            step="0.5"
                            class="edit-input"
                            @input="recalculateCreateEnd"
                        />
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelEnd') }}</label>
                        <input
                            v-model="createForm.end_time"
                            type="date"
                            class="edit-input"
                            @change="recalculateCreateEffort"
                        />
                        <label>{{ $t('tasks.columnScheduleMode') }}</label>
                        <select
                            v-model="createForm.schedule_mode"
                            class="edit-input"
                            @change="recalculateCreateEnd"
                        >
                            <option value="fixed_effort">{{ $t('tasks.fixedEffort') }}</option>
                            <option value="fixed_dates">{{ $t('tasks.fixedDates') }}</option>
                        </select>
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelType') }}</label>
                        <select v-model="createForm.type" class="edit-input">
                            <option value="Task">{{ $t('gantt.optionTask') }}</option>
                            <option value="Milestone">{{ $t('gantt.optionMilestone') }}</option>
                        </select>
                        <label>{{ $t('tasks.columnPriority') }}</label>
                        <select v-model="createForm.priority" class="edit-input">
                            <option value="5">{{ $t('tasks.p5') }}</option>
                            <option value="4">{{ $t('tasks.p4') }}</option>
                            <option value="3">{{ $t('tasks.p3') }}</option>
                            <option value="2">{{ $t('tasks.p2') }}</option>
                            <option value="1">{{ $t('tasks.p1') }}</option>
                        </select>
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelStatus') }}</label>
                        <select v-model="createForm.status" class="edit-input">
                            <option value="Pending">{{ $t('gantt.optionPending') }}</option>
                            <option value="InProgress">{{ $t('gantt.optionInProgress') }}</option>
                            <option value="Done">{{ $t('gantt.optionDone') }}</option>
                        </select>
                    </div>
                    <div class="edit-field">
                        <label>{{ $t('tasks.columnAssignee') }}</label>
                        <MemberSelect
                            v-model="createForm.assignee"
                            :allowed-member-ids="projectMemberIds"
                            :placeholder="$t('tasks.selectAssignee')"
                        />
                    </div>
                    <div class="edit-field">
                        <label>{{ $t('tasks.columnComment') }}</label>
                        <input v-model="createForm.comment" class="edit-input create-comment" />
                    </div>
                    <div class="edit-actions">
                        <button type="button" class="btn-cancel" @click="closeCreateEditor">
                            {{ $t('gantt.btnCancel') }}
                        </button>
                        <button type="submit" class="btn-save" :disabled="savingTask">
                            {{ $t('tasks.newTask') }}
                        </button>
                    </div>
                </form>
            </div>
        </Teleport>

        <Teleport to="body">
            <div v-if="editingTask" class="gantt-overlay" @click.self="closeEditor">
                <div class="edit-panel">
                    <h3>{{ $t('gantt.editTitle') }}</h3>
                    <label>{{ $t('gantt.labelName') }}</label>
                    <input v-model="editForm.name" class="edit-input" @keydown.enter="saveEdit" />
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelStart') }}</label>
                        <input
                            v-model="editForm.start_time"
                            type="date"
                            class="edit-input"
                            @change="recalculateEditEnd"
                        />
                        <label>{{ $t('tasks.columnEffort') }}</label>
                        <input
                            v-model.number="editForm.effort_days"
                            type="number"
                            min="0"
                            step="0.5"
                            class="edit-input"
                            @input="recalculateEditEnd"
                        />
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelEnd') }}</label>
                        <input
                            v-model="editForm.end_time"
                            type="date"
                            class="edit-input"
                            @change="recalculateEditEffort"
                        />
                        <label>{{ $t('tasks.columnScheduleMode') }}</label>
                        <select
                            v-model="editForm.schedule_mode"
                            class="edit-input"
                            @change="recalculateEditEnd"
                        >
                            <option value="fixed_effort">{{ $t('tasks.fixedEffort') }}</option>
                            <option value="fixed_dates">{{ $t('tasks.fixedDates') }}</option>
                        </select>
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelType') }}</label>
                        <select v-model="editForm.type" class="edit-input">
                            <option value="Task">{{ $t('gantt.optionTask') }}</option>
                            <option value="Milestone">{{ $t('gantt.optionMilestone') }}</option>
                        </select>
                        <label>{{ $t('gantt.labelStatus') }}</label>
                        <select v-model="editForm.status" class="edit-input">
                            <option value="Pending">{{ $t('gantt.optionPending') }}</option>
                            <option value="InProgress">{{ $t('gantt.optionInProgress') }}</option>
                            <option value="Done">{{ $t('gantt.optionDone') }}</option>
                        </select>
                    </div>
                    <div class="edit-field">
                        <label>{{ $t('tasks.columnAssignee') }}</label>
                        <MemberSelect
                            v-model="editForm.assignee"
                            :allowed-member-ids="projectMemberIds"
                            :placeholder="$t('tasks.selectAssignee')"
                        />
                    </div>
                    <div class="edit-row">
                        <label>{{ $t('gantt.labelProgress') }}</label>
                        <input
                            v-model.number="editForm.progress"
                            type="range"
                            min="0"
                            max="100"
                            class="edit-range"
                        />
                        <span class="progress-val">{{ editForm.progress }}%</span>
                    </div>
                    <div class="edit-actions">
                        <button class="btn-cancel" @click="closeEditor">
                            {{ $t('gantt.btnCancel') }}
                        </button>
                        <button class="btn-save" @click="saveEdit">
                            {{ $t('gantt.btnSave') }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import MemberSelect from '../../member/components/MemberSelect.vue'
import { calculateCriticalPath } from '../utils/criticalPath.js'
import {
    calculateEndDate,
    countWorkingDays,
    dateKey,
    getWorkdayInfo,
    workingDayDelta
} from '../../calendar/utils/workCalendar.js'
import { calculateDependencySchedule } from '../../calendar/utils/scheduling.js'
import { taskAvailabilityConflict } from '../../calendar/utils/memberAvailability.js'
import {
    calculateDragDelta,
    calculateDragUpdate,
    createTaskCreatePayload,
    createTaskEditPayload,
    evaluateDependency
} from '../utils/interaction.js'

const { t } = useI18n()
const { members, loadMembers } = useMembers()

const props = defineProps({
    initialProjectId: { type: String, default: '' },
    embedded: { type: Boolean, default: false }
})

const projects = ref([])
const tasks = ref([])
const dependencies = ref([])
const projectMemberIds = ref([])
const projectId = ref(props.initialProjectId)
const embedded = computed(() => props.embedded)
const activeProject = computed(() => projects.value.find(item => item.id === projectId.value) || {})
const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const scroller = ref(null)
const dragState = ref(null) // { task, mode:'move'|'resize-left'|'resize-right', startX, origStart:Date, origEnd:Date }
const dragCursorX = ref(0)
const createDrag = ref(null) // { startX, startIdx:number, endIdx:number }  day index range
const creatingTask = ref(false)
const savingTask = ref(false)
const createError = ref('')
const createForm = ref({
    name: '',
    start_time: '',
    end_time: '',
    effort_days: 1,
    schedule_mode: 'fixed_effort',
    type: 'Task',
    priority: '3',
    status: 'Pending',
    assignee: '',
    comment: ''
})
const editingTask = ref(null)
const editForm = ref({
    name: '',
    start_time: '',
    end_time: '',
    effort_days: 0,
    schedule_mode: 'fixed_dates',
    type: 'Task',
    status: 'Pending',
    progress: 0,
    assignee: ''
})
const linking = ref(null) // { fromTask, cursorX, cursorY, ganttRect }
const showCritical = ref(false) // 关键路径高亮开关
const baseline = ref([]) // 计划基线快照
const showBaseline = ref(false) // 是否叠加显示基线
const savingBaseline = ref(false) // 保存基线中

// 布局常量
const dayWidth = ref(42)
const nameWidth = 280
const rowHeight = 48
const monthHeaderH = 24
const dayHeaderH = 38
const headerHeight = monthHeaderH + dayHeaderH // 62
const zoomLevel = computed(() => {
    const v = dayWidth.value
    if (v >= 36) return t('gantt.zoomDay')
    if (v >= 18) return t('gantt.zoomWeek')
    return t('gantt.zoomMonth')
})

// 清空消息
function clearMessage() {
    message.value = ''
}

// 手动刷新（带反馈）
async function reload() {
    message.value = ''
    await load()
    if (!message.value) {
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
function taskSchedule(task) {
    let start = parse(task.start_time)
    let end = parse(task.end_time)
    const ds = dragState.value
    if (ds && ds.task.id === task.id) {
        const delta = calculateDragDelta(ds.startX, dragCursorX.value, dayWidth.value)
        const update = calculateDragUpdate(ds.origStart, ds.origEnd, delta, ds.mode)
        if (update?.kind === 'update') {
            start = update.start
            end = update.end
        }
    }
    return { start, end }
}
function fmtShortRange(task) {
    const { start: s, end: e } = taskSchedule(task)
    if (!s || !e) return ''
    return `${s.getMonth() + 1}/${s.getDate()} – ${e.getMonth() + 1}/${e.getDate()}`
}

// ---------- 日期范围 ----------
const viewRange = ref({ start: new Date(), end: new Date() })

function initViewRange() {
    const dates = tasks.value.flatMap(t => [parse(t.start_time), parse(t.end_time)]).filter(Boolean)
    const start = dates.length ? new Date(Math.min(...dates)) : new Date()
    const end = dates.length ? new Date(Math.max(...dates)) : new Date()
    start.setDate(start.getDate() - 3)
    end.setDate(end.getDate() + 7)
    const minimumEnd = new Date(start)
    minimumEnd.setDate(minimumEnd.getDate() + 34)
    if (end < minimumEnd) end.setTime(minimumEnd.getTime())
    viewRange.value = { start: dayStart(start), end: dayStart(end) }
}

// ---------- 天列表 ----------
const todayStart = dayStart(new Date()).getTime()
const days = computed(() => {
    const result = []
    for (
        let d = new Date(viewRange.value.start);
        d <= viewRange.value.end;
        d.setDate(d.getDate() + 1)
    ) {
        const copy = new Date(d)
        const workday = getWorkdayInfo(copy, activeProject.value)
        result.push({
            key: copy.toISOString(),
            day: copy.getDate(),
            weekday: copy.toLocaleDateString(undefined, { weekday: 'short' }),
            today: dayStart(copy).getTime() === todayStart,
            working: workday.working,
            name: workday.name
        })
    }
    return result
})

// ---------- 月分组 ----------
const months = computed(() => {
    const result = []
    let current = null
    for (const day of days.value) {
        const date = new Date(day.key)
        const key = `${date.getFullYear()}-${date.getMonth()}`
        const label = t('gantt.monthFormat', {
            year: date.getFullYear(),
            month: date.getMonth() + 1
        })
        if (!current || current.key !== key) {
            current = { key, label, count: 1, containsToday: day.today }
            result.push(current)
        } else {
            current.count++
            if (day.today) current.containsToday = true
        }
    }
    return result
})

// ---------- 含日期的任务 ----------
const datedTasks = computed(() => {
    const source = tasks.value.filter(t => parse(t.start_time) && parse(t.end_time))
    const ids = new Set(source.map(t => t.id))
    const level = t => {
        let n = 0
        let p = t.parent
        while (p && ids.has(p) && n < 20) {
            n++
            p = source.find(x => x.id === p)?.parent
        }
        return n
    }
    return source.map(t => ({ ...t, level: level(t) }))
})

const offset = date => Math.round((dayStart(date) - viewRange.value.start) / 86400000)

function barStyle(task) {
    const ds = dragState.value
    const isDragging = ds && ds.task.id === task.id

    let start = parse(task.start_time)
    let end = parse(task.end_time)

    // 拖拽预览：基于原始日期 + delta 计算新位置
    if (isDragging) {
        const delta = Math.round((dragCursorX.value - ds.startX) / dayWidth.value)
        if (ds.mode === 'move') {
            start = new Date(ds.origStart)
            start.setDate(start.getDate() + delta)
            end = new Date(ds.origEnd)
            end.setDate(end.getDate() + delta)
        } else if (ds.mode === 'resize-left') {
            start = new Date(ds.origStart)
            start.setDate(start.getDate() + delta)
            if (dayStart(start).getTime() >= dayStart(ds.origEnd).getTime())
                start = new Date(ds.origEnd.getTime() - 86400000)
            end = ds.origEnd
        } else if (ds.mode === 'resize-right') {
            end = new Date(ds.origEnd)
            end.setDate(end.getDate() + delta)
            if (dayStart(end).getTime() <= dayStart(ds.origStart).getTime())
                end = new Date(ds.origStart.getTime() + 86400000)
            start = ds.origStart
        }
    }

    const left = nameWidth + offset(start) * dayWidth.value + 6
    if (task.type === 'Milestone')
        return {
            left: `${left + dayWidth.value / 2 - 8}px`,
            top: '16px'
        }
    const barW = Math.max(
        dayWidth.value - 10,
        (offset(end) - offset(start) + 1) * dayWidth.value - 12
    )
    return {
        left: `${left}px`,
        width: `${barW}px`,
        top: '11px'
    }
}

// ---------- 依赖连线 ----------
const dependencyPaths = computed(() =>
    dependencies.value
        .map(edge => {
            const a = datedTasks.value.findIndex(t => t.id === edge.predecessor_task_id)
            const b = datedTasks.value.findIndex(t => t.id === edge.successor_task_id)
            if (a < 0 || b < 0) return null
            const pred = datedTasks.value[a]
            const succ = datedTasks.value[b]
            const x1 = (offset(parse(pred.end_time)) + 1) * dayWidth.value - 5
            const x2 = offset(parse(succ.start_time)) * dayWidth.value + 5
            const y1 = headerHeight + a * rowHeight + 24
            const y2 = headerHeight + b * rowHeight + 24
            const mid = Math.max(x1 + 12, (x1 + x2) / 2)
            const critical = showCritical.value && criticalData.value.edges.has(edge.id)
            return { id: edge.id, path: `M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`, critical }
        })
        .filter(Boolean)
)

// ---------- 关键路径 (CPM) ----------
// 计算最早/最晚开始与完成时间、时差，并标注关键路径（时差为 0 的链路）。
const criticalData = computed(() =>
    calculateCriticalPath(datedTasks.value, dependencies.value, activeProject.value)
)

function criticalTip(task) {
    const c = criticalData.value.info.get(task.id)
    if (!c) return task.name
    const tag = c.slack <= 0 ? t('gantt.criticalPath') : t('gantt.slack', { count: c.slack })
    return `${task.name}\n最早: ${c.esText} → ${c.efText}\n最晚: ${c.lsText} → ${c.lfText}\n${tag}`
}

function availabilityInfo(task) {
    return taskAvailabilityConflict(task, members.value, activeProject.value)
}

function taskTip(task) {
    const base = criticalTip(task)
    const availability = availabilityInfo(task)
    if (!availability.conflict) return base
    return `${base}\n${t('gantt.availabilityConflict', {
        name: availability.member?.name || task.assignee,
        count: availability.dates.length,
        dates: availability.dates.join(', ')
    })}`
}

// ---------- 计划基线 ----------
const baselineMap = computed(() => {
    const map = new Map()
    for (const b of baseline.value) map.set(b.task_id, b)
    return map
})
const baselineSavedAt = computed(() => {
    if (!baseline.value.length) return ''
    const ts = baseline.value[0].created_at
    const d = parse(ts)
    return d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        : ts
})
// 单任务偏差：返回相对于基线的开始/完成偏移（天）与延期判定
function baselineInfo(task) {
    const b = baselineMap.value.get(task.id)
    if (!b) return null
    if (![task.start_time, task.end_time, b.start_time, b.end_time].every(parse)) return null
    const startSlip = workingDayDelta(b.start_time, task.start_time, activeProject.value)
    const endSlip = workingDayDelta(b.end_time, task.end_time, activeProject.value)
    return {
        startSlip,
        endSlip,
        delayed: endSlip > 0 || startSlip > 0,
        advanced: endSlip < 0 && startSlip <= 0
    }
}
const delayedCount = computed(() => datedTasks.value.filter(t => baselineInfo(t)?.delayed).length)
function baselineDelayed(task) {
    return Boolean(baselineInfo(task)?.delayed)
}

// 基线幽灵条位置（与任务条同算法，仅换数据源）
function baselineStyle(task) {
    const b = baselineMap.value.get(task.id)
    if (!b) return null
    const s = parse(b.start_time)
    const e = parse(b.end_time)
    if (!s || !e) return null
    const left = nameWidth + offset(s) * dayWidth.value + 6
    if (task.type === 'Milestone') {
        return { left: `${left + dayWidth.value / 2 - 8}px`, top: '34px' }
    }
    const barW = Math.max(dayWidth.value - 10, (offset(e) - offset(s) + 1) * dayWidth.value - 12)
    return { left: `${left}px`, width: `${barW}px`, top: '34px' }
}
function baselineTip(task) {
    const info = baselineInfo(task)
    const b = baselineMap.value.get(task.id)
    if (!info || !b) return task.name
    const slip = info.endSlip
    const verb =
        slip > 0
            ? t('gantt.baselineDelay', { count: slip })
            : slip < 0
              ? t('gantt.baselineAdvance', { count: Math.abs(slip) })
              : t('gantt.baselineMatch')
    return `${task.name}\n基线: ${b.start_time?.slice(0, 10)} → ${b.end_time?.slice(0, 10)}\n实际: ${task.start_time?.slice(0, 10)} → ${task.end_time?.slice(0, 10)}\n${verb}`
}

async function loadBaseline() {
    if (!projectId.value) return
    try {
        const res = await crudAction('plan_baseline', 'get_by_project', {
            projectId: projectId.value
        })
        baseline.value = res?.list || []
    } catch {
        baseline.value = []
    }
}
async function saveBaseline() {
    if (!projectId.value) return
    savingBaseline.value = true
    try {
        const inputs = datedTasks.value.map(t => ({
            task_id: t.id,
            task_name: t.name,
            start_time: t.start_time,
            end_time: t.end_time
        }))
        await crudAction('plan_baseline', 'save', { project_id: projectId.value, tasks: inputs })
        await loadBaseline()
        showBaseline.value = true
        messageType.value = 'success'
        message.value = t('gantt.baselineSavedMsg', { count: inputs.length })
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    } finally {
        savingBaseline.value = false
    }
}
async function clearBaseline() {
    if (!projectId.value) return
    try {
        await crudAction('plan_baseline', 'clear', { projectId: projectId.value })
        baseline.value = []
        showBaseline.value = false
        messageType.value = 'success'
        message.value = t('gantt.baselineCleared')
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    }
}

// ---------- 数据加载 ----------
async function load() {
    if (!projectId.value) return
    loading.value = true
    try {
        const [t, d, p, pm] = await Promise.all([
            crudAction('task', 'get_all', {
                pageIndex: 1,
                pageSize: 1000,
                projectId: projectId.value
            }),
            crudAction('task_dependency', 'get_all', { projectId: projectId.value }),
            crudAction('project', 'get_all', { pageIndex: 1, pageSize: 1000 }),
            crudAction('project_member', 'get_by_project', { projectId: projectId.value })
        ])
        tasks.value = t?.list || []
        dependencies.value = d?.list || []
        projects.value = p?.list || projects.value
        projectMemberIds.value = (pm?.list || []).map(item => item.member_id)
        initViewRange()
        await loadBaseline()
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    } finally {
        loading.value = false
    }
}

async function applyAutoSchedule() {
    const result = calculateDependencySchedule(tasks.value, dependencies.value, activeProject.value)
    for (const update of result.updates) {
        await crudAction('task', 'update', update)
    }
    if (result.updates.length) await load()
    if (result.conflicts.length) {
        messageType.value = 'warning'
        message.value = t('tasks.scheduleConflicts', { count: result.conflicts.length })
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
        await load()
        await applyAutoSchedule()
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    }
}

// ---------- 编辑任务面板 ----------
function openEditor(task) {
    editingTask.value = task
    editForm.value = {
        name: task.name || '',
        start_time: (task.start_time || '').replace(' ', 'T').slice(0, 10),
        end_time: (task.end_time || '').replace(' ', 'T').slice(0, 10),
        effort_days: task.effort_days || 0,
        schedule_mode: task.schedule_mode || 'fixed_dates',
        type: task.type || 'Task',
        status: task.status || 'Pending',
        progress: task.progress || 0,
        assignee: task.assignee || ''
    }
}
function recalculateEditEnd() {
    if (editForm.value.schedule_mode === 'fixed_dates') {
        recalculateEditEffort()
        return
    }
    const end = calculateEndDate(
        editForm.value.start_time,
        editForm.value.effort_days,
        activeProject.value
    )
    if (end) editForm.value.end_time = dateKey(end)
}
function recalculateEditEffort() {
    if (editForm.value.schedule_mode !== 'fixed_dates') return
    editForm.value.effort_days = countWorkingDays(
        editForm.value.start_time,
        editForm.value.end_time,
        activeProject.value
    )
}
function closeEditor() {
    editingTask.value = null
}
async function saveEdit() {
    const task = editingTask.value
    if (!task) return
    try {
        await crudAction('task', 'update', createTaskEditPayload(task.id, editForm.value))
        messageType.value = 'success'
        message.value = t('gantt.taskUpdated', { name: editForm.value.name })
        closeEditor()
        await load()
        await applyAutoSchedule()
    } catch (err) {
        messageType.value = 'error'
        message.value = err.message
    }
}

// ---------- 拖拽 task bar ----------
function onBarMouseDown(task, e, mode = 'move') {
    if (e.button !== 0) return // 仅左键
    e.preventDefault()
    e.stopPropagation()
    const start = parse(task.start_time)
    const end = parse(task.end_time)
    if (!start || !end) return
    dragState.value = {
        task,
        mode,
        startX: e.clientX,
        origStart: new Date(start),
        origEnd: new Date(end)
    }
    dragCursorX.value = e.clientX
    document.addEventListener('mousemove', onDocMouseMove)
    document.addEventListener('mouseup', onDocMouseUp)
}

function onDocMouseMove(e) {
    if (!dragState.value) return
    dragCursorX.value = e.clientX
}

async function onDocMouseUp(_e) {
    document.removeEventListener('mousemove', onDocMouseMove)
    document.removeEventListener('mouseup', onDocMouseUp)

    const ds = dragState.value
    dragState.value = null
    if (!ds) return

    const deltaDays = calculateDragDelta(ds.startX, dragCursorX.value, dayWidth.value)
    const update = calculateDragUpdate(ds.origStart, ds.origEnd, deltaDays, ds.mode)
    if (update?.kind === 'edit') {
        // 纯点击 → 打开编辑面板
        openEditor(ds.task)
        return
    }

    if (!update) return

    try {
        await crudAction('task', 'update', {
            id: ds.task.id,
            start_time: format(update.start),
            end_time: format(update.end),
            ...(ds.mode === 'move'
                ? {}
                : {
                      effort_days: countWorkingDays(update.start, update.end, activeProject.value)
                  })
        })
        messageType.value = 'success'
        message.value = t('gantt.taskUpdated', { name: ds.task.name })
        await load()
        await applyAutoSchedule()
    } catch (err) {
        messageType.value = 'error'
        message.value = err.message
    }
}

// ---------- 新建任务预览样式 ----------
const createPreviewStyle = computed(() => {
    if (!createDrag.value) return { display: 'none' }
    const s = Math.min(createDrag.value.startIdx, createDrag.value.endIdx)
    const e = Math.max(createDrag.value.startIdx, createDrag.value.endIdx)
    return {
        left: `${nameWidth + s * dayWidth.value + 6}px`,
        width: `${(e - s + 1) * dayWidth.value - 12}px`,
        top: `${headerHeight}px`,
        height: `${datedTasks.value.length * rowHeight}px`
    }
})

// ---------- 新建任务拖拽 ----------
function onGridMouseDown(e) {
    if (e.button !== 0) return
    const ganttEl = e.currentTarget.closest('.gantt')
    if (!ganttEl) return
    const rect = ganttEl.getBoundingClientRect()
    const x = e.clientX - rect.left - nameWidth
    if (x < 0) return
    const idx = Math.floor(x / dayWidth.value)
    if (idx < 0 || idx >= days.value.length) return
    e.preventDefault()
    createDrag.value = { startX: e.clientX, startIdx: idx, endIdx: idx }
    document.addEventListener('mousemove', onGridMouseMove)
    document.addEventListener('mouseup', onGridMouseUp)
}
function onGridMouseMove(e) {
    if (!createDrag.value) return
    const ganttEl = e.target?.closest?.('.gantt')
    if (!ganttEl) return
    const rect = ganttEl.getBoundingClientRect()
    const x = e.clientX - rect.left - nameWidth
    const idx = Math.max(0, Math.min(days.value.length - 1, Math.floor(x / dayWidth.value)))
    createDrag.value.endIdx = idx
}
function onGridMouseUp(_e) {
    document.removeEventListener('mousemove', onGridMouseMove)
    document.removeEventListener('mouseup', onGridMouseUp)
    const cd = createDrag.value
    createDrag.value = null
    if (!cd) return
    const s = Math.min(cd.startIdx, cd.endIdx)
    const e = Math.max(cd.startIdx, cd.endIdx)
    if (!days.value[s] || !days.value[e]) return
    const startDate = new Date(days.value[s].key)
    const endDate = new Date(days.value[e].key)
    openCreateEditor(startDate, endDate)
}

function openCreateEditor(startDate, endDate) {
    createError.value = ''
    createForm.value = {
        name: '',
        start_time: format(startDate).slice(0, 10),
        end_time: format(endDate).slice(0, 10),
        effort_days: Math.max(1, countWorkingDays(startDate, endDate, activeProject.value)),
        schedule_mode: 'fixed_effort',
        type: 'Task',
        priority: '3',
        status: 'Pending',
        assignee: '',
        comment: ''
    }
    creatingTask.value = true
}

function recalculateCreateEnd() {
    if (createForm.value.schedule_mode === 'fixed_dates') {
        recalculateCreateEffort()
        return
    }
    const end = calculateEndDate(
        createForm.value.start_time,
        createForm.value.effort_days,
        activeProject.value
    )
    if (end) createForm.value.end_time = dateKey(end)
}

function recalculateCreateEffort() {
    if (createForm.value.schedule_mode !== 'fixed_dates') return
    createForm.value.effort_days = countWorkingDays(
        createForm.value.start_time,
        createForm.value.end_time,
        activeProject.value
    )
}

function closeCreateEditor() {
    if (savingTask.value) return
    creatingTask.value = false
    createError.value = ''
}

async function saveCreate() {
    if (!createForm.value.name.trim()) {
        createError.value = `${t('tasks.columnName')} ${t('common.required')}`
        return
    }
    savingTask.value = true
    createError.value = ''
    try {
        const payload = createTaskCreatePayload(projectId.value, createForm.value)
        await crudAction('task', 'add', payload)
        messageType.value = 'success'
        message.value = t('gantt.taskCreated', { name: payload.name })
        creatingTask.value = false
        await load()
    } catch (err) {
        messageType.value = 'error'
        message.value = err.message
        createError.value = err.message
    } finally {
        savingTask.value = false
    }
}

// ---------- 依赖链接线预览 ----------
const linkLine = computed(() => {
    if (!linking.value) return { x1: 0, y1: 0, x2: 0, y2: 0 }
    const lk = linking.value
    const task = lk.fromTask
    const end = parse(task.end_time)
    const idx = datedTasks.value.findIndex(t => t.id === task.id)
    const x1 = (offset(end) + 1) * dayWidth.value - 5
    const y1 = headerHeight + idx * rowHeight + 24
    const x2 = lk.cursorX - lk.ganttRect.left - nameWidth
    const y2 = lk.cursorY - lk.ganttRect.top
    return { x1, y1, x2, y2 }
})

// ---------- 依赖链接拖拽 ----------
function startLink(task, e) {
    e.preventDefault()
    e.stopPropagation()
    const ganttEl = e.currentTarget.closest('.gantt')
    if (!ganttEl) return
    const rect = ganttEl.getBoundingClientRect()
    linking.value = {
        fromTask: task,
        cursorX: e.clientX,
        cursorY: e.clientY,
        ganttRect: rect
    }
    document.addEventListener('mousemove', onLinkMove)
    document.addEventListener('mouseup', onLinkUp)
}
function onLinkMove(e) {
    if (!linking.value) return
    linking.value.cursorX = e.clientX
    linking.value.cursorY = e.clientY
}
function onLinkUp(e) {
    document.removeEventListener('mousemove', onLinkMove)
    document.removeEventListener('mouseup', onLinkUp)
    const link = linking.value
    linking.value = null
    if (!link) return

    // 找到鼠标释放位置下的 task bar
    const target = document.elementFromPoint(link.cursorX, link.cursorY)
    const barEl = target?.closest?.('.task-bar')
    if (!barEl) return
    // 通过 datedTasks 中找到对应的 task
    const barLeft = parseFloat(barEl.style.left || '0')
    const barTop = parseFloat(barEl.parentElement?.style?.top || '0')
    const match = datedTasks.value.find(t => {
        const bs = barStyle(t)
        return (
            Math.abs(parseFloat(bs.left) - barLeft) < 2 && Math.abs(parseFloat(bs.top) - barTop) < 2
        )
    })
    if (!match || match.id === link.fromTask.id) return

    createDependency(link.fromTask, match)
}
async function createDependency(from, to) {
    try {
        // 找到 successor task 的现有前驱列表，追加 from.id
        const evaluation = evaluateDependency(dependencies.value, from.id, to.id)
        if (!evaluation.allowed) {
            const reason = evaluation.reason
            messageType.value = 'error'
            message.value = t(`gantt.dependency${reason[0].toUpperCase()}${reason.slice(1)}`)
            return
        }
        await crudAction('task_dependency', 'set_for_task', {
            taskId: to.id,
            predecessorIds: evaluation.predecessorIds
        })
        messageType.value = 'success'
        message.value = t('gantt.dependencyCreated', { from: from.name, to: to.name })
        await load()
        await applyAutoSchedule()
    } catch (err) {
        messageType.value = 'error'
        message.value = err.message
    }
}

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

// ---------- 滚动到今天 ----------
async function scrollToday() {
    await nextTick()
    const index = days.value.findIndex(d => d.today)
    if (!scroller.value) return
    if (index < 0) {
        messageType.value = 'warning'
        message.value = t('gantt.todayOutside')
        setTimeout(clearMessage, 3500)
        return
    }
    scroller.value.scrollTo({
        left: Math.max(0, nameWidth + index * dayWidth.value - scroller.value.clientWidth / 2),
        behavior: 'smooth'
    })
}

// ---------- 滚轮左右滚动时间轴（自动扩展范围） ----------
function onWheel(e) {
    // Ctrl + 滚轮 = 缩放时间轴
    if (e.ctrlKey) {
        e.preventDefault()
        const step = e.deltaY > 0 ? -4 : 4
        dayWidth.value = Math.max(6, Math.min(60, dayWidth.value + step))
        return
    }
    // Shift + 滚轮 = 正常纵向滚动
    if (e.shiftKey) {
        e.preventDefault()
        scroller.value?.scrollBy({ top: e.deltaY, behavior: 'auto' })
        return
    }

    // 普通滚轮 → 水平滚动（时间轴）
    const direction = e.deltaY > 0 ? 1 : -1
    const steps = Math.max(1, Math.round(Math.abs(e.deltaY) / 80))
    scrollDays(direction * steps)
}

// ---------- 时间轴左右滚动（自动扩展范围） ----------
async function scrollDays(delta) {
    if (!scroller.value) return
    const el = scroller.value
    const EXTEND_DAYS = 21

    if (delta < 0 && el.scrollLeft < 60) {
        // 向左滚动到边缘 → 扩展左侧
        const newStart = new Date(viewRange.value.start)
        newStart.setDate(newStart.getDate() - EXTEND_DAYS)
        viewRange.value = { start: dayStart(newStart), end: viewRange.value.end }
        await nextTick()
        el.scrollLeft = EXTEND_DAYS * dayWidth.value
        return
    }

    if (delta > 0) {
        const maxScroll = el.scrollWidth - el.clientWidth
        if (el.scrollLeft > maxScroll - 80) {
            // 向右滚动到边缘 → 扩展右侧
            const newEnd = new Date(viewRange.value.end)
            newEnd.setDate(newEnd.getDate() + EXTEND_DAYS)
            viewRange.value = { start: viewRange.value.start, end: dayStart(newEnd) }
            return
        }
    }

    el.scrollBy({ left: delta * dayWidth.value, behavior: 'smooth' })
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
.gantt-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px);
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
    flex: 1 1 auto;
    min-height: 0;
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
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.gantt-scroller::-webkit-scrollbar {
    display: none;
}

/* ---------- 时间轴导航按钮 ---------- */
.timeline-nav {
    position: absolute;
    top: 50%;
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
    transition: all 0.2s ease;
    transform: translateY(-50%);
}
.timeline-nav:hover {
    color: var(--color-primary);
    border-color: var(--color-primary);
    box-shadow: 0 4px 14px rgb(37 99 235 / 20%);
}
.timeline-nav-left {
    left: 8px;
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
.corner {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 5;
    height: 62px; /* headerHeight */
    background: var(--color-subtle);
    border-right: 1px solid #dbe3ee;
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
    color: #1d4ed8;
    background: #dbeafe;
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
    box-shadow: inset 0 -1px #dbe3ee;
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
    color: #9f1239;
    background: repeating-linear-gradient(-45deg, #fff1f2, #fff1f2 5px, #ffe4e6 5px, #ffe4e6 10px);
}
.today {
    background: #dbeafe !important;
}

/* ---------- 任务行 ---------- */
.gantt-row {
    position: absolute;
    left: 0;
    right: 0;
    height: 48px;
    border-top: 1px solid #eef2f7;
}
.task-label {
    position: sticky;
    z-index: 3;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    background: var(--color-surface);
    border-right: 1px solid #dbe3ee;
    overflow: hidden;
    box-shadow: 5px 0 12px rgb(15 23 42 / 4%);
}
.task-label-text {
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
    border-right: 1px solid #f1f5f9;
}
.row-grid span.non-working {
    background: rgb(244 63 94 / 6%);
}

/* ---------- 任务条 ---------- */
.task-bar {
    position: absolute;
    z-index: 2;
    height: 26px;
    min-width: 4rem;
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
.task-bar span {
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
.task-bar.done span {
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
    right: -6px;
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
        height: calc(100vh - 132px);
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
