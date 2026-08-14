<template>
    <section class="calendar-sync">
        <header>
            <div>
                <span>{{ $t('calendarSync.eyebrow') }}</span>
                <h3>{{ $t('calendarSync.title') }}</h3>
                <p>{{ $t('calendarSync.subtitle') }}</p>
            </div>
        </header>

        <p v-if="message" class="sync-message" :class="messageType">{{ message }}</p>

        <div class="sync-grid">
            <article>
                <div class="action-icon"><i class="pi pi-download"></i></div>
                <div class="action-copy">
                    <h4>{{ $t('calendarSync.exportTitle') }}</h4>
                    <p>{{ $t('calendarSync.exportHint', { count: schedulableTasks.length }) }}</p>
                </div>
                <button
                    class="primary-action"
                    :disabled="!schedulableTasks.length"
                    @click="exportCalendar"
                >
                    <i class="pi pi-calendar-plus"></i>{{ $t('calendarSync.exportButton') }}
                </button>
            </article>

            <article class="import-card">
                <div class="action-icon import"><i class="pi pi-upload"></i></div>
                <div class="action-copy">
                    <h4>{{ $t('calendarSync.importTitle') }}</h4>
                    <p>{{ $t('calendarSync.importHint') }}</p>
                </div>

                <div class="import-controls">
                    <label>
                        <span>{{ $t('calendarSync.member') }}</span>
                        <select v-model="memberId" data-testid="ics-member-select">
                            <option value="">{{ $t('calendarSync.chooseMember') }}</option>
                            <option v-for="member in members" :key="member.id" :value="member.id">
                                {{ member.name }}
                            </option>
                        </select>
                    </label>
                    <label class="file-picker" :class="{ selected: fileName }">
                        <input
                            type="file"
                            accept=".ics,text/calendar"
                            data-testid="ics-file-input"
                            @change="readCalendar"
                        />
                        <i class="pi" :class="fileName ? 'pi-file-check' : 'pi-file-import'"></i>
                        <span>
                            <strong>{{ fileName || $t('calendarSync.chooseFile') }}</strong>
                            <small>{{
                                fileName
                                    ? $t('calendarSync.previewCount', {
                                          count: parsedEvents.length
                                      })
                                    : $t('calendarSync.fileTypes')
                            }}</small>
                        </span>
                    </label>
                    <button
                        class="primary-action"
                        :disabled="saving || !memberId || !parsedEvents.length"
                        data-testid="ics-import-button"
                        @click="importAvailability"
                    >
                        <i class="pi pi-check"></i>{{ $t('calendarSync.importButton') }}
                    </button>
                </div>

                <div v-if="parsedEvents.length" class="event-preview">
                    <div
                        v-for="event in parsedEvents.slice(0, 5)"
                        :key="event.uid || `${event.startDate}-${event.summary}`"
                    >
                        <i class="pi pi-circle-fill"></i>
                        <strong>{{ event.summary || $t('calendarSync.unnamedEvent') }}</strong>
                        <time
                            >{{ event.startDate
                            }}<template v-if="event.endDate !== event.startDate">
                                — {{ event.endDate }}</template
                            ></time
                        >
                    </div>
                    <small v-if="parsedEvents.length > 5">{{
                        $t('calendarSync.moreEvents', { count: parsedEvents.length - 5 })
                    }}</small>
                </div>
            </article>

            <article class="subscription-card">
                <div class="action-icon online"><i class="pi pi-cloud-download"></i></div>
                <div class="action-copy">
                    <h4>{{ $t('calendarSync.onlineTitle') }}</h4>
                    <p>{{ $t('calendarSync.onlineHint') }}</p>
                </div>
                <div class="subscription-form">
                    <input
                        v-model="subscriptionDraft.name"
                        data-testid="subscription-name"
                        :placeholder="$t('calendarSync.subscriptionName')"
                    />
                    <input
                        v-model="subscriptionDraft.url"
                        data-testid="subscription-url"
                        type="url"
                        :placeholder="$t('calendarSync.subscriptionUrl')"
                    />
                    <select v-model="subscriptionDraft.member_id" data-testid="subscription-member">
                        <option value="">{{ $t('calendarSync.chooseMember') }}</option>
                        <option v-for="member in members" :key="member.id" :value="member.id">
                            {{ member.name }}
                        </option>
                    </select>
                    <button
                        class="primary-action"
                        data-testid="subscription-add"
                        :disabled="!canSaveSubscription"
                        @click="saveSubscription"
                    >
                        <i class="pi pi-plus"></i>{{ $t('calendarSync.addSubscription') }}
                    </button>
                </div>
                <p class="subscription-warning">
                    <i class="pi pi-shield"></i>{{ $t('calendarSync.subscriptionSecurity') }}
                </p>
                <div v-if="subscriptions.length" class="subscription-list">
                    <div v-for="subscription in subscriptions" :key="subscription.id">
                        <span
                            ><strong>{{ subscription.name }}</strong
                            ><small
                                >{{ hostName(subscription.url) }} ·
                                {{ memberLabel(subscription.member_id) }}</small
                            ></span
                        >
                        <small :class="{ error: subscription.last_error }">{{
                            subscription.last_error ||
                            (subscription.last_synced_at
                                ? $t('calendarSync.lastSynced', {
                                      date: formatSyncDate(subscription.last_synced_at)
                                  })
                                : $t('calendarSync.neverSynced'))
                        }}</small>
                        <button
                            :disabled="syncingId === subscription.id"
                            data-testid="subscription-sync"
                            @click="syncSubscription(subscription)"
                        >
                            <i class="pi pi-refresh"></i>{{ $t('calendarSync.syncNow') }}
                        </button>
                        <button
                            class="remove-subscription"
                            :title="$t('calendarSync.removeSubscription')"
                            @click="removeSubscription(subscription.id)"
                        >
                            <i class="pi pi-trash"></i>
                        </button>
                    </div>
                </div>
            </article>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { crudAction } from '../../../api'
import { parseAvailabilityExceptions } from '../utils/memberAvailability.js'
import { generateProjectIcs, mergeIcsAvailability, parseIcsEvents } from '../utils/ics.js'

const props = defineProps({
    project: { type: Object, required: true },
    tasks: { type: Array, default: () => [] },
    members: { type: Array, default: () => [] }
})
const emit = defineEmits(['imported'])
const { t } = useI18n()
const memberId = ref('')
const fileName = ref('')
const parsedEvents = ref([])
const message = ref('')
const messageType = ref('success')
const saving = ref(false)
const subscriptions = ref([])
const syncingId = ref('')
const subscriptionDraft = reactive({ name: '', url: '', member_id: '' })
const SUBSCRIPTION_KEY = 'easyproject-calendar-subscriptions'

const schedulableTasks = computed(() =>
    props.tasks.filter(task => task.start_time && task.end_time)
)
const canSaveSubscription = computed(
    () =>
        subscriptionDraft.name.trim() &&
        /^https?:\/\//i.test(subscriptionDraft.url) &&
        subscriptionDraft.member_id
)

function setMessage(type, value) {
    messageType.value = type
    message.value = value
}

function exportCalendar() {
    try {
        const contents = generateProjectIcs(props.project, schedulableTasks.value)
        const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${String(props.project.name || 'easy-project').replace(/[\\/:*?"<>|]/g, '-')}.ics`
        link.click()
        URL.revokeObjectURL(url)
        setMessage('success', t('calendarSync.exported', { count: schedulableTasks.value.length }))
    } catch (error) {
        setMessage('error', error.message)
    }
}

async function readCalendar(event) {
    const input = event.target
    const file = input.files?.[0]
    fileName.value = file?.name || ''
    parsedEvents.value = []
    message.value = ''
    if (!file) return
    try {
        const events = parseIcsEvents(await file.text())
        parsedEvents.value = events
        if (!events.length) setMessage('error', t('calendarSync.noEvents'))
    } catch (error) {
        setMessage('error', error.message || t('calendarSync.invalidFile'))
    }
}

async function importAvailability() {
    const member = props.members.find(item => item.id === memberId.value)
    if (!member) return
    const result = mergeIcsAvailability(parseAvailabilityExceptions(member), parsedEvents.value)
    if (!result.imported) {
        setMessage('success', t('calendarSync.allDuplicates', { count: result.skipped }))
        return
    }
    saving.value = true
    message.value = ''
    try {
        await crudAction('member', 'update', {
            id: member.id,
            availability_exceptions: JSON.stringify(result.items)
        })
        setMessage(
            'success',
            t('calendarSync.imported', {
                count: result.imported,
                skipped: result.skipped,
                name: member.name
            })
        )
        emit('imported')
    } catch (error) {
        setMessage('error', error.message)
    } finally {
        saving.value = false
    }
}

function persistSubscriptions() {
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscriptions.value))
}
function saveSubscription() {
    if (!canSaveSubscription.value) return
    subscriptions.value.push({
        id: crypto.randomUUID(),
        name: subscriptionDraft.name.trim(),
        url: subscriptionDraft.url.trim(),
        member_id: subscriptionDraft.member_id,
        last_synced_at: '',
        last_error: ''
    })
    persistSubscriptions()
    subscriptionDraft.name = ''
    subscriptionDraft.url = ''
    subscriptionDraft.member_id = ''
}
function removeSubscription(id) {
    subscriptions.value = subscriptions.value.filter(item => item.id !== id)
    persistSubscriptions()
}
async function syncSubscription(subscription) {
    const member = props.members.find(item => item.id === subscription.member_id)
    if (!member) {
        subscription.last_error = t('calendarSync.memberMissing')
        persistSubscriptions()
        return
    }
    syncingId.value = subscription.id
    subscription.last_error = ''
    try {
        const response = await crudAction('calendar', 'fetch_ics', { url: subscription.url })
        const events = parseIcsEvents(response?.text || '')
        const result = mergeIcsAvailability(parseAvailabilityExceptions(member), events)
        if (result.imported) {
            await crudAction('member', 'update', {
                id: member.id,
                availability_exceptions: JSON.stringify(result.items)
            })
            emit('imported')
        }
        subscription.last_synced_at = new Date().toISOString()
        setMessage(
            'success',
            t('calendarSync.subscriptionSynced', {
                count: result.imported,
                skipped: result.skipped,
                name: subscription.name
            })
        )
    } catch (error) {
        subscription.last_error = error.message
        setMessage('error', error.message)
    } finally {
        syncingId.value = ''
        persistSubscriptions()
    }
}
function hostName(url) {
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}
function memberLabel(id) {
    return props.members.find(item => item.id === id)?.name || t('calendarSync.memberMissing')
}
function formatSyncDate(value) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(value)
    )
}
onMounted(() => {
    try {
        const parsed = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || '[]')
        subscriptions.value = Array.isArray(parsed) ? parsed : []
    } catch {
        subscriptions.value = []
    }
})
</script>

<style scoped>
.calendar-sync {
    padding: 1.4rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
}
.calendar-sync header span {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.calendar-sync header h3 {
    margin: 0.15rem 0 0;
    font-size: 1.25rem;
}
.calendar-sync header p,
.action-copy p {
    margin: 0.3rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.84rem;
}
.sync-message {
    padding: 0.65rem 0.8rem;
    border-radius: 0.5rem;
    font-size: 0.82rem;
}
.sync-message.success {
    color: var(--color-success-text);
    background: var(--color-success-bg);
}
.sync-message.error {
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
.sync-grid {
    display: grid;
    gap: 0.8rem;
    margin-top: 1.2rem;
}
.sync-grid article {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.9rem;
    padding: 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-subtle);
}
.action-icon {
    display: grid;
    width: 2.6rem;
    height: 2.6rem;
    place-items: center;
    border-radius: 0.65rem;
    color: var(--color-primary-text);
    background: var(--color-primary-light);
}
.action-icon.import {
    color: #047857;
    background: #d1fae5;
}
.action-icon.online {
    color: #7c3aed;
    background: #ede9fe;
}
.action-copy h4 {
    margin: 0;
    font-size: 0.92rem;
}
.primary-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    min-height: 2.45rem;
    padding: 0.55rem 0.85rem;
    border: 0;
    border-radius: 0.5rem;
    color: #fff;
    background: var(--color-primary);
    cursor: pointer;
    font-weight: 600;
}
.primary-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.import-card {
    align-items: start !important;
}
.import-controls {
    grid-column: 2 / -1;
    display: grid;
    grid-template-columns: minmax(10rem, 0.8fr) minmax(14rem, 1.2fr) auto;
    gap: 0.65rem;
    align-items: end;
}
.import-controls label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}
.import-controls label > span {
    color: var(--color-text-secondary);
    font-size: 0.76rem;
}
.import-controls select {
    min-height: 2.65rem;
    padding: 0.5rem 0.65rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    color: var(--color-text);
    background: var(--color-surface);
}
.file-picker {
    flex-direction: row !important;
    align-items: center;
    min-height: 2.65rem;
    padding: 0.45rem 0.65rem;
    border: 1px dashed var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-surface);
    cursor: pointer;
}
.file-picker.selected {
    border-style: solid;
    border-color: var(--color-primary);
}
.file-picker input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
}
.file-picker i {
    color: var(--color-primary);
}
.file-picker span {
    display: grid;
    min-width: 0;
}
.file-picker strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.78rem;
}
.file-picker small {
    color: var(--color-text-muted);
    font-size: 0.68rem;
}
.event-preview {
    grid-column: 2 / -1;
    display: grid;
    gap: 0.35rem;
    padding: 0.65rem 0.75rem;
    border-radius: 0.5rem;
    background: var(--color-surface);
}
.event-preview > div {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.76rem;
}
.event-preview i {
    color: var(--color-primary);
    font-size: 0.35rem;
}
.event-preview time,
.event-preview > small {
    color: var(--color-text-muted);
}
.subscription-card {
    align-items: start !important;
}
.subscription-form {
    grid-column: 2 / -1;
    display: grid;
    grid-template-columns: 0.7fr 1.4fr 0.8fr auto;
    gap: 0.55rem;
}
.subscription-form input,
.subscription-form select {
    min-height: 2.55rem;
    padding: 0.48rem 0.62rem;
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    color: var(--color-text);
    background: var(--color-surface);
}
.subscription-warning {
    grid-column: 2 / -1;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin: 0;
    color: var(--color-warning-text);
    font-size: 0.7rem;
}
.subscription-list {
    grid-column: 2 / -1;
    display: grid;
    gap: 0.45rem;
    width: 100%;
}
.subscription-list > div {
    display: grid;
    grid-template-columns: minmax(10rem, 1fr) minmax(10rem, 1fr) auto auto;
    align-items: center;
    gap: 0.6rem;
    padding: 0.65rem;
    border-radius: 0.5rem;
    background: var(--color-surface);
}
.subscription-list span {
    display: grid;
    gap: 0.15rem;
}
.subscription-list small {
    color: var(--color-text-muted);
    font-size: 0.68rem;
}
.subscription-list small.error {
    color: var(--color-error-text);
}
.subscription-list button {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.55rem;
    border: 1px solid var(--color-border);
    border-radius: 0.4rem;
    color: var(--color-primary-text);
    background: transparent;
    cursor: pointer;
}
.subscription-list .remove-subscription {
    color: var(--color-error-text);
}
@media (max-width: 820px) {
    .sync-grid article {
        grid-template-columns: auto 1fr;
    }
    .sync-grid article > .primary-action,
    .import-controls,
    .event-preview {
        grid-column: 1 / -1;
    }
    .import-controls {
        grid-template-columns: 1fr;
    }
    .subscription-form,
    .subscription-list {
        grid-column: 1 / -1;
        grid-template-columns: 1fr;
    }
    .subscription-warning {
        grid-column: 1 / -1;
    }
}
</style>
