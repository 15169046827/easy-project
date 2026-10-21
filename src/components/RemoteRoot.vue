<template>
    <template v-if="!remoteActive">
        <DesktopRoot v-if="hasDesktopStorage()" />
        <App v-else />
    </template>
    <template v-else>
        <section v-if="loading" class="remote-auth" role="status">
            {{ $t('remote.loading') }}
        </section>
        <main v-else-if="!remoteUser || remoteUser.mustChangePassword" class="remote-auth-shell">
            <WindowTitleBar v-if="windowChrome.visible" :native="windowChrome.native" />
            <div class="remote-auth">
                <form class="remote-auth-card" @submit.prevent="submit">
                    <span class="eyebrow">EasyProject · {{ $t('remote.online') }}</span>
                    <h1>
                        {{
                            $t(
                                remoteUser
                                    ? 'remote.changePassword'
                                    : registering
                                      ? 'remote.register'
                                      : 'remote.login'
                            )
                        }}
                    </h1>
                    <p>{{ $t('remote.isolation') }}</p>
                    <template v-if="!remoteUser">
                        <label for="remote-username">{{ $t('remote.username') }}</label>
                        <InputText
                            id="remote-username"
                            v-model="username"
                            autocomplete="username"
                            required
                            minlength="3"
                            maxlength="48"
                            pattern="[A-Za-z0-9_-]{3,48}"
                        />
                    </template>
                    <label for="remote-password">{{
                        $t(remoteUser ? 'remote.currentPassword' : 'remote.password')
                    }}</label>
                    <Password
                        input-id="remote-password"
                        v-model="password"
                        :feedback="false"
                        toggle-mask
                        :autocomplete="registering ? 'new-password' : 'current-password'"
                        required
                        :input-props="{ minlength: registering ? 12 : undefined, maxlength: 128 }"
                        fluid
                    />
                    <template v-if="registering && !remoteUser">
                        <p>{{ $t('remote.registerHint') }}</p>
                        <label for="remote-confirm-password">{{
                            $t('remote.confirmPassword')
                        }}</label>
                        <Password
                            input-id="remote-confirm-password"
                            v-model="confirmPassword"
                            :feedback="false"
                            toggle-mask
                            autocomplete="new-password"
                            required
                            fluid
                            :input-props="{ minlength: 12, maxlength: 128 }"
                        />
                    </template>
                    <template v-if="remoteUser">
                        <label for="remote-new-password">{{ $t('remote.newPassword') }}</label>
                        <Password
                            input-id="remote-new-password"
                            v-model="newPassword"
                            :feedback="false"
                            toggle-mask
                            autocomplete="new-password"
                            required
                            :input-props="{ minlength: 12, maxlength: 128 }"
                            fluid
                        />
                        <p>{{ $t('remote.passwordHint') }}</p>
                    </template>
                    <Message
                        v-if="message"
                        :severity="registered ? 'success' : 'error'"
                        :closable="false"
                        >{{ message }}</Message
                    >
                    <Button
                        type="submit"
                        :loading="busy"
                        :label="
                            $t(
                                remoteUser
                                    ? 'remote.changePassword'
                                    : registering
                                      ? 'remote.register'
                                      : 'remote.login'
                            )
                        "
                    />
                    <Button
                        v-if="!remoteUser"
                        type="button"
                        text
                        :disabled="busy"
                        :label="$t(registering ? 'remote.backToLogin' : 'remote.registerEntry')"
                        @click="toggleRegistration"
                    />
                    <Button
                        v-if="!isWebServer"
                        type="button"
                        text
                        :label="$t('remote.useLocal')"
                        @click="leaveRemote"
                    />
                </form>
            </div>
        </main>
        <section v-else class="remote-session">
            <div class="remote-status" role="status">
                <span>{{ $t('remote.online') }} · {{ remoteUser.username }}</span>
                <span v-if="remoteStale">{{ $t('remote.stale') }}</span>
                <Button
                    v-if="remoteStale"
                    size="small"
                    :label="$t('remote.reload')"
                    @click="reload"
                />
                <Button
                    v-if="remoteUser.admin"
                    size="small"
                    text
                    :label="$t('remote.accounts')"
                    @click="loadAccounts"
                />
                <Button
                    size="small"
                    text
                    :label="$t('remote.mcpTokens')"
                    @click="showTokens = true"
                />
                <Button
                    size="small"
                    text
                    :label="$t('remote.changePassword')"
                    @click="changingPassword = true"
                />
                <Button size="small" text :label="$t('remote.logout')" @click="logout" />
                <Button
                    v-if="!isWebServer"
                    size="small"
                    text
                    :label="$t('remote.returnLocal')"
                    @click="leaveRemote"
                />
            </div>
            <Message v-if="message" severity="error" :closable="false">{{ message }}</Message>
            <div class="remote-workspace"><App /></div>
            <RemoteMcpTokens v-model:visible="showTokens" />
            <Dialog
                v-model:visible="showAccounts"
                modal
                :header="$t('remote.accounts')"
                :style="{ width: '30rem', maxWidth: '95vw' }"
            >
                <ul>
                    <li v-for="account in accounts" :key="account.id">
                        {{ account.username }}{{ account.admin ? ` · ${$t('remote.admin')}` : '' }}
                    </li>
                </ul>
                <form class="remote-form" @submit.prevent="addAccount">
                    <label for="account-name">{{ $t('remote.username') }}</label>
                    <InputText
                        id="account-name"
                        v-model="accountName"
                        required
                        minlength="3"
                        maxlength="48"
                        autocomplete="off"
                    />
                    <label for="account-password">{{ $t('remote.initialPassword') }}</label>
                    <Password
                        input-id="account-password"
                        v-model="accountPassword"
                        :feedback="false"
                        toggle-mask
                        required
                        autocomplete="new-password"
                        :input-props="{ minlength: 12, maxlength: 128 }"
                        fluid
                    />
                    <Button type="submit" :loading="busy" :label="$t('remote.createAccount')" />
                </form>
            </Dialog>
            <Dialog
                v-model:visible="changingPassword"
                modal
                :header="$t('remote.changePassword')"
                :style="{ width: '30rem', maxWidth: '95vw' }"
            >
                <form class="remote-form" @submit.prevent="changePassword">
                    <label for="current-password">{{ $t('remote.currentPassword') }}</label>
                    <Password
                        input-id="current-password"
                        v-model="password"
                        :feedback="false"
                        toggle-mask
                        required
                        autocomplete="current-password"
                        fluid
                    />
                    <label for="new-password">{{ $t('remote.newPassword') }}</label>
                    <Password
                        input-id="new-password"
                        v-model="newPassword"
                        :feedback="false"
                        toggle-mask
                        required
                        autocomplete="new-password"
                        :input-props="{ minlength: 12, maxlength: 128 }"
                        fluid
                    />
                    <p>{{ $t('remote.passwordHint') }}</p>
                    <Button type="submit" :loading="busy" :label="$t('remote.changePassword')" />
                </form>
            </Dialog>
        </section>
    </template>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import App from '../App.vue'
import DesktopRoot from './DesktopRoot.vue'
import WindowTitleBar from './WindowTitleBar.vue'
import RemoteMcpTokens from './RemoteMcpTokens.vue'
import { getWindowChromeMode } from '../utils/windowChrome'
import { hasDesktopStorage } from '../api/storage'
import {
    isWebServer,
    remoteActive,
    remoteUser,
    remoteStale,
    loginRemote,
    logoutRemote,
    resumeRemote,
    leaveRemote,
    remoteRequest,
    checkRemoteRevision
} from '../api/remote'

const { t } = useI18n()
const windowChrome = getWindowChromeMode()
const loading = ref(remoteActive.value && isWebServer)
const username = ref('')
const password = ref('')
const newPassword = ref('')
const registering = ref(false)
const registered = ref(false)
const confirmPassword = ref('')
const showTokens = ref(false)
const message = ref('')
const busy = ref(false)
const accounts = ref([])
const accountName = ref('')
const accountPassword = ref('')
const showAccounts = ref(false)
const changingPassword = ref(false)
let timer

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
async function submit() {
    if (remoteUser.value) return changePassword()
    registered.value = false
    await perform(async () => {
        if (registering.value) {
            if (password.value !== confirmPassword.value)
                throw new Error(t('remote.passwordMismatch'))
            await remoteRequest('/api/auth/register', {
                username: username.value,
                password: password.value
            })
            registering.value = false
            registered.value = true
            password.value = ''
            confirmPassword.value = ''
            message.value = t('remote.registered')
            return
        }
        await loginRemote(username.value, password.value)
        password.value = ''
    })
}
function toggleRegistration() {
    registering.value = !registering.value
    registered.value = false
    password.value = ''
    confirmPassword.value = ''
    message.value = ''
}
async function logout() {
    await perform(logoutRemote)
}
async function changePassword() {
    await perform(async () => {
        await remoteRequest('/api/auth/password', {
            currentPassword: password.value,
            newPassword: newPassword.value
        })
        password.value = ''
        newPassword.value = ''
        remoteUser.value = null
        changingPassword.value = false
    })
}
async function loadAccounts() {
    await perform(async () => {
        accounts.value = (await remoteRequest('/api/admin/users')).users
        showAccounts.value = true
    })
}
async function addAccount() {
    await perform(async () => {
        await remoteRequest('/api/admin/users', {
            username: accountName.value,
            password: accountPassword.value
        })
        accountName.value = ''
        accountPassword.value = ''
        accounts.value = (await remoteRequest('/api/admin/users')).users
    })
}
function reload() {
    window.location.reload()
}
onMounted(async () => {
    if (remoteActive.value && isWebServer) {
        try {
            await resumeRemote()
        } catch {
            /* Login form remains available after expired sessions. */
        } finally {
            loading.value = false
        }
    }
    timer = setInterval(() => {
        if (remoteActive.value)
            checkRemoteRevision().catch(error => {
                message.value = error.message || t('remote.failed')
            })
    }, 15000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.remote-auth,
.remote-status,
.remote-form {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.remote-auth-shell {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.remote-auth-shell .window-titlebar {
    flex-shrink: 0;
}
.remote-auth {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: grid;
    place-items: center;
    background: var(--color-bg, #f4f7fb);
    padding: 1rem;
    box-sizing: border-box;
}
.remote-auth-card {
    box-sizing: border-box;
    width: min(25rem, 100%);
    display: grid;
    gap: 0.8rem;
    padding: 2rem;
    border: 1px solid var(--color-border, #dbe4f0);
    border-radius: 1rem;
    background: var(--color-surface, #fff);
}
.remote-auth-card h1 {
    margin: 0;
}
.remote-auth-card p {
    line-height: 1.6;
    margin: 0.25rem 0;
}
.remote-status {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.35rem 1rem;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
}
.remote-session {
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.remote-workspace {
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
.remote-workspace :deep(.app-shell) {
    height: 100%;
}
.remote-form {
    display: grid;
    gap: 0.75rem;
}
</style>
