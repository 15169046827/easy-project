<template>
    <span v-if="unknown" class="unknown-progress" :title="label" v-tooltip.bottom="label">{{
        label
    }}</span>
    <div v-else class="mini-progress" :title="label" v-tooltip.bottom="label">
        <ProgressBar
            class="mini-progress-bar"
            :value="task.progress || 0"
            :showValue="false"
            :aria-label="t('tasks.columnProgress')"
        />
        <small>{{ label }}</small>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProgressBar from 'primevue/progressbar'
import { effortLabel } from '../utils/taskEffort.js'
const props = defineProps({ task: { type: Object, required: true } })
const { t } = useI18n()
const unknown = computed(
    () => props.task.summary?.has_children && props.task.summary.progress == null
)
const label = computed(() =>
    unknown.value ? effortLabel(props.task, t) : `${props.task.progress || 0}%`
)
</script>
<style scoped>
.mini-progress {
    display: grid;
    grid-template-columns: 3.5rem 4ch;
    justify-content: start;
    align-items: center;
    gap: 0.5rem;
    text-align: left;
}
.mini-progress-bar {
    width: 3.5rem;
    height: 0.35rem;
    border-radius: 999px;
    background: var(--color-border);
    overflow: hidden;
}
.mini-progress-bar :deep(.p-progressbar-value) {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--p-primary-color);
}
.mini-progress small {
    color: var(--p-text-color);
    font-size: 0.75rem;
    text-align: left;
    font-variant-numeric: tabular-nums;
}
.unknown-progress {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
