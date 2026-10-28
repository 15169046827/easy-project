<template>
    <section
        ref="drawerElement"
        class="child-drawer"
        :aria-label="$t('taskHierarchy.children') + ': ' + parent.name"
    >
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
            <div
                class="child-row"
                :class="{ 'context-only': task.context_only, 'aligned-columns': aligned }"
                :style="rowStyle"
            >
                <div class="child-content">
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
                        :aria-label="
                            expanded(task) ? $t('tasks.collapseTask') : $t('tasks.expandTask')
                        "
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
                        <small v-if="task.context_only">{{
                            $t('taskHierarchy.contextOnly')
                        }}</small>
                        <small
                            class="truncate"
                            :title="task.comment"
                            v-tooltip.bottom="task.comment"
                            >{{ task.comment || '-' }}</small
                        >
                        <small
                            >{{ task.start_time?.slice(0, 10) || '-' }} –
                            {{ task.end_time?.slice(0, 10) || '-' }} ·
                            {{ effortLabel(task, t) }}</small
                        >
                    </div>
                </div>
                <div class="child-metrics">
                    <div v-if="showStatus" class="child-status">
                        <TaskStatusBadge
                            :appearance="styleStatus(task)"
                            :label="
                                labelStatus(
                                    task.status,
                                    task.status_builtin_key,
                                    Boolean(task.status_id)
                                )
                            "
                        />
                    </div>
                    <div
                        v-if="showProgress"
                        class="child-progress"
                        :title="progressLabel(task)"
                        v-tooltip.bottom="progressLabel(task)"
                    >
                        <TaskProgressCell :task="task" />
                    </div>
                </div>
                <div class="child-actions">
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
            </div>
            <TaskChildrenDrawer
                v-if="hasChildren(task) && expanded(task)"
                :tasks="tasks"
                :parent="task"
                :filtering="filtering"
                :labelStatus="labelStatus"
                :styleStatus="styleStatus"
                :selectedTasks="selectedTasks"
                :columnLayout="columnLayout"
                :showStatus="showStatus"
                :showProgress="showProgress"
                @edit="$emit('edit', $event)"
                @add-child="$emit('add-child', $event)"
                @select="$emit('select', $event)"
            />
        </div>
    </section>
</template>
<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import TaskStatusBadge from '../../../components/TaskStatusBadge.vue'
import TaskProgressCell from '../../../components/TaskProgressCell.vue'
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
    columnLayout: { type: Object, default: () => ({}) },
    showStatus: { type: Boolean, default: true },
    showProgress: { type: Boolean, default: true },
    labelStatus: { type: Function, required: true },
    styleStatus: { type: Function, default: () => ({}) }
})
defineEmits(['edit', 'add-child', 'select'])
const { t } = useI18n()
const drawerElement = ref(null)
const contentLeft = ref(0)
let observer
function measure() {
    const row = drawerElement.value?.querySelector('.child-row')
    if (row)
        contentLeft.value =
            row.getBoundingClientRect().left + parseFloat(getComputedStyle(row).paddingLeft)
}
onMounted(() => {
    measure()
    if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(measure)
        observer.observe(drawerElement.value)
    }
})
onBeforeUnmount(() => observer?.disconnect())
watch(
    () => props.columnLayout,
    () => nextTick(measure),
    { deep: true }
)
const aligned = computed(
    () =>
        props.showStatus &&
        props.showProgress &&
        props.columnLayout.statusLeft - contentLeft.value >= 180 &&
        props.columnLayout.progressLeft + 110 < props.columnLayout.right
)
const rowStyle = computed(() =>
    aligned.value
        ? {
              '--child-main-width': `${props.columnLayout.statusLeft - contentLeft.value}px`,
              '--child-status-width': `${props.columnLayout.progressLeft - props.columnLayout.statusLeft}px`,
              '--child-progress-width': `${props.columnLayout.progressWidth}px`
          }
        : {}
)
const open = ref(new Set())
const children = computed(() => props.tasks.filter(task => task.parent === props.parent.id))
const completed = computed(
    () =>
        props.parent.summary?.completed_child_count ??
        children.value.filter(task => task.is_completed).length
)
const hasChildren = task => props.tasks.some(child => child.parent === task.id)
const expanded = task => props.filtering || open.value.has(task.id)
const progressLabel = task =>
    task.summary?.has_children && task.summary.progress == null
        ? effortLabel(task, t)
        : `${task.progress || 0}%`
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.7rem;
    padding: 0.65rem;
    border-radius: 0.5rem;
    background: var(--p-content-background);
}
.child-content {
    display: flex;
    gap: 0.6rem;
    align-items: center;
    min-width: 0;
}
.child-content > .p-checkbox {
    flex-shrink: 0;
}
.child-actions {
    display: flex;
    align-items: center;
}
.child-row.aligned-columns {
    grid-template-columns:
        var(--child-main-width) var(--child-status-width) var(--child-progress-width)
        minmax(0, 1fr);
    gap: 0;
}
.aligned-columns .child-metrics {
    display: contents;
}
.aligned-columns .child-content {
    padding-right: 0.8rem;
}
.aligned-columns .child-status {
    padding-right: 0.7rem;
}
.child-main {
    display: grid;
    min-width: 0;
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
.child-metrics {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
    gap: 0.7rem;
    width: 13rem;
    max-width: 100%;
    text-align: left;
}
.child-status {
    display: flex;
    justify-content: flex-start;
    min-width: 0;
}
.child-status :deep(.p-tag) {
    max-width: 100%;
    min-width: 0;
}
.child-progress {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-variant-numeric: tabular-nums;
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
        grid-template-columns: minmax(0, 1fr) auto;
    }
    .child-content {
        grid-column: 1 / -1;
    }
    .child-metrics {
        width: min(100%, 15rem);
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
