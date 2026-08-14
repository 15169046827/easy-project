<template>
    <Select
        :modelValue="modelValue"
        @update:modelValue="onUpdate"
        :options="options"
        optionLabel="label"
        optionValue="value"
        :placeholder="placeholder || t('members.placeholder')"
        :showClear="showClear"
        :loading="loading"
        fluid
    >
        <template #option="{ option }">
            <div class="ms-option">
                <span class="ms-avatar" :style="{ background: avatarBg(option.name) }">{{
                    avatarInitial(option.name)
                }}</span>
                <span class="ms-name">{{ option.name }}</span>
                <span class="ms-role">{{ option.role }}</span>
            </div>
        </template>
        <template #value="{ value }">
            <span v-if="value && memberMap[value]" class="ms-option">
                <span class="ms-avatar" :style="{ background: avatarBg(memberMap[value].name) }">{{
                    avatarInitial(memberMap[value].name)
                }}</span>
                <span class="ms-name">{{ memberMap[value].name }}</span>
            </span>
            <span v-else-if="value">{{ value }}</span>
        </template>
    </Select>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import { avatarBg, avatarInitial } from '../../../composables/useAvatar'

const props = defineProps({
    modelValue: { type: String, default: '' },
    showClear: { type: Boolean, default: true },
    placeholder: { type: String, default: '' },
    allowedMemberIds: { type: Array, default: null }
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const { members, loadMembers, memberMap } = useMembers()
const loading = ref(false)

const options = computed(() =>
    members.value
        .filter(member =>
            Array.isArray(props.allowedMemberIds)
                ? props.allowedMemberIds.includes(member.id)
                : true
        )
        .map(member => ({
            value: member.id,
            name: member.name,
            role: member.role,
            label: member.name
        }))
)

function onUpdate(val) {
    emit('update:modelValue', val ?? '')
}

onMounted(async () => {
    loading.value = true
    try {
        await loadMembers()
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.ms-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.ms-avatar {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
}
.ms-name {
    font-weight: 500;
}
.ms-role {
    margin-left: auto;
    font-size: 0.7rem;
    color: var(--color-text-secondary);
}
</style>
