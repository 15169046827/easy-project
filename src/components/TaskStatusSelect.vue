<template>
    <Select
        ref="selectControl"
        :modelValue="modelValue"
        :options="options"
        optionLabel="label"
        optionValue="id"
        :inputId="inputId"
        :disabled="!projectId || loading"
        :placeholder="t(projectId ? 'taskStatuses.select' : 'taskStatuses.projectFirst')"
        fluid
        @update:modelValue="value => emit('update:modelValue', value)"
    >
        <template #footer
            ><Button
                :label="t('taskStatuses.add')"
                icon="pi pi-plus"
                text
                fluid
                :disabled="!projectId"
                @click="openAdd"
        /></template>
    </Select>
    <small v-if="error" role="alert">{{ error }}</small>
    <Dialog
        v-model:visible="adding"
        modal
        :header="t('taskStatuses.add')"
        :style="{ width: '24rem', maxWidth: 'calc(100vw - 2rem)' }"
        :closable="!saving"
        :closeOnEscape="!saving"
    >
        <label :for="`${inputId}-name`">{{ t('taskStatuses.name') }}</label>
        <InputText
            :id="`${inputId}-name`"
            v-model="name"
            :maxlength="64"
            fluid
            autofocus
            :disabled="saving"
            @keydown.enter.prevent="save"
        />
        <div class="status-complete">
            <Checkbox
                v-model="completed"
                binary
                :inputId="`${inputId}-complete`"
                :disabled="saving"
            /><label :for="`${inputId}-complete`">{{ t('taskStatuses.completed') }}</label>
        </div>
        <p v-if="addError" role="alert">{{ addError }}</p>
        <template #footer
            ><Button
                :label="t('common.cancel')"
                severity="secondary"
                :disabled="saving"
                @click="adding = false" /><Button
                :label="t('common.save')"
                :loading="saving"
                :disabled="!name.trim()"
                @click="save"
        /></template>
    </Dialog>
</template>
<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import { crudAction } from '../api'
const props = defineProps({
    projectId: { type: String, default: '' },
    modelValue: { type: String, default: '' },
    inputId: { type: String, default: 'task-status-select' }
})
const emit = defineEmits(['update:modelValue', 'loaded'])
const { t } = useI18n()
const selectControl = ref(null)
const states = ref([]),
    loading = ref(false),
    error = ref(''),
    adding = ref(false),
    name = ref(''),
    completed = ref(false),
    saving = ref(false),
    addError = ref('')
let epoch = 0
onBeforeUnmount(() => {
    epoch++
})
const keys = {
    Pending: 'tasks.statusPending',
    InProgress: 'tasks.statusInProgress',
    Done: 'tasks.statusDone'
}
const options = computed(() =>
    states.value.map(state => ({
        ...state,
        label: Object.hasOwn(keys, state.builtin_key) ? t(keys[state.builtin_key]) : state.name
    }))
)
async function load(projectId, token) {
    loading.value = true
    error.value = ''
    try {
        const result = await crudAction('task_status', 'get_all', { projectId })
        if (token !== epoch) return false
        states.value = result.list || []
        emit('loaded', states.value)
        return true
    } catch (e) {
        if (token === epoch) error.value = e.message
        return false
    } finally {
        if (token === epoch) loading.value = false
    }
}
watch(
    () => props.projectId,
    (id, previous) => {
        const token = ++epoch
        states.value = []
        adding.value = false
        if (previous && previous !== id) emit('update:modelValue', '')
        if (id) void load(id, token)
    },
    { immediate: true }
)
function openAdd() {
    selectControl.value?.hide?.()
    name.value = ''
    completed.value = false
    addError.value = ''
    adding.value = true
}
async function save() {
    if (saving.value || !name.value.trim() || !props.projectId) return
    const projectId = props.projectId,
        token = epoch
    saving.value = true
    addError.value = ''
    try {
        const result = await crudAction('task_status', 'add', {
            project_id: projectId,
            name: name.value.trim(),
            is_completed: completed.value
        })
        if (token !== epoch) return
        const loaded = await load(projectId, token)
        if (token === epoch) {
            if (!loaded) {
                // The write succeeded; keep its ID without offering an unsafe retry.
                states.value.push({
                    id: result.id,
                    name: name.value.trim(),
                    builtin_key: '',
                    is_completed: completed.value
                })
                emit('loaded', states.value)
            }
            emit('update:modelValue', result.id)
            adding.value = false
        }
    } catch (e) {
        if (token === epoch) addError.value = e.message
    } finally {
        saving.value = false
    }
}
</script>
<style scoped>
.status-complete {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 1rem;
}
</style>
