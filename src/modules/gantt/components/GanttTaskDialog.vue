<template>
    <Dialog
        :visible="visible"
        modal
        :header="creating ? $t('tasks.newTask') : $t('gantt.editTitle')"
        :style="{ width: '38rem', maxWidth: 'calc(100vw - 2rem)' }"
        :draggable="false"
        :closable="!saving"
        :closeOnEscape="!saving"
        @update:visible="!$event && $emit('close')"
    >
        <form
            :id="prefix + '-form'"
            :class="['edit-panel', { 'create-panel': creating }]"
            @submit.prevent="submit"
        >
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <div class="edit-field full">
                <label :for="prefix + '-name'"
                    >{{ $t('gantt.labelName') }}
                    <span class="required-marker" aria-hidden="true">*</span></label
                >
                <InputText
                    :id="prefix + '-name'"
                    v-model="form.name"
                    aria-required="true"
                    :invalid="Boolean(errors.name)"
                    :aria-describedby="errors.name ? prefix + '-error-name' : undefined"
                    class="create-name"
                    autofocus
                />
                <Message
                    v-if="errors.name"
                    :id="prefix + '-error-name'"
                    severity="error"
                    size="small"
                    variant="simple"
                    :closable="false"
                    >{{ errors.name }}</Message
                >
            </div>
            <div class="edit-field">
                <label :for="prefix + '-start'">{{ $t('gantt.labelStart') }}</label
                ><DatePickerDateString
                    :inputId="prefix + '-start'"
                    v-model="form.start_time"
                    :disabled="form.derived"
                    @update:modelValue="$emit('recalculate-end')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-effort'">{{ $t('tasks.columnEffort') }}</label
                ><TaskEffortInput
                    :inputId="prefix + '-effort'"
                    v-model="form.effort_days"
                    v-model:state="form.effort_state"
                    :disabled="form.derived"
                    @change="$emit('recalculate-end')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-end'">{{ $t('gantt.labelEnd') }}</label
                ><DatePickerDateString
                    :inputId="prefix + '-end'"
                    v-model="form.end_time"
                    :disabled="form.derived"
                    @update:modelValue="$emit('recalculate-effort')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-mode'"
                    >{{ $t('tasks.columnScheduleMode') }}
                    <span class="required-marker" aria-hidden="true">*</span></label
                ><Select
                    :inputId="prefix + '-mode'"
                    v-model="form.schedule_mode"
                    aria-required="true"
                    :invalid="Boolean(errors.schedule_mode)"
                    :aria-describedby="errors.schedule_mode ? prefix + '-error-mode' : undefined"
                    :options="scheduleModes"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                    @update:modelValue="$emit('recalculate-end')"
                />
                <Message
                    v-if="errors.schedule_mode"
                    :id="prefix + '-error-mode'"
                    severity="error"
                    size="small"
                    variant="simple"
                    :closable="false"
                    >{{ errors.schedule_mode }}</Message
                >
            </div>
            <div class="edit-field">
                <label :for="prefix + '-type'"
                    >{{ $t('gantt.labelType') }}
                    <span class="required-marker" aria-hidden="true">*</span></label
                ><Select
                    :inputId="prefix + '-type'"
                    v-model="form.type"
                    aria-required="true"
                    :invalid="Boolean(errors.type)"
                    :aria-describedby="errors.type ? prefix + '-error-type' : undefined"
                    :options="types"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                />
                <Message
                    v-if="errors.type"
                    :id="prefix + '-error-type'"
                    severity="error"
                    size="small"
                    variant="simple"
                    :closable="false"
                    >{{ errors.type }}</Message
                >
            </div>
            <div class="edit-field">
                <label :for="prefix + '-status'"
                    >{{ $t('gantt.labelStatus') }}
                    <span class="required-marker" aria-hidden="true">*</span></label
                ><TaskStatusSelect
                    v-if="visible"
                    :inputId="prefix + '-status'"
                    v-model="form.status_id"
                    aria-required="true"
                    :invalid="Boolean(errors.status_id)"
                    :aria-describedby="errors.status_id ? prefix + '-error-status' : undefined"
                    :projectId="projectId"
                    @loaded="setDefaultStatus"
                />
                <Message
                    v-if="errors.status_id"
                    :id="prefix + '-error-status'"
                    severity="error"
                    size="small"
                    variant="simple"
                    :closable="false"
                    >{{ errors.status_id }}</Message
                >
            </div>
            <div v-if="creating" class="edit-field">
                <label :for="prefix + '-priority'"
                    >{{ $t('tasks.columnPriority') }}
                    <span class="required-marker" aria-hidden="true">*</span></label
                ><Select
                    :inputId="prefix + '-priority'"
                    v-model="form.priority"
                    aria-required="true"
                    :invalid="Boolean(errors.priority)"
                    :aria-describedby="errors.priority ? prefix + '-error-priority' : undefined"
                    :options="priorities"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                />
                <Message
                    v-if="errors.priority"
                    :id="prefix + '-error-priority'"
                    severity="error"
                    size="small"
                    variant="simple"
                    :closable="false"
                    >{{ errors.priority }}</Message
                >
            </div>
            <div class="edit-field">
                <label :for="prefix + '-assignee'">{{ $t('tasks.columnAssignee') }}</label
                ><MemberSelect
                    :inputId="prefix + '-assignee'"
                    v-model="form.assignee"
                    :allowed-member-ids="memberIds"
                    :placeholder="$t('tasks.selectAssignee')"
                />
            </div>
            <div v-if="creating" class="edit-field full">
                <label :for="prefix + '-comment'">{{ $t('tasks.columnComment') }}</label
                ><InputText :id="prefix + '-comment'" v-model="form.comment" />
            </div>
            <div v-else class="edit-field full">
                <label :for="prefix + '-progress'">{{ $t('gantt.labelProgress') }}</label
                ><ProgressEditor
                    v-if="!form.derived"
                    :inputId="prefix + '-progress'"
                    v-model="form.progress"
                    :label="$t('gantt.labelProgress')"
                />
                <p v-else>{{ $t('taskHierarchy.derived') }}</p>
            </div>
        </form>
        <template #footer
            ><Button
                class="btn-cancel"
                :label="$t('common.cancel')"
                text
                :disabled="saving"
                @click="$emit('close')" /><Button
                class="btn-save"
                type="submit"
                :form="prefix + '-form'"
                :label="creating ? $t('tasks.newTask') : $t('common.save')"
                :loading="saving"
        /></template>
    </Dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import TaskEffortInput from '../../../components/TaskEffortInput.vue'
import Select from 'primevue/select'
import Message from 'primevue/message'
import DatePickerDateString from '../../../components/DatePickerDateString.vue'
import ProgressEditor from '../../../components/ProgressEditor.vue'
import MemberSelect from '../../member/components/MemberSelect.vue'
import TaskStatusSelect from '../../../components/TaskStatusSelect.vue'
import { validateTaskForm } from '../../task/utils/taskFormValidation.js'

const props = defineProps({
    visible: Boolean,
    projectId: { type: String, default: '' },
    creating: Boolean,
    saving: Boolean,
    error: { type: String, default: '' },
    memberIds: { type: Array, default: null }
})
const form = defineModel({ type: Object, required: true })
const emit = defineEmits(['close', 'save', 'recalculate-end', 'recalculate-effort'])
const { t } = useI18n()
const prefix = computed(() => (props.creating ? 'gantt-create' : 'gantt-edit'))
const submitted = ref(false)
watch(
    () => props.visible,
    () => {
        submitted.value = false
    }
)
const errors = computed(() =>
    submitted.value
        ? validateTaskForm(
              {
                  ...form.value,
                  project_id: props.projectId,
                  // The edit dialog does not expose or change priority.
                  priority: props.creating ? form.value.priority : '3'
              },
              t
          )
        : {}
)
function submit() {
    if (props.saving) return
    submitted.value = true
    const first = Object.keys(errors.value)[0]
    if (first) {
        const field = { status_id: 'status', schedule_mode: 'mode' }[first] || first
        document.getElementById(`${prefix.value}-${field}`)?.focus()
        return
    }
    emit('save')
}
const scheduleModes = computed(() => [
    { label: t('tasks.fixedEffort'), value: 'fixed_effort' },
    { label: t('tasks.fixedDates'), value: 'fixed_dates' }
])
const types = computed(() => [
    { label: t('gantt.optionTask'), value: 'Task' },
    { label: t('gantt.optionMilestone'), value: 'Milestone' },
    { label: t('tasks.typeFile'), value: 'File' }
])
function setDefaultStatus(states) {
    if (!form.value.status_id) {
        const state = props.creating
            ? states.find(item => item.is_default)
            : states.find(
                  item =>
                      item.builtin_key ===
                      (form.value.status === 'Todo' ? 'Pending' : form.value.status)
              )
        if (state) form.value.status_id = state.id
    }
}
const priorities = computed(() =>
    [5, 4, 3, 2, 1].map(value => ({ label: t('tasks.p' + value), value: String(value) }))
)
</script>

<style scoped>
.required-marker {
    color: var(--color-error-text);
}
.edit-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    padding-top: 0.5rem;
}
.edit-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
}
.edit-field.full {
    grid-column: 1 / -1;
}
label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-text-secondary);
}
.edit-field :deep(.p-datepicker),
.edit-field :deep(.p-datepicker-input),
.edit-field :deep(.p-inputtext) {
    width: 100%;
    min-width: 0;
}
@media (max-width: 600px) {
    .edit-panel {
        grid-template-columns: 1fr;
    }
}
</style>
