<template>
    <Tag class="task-status-badge" :style="appearance" :title="label" v-tooltip.bottom="label">
        <span class="status-dot" aria-hidden="true"></span>
        <span class="status-label">{{ label }}</span>
    </Tag>
</template>
<script setup>
import Tag from 'primevue/tag'
defineProps({
    label: { type: String, required: true },
    appearance: { type: Object, default: () => ({}) }
})
</script>
<style scoped>
.task-status-badge {
    display: inline-flex;
    gap: 0.45rem;
    align-items: center;
    justify-content: flex-start;
    max-width: 100%;
    min-width: 0;
    padding: 0.2rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 500;
    vertical-align: middle;
}
.status-dot {
    width: 0.5rem;
    height: 0.5rem;
    flex: 0 0 0.5rem;
    border-radius: 50%;
    background: var(--status-color, #718096);
}
.status-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
