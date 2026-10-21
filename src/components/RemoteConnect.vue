<template>
    <Button
        v-if="!remoteActive && native"
        class="theme-toggle remote-connect-entry"
        icon="pi pi-cloud"
        text
        :aria-label="$t('remote.connect')"
        v-tooltip.bottom="$t('remote.connect')"
        @click="selectRemote()"
    />
</template>
<script setup>
import { isTauri } from '@tauri-apps/api/core'
import Button from 'primevue/button'
import { remoteActive, selectRemote } from '../api/remote'
const native = isTauri()
</script>
<style scoped>
.remote-connect-entry {
    flex: 0 0 2.5rem;
    width: 2.5rem;
    min-width: 2.5rem;
    color: inherit;
}
</style>
