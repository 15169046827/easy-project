<template>
    <div>
        <InputNumber
            :inputId="inputId"
            :modelValue="state === 'unestimated' ? null : modelValue"
            :min="0"
            :step="0.5"
            :maxFractionDigits="2"
            :useGrouping="false"
            :disabled="disabled"
            :placeholder="$t('taskHierarchy.unestimated')"
            fluid
            @update:modelValue="update"
        />
        <small v-if="state === 'legacy_unknown'">{{ $t('taskHierarchy.legacyUnknown') }}</small>
        <small v-else-if="modelValue === 0 && state === 'estimated'">{{
            $t('taskHierarchy.zeroEffort')
        }}</small>
    </div>
</template>
<script setup>
import InputNumber from 'primevue/inputnumber'
defineProps({
    modelValue: { type: Number, default: null },
    state: { type: String, default: 'unestimated' },
    inputId: String,
    disabled: Boolean
})
const emit = defineEmits(['update:modelValue', 'update:state', 'change'])
function update(value) {
    emit('update:state', value == null ? 'unestimated' : 'estimated')
    emit('update:modelValue', value)
    emit('change')
}
</script>
