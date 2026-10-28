<template>
    <section class="status-manager">
        <header>
            <h3>{{ t('taskStatuses.manage') }}</h3>
            <Button :label="t('taskStatuses.add')" icon="pi pi-plus" @click="edit()" />
        </header>
        <p>{{ t('taskStatuses.defaultHint') }}</p>
        <p v-if="error" role="alert">{{ error }}</p>
        <p v-if="duplicateNames.length" role="alert">
            {{ t('taskStatuses.existingDuplicates', { names: duplicateNames.join(', ') }) }}
        </p>
        <DataTable :value="states" :loading="loading" dataKey="id" scrollable>
            <Column field="name" :header="t('taskStatuses.name')"
                ><template #body="{ data }"
                    ><span class="status-swatch" :style="{ background: statusColor(data) }"></span
                    >{{ label(data) }}</template
                ></Column
            >
            <Column :header="t('taskStatuses.completed')"
                ><template #body="{ data }"
                    ><i
                        v-if="data.is_completed"
                        class="pi pi-check"
                        :aria-label="t('taskStatuses.completed')"
                    ></i></template
            ></Column>
            <Column :header="t('taskStatuses.default')"
                ><template #body="{ data }"
                    ><i
                        v-if="data.is_default"
                        class="pi pi-check"
                        :aria-label="t('taskStatuses.default')"
                    ></i></template
            ></Column>
            <Column field="sort_order" :header="t('taskStatuses.order')" />
            <Column
                ><template #body="{ data }"
                    ><div class="status-actions">
                        <Button
                            icon="pi pi-pencil"
                            text
                            :aria-label="`${t('common.edit')} ${label(data)}`"
                            @click="edit(data)"
                        /><Button
                            icon="pi pi-trash"
                            text
                            severity="danger"
                            :disabled="busy"
                            :aria-label="`${t('common.delete')} ${label(data)}`"
                            @click="inspectDelete(data)"
                        /></div></template
            ></Column>
        </DataTable>
        <Dialog
            v-model:visible="editing"
            modal
            :header="t('taskStatuses.title')"
            :style="dialogStyle"
            :closable="!busy"
            :closeOnEscape="!busy"
        >
            <div class="status-form">
                <label for="status-manager-name">{{ t('taskStatuses.name') }}</label
                ><InputText
                    id="status-manager-name"
                    v-model="draft.name"
                    :maxlength="64"
                    :disabled="busy"
                />
                <label for="status-manager-color">{{ t('taskStatuses.color') }}</label
                ><StatusColorSelect
                    inputId="status-manager-color"
                    v-model="draft.color"
                    :disabled="busy || builtinColorLocked"
                />
                <label for="status-manager-custom-color">{{ t('taskStatuses.customColor') }}</label
                ><InputText
                    id="status-manager-custom-color"
                    v-model="draft.color"
                    :maxlength="7"
                    :disabled="busy || builtinColorLocked"
                    placeholder="#64748b"
                />
                <small v-if="builtinColorLocked">{{ t('taskStatuses.fixedColor') }}</small
                ><label for="status-manager-order">{{ t('taskStatuses.order') }}</label
                ><InputNumber
                    :locale="locale"
                    inputId="status-manager-order"
                    v-model="draft.sort_order"
                    :min="0"
                    :max="1000000"
                    :useGrouping="false"
                    :disabled="busy"
                />
                <div>
                    <Checkbox
                        inputId="status-manager-completed"
                        v-model="draft.is_completed"
                        binary
                        :disabled="busy"
                    /><label for="status-manager-completed">{{
                        t('taskStatuses.completed')
                    }}</label>
                </div>
                <div>
                    <Checkbox
                        inputId="status-manager-default"
                        v-model="draft.is_default"
                        binary
                        :disabled="busy || originalDefault"
                    /><label for="status-manager-default">{{ t('taskStatuses.default') }}</label>
                </div>
            </div>
            <p v-if="editError" role="alert">{{ editError }}</p>
            <template #footer
                ><Button
                    :label="t('common.cancel')"
                    severity="secondary"
                    :disabled="busy"
                    @click="editing = false" /><Button
                    :label="t('common.save')"
                    :loading="busy"
                    :disabled="!draft.name.trim()"
                    @click="save"
            /></template>
        </Dialog>
        <Dialog
            v-model:visible="deleting"
            modal
            :header="t('taskStatuses.title')"
            :style="dialogStyle"
            :closable="!busy"
            :closeOnEscape="!busy"
        >
            <template v-if="usage.total">
                <p role="alert">{{ t('taskStatuses.conflicts') }}</p>
                <p>{{ t('taskStatuses.conflictCount', { count: usage.total }) }}</p>
                <ul class="conflicts">
                    <li v-for="task in usage.list" :key="task.id">
                        <strong>{{ task.name }}</strong
                        ><small
                            >{{ task.id
                            }}<span v-if="task.deleted">
                                · {{ t('taskStatuses.deletedTask') }}</span
                            ></small
                        >
                    </li>
                </ul>
                <Button
                    v-if="usage.list.length < usage.total"
                    :label="t('taskStatuses.more')"
                    :loading="busy"
                    @click="moreUsage"
                />
            </template>
            <p v-else>
                {{ t('taskStatuses.deleteConfirm', { name: target ? label(target) : '' }) }}
            </p>
            <p v-if="deleteError" role="alert">{{ deleteError }}</p>
            <template #footer
                ><Button
                    :label="t('common.cancel')"
                    severity="secondary"
                    :disabled="busy"
                    @click="deleting = false" /><Button
                    v-if="!usage.total"
                    :label="t('common.delete')"
                    severity="danger"
                    :loading="busy"
                    :disabled="!target || target.is_default || states.length <= 1"
                    @click="remove"
            /></template>
        </Dialog>
    </section>
</template>
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { crudAction } from '../api'
import StatusColorSelect from './StatusColorSelect.vue'
import { suggestStatusColor, statusColor, storedStatusColor } from '../utils/statusColors'
import { findStatusNameConflict } from '../utils/taskStatus'
const props = defineProps({ projectId: { type: String, required: true } })
const emit = defineEmits(['updated'])
const { t, locale } = useI18n()
const states = ref([]),
    loading = ref(false),
    busy = ref(false),
    error = ref(''),
    editing = ref(false),
    deleting = ref(false),
    editError = ref(''),
    deleteError = ref(''),
    target = ref(null),
    originalDefault = ref(false)
const blank = () => ({
    id: '',
    name: '',
    color: '#64748b',
    sort_order: 100,
    is_completed: false,
    is_default: false
})
const draft = ref(blank()),
    usage = ref({ list: [], total: 0, pageIndex: 1 })
const builtinColorLocked = computed(() => {
    const state = states.value.find(item => item.id === draft.value.id)
    return Boolean(state?.builtin_key && draft.value.name.trim() === state.name)
})
const duplicateNames = computed(() => [
    ...new Set(
        states.value
            .filter(state => findStatusNameConflict(states.value, state.name, state.id))
            .map(state => label(state))
    )
])
const dialogStyle = { width: '36rem', maxWidth: 'calc(100vw - 2rem)' }
const keys = {
    Pending: 'tasks.statusPending',
    InProgress: 'tasks.statusInProgress',
    Done: 'tasks.statusDone'
}
const label = state =>
    Object.hasOwn(keys, state.builtin_key) ? t(keys[state.builtin_key]) : state.name
let epoch = 0
onBeforeUnmount(() => {
    epoch++
})
async function load(token = epoch) {
    loading.value = true
    try {
        const result = await crudAction('task_status', 'get_all', { projectId: props.projectId })
        if (token === epoch) states.value = result.list || []
    } catch (e) {
        if (token === epoch) error.value = e.message
    } finally {
        if (token === epoch) loading.value = false
    }
}
watch(
    () => props.projectId,
    () => {
        epoch++
        editing.value = false
        deleting.value = false
        states.value = []
        error.value = ''
        void load()
    },
    { immediate: true }
)
function edit(state) {
    if (busy.value) return
    draft.value = state
        ? {
              id: state.id,
              name: state.name,
              color: storedStatusColor(state),
              sort_order: state.sort_order,
              is_completed: state.is_completed,
              is_default: state.is_default
          }
        : { ...blank(), color: suggestStatusColor(states.value) }
    originalDefault.value = Boolean(state?.is_default)
    editError.value = ''
    editing.value = true
}
async function save() {
    if (busy.value || !draft.value.name.trim()) return
    if (findStatusNameConflict(states.value, draft.value.name, draft.value.id)) {
        editError.value = t('taskStatuses.duplicateName')
        return
    }
    const token = epoch,
        { id, ...fields } = draft.value
    busy.value = true
    editError.value = ''
    try {
        await crudAction('task_status', id ? 'update' : 'add', {
            ...fields,
            name: fields.name.trim(),
            ...(id ? { id } : { project_id: props.projectId })
        })
        if (token !== epoch) return
        editing.value = false
        await load(token)
        emit('updated')
    } catch (e) {
        if (token === epoch) editError.value = e.message
    } finally {
        busy.value = false
    }
}
async function inspectDelete(state) {
    if (busy.value) return
    const token = epoch
    busy.value = true
    error.value = ''
    deleteError.value = ''
    try {
        const result = await crudAction('task_status', 'get_usage', { id: state.id, pageIndex: 1 })
        if (token !== epoch) return
        target.value = state
        usage.value = result
        deleting.value = true
    } catch (e) {
        if (token === epoch) error.value = e.message
    } finally {
        busy.value = false
    }
}
async function moreUsage() {
    if (busy.value || !target.value) return
    const token = epoch
    busy.value = true
    try {
        const result = await crudAction('task_status', 'get_usage', {
            id: target.value.id,
            pageIndex: usage.value.pageIndex + 1
        })
        if (token === epoch)
            usage.value = { ...result, list: [...usage.value.list, ...result.list] }
    } catch (e) {
        if (token === epoch) deleteError.value = e.message
    } finally {
        busy.value = false
    }
}
async function remove() {
    if (busy.value || !target.value || usage.value.total) return
    const token = epoch
    busy.value = true
    try {
        await crudAction('task_status', 'delete', { id: target.value.id })
        if (token !== epoch) return
        deleting.value = false
        await load(token)
        emit('updated')
    } catch (e) {
        if (token === epoch) {
            deleteError.value = e.message
            try {
                const result = await crudAction('task_status', 'get_usage', {
                    id: target.value.id,
                    pageIndex: 1
                })
                if (token === epoch) usage.value = result
            } catch {
                /* Keep original deletion failure visible. */
            }
        }
    } finally {
        busy.value = false
    }
}
</script>
<style scoped>
.status-manager {
    height: 100%;
    overflow: auto;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
}
.status-manager > header,
.status-actions,
.status-form > div {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.status-manager > header {
    justify-content: space-between;
}
.status-form {
    display: grid;
    gap: 0.65rem;
}
.status-swatch {
    display: inline-block;
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    margin-right: 0.5rem;
}
.conflicts {
    padding-left: 1.25rem;
    max-height: 16rem;
    overflow: auto;
}
.conflicts li {
    margin-bottom: 0.5rem;
}
.conflicts small {
    display: block;
    overflow-wrap: anywhere;
    color: var(--color-text-secondary);
}
</style>
