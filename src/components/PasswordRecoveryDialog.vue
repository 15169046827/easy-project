<template>
    <Dialog
        :visible="visible"
        modal
        :header="$t('remote.forgetPassword')"
        :style="{ width: '28rem', maxWidth: '95vw' }"
        @update:visible="close"
    >
        <p>{{ $t('remote.resetHint') }}</p>
        <form class="reset-form" @submit.prevent="submit">
            <label for="reset-username">{{ $t('remote.username') }}</label>
            <InputText
                id="reset-username"
                v-model="name"
                minlength="3"
                maxlength="48"
                required
                autocomplete="username"
            />
            <label for="reset-code">{{ $t('remote.resetCode') }}</label>
            <InputText
                id="reset-code"
                v-model="code"
                maxlength="72"
                required
                autocomplete="off"
                :spellcheck="false"
            />
            <label for="reset-new-password">{{ $t('remote.newPassword') }}</label>
            <Password
                input-id="reset-new-password"
                v-model="password"
                :feedback="false"
                toggle-mask
                required
                autocomplete="new-password"
                :input-props="{ minlength: 6, maxlength: 31 }"
                fluid
            />
            <label for="reset-confirm-password">{{ $t('remote.confirmPassword') }}</label>
            <Password
                input-id="reset-confirm-password"
                v-model="confirm"
                :feedback="false"
                toggle-mask
                required
                autocomplete="new-password"
                :input-props="{ minlength: 6, maxlength: 31 }"
                fluid
            />
            <Message v-if="message" :severity="done ? 'success' : 'error'" :closable="false">{{
                message
            }}</Message>
            <Button
                type="submit"
                :loading="busy"
                :disabled="done"
                :label="$t('remote.resetPassword')"
            />
        </form>
    </Dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { remoteRequest } from '../api/remote'
const props = defineProps({ visible: Boolean, username: { type: String, default: '' } })
const emit = defineEmits(['update:visible', 'reset'])
const { t } = useI18n()
const name = ref(''),
    code = ref(''),
    password = ref(''),
    confirm = ref(''),
    message = ref('')
const busy = ref(false),
    done = ref(false)
let epoch = 0
watch(
    () => props.visible,
    value => {
        epoch += 1
        name.value = value ? props.username : ''
        code.value = password.value = confirm.value = message.value = ''
        done.value = false
    }
)
function close(value) {
    emit('update:visible', value)
}
async function submit() {
    if (busy.value) return
    if (password.value !== confirm.value) {
        message.value = t('remote.passwordMismatch')
        return
    }
    busy.value = true
    const current = epoch
    try {
        await remoteRequest('/api/auth/reset-password', {
            username: name.value,
            code: code.value,
            newPassword: password.value
        })
        emit('reset')
        if (current === epoch) {
            done.value = true
            message.value = t('remote.resetComplete')
        }
    } catch (error) {
        if (current === epoch) message.value = error.message || t('remote.failed')
    } finally {
        if (current === epoch) code.value = password.value = confirm.value = ''
        busy.value = false
    }
}
</script>
<style scoped>
.reset-form {
    display: grid;
    gap: 0.6rem;
}
</style>
