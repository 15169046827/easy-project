<template>
    <section v-if="failure" class="workspace-page workspace-route-error">
        <Message severity="error" :closable="false">
            <strong>{{ $t('app.pageFailed') }}</strong>
            <p>{{ $t('app.pageFailedHint') }}</p>
            <code>{{ failure }}</code>
            <p v-if="detail" class="failure-detail">{{ detail }}</p>
        </Message>
        <div class="recovery-actions">
            <Button :label="$t('app.retryPage')" icon="pi pi-refresh" @click="retry" />
            <Button
                :label="$t('project.back')"
                severity="secondary"
                outlined
                @click="backToProjects"
            />
        </div>
    </section>
    <RouterView v-else :key="`${revision}:${attempt}`" />
</template>

<script setup>
import { onErrorCaptured, onUnmounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { describePageFailure } from '../utils/pageFailure'

defineProps({ revision: { type: Number, default: 0 } })
const router = useRouter()
const route = useRoute()
const failure = ref('')
const detail = ref('')
const attempt = ref(0)
let failedTarget = ''

// Keep recovery inside the existing App/session. A full-page reload would discard
// the desktop's memory-only Bearer and incorrectly send the user to sign-in.
const stopBefore = router.beforeEach(() => {
    failure.value = ''
    detail.value = ''
})
const stopError = router.onError((_error, target) => {
    failedTarget = target.fullPath
    failure.value = 'PAGE_MODULE_LOAD_FAILED'
})
onErrorCaptured((error, instance) => {
    failedTarget = route.fullPath
    detail.value = describePageFailure(error, instance)
    failure.value = 'PAGE_RENDER_FAILED'
    return false
})
watch(
    () => route.fullPath,
    () => {
        failure.value = ''
        detail.value = ''
    }
)
async function retry() {
    failure.value = ''
    detail.value = ''
    attempt.value += 1
    if (failedTarget && failedTarget !== route.fullPath) {
        try {
            await router.push(failedTarget)
        } catch {
            // router.onError supplies the safe diagnostic without exposing URLs,
            // account information or arbitrary server error content in the UI.
            failure.value = 'PAGE_MODULE_LOAD_FAILED'
        }
    }
}
function backToProjects() {
    failure.value = ''
    detail.value = ''
    failedTarget = ''
    return router.push('/projects')
}
onUnmounted(() => {
    stopBefore()
    stopError()
})
</script>

<style scoped>
.workspace-route-error p {
    margin: 0;
    color: var(--color-text-secondary);
}
.workspace-route-error code {
    color: var(--color-text-muted);
}
.failure-detail {
    overflow-wrap: anywhere;
    font-family: monospace;
}
.recovery-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}
</style>
