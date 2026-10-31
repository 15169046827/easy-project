<template>
    <svg class="gantt-arrow-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
            :d="direction === 'left' ? 'M14.5 6.5 9 12l5.5 5.5' : 'm9.5 6.5 5.5 5.5-5.5 5.5'"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
        />
    </svg>
</template>

<script setup>
defineProps({ direction: { type: String, required: true } })
</script>

<style scoped>
.gantt-arrow-icon {
    display: block;
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
}
</style>
