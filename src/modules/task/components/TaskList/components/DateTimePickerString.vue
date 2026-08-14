<template>
    <DatePicker
        v-model="innerDate"
        showIcon
        showTime
        hourFormat="24"
        manualInput
        dateFormat="yy-mm-dd"
        iconDisplay="input"
        showClear
        :placeholder="placeholder"
        @blur="onBlur"
    />
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
    modelValue: { type: String, default: '' }, // 对外是字符串
    placeholder: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

// 将字符串转为 Date（支持 'YYYY-MM-DD' 或 'YYYY-MM-DD HH:mm:ss'）
function parseDateString(s) {
    if (!s) return null
    if (s instanceof Date) return s
    const str = String(s).trim()
    if (!str) return null

    // 支持 'YYYY-MM-DD' 或 'YYYY-MM-DD HH:mm:ss' 或 'YYYY-MM-DDTHH:mm:ss'
    const dateTime = str.replace('T', ' ').split(' ')
    const datePart = dateTime[0]
    const timePart = dateTime[1] || '00:00:00'

    const dateParts = datePart.split('-').map(n => parseInt(n, 10))
    if (dateParts.length !== 3 || dateParts.some(isNaN)) return null
    const [y, m, d] = dateParts

    const timeParts = timePart.split(':').map(n => parseInt(n, 10))
    const hh = timeParts[0] || 0
    const mm = timeParts[1] || 0
    const ss = timeParts[2] || 0

    return new Date(y, m - 1, d, hh, mm, ss)
}

function formatDateToString(date) {
    if (!date) return ''
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const s = '00'
    return `${y}-${m}-${d} ${h}:${min}:${s}`
}

// 内部 Date ref，供 DatePicker v-model 使用
const innerDate = ref(parseDateString(props.modelValue))

// 当外部 modelValue 改变时（例如从后端拉回），同步到 innerDate
watch(
    () => props.modelValue,
    nv => {
        const d = parseDateString(nv)
        // 只有在实际不同的时候才更新，避免不必要的重渲染
        if (
            (d === null && innerDate.value !== null) ||
            (d !== null && (!innerDate.value || d.getTime() !== innerDate.value.getTime()))
        ) {
            innerDate.value = d
        }
    },
    { immediate: true }
)

// 当内部 Date 改变（用户选择/手动输入），把字符串 emit 回去
watch(innerDate, nv => {
    if (!nv) {
        emit('update:modelValue', '')
    } else {
        emit('update:modelValue', formatDateToString(nv))
    }
})

// 当用户手动输入（可能是字符串），blur 时强制解析并 emit（避免半成输入）
function onBlur(e) {
    // DatePicker 在 manualInput 下会把 innerDate 设为字符串形式或 Date
    const v = innerDate.value
    if (typeof v === 'string') {
        // 尝试解析字符串
        const parsed = parseDateString(v)
        if (parsed) {
            innerDate.value = parsed
            emit('update:modelValue', formatDateToString(parsed))
        } else {
            // 如果解析失败，清空或保持原值（这里清空）
            innerDate.value = null
            emit('update:modelValue', '')
        }
    }
}
</script>
