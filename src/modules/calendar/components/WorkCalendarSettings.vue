<template>
    <section class="calendar-settings">
        <header class="calendar-heading">
            <div>
                <span>{{ $t('calendar.eyebrow') }}</span>
                <h3>{{ $t('calendar.title') }}</h3>
                <p>{{ $t('calendar.subtitle') }}</p>
            </div>
            <button class="calendar-save" :disabled="saving" @click="save">
                <i class="pi pi-check"></i>{{ $t('calendar.save') }}
            </button>
        </header>

        <p v-if="message" class="calendar-message" :class="messageType">{{ message }}</p>

        <div class="calendar-grid">
            <label>
                <span>{{ $t('calendar.country') }}</span>
                <select v-model="form.calendar_country" @change="form.calendar_region = ''">
                    <option
                        v-for="country in countries"
                        :key="country.value"
                        :value="country.value"
                    >
                        {{ country.label }}
                    </option>
                </select>
            </label>
            <label>
                <span>{{ $t('calendar.region') }}</span>
                <select v-model="form.calendar_region" :disabled="!regions.length">
                    <option value="">{{ $t('calendar.noRegion') }}</option>
                    <option v-for="region in regions" :key="region.value" :value="region.value">
                        {{ region.label }}
                    </option>
                </select>
            </label>
        </div>

        <div class="weekend-section">
            <strong>{{ $t('calendar.weekends') }}</strong>
            <div class="weekday-options">
                <label v-for="(label, index) in weekdayLabels" :key="index">
                    <input v-model="weekendDays" type="checkbox" :value="index" />
                    <span>{{ label }}</span>
                </label>
            </div>
        </div>

        <div class="exception-section">
            <div class="section-title">
                <strong>{{ $t('calendar.exceptions') }}</strong>
                <small>{{ exceptions.length }}</small>
            </div>
            <div class="exception-form">
                <input
                    v-model="draft.date"
                    type="date"
                    :aria-label="$t('calendar.exceptionDate')"
                />
                <input
                    v-model="draft.name"
                    type="text"
                    :placeholder="$t('calendar.exceptionName')"
                />
                <select v-model="draft.type">
                    <option value="holiday">{{ $t('calendar.holiday') }}</option>
                    <option value="working">{{ $t('calendar.working') }}</option>
                </select>
                <button class="exception-add" @click="addException">
                    <i class="pi pi-plus"></i>{{ $t('calendar.addException') }}
                </button>
            </div>
            <p v-if="!exceptions.length" class="empty-exceptions">
                {{ $t('calendar.noExceptions') }}
            </p>
            <div v-else class="exception-list">
                <div v-for="(item, index) in exceptions" :key="`${item.date}-${index}`">
                    <time>{{ item.date }}</time>
                    <span class="exception-kind" :class="item.type">
                        {{
                            item.type === 'working'
                                ? $t('calendar.working')
                                : $t('calendar.holiday')
                        }}
                    </span>
                    <strong>{{ item.name }}</strong>
                    <button :title="$t('calendar.removeException')" @click="removeException(index)">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../api'
import { getCountries, getRegions, normalizeCalendar } from '../utils/workCalendar.js'

const props = defineProps({ project: { type: Object, required: true } })
const emit = defineEmits(['saved'])
const { t, tm, locale } = useI18n()
const form = reactive({ calendar_country: 'CN', calendar_region: '' })
const weekendDays = ref([0, 6])
const exceptions = ref([])
const draft = reactive({ date: '', name: '', type: 'holiday' })
const saving = ref(false)
const message = ref('')
const messageType = ref('success')

const language = computed(() => (locale.value.startsWith('zh') ? 'zh' : 'en'))
const countries = computed(() => getCountries(language.value))
const regions = computed(() => getRegions(form.calendar_country, language.value))
const weekdayLabels = computed(() => tm('calendar.weekdays'))

function hydrate(project) {
    const calendar = normalizeCalendar(project)
    form.calendar_country = calendar.country
    form.calendar_region = calendar.region
    weekendDays.value = [...calendar.weekendDays]
    exceptions.value = calendar.exceptions.map(item => ({ ...item }))
}

function addException() {
    if (!draft.date || !draft.name.trim()) {
        messageType.value = 'error'
        message.value = t('calendar.invalidException')
        return
    }
    exceptions.value = [
        ...exceptions.value.filter(item => item.date !== draft.date),
        { date: draft.date, name: draft.name.trim(), type: draft.type }
    ].sort((left, right) => left.date.localeCompare(right.date))
    draft.date = ''
    draft.name = ''
    message.value = ''
}

function removeException(index) {
    exceptions.value.splice(index, 1)
}

async function save() {
    saving.value = true
    message.value = ''
    try {
        const changes = {
            calendar_country: form.calendar_country,
            calendar_region: form.calendar_region,
            weekend_days: JSON.stringify([...weekendDays.value].map(Number).sort()),
            calendar_exceptions: JSON.stringify(exceptions.value)
        }
        await crudAction('project', 'update', { id: props.project.id, ...changes })
        messageType.value = 'success'
        message.value = t('calendar.saved')
        emit('saved', { ...props.project, ...changes })
    } catch (error) {
        messageType.value = 'error'
        message.value = error.message
    } finally {
        saving.value = false
    }
}

watch(() => props.project, hydrate, { immediate: true, deep: true })
</script>

<style scoped>
.calendar-settings {
    height: 100%;
    overflow-y: auto;
    padding: 1.4rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
.calendar-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}
.calendar-heading span {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.calendar-heading h3 {
    margin: 0.15rem 0 0;
    font-size: 1.25rem;
}
.calendar-heading p {
    margin: 0.3rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.84rem;
}
.calendar-save,
.exception-add {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.85rem;
    border: 0;
    border-radius: 0.5rem;
    color: #fff;
    background: var(--color-primary);
    cursor: pointer;
    font-weight: 600;
}
.calendar-save:disabled {
    opacity: 0.6;
}
.calendar-message {
    padding: 0.65rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.82rem;
}
.calendar-message.success {
    color: var(--color-success-text);
    background: var(--color-success-bg);
}
.calendar-message.error {
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}
.calendar-grid label,
.weekend-section,
.exception-section {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
}
.calendar-grid label > span,
.weekend-section > strong,
.section-title strong {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
}
.calendar-grid select,
.exception-form input,
.exception-form select {
    min-height: 2.5rem;
    padding: 0.48rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    color: var(--color-text);
    background: var(--color-subtle);
}
.weekend-section,
.exception-section {
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border);
}
.weekday-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.weekday-options label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.45rem;
    font-size: 0.8rem;
}
.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.section-title small {
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    color: var(--color-primary-text);
    background: var(--color-primary-light);
}
.exception-form {
    display: grid;
    grid-template-columns: 10rem minmax(10rem, 1fr) 10rem auto;
    gap: 0.6rem;
}
.empty-exceptions {
    margin: 0.35rem 0 0;
    color: var(--color-text-muted);
    font-size: 0.82rem;
}
.exception-list {
    display: grid;
    gap: 0.5rem;
}
.exception-list > div {
    display: grid;
    grid-template-columns: 7rem 8rem 1fr auto;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.75rem;
    border-radius: 0.5rem;
    background: var(--color-subtle);
    font-size: 0.82rem;
}
.exception-kind {
    width: fit-content;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    color: #b91c1c;
    background: #fee2e2;
}
.exception-kind.working {
    color: #166534;
    background: #dcfce7;
}
.exception-list button {
    border: 0;
    color: var(--color-text-muted);
    background: transparent;
    cursor: pointer;
}
@media (max-width: 820px) {
    .calendar-grid {
        grid-template-columns: 1fr;
    }
    .exception-form {
        grid-template-columns: 1fr;
    }
}
</style>
