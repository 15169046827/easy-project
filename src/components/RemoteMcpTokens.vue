<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('remote.mcpTokens')"
        :style="{ width: '40rem', maxWidth: '95vw' }"
        @show="load"
        @hide="clearSecret"
    >
        <div class="token-panel">
            <p>{{ $t('remote.tokenHint') }}</p>
            <p v-if="endpoint">
                <span>{{ $t('remote.mcpEndpoint') }}: </span><code>{{ endpoint }}</code>
            </p>
            <Message v-if="message" severity="error" :closable="false">{{ message }}</Message>
            <Message v-if="secret" severity="warn" :closable="false">{{
                $t('remote.tokenOnce')
            }}</Message>
            <template v-if="secret">
                <label for="mcp-secret">{{ $t('remote.tokenSecret') }}</label>
                <InputText
                    id="mcp-secret"
                    :model-value="secret"
                    readonly
                    autocomplete="off"
                    spellcheck="false"
                    @focus="$event.target.select()"
                />
            </template>
            <form class="token-panel" @submit.prevent="create">
                <label for="mcp-token-name">{{ $t('remote.tokenName') }}</label>
                <InputText
                    id="mcp-token-name"
                    v-model="name"
                    required
                    maxlength="64"
                    autocomplete="off"
                />
                <label for="mcp-token-scope">{{ $t('remote.tokenScope') }}</label>
                <Select
                    input-id="mcp-token-scope"
                    v-model="scope"
                    :options="scopes"
                    option-label="label"
                    option-value="value"
                />
                <label for="mcp-token-days">{{ $t('remote.tokenLifetime') }}</label>
                <Select
                    input-id="mcp-token-days"
                    v-model="days"
                    :options="lifetimes"
                    option-label="label"
                    option-value="value"
                />
                <Button type="submit" :label="$t('remote.tokenCreate')" :loading="busy" />
            </form>
            <ul class="token-list">
                <li v-for="token in tokens" :key="token.id">
                    <span
                        >{{ token.name }} · {{ $t(`remote.scope_${token.scope}`) }} ·
                        {{ $t('remote.tokenExpires') }} {{ formatDate(token.expires) }}</span
                    >
                    <Button
                        size="small"
                        severity="danger"
                        text
                        :disabled="busy"
                        :label="$t('remote.tokenRevoke')"
                        @click="revoking = token"
                    />
                </li>
            </ul>
            <p v-if="!tokens.length && !busy">{{ $t('remote.noTokens') }}</p>
        </div>
        <Dialog
            :visible="Boolean(revoking)"
            modal
            :header="$t('remote.tokenRevoke')"
            :style="{ width: '28rem', maxWidth: '95vw' }"
            @update:visible="
                value => {
                    if (!value) revoking = null
                }
            "
        >
            <p>{{ $t('remote.tokenRevokeConfirm', { name: revoking?.name }) }}</p>
            <template #footer>
                <Button
                    text
                    :label="$t('remote.cancel')"
                    :disabled="busy"
                    @click="revoking = null"
                />
                <Button
                    severity="danger"
                    :label="$t('remote.tokenRevoke')"
                    :loading="busy"
                    @click="revoke"
                />
            </template>
        </Dialog>
    </Dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Message from 'primevue/message'
import { remoteRequest } from '../api/remote'

const visible = defineModel('visible', { type: Boolean })
const { t, locale } = useI18n()
const tokens = ref([])
const endpoint = ref('')
const secret = ref('')
const name = ref('')
const scope = ref('read')
const days = ref(30)
const busy = ref(false)
const message = ref('')
const revoking = ref(null)
const scopes = computed(() =>
    ['read', 'write', 'delete'].map(value => ({ value, label: t(`remote.scope_${value}`) }))
)
const lifetimes = computed(() =>
    [7, 30, 90].map(value => ({ value, label: t('remote.tokenDays', { days: value }) }))
)
function clearSecret() {
    secret.value = ''
    revoking.value = null
}
function formatDate(value) {
    return new Intl.DateTimeFormat(locale.value).format(new Date(value * 1000))
}
async function refresh() {
    const result = await remoteRequest('/api/account/mcp-tokens')
    tokens.value = result.tokens
    endpoint.value = result.endpoint
}
async function perform(operation) {
    if (busy.value) return
    busy.value = true
    message.value = ''
    try {
        await operation()
    } catch (error) {
        message.value = error.message || t('remote.failed')
    } finally {
        busy.value = false
    }
}
async function load() {
    clearSecret()
    await perform(refresh)
}
async function create() {
    await perform(async () => {
        // Never persist this plaintext secret or include it in URL/config/logs.
        secret.value = ''
        const result = await remoteRequest('/api/account/mcp-tokens', {
            name: name.value,
            scope: scope.value,
            days: days.value
        })
        if (visible.value) secret.value = result.secret
        name.value = ''
        await refresh()
    })
}
async function revoke() {
    const target = revoking.value
    if (!target) return
    await perform(async () => {
        await remoteRequest('/api/account/mcp-tokens/revoke', { id: target.id })
        clearSecret()
        await refresh()
    })
}
</script>

<style scoped>
.token-panel {
    display: grid;
    gap: 0.75rem;
}
.token-panel p {
    margin: 0;
    line-height: 1.6;
    overflow-wrap: anywhere;
}
.token-list {
    padding: 0;
    list-style: none;
}
.token-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--color-border);
}
.token-list span {
    min-width: 0;
    overflow-wrap: anywhere;
}
</style>
