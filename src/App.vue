<template>
    <main class="app-shell">
        <header class="app-header">
            <div class="header-left">
                <span class="eyebrow">{{ $t('app.subtitle') }}</span>
                <h1>EasyProject</h1>
            </div>
            <nav aria-label="Workspace views">
                <button
                    :class="{ active: route.name === 'Dashboard' }"
                    @click="go('/dashboard')"
                    :title="$t('nav.dashboard') + ' (Ctrl+1)'"
                >
                    {{ $t('nav.dashboard') }}
                </button>
                <button
                    :class="{ active: route.name === 'Projects' || route.name === 'Project' }"
                    @click="go('/projects')"
                    :title="$t('nav.projects') + ' (Ctrl+2)'"
                >
                    {{ $t('nav.projects') }}
                </button>
                <button
                    :class="{ active: route.name === 'Tasks' }"
                    @click="go('/tasks')"
                    :title="$t('nav.tasks') + ' (Ctrl+3)'"
                >
                    {{ $t('nav.tasks') }}
                </button>
                <button
                    :class="{ active: route.name === 'Data' }"
                    @click="go('/data')"
                    :title="$t('nav.data') + ' (Ctrl+4)'"
                >
                    {{ $t('nav.data') }}
                </button>
                <button
                    :class="{ active: route.name === 'Members' }"
                    @click="go('/members')"
                    :title="$t('nav.members') + ' (Ctrl+5)'"
                >
                    {{ $t('nav.members') }}
                </button>
            </nav>
            <div class="header-actions">
                <Select
                    class="lang-select"
                    :modelValue="locale"
                    :options="langOptions"
                    optionLabel="label"
                    optionValue="value"
                    :placeholder="$t('app.language')"
                    @update:modelValue="setLocale"
                />
                <button
                    class="theme-toggle"
                    @click="toggleTheme"
                    :title="(isDark ? $t('app.themeToLight') : $t('app.themeToDark')) + ' (Ctrl+D)'"
                >
                    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"></i>
                </button>
                <button
                    class="help-toggle"
                    @click="showHelp = !showHelp"
                    :title="$t('app.shortcutsTitle') + ' (?)'"
                >
                    <i class="pi pi-question-circle"></i>
                </button>
            </div>
        </header>

        <router-view :key="viewRevision" />

        <Transition name="history-fade">
            <div v-if="historyMessage" class="history-toast">{{ historyMessage }}</div>
        </Transition>

        <!-- 快捷键帮助面板 -->
        <Teleport to="body">
            <Transition name="help-fade">
                <div v-if="showHelp" class="help-overlay" @click.self="showHelp = false">
                    <div class="help-panel">
                        <div class="help-header">
                            <h3>{{ $t('app.helpTitle') }}</h3>
                            <button
                                class="help-close"
                                @click="showHelp = false"
                                :title="$t('app.closeHelp') + ' (?)'"
                            >
                                <i class="pi pi-times"></i>
                            </button>
                        </div>
                        <div class="help-list">
                            <div v-for="s in shortcutsHelp" :key="s.keys" class="help-item">
                                <kbd>{{ s.keys }}</kbd>
                                <span>{{ $t(s.description) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- 新手引导 -->
        <OnboardingGuide ref="onboardingRef" />
    </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import OnboardingGuide from './components/OnboardingGuide.vue'
import { useTheme } from './composables/useTheme'
import { useKeyboard, SHORTCUTS_HELP } from './composables/useKeyboard'
import { setLocale } from './i18n'
import { canRedo, canUndo, crudAction, enableHistory, redoLastAction, undoLastAction } from './api'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const { isDark, toggle: toggleTheme } = useTheme()

const langOptions = [
    { label: '中文', value: 'zh-CN' },
    { label: 'English', value: 'en-US' }
]

const showHelp = ref(false)
const viewRevision = ref(0)
const historyMessage = ref('')
let historyTimer
let backupTimer
const shortcutsHelp = SHORTCUTS_HELP

function go(path) {
    router.push(path)
}

function showHistoryMessage(value) {
    historyMessage.value = value
    clearTimeout(historyTimer)
    historyTimer = setTimeout(() => (historyMessage.value = ''), 2400)
}

async function undo() {
    if (!canUndo.value) return
    const label = await undoLastAction()
    if (label) showHistoryMessage(t('history.undone'))
}

async function redo() {
    if (!canRedo.value) return
    const label = await redoLastAction()
    if (label) showHistoryMessage(t('history.redone'))
}

function refreshAfterHistory() {
    viewRevision.value += 1
}

onMounted(() => {
    enableHistory()
    window.addEventListener('easyproject:data-changed', refreshAfterHistory)
    backupTimer = setInterval(
        () => crudAction('data', 'backup', { reason: 'auto' }).catch(() => {}),
        30 * 60 * 1000
    )
})
onUnmounted(() => {
    window.removeEventListener('easyproject:data-changed', refreshAfterHistory)
    clearTimeout(historyTimer)
    clearInterval(backupTimer)
})

// 全局快捷键
useKeyboard([
    { key: '1', ctrl: true, handler: () => go('/dashboard'), description: '仪表盘' },
    { key: '2', ctrl: true, handler: () => go('/projects'), description: '项目管理' },
    { key: '3', ctrl: true, handler: () => go('/tasks'), description: '任务列表' },
    { key: '4', ctrl: true, handler: () => go('/data'), description: '数据管理' },
    { key: '5', ctrl: true, handler: () => go('/members'), description: '人员管理' },
    { key: 'd', ctrl: true, handler: toggleTheme, description: '切换暗色模式' },
    { key: 'z', ctrl: true, handler: undo, description: '撤销' },
    { key: 'y', ctrl: true, handler: redo, description: '重做' },
    {
        key: '?',
        handler: () => {
            showHelp.value = !showHelp.value
        },
        description: '快捷键帮助'
    },
    {
        key: 'Escape',
        handler: () => {
            if (showHelp.value) showHelp.value = false
        },
        description: '关闭帮助'
    }
])
</script>

<style>
* {
    box-sizing: border-box;
}

:root {
    --color-bg: #f4f7fb;
    --color-text: #172033;
    --color-text-secondary: #64748b;
    --color-text-muted: #475569;
    --color-header-bg-start: #172554;
    --color-header-bg-end: #1d4ed8;
    --color-header-text: white;
    --color-nav-active-bg: white;
    --color-nav-active-text: #172554;
    --color-nav-text: #dbeafe;
    --color-panel-bg: white;
    --color-surface: white;
    --color-surface-raised: #fafbfc;
    --color-subtle: #f8fafc;
    --color-subtle-hover: #f1f5f9;
    --color-panel-shadow: rgba(15, 23, 42, 0.06);
    --color-card-shadow: rgba(15, 23, 42, 0.05);
    --color-border: #e2e8f0;
    --color-border-light: #f1f5f9;
    --color-help-bg: white;
    --color-overlay: rgba(0, 0, 0, 0.4);
    --color-primary: #2563eb;
    --color-primary-light: #dbeafe;
    --color-primary-text: #1d4ed8;
    --color-success-bg: #dcfce7;
    --color-success-text: #166534;
    --color-warning-bg: #fef3c7;
    --color-warning-text: #92400e;
    --color-error-bg: #fef2f2;
    --color-error-text: #b91c1c;
    --color-scrollbar-track: #f1f5f9;
    --color-scrollbar-thumb: #94a3b8;
    --color-scrollbar-thumb-hover: #64748b;

    /* 新增通用变量 */
    --radius-sm: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 0.9rem;
    --radius-xl: 1rem;
    --transition-fast: 0.15s ease;
    --transition-normal: 0.25s ease;

    /* 状态颜色常量 */
    --status-draft: #94a3b8;
    --status-inprogress: #3b82f6;
    --status-paused: #f59e0b;
    --status-done: #22c55e;
    --status-archived: #6b7280;
    --priority-p1: #ef4444;
    --priority-p2: #f97316;
    --priority-p3: #eab308;
    --priority-p4: #3b82f6;
    --priority-p5: #6b7280;

    /* 统一布局尺寸 */
    --page-gap: 0.75rem;
    --header-mb: 1.25rem;
    --stat-icon-size: 2.4rem;
    --stat-icon-radius: 0.6rem;
    --stat-icon-font: 1rem;
    --stat-num-size: 1.35rem;
    --stat-label-size: 0.75rem;
    --card-padding: 0.85rem 1rem;
}

.app-dark {
    --color-bg: #0f172a;
    --color-text: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-text-muted: #64748b;
    --color-header-bg-start: #020617;
    --color-header-bg-end: #1e3a8a;
    --color-header-text: #e2e8f0;
    --color-nav-active-bg: #1e293b;
    --color-nav-active-text: #93c5fd;
    --color-nav-text: #94a3b8;
    --color-panel-bg: #1e293b;
    --color-surface: #1e293b;
    --color-surface-raised: #1a2332;
    --color-subtle: #1e293b;
    --color-subtle-hover: #334155;
    --color-panel-shadow: rgba(0, 0, 0, 0.3);
    --color-card-shadow: rgba(0, 0, 0, 0.2);
    --color-border: #334155;
    --color-border-light: #1e293b;
    --color-help-bg: #1e293b;
    --color-overlay: rgba(0, 0, 0, 0.6);
    --color-primary: #3b82f6;
    --color-primary-light: #1e3a8a;
    --color-primary-text: #93c5fd;
    --color-success-bg: #064e3b;
    --color-success-text: #6ee7b7;
    --color-warning-bg: #78350f;
    --color-warning-text: #fcd34d;
    --color-error-bg: #7f1d1d;
    --color-error-text: #fca5a5;
    --color-scrollbar-track: #1e293b;
    --color-scrollbar-thumb: #475569;
    --color-scrollbar-thumb-hover: #64748b;
}

body {
    margin: 0;
    color: var(--color-text);
    background: var(--color-bg);
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    transition:
        background 0.3s ease,
        color 0.3s ease;
}

button,
input,
select,
textarea {
    font: inherit;
}

.workspace-table .p-datatable-paginator-bottom,
.workspace-table .p-paginator {
    width: 100%;
    box-sizing: border-box;
    background: var(--color-surface);
}

/* 全局滚动条美化 */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: var(--color-scrollbar-track);
    border-radius: 999px;
}
::-webkit-scrollbar-thumb {
    background: var(--color-scrollbar-thumb);
    border-radius: 999px;
    border: 2px solid var(--color-scrollbar-track);
}
::-webkit-scrollbar-thumb:hover {
    background: var(--color-scrollbar-thumb-hover);
}

/* 通用卡片样式 */
.card {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
    transition:
        box-shadow var(--transition-normal),
        border-color var(--transition-normal);
}
.card:hover {
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
    border-color: #cbd5e1;
}

/* 通用 Pill 标签 */
.pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    white-space: nowrap;
}
.pill .pill-dot {
    width: 0.4rem;
    height: 0.4rem;
    border-radius: 50%;
    flex-shrink: 0;
}

/* 状态 Pill 颜色 */
.pill-draft {
    color: var(--status-draft);
    background: #f1f5f9;
}
.pill-draft .pill-dot {
    background: var(--status-draft);
}
.pill-inprogress {
    color: #1d4ed8;
    background: #dbeafe;
}
.pill-inprogress .pill-dot {
    background: var(--status-inprogress);
}
.pill-paused {
    color: #92400e;
    background: #fef3c7;
}
.pill-paused .pill-dot {
    background: var(--status-paused);
}
.pill-done {
    color: #166534;
    background: #dcfce7;
}
.pill-done .pill-dot {
    background: var(--status-done);
}
.pill-archived {
    color: #475569;
    background: #f1f5f9;
}
.pill-archived .pill-dot {
    background: var(--status-archived);
}

.app-dark .pill-draft {
    color: #cbd5e1;
    background: #1e293b;
}
.app-dark .pill-inprogress {
    color: #93c5fd;
    background: #1e3a8a;
}
.app-dark .pill-paused {
    color: #fcd34d;
    background: #78350f;
}
.app-dark .pill-done {
    color: #6ee7b7;
    background: #064e3b;
}
.app-dark .pill-archived {
    color: #94a3b8;
    background: #1e293b;
}

/* 优先级颜色 */
.priority-p1 {
    color: var(--priority-p1);
    font-weight: 700;
}
.priority-p2 {
    color: var(--priority-p2);
    font-weight: 700;
}
.priority-p3 {
    color: var(--priority-p3);
    font-weight: 600;
}
.priority-p4 {
    color: var(--priority-p4);
}
.priority-p5 {
    color: var(--priority-p5);
}

.app-shell {
    min-height: 100vh;
}

.app-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 1.2rem 1.5rem;
    color: var(--color-header-text);
    background: linear-gradient(135deg, var(--color-header-bg-start), var(--color-header-bg-end));
    transition: background 0.3s ease;
    position: relative;
}
.app-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
}

.header-left {
    min-width: 11rem;
}
.header-left h1 {
    margin: 0.15rem 0 0;
    font-size: 1.65rem;
    font-weight: 700;
    letter-spacing: -0.02em;
}

.eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.16em;
    opacity: 0.75;
    text-transform: uppercase;
}

nav {
    display: flex;
    gap: 0.3rem;
    padding: 0.25rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 0.65rem;
    flex-shrink: 0;
}

nav button {
    border: 0;
    border-radius: 0.5rem;
    padding: 0.55rem 1.1rem;
    color: var(--color-nav-text);
    background: transparent;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    min-width: 5.5rem;
    text-align: center;
    transition: all 0.2s ease;
    position: relative;
}

nav button:hover {
    color: var(--color-header-text);
    background: rgba(255, 255, 255, 0.08);
}

nav button.active {
    color: var(--color-nav-active-text);
    background: var(--color-nav-active-bg);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
    display: flex;
    gap: 0.35rem;
    align-items: center;
    flex-shrink: 0;
}

.lang-select {
    min-width: 7.5rem;
    width: 7.5rem;
    font-size: 0.82rem;
}

.theme-toggle,
.help-toggle {
    border: 0;
    border-radius: 0.5rem;
    padding: 0.5rem;
    color: var(--color-nav-text);
    background: transparent;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.1rem;
    height: 2.1rem;
}

.theme-toggle:hover,
.help-toggle:hover {
    color: var(--color-header-text);
    background: rgba(255, 255, 255, 0.15);
}

/* 快捷键帮助面板 */
.help-overlay {
    position: fixed;
    inset: 0;
    background: var(--color-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(2px);
}

.help-panel {
    background: var(--color-help-bg);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    min-width: 360px;
    max-width: 440px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.help-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--color-border);
}

.help-header h3 {
    margin: 0;
    font-size: 1.15rem;
    color: var(--color-text);
}

.help-close {
    border: 0;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 0.25rem;
    opacity: 0.6;
}

.help-close:hover {
    opacity: 1;
    background: rgba(128, 128, 128, 0.15);
}

.help-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.help-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0;
    font-size: 0.875rem;
    color: var(--color-text);
}

.help-item kbd {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    font-size: 0.8rem;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 0.3rem;
    color: var(--color-text);
    min-width: 60px;
    text-align: center;
}

.help-fade-enter-active,
.help-fade-leave-active {
    transition: opacity 0.2s ease;
}

.help-fade-enter-from,
.help-fade-leave-to {
    opacity: 0;
}

.help-fade-enter-active .help-panel {
    animation: help-slide 0.2s ease;
}
.history-toast {
    position: fixed;
    left: 50%;
    bottom: 1.5rem;
    z-index: 10001;
    transform: translateX(-50%);
    padding: 0.7rem 1rem;
    border-radius: 0.6rem;
    color: #fff;
    background: #172033;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    font-size: 0.84rem;
}
.history-fade-enter-active,
.history-fade-leave-active {
    transition:
        opacity 0.18s ease,
        transform 0.18s ease;
}
.history-fade-enter-from,
.history-fade-leave-to {
    opacity: 0;
    transform: translate(-50%, 0.5rem);
}

@keyframes help-slide {
    from {
        transform: translateY(-10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 820px) {
    .app-header {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.85rem;
    }
    nav {
        width: 100%;
        overflow-x: auto;
    }
    nav button {
        flex: 0 0 auto;
    }
    .header-actions {
        position: absolute;
        top: 1.2rem;
        right: 1.5rem;
    }
}
</style>
