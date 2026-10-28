<template>
    <section class="task-board">
        <header class="board-heading">
            <div>
                <span>{{ $t('board.eyebrow') }}</span>
                <h3>{{ $t('board.title') }}</h3>
                <p>{{ $t('board.subtitle') }}</p>
            </div>
            <strong>{{ $t('board.total', { count: tasks.length }) }}</strong>
        </header>
        <p v-if="message" class="board-message" :class="messageType">{{ message }}</p>
        <div class="board-columns">
            <article
                v-for="column in columns"
                :key="column.status"
                class="board-column"
                :data-status-id="column.status"
                :class="{ 'drop-active': dragOver === column.status }"
                @dragover.prevent
                @drop.prevent.stop
            >
                <header>
                    <span class="status-dot" :style="{ background: column.color }"></span>
                    <h4
                        :title="column.label"
                        v-tooltip.top="{ value: column.label, class: 'task-content-tooltip' }"
                    >
                        {{ column.label }}
                    </h4>
                    <small>{{ tasksByStatus[column.status].length }}</small>
                </header>
                <div class="card-list">
                    <Button
                        v-for="task in tasksByStatus[column.status]"
                        :key="task.id"
                        class="board-card"
                        :class="{ 'is-dragging': dragging?.id === task.id }"
                        :draggable="false"
                        @pointerdown="startPointerDrag($event, task)"
                        @click="openTask(task)"
                    >
                        <span
                            class="priority"
                            :class="`p${priorityRank(task.priority) || 'unknown'}`"
                            :title="String(task.priority || '')"
                            >{{
                                priorityRank(task.priority)
                                    ? `P${priorityRank(task.priority)}`
                                    : task.priority || '—'
                            }}</span
                        >
                        <strong
                            :title="task.name"
                            v-tooltip.top="{ value: task.name, class: 'task-content-tooltip' }"
                            >{{ task.name }}</strong
                        >
                        <p
                            v-if="task.comment"
                            :title="task.comment"
                            v-tooltip.top="{ value: task.comment, class: 'task-content-tooltip' }"
                        >
                            {{ task.comment }}
                        </p>
                        <footer>
                            <span
                                :title="memberName(task.assignee)"
                                v-tooltip.top="{
                                    value: memberName(task.assignee),
                                    class: 'task-content-tooltip'
                                }"
                                ><i class="pi pi-user"></i
                                ><span class="assignee-name">{{
                                    memberName(task.assignee)
                                }}</span></span
                            >
                            <time v-if="task.end_time"
                                ><i class="pi pi-calendar"></i>{{ dateOnly(task.end_time) }}</time
                            >
                        </footer>
                        <ProgressBar
                            class="progress-track"
                            :value="Number(task.progress) || 0"
                            :showValue="false"
                            :aria-label="$t('tasks.columnProgress')"
                        />
                    </Button>
                    <p v-if="!tasksByStatus[column.status].length" class="empty-column">
                        {{ $t('board.empty') }}
                    </p>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup>
import { priorityRank } from '../../../utils/taskPriority'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../api'
import { statusColor } from '../../../utils/statusColors'

const props = defineProps({
    projectId: { type: String, default: '' },
    tasks: {
        type: /** @type {import('vue').PropType<Array<{id: string, name: string, priority?: number, comment?: string, assignee?: string, end_time?: string, progress?: number, status?: string, status_id?: string, status_builtin_key?: string}>>} */ (
            Array
        ),
        default: () => []
    },
    members: {
        type: /** @type {import('vue').PropType<Array<{id: string, name: string}>>} */ (Array),
        default: () => []
    }
})
const emit = defineEmits(['updated', 'open'])
const { t } = useI18n()
const dragging = ref(null)
const dragOver = ref('')
const message = ref('')
const messageType = ref('success')
let pointer = null
let suppressClick = false
let clickResetTimer

const states = ref([])
let epoch = 0
onBeforeUnmount(() => {
    epoch++
    finishDrag()
    clearTimeout(clickResetTimer)
})
watch(
    () => props.projectId,
    async projectId => {
        finishDrag()
        const token = ++epoch
        states.value = []
        if (!projectId) return
        try {
            const result = await crudAction('task_status', 'get_all', { projectId })
            if (token === epoch) states.value = result.list || []
        } catch (error) {
            if (token === epoch) {
                messageType.value = 'error'
                message.value = error.message
            }
        }
    },
    { immediate: true }
)
const keys = {
    Pending: 'tasks.statusPending',
    InProgress: 'tasks.statusInProgress',
    Done: 'tasks.statusDone'
}
function taskColumn(task) {
    const state = states.value.find(
        item =>
            item.id === task.status_id ||
            (!task.status_id &&
                item.builtin_key === (task.status === 'Todo' ? 'Pending' : task.status))
    )
    return state?.id || `unknown:${task.status_id || task.status || ''}`
}
const columns = computed(() => {
    const result = states.value.map(state => ({
        status: state.id,
        label: Object.hasOwn(keys, state.builtin_key) ? t(keys[state.builtin_key]) : state.name,
        color: statusColor(state),
        is_completed: state.is_completed,
        writable: true
    }))
    for (const task of props.tasks) {
        const id = taskColumn(task)
        if (!result.some(column => column.status === id))
            result.push({
                status: id,
                label: task.status || t('taskStatuses.unnamed'),
                color: '#64748b',
                is_completed: false,
                writable: false
            })
    }
    return result
})
const tasksByStatus = computed(() =>
    Object.fromEntries(
        columns.value.map(column => [
            column.status,
            props.tasks.filter(task => taskColumn(task) === column.status)
        ])
    )
)

function memberName(id) {
    return props.members.find(member => member.id === id)?.name || t('board.unassigned')
}
function dateOnly(value) {
    return String(value).slice(0, 10)
}
function openTask(task) {
    if (!suppressClick) emit('open', task)
}
function startPointerDrag(event, task) {
    if (event.button !== 0 || (event.pointerType && event.pointerType !== 'mouse')) return
    finishDrag()
    suppressClick = false
    pointer = { id: event.pointerId, task, x: event.clientX, y: event.clientY }
    window.addEventListener('pointermove', movePointerDrag)
    window.addEventListener('pointerup', endPointerDrag)
    window.addEventListener('pointercancel', finishDrag)
    window.addEventListener('blur', finishDrag)
}
function statusAtPoint(event) {
    const column = document.elementFromPoint(event.clientX, event.clientY)?.closest('.board-column')
    return column?.getAttribute('data-status-id') || ''
}
function movePointerDrag(event) {
    if (!pointer || event.pointerId !== pointer.id) return
    if (!dragging.value && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < 8)
        return
    dragging.value = pointer.task
    suppressClick = true
    dragOver.value = statusAtPoint(event)
}
function endPointerDrag(event) {
    if (!pointer || event.pointerId !== pointer.id) return
    // A fast native gesture may coalesce move events; still require a real
    // primary-pointer press on an internal task and an eight-pixel gesture.
    if (!dragging.value && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) >= 8)
        dragging.value = pointer.task
    const target = dragging.value ? statusAtPoint(event) : ''
    const moved = Boolean(dragging.value)
    if (target) void dropTask(target)
    else finishDrag()
    suppressClick = moved
    clearTimeout(clickResetTimer)
    clickResetTimer = setTimeout(() => {
        suppressClick = false
    }, 0)
}
function finishDrag() {
    pointer = null
    suppressClick = false
    window.removeEventListener('pointermove', movePointerDrag)
    window.removeEventListener('pointerup', endPointerDrag)
    window.removeEventListener('pointercancel', finishDrag)
    window.removeEventListener('blur', finishDrag)
    dragging.value = null
    dragOver.value = ''
}
async function dropTask(status) {
    const task = dragging.value
    finishDrag()
    const column = columns.value.find(item => item.status === status)
    if (!task || taskColumn(task) === status || !column?.writable) return
    try {
        await crudAction('task', 'update', {
            id: task.id,
            status_id: status,
            ...(column.is_completed ? { progress: 100 } : {})
        })
        messageType.value = 'success'
        message.value = t('board.moved', {
            name: task.name,
            status: columns.value.find(item => item.status === status)?.label
        })
        emit('updated')
    } catch (error) {
        messageType.value = 'error'
        message.value = error.message
    }
}
</script>

<style scoped>
.task-board {
    height: 100%;
    min-width: 0;
    overflow: auto;
}
.board-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}
.board-heading span {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.board-heading h3 {
    margin: 0.15rem 0 0;
    font-size: 1.25rem;
}
.board-heading p {
    margin: 0.3rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.84rem;
}
.board-heading > strong {
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    color: var(--color-primary-text);
    background: var(--color-primary-light);
    font-size: 0.75rem;
}
.board-message {
    padding: 0.6rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
}
.board-message.success {
    color: var(--color-success-text);
    background: var(--color-success-bg);
}
.board-message.error {
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
.board-columns {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 420px));
    gap: 0.9rem;
    width: 100%;
    align-items: start;
    padding-bottom: 0.25rem;
}
.board-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: clamp(18rem, 55vh, 34rem);
    padding: 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-subtle);
    transition:
        border-color 0.15s,
        background 0.15s;
}
.board-column.drop-active {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
}
.board-column > header {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.25rem 0.25rem 0.75rem;
    flex: 0 0 auto;
}
.board-column h4 {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin: 0;
    font-size: 0.86rem;
}
.board-column header small {
    display: grid;
    min-width: 1.45rem;
    height: 1.45rem;
    place-items: center;
    border-radius: 999px;
    background: var(--color-surface);
}
.status-dot {
    flex-shrink: 0;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #94a3b8;
}
.status-dot.inprogress {
    background: #3b82f6;
}
.status-dot.done {
    background: #22c55e;
}
.card-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-auto-rows: max-content;
    align-content: start;
    gap: 0.6rem;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-gutter: stable;
    flex: 1 1 auto;
    padding: 0.2rem;
}
.board-card.p-button {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    justify-content: stretch;
    justify-items: stretch;
    align-items: start;
    align-self: start;
    height: auto;
    overflow: visible;
    min-width: 0;
    gap: 0.55rem;
    width: 100%;
    padding: 0.85rem;
    border: 1px solid var(--color-border);
    border-radius: 0.65rem;
    color: var(--color-text);
    text-align: left;
    background: var(--color-surface);
    box-shadow: 0 2px 6px var(--color-card-shadow);
    cursor: grab;
    user-select: none;
}
.board-card.is-dragging {
    opacity: 0.55;
}
.board-card:active {
    cursor: grabbing;
}
.board-card.p-button:not(:disabled):hover,
.board-card.p-button:not(:disabled):active {
    border-color: #bfdbfe;
    background: var(--color-subtle-hover);
    color: var(--color-text);
    box-shadow: 0 5px 14px var(--color-card-shadow);
}
.board-card.p-button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.priority {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    width: fit-content;
    padding: 0.12rem 0.4rem;
    border-radius: 0.3rem;
    color: var(--color-text);
    background: var(--color-panel-bg);
    font-size: 0.65rem;
    font-weight: 800;
}
.priority::before {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    flex: 0 0 0.5rem;
    border-radius: 50%;
    background: var(--priority-dot, var(--priority-p5));
}
.priority.p1 {
    --priority-dot: var(--priority-p1);
}
.priority.p2 {
    --priority-dot: var(--priority-p2);
}
.priority.p3 {
    --priority-dot: var(--priority-p3);
}
.priority.p4 {
    --priority-dot: var(--priority-p4);
}
.priority.p5 {
    --priority-dot: var(--priority-p5);
}
.board-card > strong {
    font-size: 0.86rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    white-space: normal;
    text-align: left;
}
.board-card > p {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    text-overflow: ellipsis;
    white-space: normal;
    overflow-wrap: anywhere;
    text-align: left;
}
.board-card footer {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-text-muted);
    font-size: 0.68rem;
}
.board-card footer span,
.board-card time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-width: 0;
}
.board-card footer > span {
    overflow: hidden;
}
.board-card footer .assignee-name {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.board-card time,
.board-card footer i {
    flex-shrink: 0;
}
.progress-track {
    display: block;
    height: 0.22rem;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color-border);
}
.progress-track :deep(.p-progressbar-value) {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--color-primary);
}
.empty-column {
    padding: 1.5rem 0.5rem;
    color: var(--color-text-muted);
    text-align: center;
    font-size: 0.78rem;
}
</style>
