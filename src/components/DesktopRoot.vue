<template>
    <App v-if="ready" />
    <main v-else class="storage-setup">
        <WindowTitleBar v-if="chrome.visible" :native="chrome.native" />
        <div class="storage-setup-content"><StorageSettings setup-mode /></div>
    </main>
</template>

<script setup>
import App from '../App.vue'
import StorageSettings from './StorageSettings.vue'
import WindowTitleBar from './WindowTitleBar.vue'
import { getWindowChromeMode } from '../utils/windowChrome'
const ready = Boolean(window.__EASYPROJECT_STORAGE_INFO__?.ready)
const chrome = getWindowChromeMode()
</script>

<style scoped>
.storage-setup {
    height: 100vh;
    overflow: hidden;
    background: var(--color-bg);
}
.storage-setup-content {
    padding: 1.5rem;
    max-height: calc(100vh - 36px);
    overflow: auto;
}
</style>
