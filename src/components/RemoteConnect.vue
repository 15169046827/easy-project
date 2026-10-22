<template>
    <template v-if="remoteUser || (!remoteActive && native)">
        <Button
            class="theme-toggle remote-connect-entry account-menu-entry"
            text
            :aria-label="$t('remote.accountMenu')"
            aria-haspopup="menu"
            :aria-expanded="opened"
            aria-controls="easyproject-account-menu"
            v-tooltip.bottom="remoteUser?.username || $t('remote.localAccount')"
            @click="menu.toggle($event)"
        >
            <Avatar
                v-if="remoteUser"
                :label="
                    remoteUser.avatar ? undefined : remoteUser.username.slice(0, 1).toUpperCase()
                "
                :image="remoteUser.avatar || undefined"
                shape="circle"
                aria-hidden="true"
            />
            <Avatar v-else icon="pi pi-user" shape="circle" aria-hidden="true" />
        </Button>
        <Menu
            ref="menu"
            id="easyproject-account-menu"
            :model="items"
            :style="{ maxWidth: 'calc(100vw - 2rem)' }"
            :pt="{ submenuLabel: { style: { whiteSpace: 'normal', overflowWrap: 'anywhere' } } }"
            popup
            @show="opened = true"
            @hide="opened = false"
        />
    </template>
</template>
<script setup>
import { isTauri } from '@tauri-apps/api/core'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import { isWebServer, remoteActive, remoteUser, selectRemote, leaveRemote } from '../api/remote'
const native = isTauri()
const router = useRouter()
const { t } = useI18n()
/** @type {{ settings?: () => void | Promise<void>, mcp?: () => void | Promise<void>, accounts?: () => void | Promise<void>, logout?: () => void | Promise<void> }} */
const fallbackActions = {}
const actions = inject('easyproject-account-actions', fallbackActions)
const menu = ref(null)
const opened = ref(false)
const items = computed(() => [
    {
        label: remoteUser.value?.username || t('remote.localAccount'),
        items: remoteUser.value
            ? [
                  {
                      label: t('remote.userSettings'),
                      icon: 'pi pi-user-edit',
                      command: () => actions.settings?.()
                  },
                  {
                      label: t('remote.mcpTokens'),
                      icon: 'pi pi-link',
                      command: () => actions.mcp?.()
                  },
                  ...(remoteUser.value.admin
                      ? [
                            {
                                label: t('remote.accounts'),
                                icon: 'pi pi-users',
                                command: () => actions.accounts?.()
                            }
                        ]
                      : []),
                  ...(!isWebServer
                      ? [
                            {
                                label: t('remote.returnLocal'),
                                icon: 'pi pi-desktop',
                                command: leaveRemote
                            }
                        ]
                      : []),
                  {
                      label: t('remote.logout'),
                      icon: 'pi pi-sign-out',
                      command: () => actions.logout?.()
                  }
              ]
            : [
                  {
                      label: t('remote.localSettings'),
                      icon: 'pi pi-cog',
                      command: () => router.push('/data')
                  },
                  { label: t('remote.connect'), icon: 'pi pi-sign-in', command: selectRemote }
              ]
    }
])
</script>
<style scoped>
.remote-connect-entry {
    flex: 0 0 2.5rem;
    width: 2.5rem;
    height: 2.5rem;
    aspect-ratio: 1;
    min-width: 2.5rem;
    padding: 0;
    color: inherit;
}
.account-menu-entry :deep(.p-avatar) {
    flex: 0 0 1.75rem;
    width: 1.75rem;
    height: 1.75rem;
    min-width: 1.75rem;
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    font-size: 0.8rem;
    background: rgb(255 255 255 / 16%);
    color: inherit;
    pointer-events: none;
}
.account-menu-entry :deep(.p-avatar img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>
