<template>
    <div class="avatar-editor">
        <div class="avatar-square" :aria-label="$t('remote.avatarPreview')">
            <img v-if="modelValue" :src="modelValue" :alt="$t('remote.avatarPreview')" />
            <span v-else class="pi pi-user" aria-hidden="true"></span>
        </div>
        <p>{{ $t('remote.avatarHint') }}</p>
        <FileUpload
            mode="basic"
            accept="image/png,image/jpeg,image/webp"
            :max-file-size="5242880"
            :choose-label="$t('remote.chooseAvatar')"
            :disabled="busy"
            custom-upload
            auto
            @uploader="upload"
        />
        <Button
            :label="$t('remote.removeAvatar')"
            text
            :disabled="busy || !modelValue"
            @click="$emit('update:modelValue', '')"
        />
        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { prepareAvatar } from '../utils/avatarImage'
defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const busy = ref(false)
const error = ref('')
async function upload(event) {
    busy.value = true
    error.value = ''
    try {
        emit('update:modelValue', await prepareAvatar(event.files[0]))
    } catch {
        error.value = t('remote.avatarInvalid')
    } finally {
        busy.value = false
    }
}
</script>
<style scoped>
.avatar-square {
    width: 8rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-bg);
}
.avatar-square img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.avatar-square .pi {
    font-size: 3rem;
}
.avatar-editor {
    display: grid;
    gap: 0.5rem;
}
</style>
