<template>
    <Select
        :modelValue="modelValue"
        :options="options"
        optionLabel="label"
        optionValue="value"
        :inputId="inputId"
        :aria-label="t('taskStatuses.color')"
        :disabled="disabled"
        fluid
        @update:modelValue="value => emit('update:modelValue', value)"
    >
        <template #value="{ value }">
            <span class="color-option"
                ><span class="color-dot" :style="{ background: value }"></span
                >{{ colorLabel(value) }}</span
            >
        </template>
        <template #option="{ option }">
            <span class="color-option"
                ><span class="color-dot" :style="{ background: option.value }"></span
                >{{ option.label }}</span
            >
        </template>
    </Select>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import { STATUS_COLORS } from '../utils/statusColors'
const props = defineProps({
    modelValue: { type: String, default: '' },
    inputId: { type: String, required: true },
    disabled: Boolean
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
function colorLabel(value) {
    const color = STATUS_COLORS.find(item => item.value === String(value).toLowerCase())
    return color
        ? t(`taskStatuses.colors.${color.key}`)
        : t('taskStatuses.currentColor', { color: value })
}
const options = computed(() => {
    const result = STATUS_COLORS.map(color => ({ ...color, label: colorLabel(color.value) }))
    if (props.modelValue && !result.some(color => color.value === props.modelValue))
        result.push({
            value: props.modelValue,
            key: 'current',
            label: colorLabel(props.modelValue)
        })
    return result
})
</script>
<style scoped>
.color-option {
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    min-width: 0;
}
.color-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
}
</style>
