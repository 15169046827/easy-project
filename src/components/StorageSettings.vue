<template>
    <article class="data-card storage-card" aria-labelledby="storage-heading">
        <h3 id="storage-heading">{{ $t('storage.title') }}</h3>
        <p>{{ $t('storage.description') }}</p>
        <p v-if="error" class="storage-error" role="alert">{{ error }}</p>
        <template v-if="info">
            <dl>
                <dt>{{ $t('storage.currentDatabase') }}</dt>
                <dd>
                    <code>{{ info.databasePath }}</code>
                </dd>
                <dt>{{ $t('storage.profile') }}</dt>
                <dd>
                    <code>{{ info.profileDir }}</code>
                </dd>
            </dl>
            <label for="storage-directory">{{ $t('storage.destination') }}</label>
            <InputText id="storage-directory" v-model="directory" :disabled="saving" />
            <small>{{ $t('storage.pathHint') }}</small>
            <p v-if="info.pendingDir" role="status" class="storage-pending">
                {{ $t('storage.pending', { path: info.pendingDir }) }}
            </p>
            <div class="storage-actions">
                <Button
                    :label="$t('storage.useDefault')"
                    outlined
                    :disabled="saving"
                    @click="directory = info.defaultDir"
                />
                <Button
                    :label="$t('storage.configure')"
                    :disabled="!directory.trim() || saving"
                    @click="confirming = true"
                />
                <Button
                    v-if="setupMode && info.pendingDir"
                    :label="$t('storage.closeForRestart')"
                    outlined
                    @click="closeWindow"
                />
            </div>
        </template>
        <p v-else>{{ $t('storage.desktopOnly') }}</p>
        <Dialog
            v-model:visible="confirming"
            modal
            :header="$t('storage.confirmTitle')"
            :style="{ width: 'min(32rem, calc(100vw - 2rem))' }"
            :closable="!saving"
        >
            <p>{{ $t('storage.confirmHint') }}</p>
            <code class="storage-target">{{ directory }}</code>
            <template #footer>
                <Button
                    :label="$t('common.cancel')"
                    outlined
                    :disabled="saving"
                    @click="confirming = false"
                />
                <Button :label="$t('common.confirm')" :loading="saving" @click="save" />
            </template>
        </Dialog>
    </article>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { getStorageInfo, setDataDirectory } from '../api/storage'

defineProps({ setupMode: { type: Boolean, default: false } })
const info = ref(/** @type {import('../api/storage').StorageInfo|null} */ (null))
const directory = ref(''),
    error = ref(''),
    confirming = ref(false),
    saving = ref(false)
onMounted(async () => {
    try {
        info.value = await getStorageInfo()
        directory.value = info.value?.pendingDir || info.value?.activeDir || ''
        error.value = info.value?.error || ''
    } catch (reason) {
        error.value = String(reason)
    }
})
async function save() {
    saving.value = true
    try {
        info.value = await setDataDirectory(directory.value.trim())
        error.value = info.value.error || ''
        confirming.value = false
    } catch (reason) {
        error.value = String(reason)
    } finally {
        saving.value = false
    }
}
async function closeWindow() {
    try {
        await getCurrentWindow().close()
    } catch (reason) {
        error.value = String(reason)
    }
}
</script>

<style scoped>
.storage-card {
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    min-width: 0;
}
.storage-card h3 {
    margin: 0 0 0.5rem;
}
.storage-card p,
.storage-card small {
    color: var(--color-text-secondary);
}
.storage-card dl {
    margin: 1rem 0;
}
.storage-card dt {
    font-size: 0.8rem;
    margin-top: 0.5rem;
}
.storage-card dd {
    margin: 0.2rem 0 0;
}
.storage-card code,
.storage-target {
    overflow-wrap: anywhere;
    white-space: normal;
}
.storage-card label,
.storage-card small {
    display: block;
    margin: 0.5rem 0;
}
.storage-card .p-inputtext {
    width: 100%;
}
.storage-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1rem;
}
.storage-card .storage-error {
    color: var(--color-error-text);
}
.storage-card .storage-pending {
    color: var(--color-warning-text);
}
</style>
