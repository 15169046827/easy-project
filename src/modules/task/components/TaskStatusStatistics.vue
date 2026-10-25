<template>
    <div class="workspace-stats hierarchy-statistics">
        <div class="status-stat">
            <strong>{{ data.total }}</strong>
            <Select
                class="scope-select"
                :inputId="inputId"
                :modelValue="modelValue"
                :options="scopes"
                optionLabel="label"
                optionValue="value"
                :aria-label="$t('taskHierarchy.statisticsScope')"
                size="small"
                @update:modelValue="$emit('update:modelValue', $event)"
            />
        </div>
        <div v-for="state in data.statuses" :key="state.id" class="status-stat">
            <strong>{{ state.count }}</strong
            ><small :title="label(state)" v-tooltip.bottom="label(state)">{{ label(state) }}</small>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
defineProps({
    modelValue: { type: String, required: true },
    data: { type: Object, required: true },
    label: { type: Function, required: true },
    inputId: { type: String, required: true }
})
defineEmits(['update:modelValue'])
const { t } = useI18n()
const scopes = computed(() => [
    { label: t('taskHierarchy.topLevel'), value: 'top_level' },
    { label: t('taskHierarchy.allTasks'), value: 'all_tasks' }
])
</script>
<style scoped>
.scope-select {
    min-width: 0;
    max-width: 100%;
    flex: 1;
}
.hierarchy-statistics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
    max-height: calc(2 * var(--workspace-stat-height, 76px) + var(--workspace-gap, 16px));
    overflow: auto;
}
.status-stat {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
    padding: 1rem;
    background: var(--p-content-background);
    border: 1px solid var(--p-content-border-color);
    border-radius: 0.75rem;
}
.status-stat strong {
    font-size: var(--stat-num-size);
}
.status-stat small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--p-text-muted-color);
}
</style>
