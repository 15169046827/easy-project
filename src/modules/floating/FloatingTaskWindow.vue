<template>
    <section class="floating-root" :class="{ expanded }" data-testid="floating-window">
        <header class="floating-header">
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
        <p v-if="!expanded && (error || actionError)" class="collapsed-error" role="alert">
            {{ $t('floating.loadFailed') }}
        </p>
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
import {
    closeFloatingWindow,
    isFloatingNative,
    resizeFloatingWindow,
    returnToMain,
    setFloatingOnTop
} from './windowActions'

useTheme()
const native = isFloatingNative()
const expanded = ref(true)
const onTop = ref(true)
const actionError = ref('')
const { tasks, projectNames, error, loading, initialLoading, refresh } = useFloatingTasks()

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
