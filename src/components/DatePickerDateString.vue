<template>
    <DatePicker
        :modelValue="dateValue"
        :ariaLabel="ariaLabel"
        dateFormat="yy-mm-dd"
        showIcon
        showButtonBar
        :manualInput="true"
        @update:modelValue="updateDate"
    />
</template>

<script setup>
import { computed } from 'vue'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
    modelValue: { type: String, default: '' },
    ariaLabel: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])
const dateValue = computed(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(props.modelValue)) return null
    const [year, month, day] = props.modelValue.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date
        : null
})
function updateDate(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        emit('update:modelValue', '')
        return
    }
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    emit('update:modelValue', `${value.getFullYear()}-${month}-${day}`)
}
</script>
