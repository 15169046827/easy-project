<template>
    <div class="progress-editor">
        <Slider v-model="value" :min="0" :max="100" :step="1" :aria-label="label" />
        <InputNumber
            v-model="value"
            :inputId="inputId"
            :aria-label="label"
            :min="0"
            :max="100"
            :maxFractionDigits="0"
            :useGrouping="false"
            suffix="%"
            fluid
        />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'

const props = defineProps({
    modelValue: { type: Number, default: 0 },
    inputId: { type: String, default: undefined },
    label: { type: String, required: true }
})
const emit = defineEmits(['update:modelValue'])
const value = computed({
    get: () => Math.min(100, Math.max(0, Number(props.modelValue) || 0)),
    set: next =>
        emit('update:modelValue', Math.round(Math.min(100, Math.max(0, Number(next) || 0))))
})
</script>

<style scoped>
.progress-editor {
    display: grid;
    grid-template-columns: minmax(3rem, 1fr) 6rem;
    gap: 1rem;
    align-items: center;
    min-width: 0;
    width: 100%;
}
.progress-editor :deep(.p-slider) {
    margin: 0 0.5rem;
}
.progress-editor :deep(.p-inputnumber-input) {
    min-width: 0;
    width: 100%;
    text-align: right;
}
</style>
