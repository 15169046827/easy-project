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
            @submit.prevent="$emit('save')"
        >
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
            <div class="edit-field full">
                <label :for="prefix + '-name'">{{ $t('gantt.labelName') }}</label>
                <InputText
                    :id="prefix + '-name'"
                    v-model="form.name"
                    class="create-name"
                    autofocus
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-start'">{{ $t('gantt.labelStart') }}</label
                ><DatePickerDateString
                    :inputId="prefix + '-start'"
                    v-model="form.start_time"
                    @update:modelValue="$emit('recalculate-end')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-effort'">{{ $t('tasks.columnEffort') }}</label
                ><InputNumber
                    :inputId="prefix + '-effort'"
                    v-model="form.effort_days"
                    :min="0"
                    :step="0.5"
                    :maxFractionDigits="2"
                    fluid
                    @update:modelValue="$emit('recalculate-end')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-end'">{{ $t('gantt.labelEnd') }}</label
                ><DatePickerDateString
                    :inputId="prefix + '-end'"
                    v-model="form.end_time"
                    @update:modelValue="$emit('recalculate-effort')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-mode'">{{ $t('tasks.columnScheduleMode') }}</label
                ><Select
                    :inputId="prefix + '-mode'"
                    v-model="form.schedule_mode"
                    :options="scheduleModes"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                    @update:modelValue="$emit('recalculate-end')"
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-type'">{{ $t('gantt.labelType') }}</label
                ><Select
                    :inputId="prefix + '-type'"
                    v-model="form.type"
                    :options="types"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                />
            </div>
            <div class="edit-field">
                <label :for="prefix + '-status'">{{ $t('gantt.labelStatus') }}</label
                ><TaskStatusSelect
                    v-if="visible"
                    :inputId="prefix + '-status'"
                    v-model="form.status_id"
                    :projectId="projectId"
                    @loaded="setDefaultStatus"
                />
            </div>
            <div v-if="creating" class="edit-field">
                <label :for="prefix + '-priority'">{{ $t('tasks.columnPriority') }}</label
                ><Select
                    :inputId="prefix + '-priority'"
                    v-model="form.priority"
                    :options="priorities"
                    optionLabel="label"
                    optionValue="value"
                    fluid
                />
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
                    :inputId="prefix + '-progress'"
                    v-model="form.progress"
                    :label="$t('gantt.labelProgress')"
                />
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Message from 'primevue/message'
import DatePickerDateString from '../../../components/DatePickerDateString.vue'
import ProgressEditor from '../../../components/ProgressEditor.vue'
import MemberSelect from '../../member/components/MemberSelect.vue'
import TaskStatusSelect from '../../../components/TaskStatusSelect.vue'

const props = defineProps({
    visible: Boolean,
    projectId: { type: String, default: '' },
    creating: Boolean,
    saving: Boolean,
    error: { type: String, default: '' },
    memberIds: { type: Array, default: null }
})
const form = defineModel({ type: Object, required: true })
defineEmits(['close', 'save', 'recalculate-end', 'recalculate-effort'])
const { t } = useI18n()
const prefix = computed(() => (props.creating ? 'gantt-create' : 'gantt-edit'))
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
