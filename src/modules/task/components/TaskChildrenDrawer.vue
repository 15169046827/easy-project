<template>
    <section class="child-drawer" :aria-label="$t('taskHierarchy.children') + ': ' + parent.name">
        <header>
            <div>
                <strong>{{ $t('taskHierarchy.children') }}</strong> ·
                {{
                    $t('taskHierarchy.completedChildren', {
                        done: completed,
                        total: parent.summary?.direct_child_count ?? children.length
                    })
                }}
            </div>
            <Button
                :label="$t('taskHierarchy.addChild')"
                icon="pi pi-plus"
                text
                size="small"
                @click="$emit('add-child', parent)"
            />
        </header>
        <div v-for="task in children" :key="task.id" class="child-entry">
            <div class="child-row" :class="{ 'context-only': task.context_only }">
                <Checkbox
                    :modelValue="selectedTasks.some(item => item.id === task.id)"
                    binary
                    :aria-label="task.name"
                    @update:modelValue="$emit('select', task)"
                />
                <Button
                    v-if="hasChildren(task)"
                    :icon="expanded(task) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                    text
                    rounded
                    size="small"
                    :aria-label="expanded(task) ? $t('tasks.collapseTask') : $t('tasks.expandTask')"
                    :aria-expanded="expanded(task)"
                    @click="toggle(task)"
                />
                <div class="child-main">
                    <strong
                        tabindex="0"
                        class="truncate"
                        :title="task.name"
                        v-tooltip.bottom="task.name"
                        >{{ task.name }}</strong
                    >
                    <small v-if="task.context_only">{{ $t('taskHierarchy.contextOnly') }}</small>
                    <small class="truncate" :title="task.comment" v-tooltip.bottom="task.comment">{{
                        task.comment || '-'
                    }}</small>
                    <small
                        >{{ task.start_time?.slice(0, 10) || '-' }} –
                        {{ task.end_time?.slice(0, 10) || '-' }} · {{ effortLabel(task, t) }}</small
                    >
                </div>
                <Tag
                    :style="styleStatus(task)"
                    :title="
                        labelStatus(task.status, task.status_builtin_key, Boolean(task.status_id))
                    "
                    v-tooltip.bottom="
                        labelStatus(task.status, task.status_builtin_key, Boolean(task.status_id))
                    "
                    :value="
                        labelStatus(task.status, task.status_builtin_key, Boolean(task.status_id))
                    "
                />
                <span>{{
                    task.summary?.has_children && task.summary.progress == null
                        ? effortLabel(task, t)
                        : `${task.progress || 0}%`
                }}</span>
                <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    :aria-label="$t('common.edit') + ': ' + task.name"
                    @click="$emit('edit', task)"
                />
                <Button
                    icon="pi pi-plus"
                    text
                    rounded
                    :aria-label="$t('taskHierarchy.addChild') + ': ' + task.name"
                    @click="$emit('add-child', task)"
                />
            </div>
            <TaskChildrenDrawer
                v-if="hasChildren(task) && expanded(task)"
                :tasks="tasks"
                :parent="task"
                :filtering="filtering"
                :labelStatus="labelStatus"
                :styleStatus="styleStatus"
                :selectedTasks="selectedTasks"
                @edit="$emit('edit', $event)"
                @add-child="$emit('add-child', $event)"
                @select="$emit('select', $event)"
            />
        </div>
    </section>
</template>
<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Checkbox from 'primevue/checkbox'
import { effortLabel } from '../../../utils/taskEffort.js'
const props = defineProps({
    tasks: {
        type: /** @type {import('vue').PropType<Array<{id:string,parent?:string,name:string,context_only?:boolean,comment?:string,start_time?:string,end_time?:string,status?:string,status_builtin_key?:string,status_id?:string,is_completed?:boolean,progress?:number,summary?:{has_children?:boolean,progress?:number|null}}>>} */ (
            Array
        ),
        required: true
    },
    parent: { type: Object, required: true },
    selectedTasks: {
        type: /** @type {import('vue').PropType<Array<{id:string}>>} */ (Array),
        default: () => []
    },
    filtering: Boolean,
    labelStatus: { type: Function, required: true },
    styleStatus: { type: Function, default: () => ({}) }
})
defineEmits(['edit', 'add-child', 'select'])
const { t } = useI18n()
const open = ref(new Set())
const children = computed(() => props.tasks.filter(task => task.parent === props.parent.id))
const completed = computed(
    () =>
        props.parent.summary?.completed_child_count ??
        children.value.filter(task => task.is_completed).length
)
const hasChildren = task => props.tasks.some(child => child.parent === task.id)
const expanded = task => props.filtering || open.value.has(task.id)
function toggle(task) {
    const next = new Set(open.value)
    if (next.has(task.id)) next.delete(task.id)
    else next.add(task.id)
    open.value = next
}
</script>
<style scoped>
.child-drawer {
    width: calc(var(--task-list-viewport-width, 100vw) - 3rem);
    max-width: calc(100% - 1rem);
    margin: 0.5rem;
    padding: 0.8rem 1rem;
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--p-primary-color) 5%, var(--p-content-background));
    color: var(--p-text-color);
    min-width: 0;
}
.child-drawer header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
}
.child-entry {
    margin-top: 0.5rem;
}
.child-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.65rem;
    border-radius: 0.5rem;
    background: var(--p-content-background);
}
.child-main {
    display: grid;
    min-width: 5rem;
    flex: 1;
    gap: 0.25rem;
}
.truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.child-main small {
    color: var(--p-text-muted-color);
}
.child-row :deep(.p-tag) {
    max-width: min(12rem, 35%);
    min-width: 0;
}
.child-row :deep(.p-tag-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.context-only .child-main > strong {
    color: var(--p-text-muted-color);
}
@media (max-width: 640px) {
    .child-row {
        flex-wrap: wrap;
    }
    .child-main {
        flex-basis: 65%;
    }
    .child-drawer {
        margin: 0.3rem 0;
        padding: 0.5rem;
    }
}
</style>
