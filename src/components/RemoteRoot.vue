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
                    <div class="auth-language"><LanguageSelect /></div>
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
                        :input-props="{ minlength: 6, maxlength: 31 }"
                        fluid
                    />
                    <Button
                        v-if="!remoteUser && !registering"
                        class="password-recovery-link"
                        type="button"
                        text
                        size="small"
                        :label="$t('remote.forgetPassword')"
                        @click="showRecovery = true"
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
                            :input-props="{ minlength: 6, maxlength: 31 }"
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
                            :input-props="{ minlength: 6, maxlength: 31 }"
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
                    <div
                        v-if="canRemember && !registering && !remoteUser"
                        class="remember-password"
                    >
                        <Checkbox
                            input-id="remember-password"
                            v-model="rememberPassword"
                            binary
                            @update:model-value="onRememberChange"
                        />
                        <label for="remember-password">{{ $t('remote.rememberPassword') }}</label>
                    </div>
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
                <PasswordRecoveryDialog
                    v-model:visible="showRecovery"
                    :username="username"
                    @reset="clearSavedPassword"
                />
            </div>
        </main>
        <section v-else class="remote-session">
            <div class="remote-workspace">
                <App :key="workspaceVersion">
                    <template #notice>
                        <div v-if="remoteStale" class="remote-status" role="status">
                            <span>{{ $t('remote.stale') }}</span>
                            <Button
                                size="small"
                                :loading="busy"
                                :label="$t('remote.reload')"
                                @click="reload"
                            />
                        </div>
                        <Message v-if="message" severity="error" :closable="false">{{
                            message
                        }}</Message>
                    </template>
                </App>
            </div>
            <RemoteMcpTokens v-model:visible="showTokens" />
            <Dialog
                v-model:visible="showAccounts"
                modal
                :header="$t('remote.accounts')"
                :style="{ width: '30rem', maxWidth: '95vw' }"
            >
                <ul class="account-list">
                    <li v-for="account in accounts" :key="account.id">
                        <span
                            >{{ account.username
                            }}{{ account.admin ? ` · ${$t('remote.admin')}` : '' }}</span
                        >
                        <Button
                            size="small"
                            text
                            :label="$t('remote.issueResetCode')"
                            :loading="busy"
                            @click="issueReset(account.username)"
                        />
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
                        :input-props="{ minlength: 6, maxlength: 31 }"
                        fluid
                    />
                    <Button type="submit" :loading="busy" :label="$t('remote.createAccount')" />
                </form>
            </Dialog>
            <Dialog
                :visible="Boolean(resetSecret)"
                modal
                :header="$t('remote.resetCodeTitle')"
                :style="{ width: '30rem', maxWidth: '95vw' }"
                @update:visible="resetSecret = ''"
            >
                <p>{{ $t('remote.resetHint') }}</p>
                <pre class="reset-secret"><code tabindex="0">{{ resetSecret }}</code></pre>
                <Button :label="$t('remote.copyToken')" icon="pi pi-copy" @click="copyReset" />
                <Message v-if="resetCopyMessage" severity="info" :closable="false">{{
                    resetCopyMessage
                }}</Message>
            </Dialog>
            <Dialog
                v-model:visible="changingPassword"
                modal
                :header="$t('remote.userSettings')"
                :style="{ width: '30rem', maxWidth: '95vw' }"
            >
                <Tabs value="profile">
                    <TabList>
                        <Tab value="profile">{{ $t('remote.profileTab') }}</Tab>
                        <Tab value="password">{{ $t('remote.changePassword') }}</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel value="profile">
                            <form class="remote-form" @submit.prevent="saveProfile">
                                <AccountAvatarEditor v-model="profileAvatar" />
                                <label for="profile-username">{{ $t('remote.username') }}</label>
                                <InputText
                                    id="profile-username"
                                    v-model="profileUsername"
                                    required
                                    minlength="3"
                                    maxlength="48"
                                    pattern="[A-Za-z0-9_-]{3,48}"
                                    autocomplete="username"
                                />
                                <template v-if="profileUsername !== remoteUser.username">
                                    <label for="profile-password">{{
                                        $t('remote.currentPassword')
                                    }}</label>
                                    <Password
                                        input-id="profile-password"
                                        v-model="profilePassword"
                                        :feedback="false"
                                        toggle-mask
                                        required
                                        autocomplete="current-password"
                                        :input-props="{ minlength: 6, maxlength: 31 }"
                                        fluid
                                    />
                                </template>
                                <Button
                                    type="submit"
                                    :loading="busy"
                                    :label="$t('remote.saveProfile')"
                                />
                            </form>
                        </TabPanel>
                        <TabPanel value="password">
                            <form class="remote-form" @submit.prevent="changePassword">
                                <label for="current-password">{{
                                    $t('remote.currentPassword')
                                }}</label>
                                <Password
                                    input-id="current-password"
                                    v-model="password"
                                    :feedback="false"
                                    toggle-mask
                                    required
                                    autocomplete="current-password"
                                    :input-props="{ minlength: 6, maxlength: 31 }"
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
                                    :input-props="{ minlength: 6, maxlength: 31 }"
                                    fluid
                                />
                                <p>{{ $t('remote.passwordHint') }}</p>
                                <Button
                                    type="submit"
                                    :loading="busy"
                                    :label="$t('remote.changePassword')"
                                />
                            </form>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Dialog>
        </section>
    </template>
</template>

<script setup>
import { onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import { invoke } from '@tauri-apps/api/core'
import App from '../App.vue'
import DesktopRoot from './DesktopRoot.vue'
import WindowTitleBar from './WindowTitleBar.vue'
import LanguageSelect from './LanguageSelect.vue'
import RemoteMcpTokens from './RemoteMcpTokens.vue'
import AccountAvatarEditor from './AccountAvatarEditor.vue'
import PasswordRecoveryDialog from './PasswordRecoveryDialog.vue'
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
    refreshRemoteWorkspace,
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
const workspaceVersion = ref(0)
const profileUsername = ref('')
const profileAvatar = ref('')
const profilePassword = ref('')
const showRecovery = ref(false)
const resetSecret = ref('')
const resetCopyMessage = ref('')
const canRemember = !isWebServer && hasDesktopStorage() && /Windows/i.test(navigator.userAgent)
const rememberPassword = ref(false)
watch(remoteUser, user => {
    if (!user) {
        showAccounts.value = false
        changingPassword.value = false
        resetSecret.value = ''
        resetCopyMessage.value = ''
    }
})
let accountsEpoch = 0
watch(showAccounts, () => {
    accountsEpoch += 1
    resetSecret.value = ''
    resetCopyMessage.value = ''
})
watch(changingPassword, value => {
    if (!value) {
        password.value = ''
        newPassword.value = ''
        profilePassword.value = ''
        profileAvatar.value = ''
    }
})
provide('easyproject-account-actions', {
    settings: () => {
        profileUsername.value = remoteUser.value.username
        profileAvatar.value = remoteUser.value.avatar || ''
        profilePassword.value = ''
        changingPassword.value = true
    },
    accounts: loadAccounts,
    mcp: () => {
        showTokens.value = true
    },
    logout
})
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
        if (canRemember) {
            try {
                await invoke('desktop_credentials', {
                    action:
                        rememberPassword.value && !remoteUser.value.mustChangePassword
                            ? 'save'
                            : 'clear',
                    credentials:
                        rememberPassword.value && !remoteUser.value.mustChangePassword
                            ? { username: username.value, password: password.value }
                            : null
                })
            } catch {
                message.value = t('remote.savedPasswordFailed')
            }
        }
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
        await clearSavedPassword()
        password.value = ''
        newPassword.value = ''
        remoteUser.value = null
        changingPassword.value = false
    })
}
async function saveProfile() {
    await perform(async () => {
        const result = await remoteRequest('/api/account/profile', {
            username: profileUsername.value,
            avatar: profileAvatar.value,
            currentPassword: profilePassword.value
        })
        const renamed = result.user.username !== remoteUser.value.username
        remoteUser.value = result.user
        if (renamed) await clearSavedPassword()
        profilePassword.value = ''
        changingPassword.value = false
    })
}
async function clearSavedPassword() {
    if (!canRemember) return
    try {
        await invoke('desktop_credentials', { action: 'clear', credentials: null })
        rememberPassword.value = false
    } catch {
        message.value = t('remote.savedPasswordFailed')
    }
}
function onRememberChange(value) {
    if (!value) void clearSavedPassword()
}
async function issueReset(target) {
    const current = accountsEpoch
    await perform(async () => {
        const result = await remoteRequest('/api/admin/reset-codes', { username: target })
        if (showAccounts.value && current === accountsEpoch) {
            resetCopyMessage.value = ''
            resetSecret.value = result.code
        }
    })
}
async function copyReset() {
    try {
        await navigator.clipboard.writeText(resetSecret.value)
        resetCopyMessage.value = t('remote.tokenCopied')
    } catch {
        resetCopyMessage.value = t('remote.tokenCopyFailed')
    }
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
async function reload() {
    await perform(async () => {
        await refreshRemoteWorkspace()
        workspaceVersion.value += 1
    })
}
onMounted(async () => {
    if (canRemember && !username.value && !password.value) {
        try {
            const saved = await invoke('desktop_credentials', { action: 'read', credentials: null })
            if (saved && !username.value && !password.value) {
                username.value = saved.username
                password.value = saved.password
                rememberPassword.value = true
            }
        } catch {
            message.value = t('remote.savedPasswordFailed')
        }
    }
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
.account-list {
    list-style: none;
    padding: 0;
    display: grid;
    gap: 0.4rem;
}
.account-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}
.account-list li span {
    min-width: 0;
    overflow-wrap: anywhere;
}
.account-list li :deep(.p-button) {
    flex-shrink: 0;
}
.remember-password {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.password-recovery-link {
    justify-self: end;
    margin-top: -0.4rem;
    padding: 0 0.125rem;
    min-height: 1.5rem;
    font-size: 0.8125rem;
}
.reset-secret {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    user-select: text;
}
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
.auth-language {
    display: flex;
    justify-content: flex-end;
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
