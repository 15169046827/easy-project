<template>
    <Button
        class="theme-toggle"
        :aria-label="t('updates.title')"
        v-tooltip.bottom="t('updates.title')"
        @click="visible = true"
    >
        <i class="pi pi-info-circle" aria-hidden="true" />
    </Button>
    <Dialog
        v-model:visible="visible"
        modal
        :header="t('updates.title')"
        :style="{ width: '34rem', maxWidth: '95vw' }"
        @hide="cancel"
    >
        <div class="version-check">
            <dl>
                <dt>{{ t('updates.installed') }}</dt>
                <dd>{{ currentVersion }}</dd>
                <dt>{{ t('updates.build') }}</dt>
                <dd>
                    <code :title="fullCommit" v-tooltip.top="fullCommit">{{ commit }}</code>
                </dd>
            </dl>
            <p>{{ t('updates.manualOnly') }}</p>
            <p v-if="internalBuild">{{ t('updates.internalHint') }}</p>
            <p v-if="loading" role="status">{{ t('updates.checking') }}</p>
            <Message v-if="error" severity="warn" :closable="false">{{ t(error) }}</Message>
            <div v-if="checked && !loading && !error" role="status">
                <template v-if="release">
                    <p>
                        {{
                            t('updates.latest', {
                                version: release.version,
                                date: release.publishedDate
                            })
                        }}
                    </p>
                    <Message severity="info" :closable="false">{{
                        t('updates.' + relationship)
                    }}</Message>
                    <p>{{ t('updates.signatureHint') }}</p>
                </template>
                <p v-else>{{ t('updates.noRelease') }}</p>
            </div>
        </div>
        <template #footer>
            <Button :label="t('common.close')" outlined @click="visible = false" />
            <Button
                v-if="release"
                :label="t('updates.openRelease')"
                icon="pi pi-external-link"
                outlined
                @click="openRelease"
            />
            <Button
                :label="t('updates.check')"
                icon="pi pi-cloud-download"
                :disabled="loading"
                @click="check"
            />
        </template>
    </Dialog>
</template>

<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { isTauri } from '@tauri-apps/api/core'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import { checkPublicRelease } from '../utils/releaseCheck'
import { isInternalBuildTag, releaseRelationship } from '../utils/releaseVersion'

const { t } = useI18n()
const visible = ref(false),
    loading = ref(false),
    checked = ref(false),
    error = ref('')
const release = ref(
    /** @type {ReturnType<typeof import('../utils/releaseVersion').validateReleaseInfo>} */ (null)
)
const releaseTag = import.meta.env.VITE_RELEASE_TAG || ''
const internalBuild = isInternalBuildTag(releaseTag)
const currentVersion = releaseTag
    ? releaseTag.slice(1)
    : import.meta.env.VITE_APP_VERSION || 'unknown'
const fullCommit = import.meta.env.VITE_BUILD_COMMIT || 'unknown'
const commit = fullCommit.slice(0, 12)
const relationship = computed(() =>
    release.value ? releaseRelationship(releaseTag, release.value.version) : 'internal'
)
let controller = null,
    epoch = 0
function cancel() {
    epoch++
    controller?.abort()
    controller = null
    loading.value = false
}
async function check() {
    cancel()
    const request = epoch
    controller = new AbortController()
    const active = controller
    const timer = setTimeout(() => active.abort(), 8000)
    loading.value = true
    error.value = ''
    try {
        const result = await checkPublicRelease({ signal: active.signal })
        if (request === epoch && visible.value) {
            release.value = result
            checked.value = true
        }
    } catch {
        if (request === epoch && visible.value) error.value = 'updates.checkFailed'
    } finally {
        clearTimeout(timer)
        if (request === epoch) loading.value = false
    }
}
async function openRelease() {
    if (!release.value) return
    try {
        if (isTauri()) {
            const { openUrl } = await import('@tauri-apps/plugin-opener')
            await openUrl(release.value.url)
        } else window.open(release.value.url, '_blank', 'noopener,noreferrer')
    } catch {
        error.value = 'updates.openFailed'
    }
}
onUnmounted(cancel)
</script>

<style scoped>
.version-check {
    display: grid;
    gap: 0.75rem;
    overflow-wrap: anywhere;
}
.version-check p {
    margin: 0;
}
.version-check dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem 1rem;
    margin: 0;
}
.version-check dd {
    margin: 0;
}
.version-check dt {
    color: var(--text-color-secondary);
}
</style>
