<template>
    <section class="floating-root" :class="{ expanded }" data-testid="floating-window">
        <header class="floating-header">
            <div class="floating-drag" :data-tauri-drag-region="native ? '' : undefined">
                <i
                    class="pi pi-sparkles"
                    aria-hidden="true"
                    :data-tauri-drag-region="native ? '' : undefined"
                />
                <span :title="task?.name" :data-tauri-drag-region="native ? '' : undefined">{{
                    task?.name || $t('floating.title')
                }}</span>
            </div>
            <button
                type="button"
                :aria-label="expanded ? $t('floating.collapse') : $t('floating.expand')"
                :aria-expanded="expanded"
                @click="toggleExpanded"
            >
                <i
                    :class="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
                    aria-hidden="true"
                />
            </button>
            <button
                type="button"
                :aria-label="$t('floating.close')"
                @click="run(closeFloatingWindow)"
            >
                <i class="pi pi-times" aria-hidden="true" />
            </button>
        </header>
        <div v-if="expanded" class="floating-content">
            <p v-if="error || actionError" role="alert" class="floating-error">
                {{ error || actionError }}
            </p>
            <label for="floating-task-select">{{ $t('floating.currentTask') }}</label>
            <select
                id="floating-task-select"
                :value="task?.id || ''"
                :disabled="!tasks.length"
                @change="onTaskChange"
            >
                <option v-if="!tasks.length" value="">{{ $t('floating.empty') }}</option>
                <option v-for="item in tasks" :key="item.id" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
            <template v-if="task">
                <h2>{{ task.name }}</h2>
                <p class="floating-project">{{ project?.name || $t('floating.noProject') }}</p>
                <p>
                    {{ $t('floating.deadline') }}:
                    {{ task.end_time?.slice(0, 10) || $t('floating.noDeadline') }}
                </p>
                <div class="floating-progress">
                    <progress
                        :value="taskProgress(task)"
                        max="100"
                        :aria-label="$t('floating.progress')"
                    /><span>{{ taskProgress(task) }}%</span>
                </div>
            </template>
            <p v-else>{{ $t('floating.empty') }}</p>
            <p class="floating-hint">{{ $t('floating.refreshHint') }}</p>
        </div>
        <footer v-if="expanded">
            <button type="button" :aria-pressed="onTop" :disabled="!native" @click="toggleOnTop">
                <i class="pi pi-thumbtack" aria-hidden="true" /> {{ $t('floating.onTop') }}
            </button>
            <button type="button" @click="run(refresh)">{{ $t('floating.refresh') }}</button>
            <button type="button" @click="run(() => returnToMain(task?.project_id || ''))">
                {{ $t('floating.openMain') }}
            </button>
        </footer>
        <p v-if="!expanded && (error || actionError)" class="collapsed-error" role="alert">
            {{ $t('floating.loadFailed') }}
        </p>
    </section>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '../../composables/useTheme'
import { useFloatingTasks } from './useFloatingTasks'
import { taskProgress } from './taskSelection'
import {
    closeFloatingWindow,
    isFloatingNative,
    resizeFloatingWindow,
    returnToMain,
    setFloatingOnTop
} from './windowActions'

useTheme()
const native = isFloatingNative()
const expanded = ref(false)
const onTop = ref(true)
const actionError = ref('')
const { tasks, task, project, error, selectTask, refresh } = useFloatingTasks()

/** @param {Event} event */
function onTaskChange(event) {
    if (event.target instanceof HTMLSelectElement) selectTask(event.target.value)
}

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
    const next = !expanded.value
    if (await run(() => resizeFloatingWindow(next))) expanded.value = next
}
async function toggleOnTop() {
    const next = !onTop.value
    if (await run(() => setFloatingOnTop(next))) onTop.value = next
}
</script>

<style scoped>
.floating-root {
    width: 100%;
    max-width: 340px;
    height: 72px;
    display: flex;
    flex-direction: column;
    padding: 8px;
    color: var(--color-text);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
}
.floating-root.expanded {
    height: min(360px, 100vh);
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
button:focus-visible,
select:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.floating-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 8px;
}
label {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
    color: var(--color-text-secondary);
}
select {
    width: 100%;
    padding: 6px;
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 6px;
}
h2 {
    font-size: 16px;
    margin: 14px 0 4px;
    overflow-wrap: anywhere;
}
p {
    font-size: 12px;
    margin: 8px 0;
}
.floating-project,
.floating-hint {
    color: var(--color-text-secondary);
}
.floating-progress {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
}
progress {
    width: 100%;
    accent-color: var(--color-primary);
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
