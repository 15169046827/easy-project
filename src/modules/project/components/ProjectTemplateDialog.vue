<template>
    <Dialog
        :visible="visible"
        modal
        :header="$t('projectTemplates.dialogTitle')"
        :style="{ width: '52rem', maxWidth: 'calc(100vw - 2rem)' }"
        :draggable="false"
        @update:visible="$emit('update:visible', $event)"
    >
        <div class="template-dialog">
            <p class="dialog-intro">{{ $t('projectTemplates.dialogDescription') }}</p>
            <div class="template-grid">
                <button
                    v-for="template in PROJECT_TEMPLATES"
                    :key="template.id"
                    type="button"
                    :class="['template-card', { selected: form.templateId === template.id }]"
                    @click="selectTemplate(template)"
                >
                    <span class="template-icon"><i :class="template.icon"></i></span>
                    <span>
                        <strong>{{ $t(template.titleKey) }}</strong>
                        <small>{{ $t(template.descriptionKey) }}</small>
                    </span>
                    <i
                        v-if="form.templateId === template.id"
                        class="pi pi-check selection-mark"
                    ></i>
                </button>
            </div>

            <div class="form-grid">
                <label class="field field-wide">
                    <span>{{ $t('projectTemplates.projectName') }}</span>
                    <InputText v-model="form.name" autofocus fluid />
                </label>
                <label class="field">
                    <span>{{ $t('projectTemplates.owner') }}</span>
                    <MemberSelect
                        v-model="form.owner"
                        :placeholder="$t('projects.ownerPlaceholder')"
                    />
                </label>
                <label class="field">
                    <span>{{ $t('projectTemplates.startDate') }}</span>
                    <DatePicker v-model="form.startDate" dateFormat="yy-mm-dd" showIcon fluid />
                </label>
            </div>

            <label v-if="selectedTemplate.tasks.length" class="assign-option">
                <input v-model="form.assignOwner" type="checkbox" :disabled="!form.owner" />
                <span>{{ $t('projectTemplates.assignOwner') }}</span>
            </label>
            <p v-if="error" class="dialog-error">{{ error }}</p>
        </div>

        <template #footer>
            <Button
                :label="$t('common.cancel')"
                severity="secondary"
                text
                :disabled="busy"
                @click="$emit('update:visible', false)"
            />
            <Button
                :label="$t('projectTemplates.create')"
                icon="pi pi-plus"
                :loading="busy"
                :disabled="!form.name.trim() || !form.startDate"
                @click="submit"
            />
        </template>
    </Dialog>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useI18n } from 'vue-i18n'
import MemberSelect from '../../member/components/MemberSelect.vue'
import { buildTemplateTasks, PROJECT_TEMPLATES } from '../templates/projectTemplates.js'

const props = defineProps({
    visible: Boolean,
    busy: Boolean,
    error: { type: String, default: '' }
})
const emit = defineEmits(['update:visible', 'create'])
const { t } = useI18n()

const form = reactive({
    templateId: 'blank',
    name: '',
    owner: '',
    startDate: new Date(),
    assignOwner: true
})

const selectedTemplate = computed(
    () =>
        PROJECT_TEMPLATES.find(template => template.id === form.templateId) ?? PROJECT_TEMPLATES[0]
)

function reset() {
    form.templateId = 'blank'
    form.name = ''
    form.owner = ''
    form.startDate = new Date()
    form.assignOwner = true
}

function selectTemplate(template) {
    const previousDefault = t(selectedTemplate.value.titleKey)
    form.templateId = template.id
    if (!form.name || form.name === previousDefault) form.name = t(template.titleKey)
}

function submit() {
    const calendar = {
        calendar_country: 'CN',
        calendar_region: '',
        weekend_days: '[0,6]',
        calendar_exceptions: '[]'
    }
    emit('create', {
        project: {
            name: form.name.trim(),
            version: 'v1.0',
            type: 'private',
            status: 'Draft',
            owner: form.owner,
            ...calendar
        },
        tasks: buildTemplateTasks(
            selectedTemplate.value,
            form.startDate,
            calendar,
            t,
            form.assignOwner ? form.owner : ''
        )
    })
}

watch(
    () => props.visible,
    value => {
        if (value) reset()
    }
)
</script>

<style scoped>
.template-dialog {
    display: grid;
    gap: 1.25rem;
}
.dialog-intro {
    margin: 0;
    color: var(--color-text-secondary);
}
.template-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}
.template-card {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    min-height: 6rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    background: var(--color-surface);
    text-align: left;
    cursor: pointer;
    transition:
        border-color var(--transition-fast),
        box-shadow var(--transition-fast),
        background var(--transition-fast);
}
.template-card:hover,
.template-card.selected {
    border-color: var(--color-primary);
    background: var(--color-subtle);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 14%, transparent);
}
.template-card strong,
.template-card small {
    display: block;
}
.template-card small {
    margin-top: 0.3rem;
    color: var(--color-text-secondary);
    line-height: 1.35;
}
.template-icon {
    display: grid;
    width: 2.2rem;
    height: 2.2rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.65rem;
    color: var(--color-primary);
    background: var(--color-subtle);
}
.selection-mark {
    position: absolute;
    top: 0.65rem;
    right: 0.65rem;
    color: var(--color-primary);
}
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}
.field {
    display: grid;
    gap: 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
}
.field-wide {
    grid-column: 1 / -1;
}
.assign-option {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}
.dialog-error {
    margin: 0;
    padding: 0.65rem 0.8rem;
    border-radius: var(--radius-md);
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
@media (max-width: 640px) {
    .template-grid,
    .form-grid {
        grid-template-columns: 1fr;
    }
    .field-wide {
        grid-column: auto;
    }
}
</style>
