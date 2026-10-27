<template>
    <section class="hierarchy-statistics" :aria-label="t('taskHierarchy.statisticsScope')">
        <header class="statistics-toolbar">
            <span>{{ scopeLabel }} · {{ data.total }}</span>
            <div class="statistics-controls">
                <Button
                    :icon="modelValue === 'top_level' ? 'pi pi-sitemap' : 'pi pi-list'"
                    text
                    rounded
                    size="small"
                    :aria-label="scopeHint"
                    :title="scopeHint"
                    v-tooltip.bottom="scopeHint"
                    @click="$emit('update:modelValue', nextScope)"
                />
                <Button
                    :icon="collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"
                    text
                    rounded
                    size="small"
                    :aria-label="collapseHint"
                    :title="collapseHint"
                    :aria-expanded="!collapsed"
                    :aria-controls="inputId + '-cards'"
                    v-tooltip.bottom="collapseHint"
                    @click="collapsed = !collapsed"
                />
            </div>
        </header>
        <div v-if="!collapsed" :id="inputId + '-cards'" class="statistics-cards">
            <Button
                v-for="state in populatedStatuses"
                :key="state.id"
                class="status-stat"
                :class="{ selected: selectedStatus === state.id }"
                :style="{ '--status-color': statusColor(state) }"
                :aria-label="label(state) + ': ' + state.count"
                :aria-pressed="selectedStatus === state.id"
                :title="label(state)"
                v-tooltip.bottom="label(state)"
                @click="$emit('select-status', selectedStatus === state.id ? '' : state.id)"
            >
                <strong>{{ state.count }}</strong>
                <small>
                    <span class="status-dot" aria-hidden="true"></span>
                    <span class="status-name">{{ label(state) }}</span>
                </small>
            </Button>
        </div>
    </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { statusColor } from '../../../utils/statusColors'
const props = defineProps({
    modelValue: { type: String, required: true },
    data: { type: Object, required: true },
    label: { type: Function, required: true },
    inputId: { type: String, required: true },
    selectedStatus: { type: String, default: '' }
})
defineEmits(['update:modelValue', 'select-status'])
const { t } = useI18n()
const collapsed = ref(false)
const nextScope = computed(() => (props.modelValue === 'top_level' ? 'all_tasks' : 'top_level'))
const scopeName = value =>
    t(value === 'top_level' ? 'taskHierarchy.topLevel' : 'taskHierarchy.allTasks')
const scopeLabel = computed(() => scopeName(props.modelValue))
const scopeHint = computed(() =>
    t('taskHierarchy.switchScope', { current: scopeLabel.value, next: scopeName(nextScope.value) })
)
const collapseHint = computed(() =>
    t(collapsed.value ? 'taskHierarchy.expandStatistics' : 'taskHierarchy.collapseStatistics')
)
const populatedStatuses = computed(() =>
    (props.data.statuses || []).filter(state => state.count > 0)
)
</script>
<style scoped>
.hierarchy-statistics {
    flex: 0 0 auto;
    min-width: 0;
    margin-bottom: 1rem;
}
.statistics-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    min-height: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--p-text-muted-color);
    font-size: 0.85rem;
}
.statistics-controls {
    display: flex;
    flex-shrink: 0;
}
.statistics-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}
.status-stat {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 0.35rem;
    flex: 0 0 12rem;
    width: 12rem;
    max-width: 100%;
    min-width: 0;
    min-height: var(--workspace-stat-height, 76px);
    height: var(--workspace-stat-height, 76px);
    padding: 0.8rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: 0.75rem;
    text-align: left;
    background: var(--color-surface);
    color: var(--color-text);
}
.status-stat:not(:disabled):hover {
    border-color: var(--status-color);
    background: var(--color-subtle-hover);
    color: var(--color-text);
}
.status-stat.selected {
    border-color: var(--status-color);
    box-shadow: inset 0 0 0 1px var(--status-color);
}
.status-stat:focus-visible {
    outline: 3px solid var(--p-primary-color);
    outline-offset: 2px;
}
.status-stat strong {
    font-size: var(--stat-num-size, 1.5rem);
    line-height: 1;
}
.status-stat small {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
    line-height: 1.2;
}
.status-dot {
    width: 0.625rem;
    height: 0.625rem;
    flex: 0 0 0.625rem;
    border-radius: 50%;
    background: var(--status-color);
}
.status-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
