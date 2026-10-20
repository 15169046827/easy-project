<template>
    <Button
        v-if="!remoteActive && native"
        icon="pi pi-cloud"
        text
        :label="$t('remote.connect')"
        @click="visible = true"
    />
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('remote.connect')"
        :style="{ width: '30rem', maxWidth: '95vw' }"
    >
        <form class="remote-connect" @submit.prevent="connect">
            <p>{{ $t('remote.localPreserved') }}</p>
            <label for="server-url">{{ $t('remote.serverUrl') }}</label>
            <InputText
                id="server-url"
                v-model="url"
                type="url"
                required
                placeholder="https://home-host.tail2956dd.ts.net"
            />
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <Button type="submit" :label="$t('remote.connect')" />
        </form>
    </Dialog>
</template>
<script setup>
import { ref } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { remoteActive, remoteEndpoint, selectRemote } from '../api/remote'
const native = isTauri()
const visible = ref(false)
const url = ref(remoteEndpoint.value || 'https://home-host.tail2956dd.ts.net')
const error = ref('')
function connect() {
    try {
        selectRemote(url.value)
    } catch (failure) {
        error.value = failure.message
    }
}
</script>
<style scoped>
.remote-connect {
    display: grid;
    gap: 0.8rem;
}
</style>
