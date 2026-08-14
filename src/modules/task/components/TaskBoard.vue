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
                :class="{ 'drop-active': dragOver === column.status }"
                @dragover.prevent="dragOver = column.status"
                @dragleave="dragOver = ''"
                @drop="dropTask(column.status)"
            >
                <header>
                    <span class="status-dot" :class="column.status.toLowerCase()"></span>
                    <h4>{{ column.label }}</h4>
                    <small>{{ tasksByStatus[column.status].length }}</small>
                </header>
                <div class="card-list">
                    <button
                        v-for="task in tasksByStatus[column.status]"
                        :key="task.id"
                        class="board-card"
                        draggable="true"
                        @dragstart="startDrag(task)"
                        @dragend="finishDrag"
                        @click="$emit('open', task)"
                    >
                        <span class="priority" :class="`p${task.priority || 3}`"
                            >P{{ task.priority || 3 }}</span
                        >
                        <strong>{{ task.name }}</strong>
                        <p v-if="task.comment">{{ task.comment }}</p>
                        <footer>
                            <span><i class="pi pi-user"></i>{{ memberName(task.assignee) }}</span>
                            <time v-if="task.end_time"
                                ><i class="pi pi-calendar"></i>{{ dateOnly(task.end_time) }}</time
                            >
                        </footer>
                        <span class="progress-track"
                            ><i :style="{ width: `${Number(task.progress) || 0}%` }"></i
                        ></span>
                    </button>
                    <p v-if="!tasksByStatus[column.status].length" class="empty-column">
                        {{ $t('board.empty') }}
                    </p>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../api'

const props = defineProps({
    tasks: { type: Array, default: () => [] },
    members: { type: Array, default: () => [] }
})
const emit = defineEmits(['updated', 'open'])
const { t } = useI18n()
const dragging = ref(null)
const dragOver = ref('')
const message = ref('')
const messageType = ref('success')

const columns = computed(() => [
    { status: 'Pending', label: t('board.pending') },
    { status: 'InProgress', label: t('board.inProgress') },
    { status: 'Done', label: t('board.done') }
])
const tasksByStatus = computed(() =>
    Object.fromEntries(
        columns.value.map(column => [
            column.status,
            props.tasks.filter(task => (task.status || 'Pending') === column.status)
        ])
    )
)

function memberName(id) {
    return props.members.find(member => member.id === id)?.name || t('board.unassigned')
}
function dateOnly(value) {
    return String(value).slice(0, 10)
}
function startDrag(task) {
    dragging.value = task
}
function finishDrag() {
    dragging.value = null
    dragOver.value = ''
}
async function dropTask(status) {
    const task = dragging.value
    finishDrag()
    if (!task || task.status === status) return
    try {
        await crudAction('task', 'update', {
            id: task.id,
            status,
            ...(status === 'Done' ? { progress: 100 } : {})
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
    grid-template-columns: repeat(3, minmax(16rem, 1fr));
    gap: 0.9rem;
    min-width: 52rem;
    min-height: calc(100% - 5rem);
}
.board-column {
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
}
.board-column h4 {
    flex: 1;
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
    align-content: start;
    gap: 0.6rem;
}
.board-card {
    display: grid;
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
}
.board-card:active {
    cursor: grabbing;
}
.board-card:hover {
    border-color: #bfdbfe;
    box-shadow: 0 5px 14px var(--color-card-shadow);
}
.priority {
    width: fit-content;
    padding: 0.12rem 0.4rem;
    border-radius: 0.3rem;
    color: #475569;
    background: #e2e8f0;
    font-size: 0.65rem;
    font-weight: 800;
}
.priority.p1 {
    color: #b91c1c;
    background: #fee2e2;
}
.priority.p2 {
    color: #c2410c;
    background: #ffedd5;
}
.board-card > strong {
    font-size: 0.86rem;
}
.board-card > p {
    overflow: hidden;
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
    text-overflow: ellipsis;
    white-space: nowrap;
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
}
.progress-track {
    display: block;
    height: 0.22rem;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color-border);
}
.progress-track i {
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
