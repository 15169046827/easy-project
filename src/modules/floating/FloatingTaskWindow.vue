<template>
    <section
        class="floating-root"
        :class="{ expanded, collapsed: !expanded }"
        :data-dock-edge="dockEdge"
        data-testid="floating-window"
    >
        <Button
            v-if="!expanded"
            class="floating-ball"
            :disabled="resizing"
            :aria-label="$t('floating.ballHint')"
            :aria-expanded="false"
            v-tooltip.bottom="error || actionError || $t('floating.ballHint')"
            @pointerdown="pointerDown"
            @pointermove="pointerMove"
            @pointerup="pointerUp"
            @pointercancel="pointerUp"
            @click="ballClick"
            @keydown="ballKeydown"
        >
            <i class="pi pi-sparkles" aria-hidden="true" />
            <span v-if="error || actionError" class="ball-error" role="alert">!</span>
        </Button>
        <header v-if="expanded" class="floating-header">
            <div class="floating-drag" :data-tauri-drag-region="native ? '' : undefined">
                <i
                    class="pi pi-sparkles"
                    aria-hidden="true"
                    :data-tauri-drag-region="native ? '' : undefined"
                />
                <span :data-tauri-drag-region="native ? '' : undefined">{{
                    $t('floating.title')
                }}</span>
            </div>
            <Button
                type="button"
                :aria-label="expanded ? $t('floating.collapse') : $t('floating.expand')"
                :aria-expanded="expanded"
                :disabled="resizing"
                @click="toggleExpanded"
            >
                <i
                    :class="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                    aria-hidden="true"
                />
            </Button>
            <Button
                type="button"
                :aria-label="$t('floating.close')"
                @click="run(closeFloatingWindow)"
            >
                <i class="pi pi-times" aria-hidden="true" />
            </Button>
        </header>
        <div v-if="expanded" class="floating-content">
            <Message v-if="error || actionError" severity="error" :closable="false">
                {{ error || actionError }}
            </Message>
            <p v-if="initialLoading" role="status">{{ $t('common.loading') }}</p>
            <article
                v-for="task in tasks"
                :key="task.id"
                class="floating-task"
                :data-task-id="task.id"
            >
                <h2 v-tooltip.bottom="task.name">{{ task.name }}</h2>
                <Button
                    class="floating-project"
                    text
                    size="small"
                    :label="projectNames.get(task.project_id) || $t('floating.noProject')"
                    v-tooltip.bottom="projectNames.get(task.project_id) || $t('floating.noProject')"
                    @click="run(() => returnToMain(task.project_id || ''))"
                />
                <p>
                    {{ $t('floating.deadline') }}:
                    {{ task.end_time?.slice(0, 10) || $t('floating.noDeadline') }}
                </p>
                <div class="floating-progress">
                    <ProgressBar
                        :value="taskProgress(task)"
                        :showValue="false"
                        :aria-label="$t('floating.progress')"
                    /><span>{{ taskProgress(task) }}%</span>
                </div>
            </article>
            <p v-if="!initialLoading && !tasks.length && !error">{{ $t('floating.empty') }}</p>
            <p class="floating-hint">{{ $t('floating.refreshHint') }}</p>
        </div>
        <footer v-if="expanded">
            <Button type="button" :aria-pressed="onTop" :disabled="!native" @click="toggleOnTop">
                <i class="pi pi-thumbtack" aria-hidden="true" /> {{ $t('floating.onTop') }}
            </Button>
            <Button type="button" :disabled="loading" @click="run(refresh)">{{
                $t('floating.refresh')
            }}</Button>
            <Button type="button" @click="run(() => returnToMain(''))">
                {{ $t('floating.openMain') }}
            </Button>
        </footer>
        <div
            v-for="edge in expanded && native ? resizeEdges : []"
            :key="edge"
            :class="['resize-edge', edge]"
            :tabindex="edge === 'SouthEast' ? 0 : undefined"
            :role="edge === 'SouthEast' ? 'separator' : undefined"
            :aria-label="edge === 'SouthEast' ? $t('floating.resizeHint') : undefined"
            @pointerdown.prevent="run(() => startFloatingResize(edge))"
            @keydown="resizeKey"
        />
    </section>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'
import { useTheme } from '../../composables/useTheme'
import { useFloatingTasks } from './useFloatingTasks'
import { taskProgress } from './taskSelection'
import { useFloatingBall } from './useFloatingBall'
import {
    closeFloatingWindow,
    isFloatingNative,
    resizeFloatingWindow,
    returnToMain,
    setFloatingOnTop,
    startFloatingResize,
    keyboardFloatingResize
} from './windowActions'

useTheme()
const native = isFloatingNative()
const expanded = ref(true)
const resizing = ref(false)
const onTop = ref(true)
const actionError = ref('')
const { tasks, projectNames, error, loading, initialLoading, refresh } = useFloatingTasks()
const resizeEdges = [
    'North',
    'South',
    'East',
    'West',
    'NorthEast',
    'NorthWest',
    'SouthEast',
    'SouthWest'
]
const {
    dockEdge,
    pointerDown,
    pointerMove,
    pointerUp,
    click: ballClick,
    keydown: ballKeydown
} = useFloatingBall(run, toggleExpanded)

async function run(action) {
    try {
        await action()
        actionError.value = ''
        return true
    } catch (cause) {
        actionError.value = String(cause?.message || cause)
        return false
    }
}
async function toggleExpanded() {
    if (resizing.value) return
    resizing.value = true
    const next = !expanded.value
    expanded.value = next
    try {
        if (
            !(await run(async () => {
                const edge = await resizeFloatingWindow(next)
                dockEdge.value = next ? '' : edge || ''
            }))
        )
            expanded.value = !next
    } finally {
        resizing.value = false
    }
}
async function toggleOnTop() {
    const next = !onTop.value
    if (await run(() => setFloatingOnTop(next))) onTop.value = next
}
function resizeKey(event) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    run(() => keyboardFloatingResize(event.key))
}
</script>

<style scoped>
.floating-root {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 8px;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}
.floating-root.expanded {
    min-width: 340px;
    min-height: 360px;
}
.floating-root.collapsed {
    width: 64px;
    height: 64px;
    padding: 4px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    overflow: hidden;
}
.floating-ball.p-button {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 50%;
    background: var(--color-primary);
    color: white;
    touch-action: none;
    cursor: grab;
    user-select: none;
    border: 2px solid var(--color-surface);
    padding: 0;
    flex-shrink: 0;
    transition:
        transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
        background-color 150ms ease;
}
.floating-root.collapsed[data-dock-edge='left'] .floating-ball {
    transform: translateX(-32px);
}
.floating-root.collapsed[data-dock-edge='right'] .floating-ball {
    transform: translateX(32px);
}
.floating-root.collapsed[data-dock-edge='top'] .floating-ball {
    transform: translateY(-32px);
}
.floating-root.collapsed[data-dock-edge='bottom'] .floating-ball {
    transform: translateY(32px);
}
.floating-root.collapsed[data-dock-edge]:not([data-dock-edge='']) {
    border-radius: 0;
}
.floating-root.collapsed[data-dock-edge]:hover .floating-ball,
.floating-root.collapsed[data-dock-edge]:has(.floating-ball:focus-visible) .floating-ball {
    transform: translate(0, 0);
}
@media (prefers-reduced-motion: reduce) {
    .floating-ball.p-button {
        transition: none;
    }
}
.floating-ball.p-button:not(:disabled):hover {
    background: var(--color-primary-dark, #1d4ed8);
    color: white;
}
.floating-ball:active {
    cursor: grabbing;
}
.floating-ball i {
    font-size: 1.4rem;
    pointer-events: none;
}
.ball-error {
    position: absolute;
    right: 6px;
    top: 2px;
    color: var(--color-error-text);
}
.resize-edge {
    position: absolute;
    z-index: 5;
    touch-action: none;
}
.resize-edge:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
}
.North,
.South {
    height: 5px;
    left: 10px;
    right: 10px;
    cursor: ns-resize;
}
.North {
    top: 0;
}
.South {
    bottom: 0;
}
.East,
.West {
    width: 5px;
    top: 10px;
    bottom: 10px;
    cursor: ew-resize;
}
.East {
    right: 0;
}
.West {
    left: 0;
}
.NorthEast,
.NorthWest,
.SouthEast,
.SouthWest {
    width: 12px;
    height: 12px;
}
.NorthEast {
    top: 0;
    right: 0;
    cursor: nesw-resize;
}
.NorthWest {
    top: 0;
    left: 0;
    cursor: nwse-resize;
}
.SouthEast {
    bottom: 0;
    right: 0;
    cursor: nwse-resize;
}
.SouthWest {
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
}
.floating-header {
    display: flex;
    align-items: center;
    min-height: 44px;
    gap: 4px;
    flex-shrink: 0;
}
.floating-drag {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    padding: 6px;
    color: var(--color-primary-text);
}
.floating-drag span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
}
button {
    min-height: 32px;
    min-width: 32px;
    border: 0;
    border-radius: 6px;
    background: var(--color-subtle);
    color: var(--color-text);
    cursor: pointer;
}
button:hover {
    background: var(--color-subtle-hover);
}
button:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.floating-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px;
}
.floating-task {
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
}
h2 {
    font-size: 14px;
    margin: 0 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
p {
    font-size: 12px;
    margin: 8px 0;
}
.floating-project,
.floating-hint {
    color: var(--color-text-secondary);
}
.floating-project {
    max-width: 100%;
    min-height: 24px;
    padding: 0;
    justify-content: flex-start;
    background: transparent;
    font-size: 12px;
}
.floating-project :deep(.p-button-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.floating-progress :deep(.p-progressbar-value) {
    transition: none;
}
.floating-progress {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
}
.floating-progress :deep(.p-progressbar) {
    width: 100%;
    height: 8px;
}
footer {
    display: flex;
    gap: 4px;
    justify-content: space-between;
    flex-shrink: 0;
    padding-top: 8px;
}
footer button {
    padding: 4px 8px;
    font-size: 12px;
}
.floating-error,
.collapsed-error {
    color: var(--color-error-text);
}
.collapsed-error {
    margin: 0 6px;
    font-size: 10px;
}
</style>
