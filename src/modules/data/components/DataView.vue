<template>
    <section class="data-page">
        <header class="data-header">
            <div>
                <span class="eyebrow">{{ $t('data.eyebrow') }}</span>
                <h2>{{ $t('data.title') }}</h2>
                <p>{{ $t('data.subtitle') }}</p>
            </div>
            <Button
                :label="$t('data.refreshBackups')"
                icon="pi pi-refresh"
                outlined
                @click="loadBackups"
            />
        </header>
        <p v-if="message" :class="['message-toast', messageType]">{{ message }}</p>
        <div class="cards">
            <article class="data-card">
                <div class="card-icon blue"><i class="pi pi-download"></i></div>
                <h3>{{ $t('data.exportTitle') }}</h3>
                <p>{{ $t('data.exportDesc') }}</p>
                <div class="actions">
                    <Button
                        :label="$t('data.json')"
                        icon="pi pi-download"
                        @click="exportData('json')"
                    />
                    <Button
                        :label="$t('data.csv')"
                        icon="pi pi-download"
                        outlined
                        @click="exportData('csv')"
                    />
                    <Button
                        :label="$t('data.xlsx')"
                        icon="pi pi-file-excel"
                        severity="success"
                        outlined
                        @click="exportData('xlsx')"
                    />
                    <Button
                        :label="$t('data.exampleProject')"
                        icon="pi pi-lightbulb"
                        text
                        @click="downloadExample"
                    />
                </div>
            </article>
            <article class="data-card">
                <div class="card-icon indigo"><i class="pi pi-upload"></i></div>
                <h3>{{ $t('data.importTitle') }}</h3>
                <p>{{ $t('data.importDesc') }}</p>
                <label class="file-picker" for="project-import-file">
                    <span class="file-icon"><i class="pi pi-upload"></i></span>
                    <span>
                        <strong>{{ selectedFileName || $t('data.chooseFile') }}</strong>
                        <small>{{ $t('data.clickBrowse') }}</small>
                    </span>
                    <span class="browse-button">{{ $t('common.browse') }}</span>
                </label>
                <input
                    id="project-import-file"
                    ref="fileInput"
                    class="native-file-input"
                    type="file"
                    accept=".json,.csv,.xlsx,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    @change="selectImportFile"
                />
                <div v-if="importPreview" class="import-preview">
                    <strong>{{ $t('data.mappingPreview') }}</strong>
                    <div class="preview-counts">
                        <span v-for="(count, name) in importPreview.counts" :key="name">
                            {{ name }} <b>{{ count }}</b>
                        </span>
                    </div>
                    <p v-for="mapping in importPreview.mappings || []" :key="mapping.sheet">
                        {{ mapping.sheet }}：{{ mapping.matched }}/{{ mapping.total }}
                        {{ $t('data.columnsMatched') }}
                    </p>
                    <p
                        v-for="warning in importPreview.warnings || []"
                        :key="warning"
                        class="preview-warning"
                    >
                        {{ warning }}
                    </p>
                </div>
                <label class="confirm-row">
                    <input v-model="confirmed" type="checkbox" />
                    <span>{{ $t('data.confirmReplace') }}</span>
                </label>
                <Button
                    v-if="pendingPayload"
                    class="import-submit"
                    :label="$t('data.startImport')"
                    icon="pi pi-check"
                    :disabled="!confirmed"
                    @click="executeImport"
                />
            </article>
            <article class="data-card wide">
                <div class="card-icon green"><i class="pi pi-database"></i></div>
                <h3>{{ $t('data.backupsTitle') }}</h3>
                <div class="backup-actions">
                    <Button
                        :label="$t('data.createBackup')"
                        icon="pi pi-save"
                        @click="createBackup"
                    />
                    <Button
                        v-if="backupDirectory"
                        :label="$t('data.openBackupFolder')"
                        icon="pi pi-folder-open"
                        outlined
                        @click="openBackupFolder"
                    />
                </div>
                <div v-if="backups.length" class="backup-list">
                    <div v-for="backup in backups" :key="backup.path">
                        <span class="backup-kind" :class="backup.reason">
                            {{ $t(`data.backupReason.${backup.reason || 'manual'}`) }}
                        </span>
                        <span class="backup-meta">
                            <strong>{{ formatDate(backup.created_at) }}</strong>
                            <small>
                                {{ formatSize(backup.size) }} ·
                                {{ $t('data.backupCounts', backup.counts || {}) }}
                            </small>
                            <code :title="backup.path">{{ backup.name }}</code>
                        </span>
                        <Button
                            :label="$t('data.restore')"
                            severity="danger"
                            outlined
                            size="small"
                            @click="prepareRestore(backup)"
                        />
                    </div>
                </div>
                <p v-else class="empty-text">{{ $t('data.noBackups') }}</p>
                <p class="backup-policy">{{ $t('data.backupPolicy') }}</p>
            </article>
        </div>
        <Teleport to="body">
            <div v-if="restoreCandidate" class="restore-overlay" @click.self="cancelRestore">
                <section class="restore-dialog" role="dialog" aria-modal="true">
                    <div class="restore-icon"><i class="pi pi-history"></i></div>
                    <h3>{{ $t('data.restorePreviewTitle') }}</h3>
                    <p>{{ $t('data.restorePreviewHint') }}</p>
                    <div class="restore-counts">
                        <span
                            ><strong>{{ restorePreview.projects || 0 }}</strong
                            >{{ $t('data.projects') }}</span
                        >
                        <span
                            ><strong>{{ restorePreview.tasks || 0 }}</strong
                            >{{ $t('data.tasks') }}</span
                        >
                        <span
                            ><strong>{{ restorePreview.members || 0 }}</strong
                            >{{ $t('data.members') }}</span
                        >
                        <span
                            ><strong>{{ restorePreview.dependencies || 0 }}</strong
                            >{{ $t('data.dependencies') }}</span
                        >
                        <span
                            ><strong>{{ restorePreview.baselines || 0 }}</strong
                            >{{ $t('data.baselines') }}</span
                        >
                    </div>
                    <small>{{ $t('data.restoreSafetyHint') }}</small>
                    <div class="restore-actions">
                        <Button :label="$t('common.cancel')" outlined @click="cancelRestore" />
                        <Button
                            :label="$t('data.confirmRestore')"
                            severity="danger"
                            :loading="restoring"
                            @click="restore"
                        />
                    </div>
                </section>
            </div>
        </Teleport>
    </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { crudAction } from '../../../api'
import { snapshotToXlsx, xlsxToSnapshot } from '../utils/xlsx.js'
const backups = ref([]),
    backupDirectory = ref(''),
    message = ref(''),
    messageType = ref('success'),
    confirmed = ref(false),
    fileInput = ref(null),
    selectedFileName = ref(''),
    restoreCandidate = ref(null),
    restorePreview = ref({}),
    restoring = ref(false),
    pendingPayload = ref(null),
    importPreview = ref(null)
const { t } = useI18n()
const csvEscape = value => `"${String(value ?? '').replaceAll('"', '""')}"`
function toCsv(snapshot) {
    const rows = [
        ['record_type', 'data'],
        ['schema_version', snapshot.schemaVersion || 5]
    ]
    for (const p of snapshot.projects) rows.push(['project', ...p])
    for (const t of snapshot.tasks) rows.push(['task', ...t])
    for (const d of snapshot.dependencies) rows.push(['dependency', ...d])
    for (const m of snapshot.members || []) rows.push(['member', ...m])
    for (const pm of snapshot.project_members || []) rows.push(['project_member', ...pm])
    for (const baseline of snapshot.plan_baselines || []) rows.push(['plan_baseline', ...baseline])
    return rows.map(r => r.map(csvEscape).join(',')).join('\r\n')
}
function parseCsv(text) {
    const rows = []
    let row = [],
        cell = '',
        quoted = false
    for (let i = 0; i < text.length; i++) {
        const c = text[i]
        if (quoted && c === '"' && text[i + 1] === '"') {
            cell += '"'
            i++
        } else if (c === '"') quoted = !quoted
        else if (c === ',' && !quoted) {
            row.push(cell)
            cell = ''
        } else if ((c === '\n' || c === '\r') && !quoted) {
            if (c === '\r' && text[i + 1] === '\n') i++
            row.push(cell)
            if (row.some(Boolean)) rows.push(row)
            row = []
            cell = ''
        } else cell += c
    }
    row.push(cell)
    if (row.some(Boolean)) rows.push(row)
    return rows
}
function fromCsv(text) {
    const rows = parseCsv(text)
    if (rows[0]?.[0] !== 'record_type') throw new Error('Unsupported CSV header')
    const payload = {
        schemaVersion: 1,
        projects: [],
        tasks: [],
        dependencies: [],
        members: [],
        project_members: [],
        plan_baselines: []
    }
    for (const row of rows.slice(1)) {
        const [type, ...data] = row
        if (type === 'schema_version') payload.schemaVersion = Number(data[0]) || 1
        else if (type === 'project') payload.projects.push(data)
        else if (type === 'task') payload.tasks.push(data)
        else if (type === 'dependency') payload.dependencies.push(data)
        else if (type === 'member') payload.members.push(data)
        else if (type === 'project_member') payload.project_members.push(data)
        else if (type === 'plan_baseline') payload.plan_baselines.push(data)
    }
    return payload
}
function download(name, content, type) {
    const url = URL.createObjectURL(new Blob([content], { type }))
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    URL.revokeObjectURL(url)
}
async function exportData(format) {
    try {
        const snapshot = await crudAction('data', 'export_json')
        const stamp = new Date().toISOString().slice(0, 10)
        if (format === 'xlsx') {
            download(
                `easy-project-${stamp}.xlsx`,
                await snapshotToXlsx(snapshot),
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            show(t('data.exportCreated'))
            return
        }
        download(
            `easy-project-${stamp}.${format}`,
            format === 'json' ? JSON.stringify(snapshot, null, 2) : toCsv(snapshot),
            format === 'json' ? 'application/json' : 'text/csv'
        )
        show(t('data.exportCreated'))
    } catch (e) {
        show(e.message, 'error')
    }
}
async function downloadExample() {
    try {
        const response = await fetch('/examples/easy-project-example.json')
        download('easy-project-example.json', await response.text(), 'application/json')
        show(t('data.exampleDownloaded'))
    } catch (error) {
        show(error.message, 'error')
    }
}
async function selectImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
        show(t('data.fileTooLarge'), 'error')
        event.target.value = ''
        return
    }
    selectedFileName.value = file.name
    try {
        let payload
        if (file.name.toLowerCase().endsWith('.xlsx')) {
            const parsed = await xlsxToSnapshot(await file.arrayBuffer())
            payload = parsed.payload
            importPreview.value = parsed.preview
        } else {
            const text = await file.text()
            payload = file.name.toLowerCase().endsWith('.csv') ? fromCsv(text) : JSON.parse(text)
            importPreview.value = {
                counts: {
                    Projects: payload.projects?.length || 0,
                    Tasks: payload.tasks?.length || 0,
                    Dependencies: payload.dependencies?.length || 0,
                    Members: payload.members?.length || 0,
                    ProjectMembers: payload.project_members?.length || 0,
                    Baselines: payload.plan_baselines?.length || 0
                },
                mappings: [],
                warnings: []
            }
        }
        pendingPayload.value = payload
    } catch (e) {
        pendingPayload.value = null
        importPreview.value = null
        show(e.message, 'error')
    } finally {
        event.target.value = ''
    }
}
async function executeImport() {
    if (!pendingPayload.value || !confirmed.value) return
    try {
        await crudAction('data', 'backup', { reason: 'import' })
        await crudAction('data', 'import_json', { payload: pendingPayload.value })
        confirmed.value = false
        show(t('data.importCompleted'))
        await loadBackups()
    } catch (e) {
        show(e.message, 'error')
    } finally {
        selectedFileName.value = ''
        pendingPayload.value = null
        importPreview.value = null
    }
}
async function createBackup() {
    try {
        const result = await crudAction('data', 'backup', { reason: 'manual' })
        show(t('data.backupCreated', { path: result.path }))
        await loadBackups()
    } catch (e) {
        show(e.message, 'error')
    }
}
async function prepareRestore(backup) {
    try {
        const result = await crudAction('data', 'preview_backup', { path: backup.path })
        restoreCandidate.value = backup
        restorePreview.value = result?.counts || backup.counts || {}
    } catch (e) {
        show(e.message, 'error')
    }
}
function cancelRestore() {
    restoreCandidate.value = null
    restorePreview.value = {}
}
async function restore() {
    if (!restoreCandidate.value) return
    restoring.value = true
    try {
        await crudAction('data', 'restore', { path: restoreCandidate.value.path })
        show(t('data.backupRestored'))
        cancelRestore()
        await loadBackups()
    } catch (e) {
        show(e.message, 'error')
    } finally {
        restoring.value = false
    }
}
async function loadBackups() {
    try {
        const result = await crudAction('data', 'list_backups')
        backups.value = result?.list || []
        backupDirectory.value = result?.directory || ''
    } catch (e) {
        show(e.message, 'error')
    }
}
async function openBackupFolder() {
    try {
        await revealItemInDir(backups.value[0]?.path || backupDirectory.value)
    } catch (e) {
        show(e.message, 'error')
    }
}
function formatDate(value) {
    if (!value) return t('data.unknownDate')
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
    )
}
function formatSize(value) {
    const bytes = Number(value) || 0
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
function show(text, type = 'success') {
    message.value = text
    messageType.value = type
}
onMounted(loadBackups)
</script>

<style scoped>
.data-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 88px - var(--window-titlebar-height, 0px));
    padding: 1.5rem;
    overflow: hidden;
}
.data-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex: 0 0 auto;
    margin-bottom: var(--header-mb);
}
.eyebrow {
    color: var(--color-primary-text);
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.data-header h2 {
    margin: 0.15rem 0 0;
    font-size: 1.6rem;
    font-weight: 700;
}
.data-header p {
    margin: 0.2rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    min-height: 1.3rem;
}
.message-toast {
    padding: 0.7rem 1rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
    font-size: 0.85rem;
    flex: 0 0 auto;
}
.message-toast.success {
    color: var(--color-success-text);
    background: var(--color-success-bg);
}
.message-toast.error {
    color: var(--color-error-text);
    background: var(--color-error-bg);
}
.cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    align-content: start;
}
.data-card {
    padding: 1.4rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
    transition: box-shadow var(--transition-fast);
}
.data-card:hover {
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}
.card-icon {
    display: grid;
    width: var(--stat-icon-size);
    height: var(--stat-icon-size);
    place-items: center;
    border-radius: var(--stat-icon-radius);
    font-size: var(--stat-icon-font);
    margin-bottom: 0.75rem;
}
.card-icon.blue {
    color: #1d4ed8;
    background: #dbeafe;
}
.card-icon.indigo {
    color: #4338ca;
    background: #e0e7ff;
}
.card-icon.green {
    color: #15803d;
    background: #dcfce7;
}
.data-card h3 {
    margin: 0 0 0.4rem;
    font-size: 1rem;
}
.data-card p {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    margin: 0 0 1rem;
}
.wide {
    grid-column: 1/-1;
}
.actions {
    display: flex;
    gap: 0.7rem;
}
.backup-actions {
    margin-bottom: 1rem;
    display: flex;
    gap: 0.65rem;
}
.native-file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}
.file-picker {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    min-height: 5rem;
    padding: 0.85rem;
    border: 1px dashed var(--color-primary-light);
    border-radius: 0.7rem;
    background: rgba(37, 99, 235, 0.03);
    cursor: pointer;
    transition:
        border-color 0.15s ease,
        background 0.15s ease;
}
.file-picker:hover {
    border-color: var(--color-primary);
    background: rgba(37, 99, 235, 0.06);
}
.file-picker > span:nth-child(2) {
    min-width: 0;
    flex: 1 1 auto;
}
.file-picker strong,
.file-picker small {
    display: block;
}
.file-picker strong {
    overflow: hidden;
    color: var(--color-text);
    text-overflow: ellipsis;
    white-space: nowrap;
}
.file-picker small {
    margin-top: 0.25rem;
    color: var(--color-text-secondary);
}
.file-icon {
    display: grid;
    width: 2.5rem;
    height: 2.5rem;
    flex: 0 0 auto;
    place-items: center;
    border-radius: 0.6rem;
    color: var(--color-primary);
    background: var(--color-primary-light);
}
.browse-button {
    flex: 0 0 auto;
    padding: 0.5rem 0.75rem;
    border: 1px solid #bfdbfe;
    border-radius: 0.5rem;
    color: var(--color-primary-text);
    background: var(--color-surface);
    font-size: 0.82rem;
    font-weight: 700;
}
.confirm-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.85rem;
    color: var(--color-text-muted);
    font-size: 0.85rem;
}
.import-preview {
    display: grid;
    gap: 0.35rem;
    margin-top: 0.8rem;
    padding: 0.75rem;
    border-radius: 0.55rem;
    background: var(--color-subtle);
    font-size: 0.74rem;
}
.preview-counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
}
.preview-counts span {
    padding: 0.2rem 0.45rem;
    border-radius: 999px;
    background: var(--color-surface);
}
.import-preview p {
    margin: 0;
    font-size: 0.7rem;
}
.preview-warning {
    color: var(--color-warning-text) !important;
}
.import-submit {
    margin-top: 0.75rem;
}
.backup-list {
    display: grid;
    gap: 0.5rem;
}
.backup-list div {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    padding: 0.65rem 0.85rem;
    background: var(--color-subtle-hover);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
}
.backup-kind {
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    color: var(--color-primary-text);
    background: var(--color-primary-light);
    font-size: 0.7rem;
    font-weight: 700;
}
.backup-kind.auto {
    color: #047857;
    background: #d1fae5;
}
.backup-kind.restore {
    color: #b45309;
    background: #fef3c7;
}
.backup-meta {
    display: grid;
    min-width: 0;
    gap: 0.15rem;
}
.backup-meta strong {
    font-size: 0.82rem;
}
.backup-meta small {
    color: var(--color-text-secondary);
    font-size: 0.72rem;
}
.backup-list code {
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.8rem;
}
.backup-policy {
    margin: 0.8rem 0 0 !important;
    font-size: 0.75rem !important;
}
.restore-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: var(--color-overlay);
    backdrop-filter: blur(2px);
}
.restore-dialog {
    width: min(32rem, 100%);
    padding: 1.5rem;
    border-radius: var(--radius-xl);
    color: var(--color-text);
    background: var(--color-surface);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
}
.restore-dialog h3 {
    margin: 0.8rem 0 0.3rem;
}
.restore-dialog p,
.restore-dialog > small {
    color: var(--color-text-secondary);
}
.restore-icon {
    display: grid;
    width: 2.8rem;
    height: 2.8rem;
    place-items: center;
    border-radius: 0.7rem;
    color: #b45309;
    background: #fef3c7;
}
.restore-counts {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
}
.restore-counts span {
    display: grid;
    padding: 0.7rem;
    border-radius: 0.5rem;
    text-align: center;
    background: var(--color-subtle);
    font-size: 0.72rem;
}
.restore-counts strong {
    font-size: 1.1rem;
}
.restore-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.65rem;
    margin-top: 1.2rem;
}
.empty-text {
    color: var(--color-text-muted);
    font-style: italic;
}
@media (max-width: 900px) {
    .data-page {
        padding: 1rem;
    }
    .cards {
        grid-template-columns: 1fr;
    }
    .wide {
        grid-column: auto;
    }
}
</style>
