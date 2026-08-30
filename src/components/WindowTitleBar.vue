<template>
    <div class="window-titlebar" data-testid="window-titlebar">
        <div class="window-titlebar__drag" :data-tauri-drag-region="native ? '' : undefined">
            <img
                class="window-titlebar__icon"
                :src="appIconUrl"
                alt=""
                :data-tauri-drag-region="native ? '' : undefined"
            />
            <span :data-tauri-drag-region="native ? '' : undefined">EasyProject</span>
        </div>

        <div class="window-titlebar__controls" role="group" :aria-label="$t('app.windowControls')">
            <button
                type="button"
                class="window-titlebar__button"
                data-testid="window-minimize"
                :title="$t('app.windowMinimize')"
                :aria-label="$t('app.windowMinimize')"
                :aria-disabled="!native"
                @click="minimize"
            >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 8.5h8" />
                </svg>
            </button>
            <button
                type="button"
                class="window-titlebar__button"
                data-testid="window-maximize"
                :title="isMaximized ? $t('app.windowRestore') : $t('app.windowMaximize')"
                :aria-label="isMaximized ? $t('app.windowRestore') : $t('app.windowMaximize')"
                :aria-disabled="!native"
                @click="toggleMaximize"
            >
                <svg v-if="isMaximized" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M4 2.5h5.5V8H8M2.5 4H8v5.5H2.5z" />
                </svg>
                <svg v-else viewBox="0 0 12 12" aria-hidden="true">
                    <rect x="2.5" y="2.5" width="7" height="7" />
                </svg>
            </button>
            <button
                type="button"
                class="window-titlebar__button window-titlebar__button--close"
                data-testid="window-close"
                :title="$t('app.windowClose')"
                :aria-label="$t('app.windowClose')"
                :aria-disabled="!native"
                @click="close"
            >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="m2.5 2.5 7 7m0-7-7 7" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import appIconUrl from '../../src-tauri/icons/icon.svg'

const props = defineProps({
    native: {
        type: Boolean,
        default: false
    }
})

const isMaximized = ref(false)
const appWindow = props.native ? getCurrentWindow() : null
let unlistenResize

async function refreshMaximizedState() {
    if (!appWindow) return
    try {
        isMaximized.value = await appWindow.isMaximized()
    } catch {
        isMaximized.value = false
    }
}

async function minimize() {
    if (!appWindow) return
    await appWindow.minimize()
}

async function toggleMaximize() {
    if (!appWindow) return
    await appWindow.toggleMaximize()
    await refreshMaximizedState()
}

async function close() {
    if (!appWindow) return
    await appWindow.close()
}

onMounted(async () => {
    await refreshMaximizedState()
    if (!appWindow) return
    try {
        unlistenResize = await appWindow.onResized(refreshMaximizedState)
    } catch {
        unlistenResize = undefined
    }
})

onUnmounted(() => unlistenResize?.())
</script>

<style scoped>
.window-titlebar {
    position: relative;
    z-index: 100;
    display: flex;
    height: 36px;
    color: var(--color-header-text);
    background: linear-gradient(100deg, var(--color-header-bg-start), var(--color-header-bg-end));
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    user-select: none;
    -webkit-user-select: none;
}

.window-titlebar__drag {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    padding-left: 0.8rem;
    cursor: default;
}

.window-titlebar__icon {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
}

.window-titlebar__drag span {
    overflow: hidden;
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.015em;
    opacity: 0.9;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.window-titlebar__controls {
    display: flex;
    align-items: stretch;
    height: 36px;
}

.window-titlebar__button {
    display: inline-flex;
    width: 46px;
    height: 36px;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 0;
    cursor: default;
    transition: background var(--transition-fast);
}

.window-titlebar__button svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: currentColor;
    stroke-linecap: square;
    stroke-width: 1;
}

.window-titlebar__button:hover {
    background: rgba(255, 255, 255, 0.13);
}

.window-titlebar__button--close:hover {
    color: #fff;
    background: #e81123;
}

.window-titlebar__button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.9);
    outline-offset: -2px;
}
</style>
