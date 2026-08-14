<template>
    <section class="pm-panel">
        <header class="pm-header">
            <div class="pm-title">
                <span class="eyebrow">{{ $t('projectMember.eyebrow') }}</span>
                <h3>
                    {{ $t('projectMember.title') }} <span class="count">{{ members.length }}</span>
                </h3>
                <p>{{ $t('projectMember.subtitle') }}</p>
            </div>
        </header>

        <p v-if="message" class="pm-banner" :class="messageType">{{ message }}</p>

        <!-- 添加成员 -->
        <div class="pm-add">
            <Select
                v-model="newMemberId"
                :options="availableMembers"
                optionLabel="name"
                optionValue="id"
                :placeholder="$t('projectMember.addPlaceholder')"
                :disabled="loading || availableMembers.length === 0"
                class="pm-select"
            />
            <InputText
                v-model="newRole"
                :placeholder="$t('projectMember.rolePlaceholder')"
                class="pm-role"
                @keydown.enter="addMember"
            />
            <Button
                :label="$t('common.add')"
                icon="pi pi-plus"
                :disabled="loading || !newMemberId"
                @click="addMember"
            />
        </div>

        <!-- 成员列表 -->
        <div class="pm-list">
            <div v-if="loading" class="pm-empty">{{ $t('projectMember.loading') }}</div>
            <div v-else-if="members.length === 0" class="pm-empty">
                <i class="pi pi-users"></i>
                <p>{{ $t('projectMember.empty') }}</p>
            </div>
            <div v-for="pm in members" :key="pm.id" class="pm-row">
                <span class="pm-avatar" :style="{ background: avatarBg(pm.member_name) }">{{
                    avatarInitial(pm.member_name)
                }}</span>
                <div class="pm-info">
                    <span class="pm-name">{{ pm.member_name }}</span>
                    <span class="pm-email">{{ pm.member_email || '—' }}</span>
                </div>
                <span class="pm-role-pill">{{ pm.role || $t('common.member') }}</span>
                <span class="pm-joined">{{ formatJoined(pm.joined_at) }}</span>
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    text
                    rounded
                    :title="$t('projectMember.removeTitle')"
                    :disabled="loading"
                    @click="removeMember(pm)"
                />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { crudAction } from '../../../api'
import { useMembers } from '../../../composables/useMembers'
import { avatarBg, avatarInitial } from '../../../composables/useAvatar'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({ projectId: { type: String, required: true } })

const { members: allMembers, loadMembers } = useMembers()
const members = ref([]) // 本项目成员（ProjectMemberWithMember）
const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const newMemberId = ref('')
const newRole = ref('')

// 已在本项目的成员 id 集合
const currentIds = computed(() => new Set(members.value.map(m => m.member_id)))
// 可选（未加入）的成员
const availableMembers = computed(() => allMembers.value.filter(m => !currentIds.value.has(m.id)))

function clearMessage() {
    message.value = ''
}

async function load() {
    loading.value = true
    clearMessage()
    try {
        await loadMembers({ force: true })
        const res = await crudAction('project_member', 'get_by_project', {
            projectId: props.projectId
        })
        members.value = res?.list || []
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    } finally {
        loading.value = false
    }
}

async function addMember() {
    if (!newMemberId.value) return
    try {
        await crudAction('project_member', 'add', {
            project_id: props.projectId,
            member_id: newMemberId.value,
            role: newRole.value.trim() || 'Member'
        })
        messageType.value = 'success'
        message.value = t('projectMember.added')
        newMemberId.value = ''
        newRole.value = ''
        await load()
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    }
}

async function removeMember(pm) {
    if (!confirm(t('projectMember.removeConfirm', { name: pm.member_name }))) return
    try {
        await crudAction('project_member', 'delete', { ids: [pm.id] })
        messageType.value = 'success'
        message.value = t('projectMember.removed', { name: pm.member_name })
        await load()
    } catch (e) {
        messageType.value = 'error'
        message.value = e.message
    }
}

function formatJoined(value) {
    if (!value) return ''
    const d = new Date(String(value).replace(' ', 'T'))
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString()
}

watch(() => props.projectId, load)
onMounted(load)
</script>

<style scoped>
.pm-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1.5rem;
    gap: 1rem;
    overflow: hidden;
}

.pm-header .eyebrow {
    color: var(--color-primary-text);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.14em;
}
.pm-title h3 {
    margin: 0.15rem 0 0;
    font-size: 1.35rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.pm-title .count {
    font-size: 0.85rem;
    color: #fff;
    background: var(--color-primary);
    border-radius: 999px;
    padding: 0.05rem 0.6rem;
    font-weight: 700;
}
.pm-title p {
    margin: 0.25rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.82rem;
}

.pm-banner {
    padding: 0.6rem 0.9rem;
    border-radius: var(--radius-md);
    font-size: 0.85rem;
    margin: 0;
    flex: 0 0 auto;
}
.pm-banner.success {
    color: var(--color-success-text);
    background: var(--color-success-bg);
}
.pm-banner.error {
    color: var(--color-error-text);
    background: var(--color-error-bg);
}

/* 添加表单 */
.pm-add {
    display: flex;
    gap: 0.6rem;
    flex: 0 0 auto;
    padding: 0.9rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: 0 2px 6px var(--color-card-shadow);
    flex-wrap: wrap;
}
.pm-select {
    flex: 1 1 14rem;
    min-width: 12rem;
}
.pm-role {
    flex: 1 1 10rem;
    min-width: 8rem;
}

/* 列表 */
.pm-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    box-shadow: 0 2px 8px var(--color-card-shadow);
    padding: 0.75rem;
}
.pm-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-secondary);
    height: 100%;
}
.pm-empty i {
    font-size: 2rem;
    color: var(--color-border);
}
.pm-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-raised);
}
.pm-avatar {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    flex-shrink: 0;
}
.pm-info {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
}
.pm-name {
    font-weight: 600;
    font-size: 0.9rem;
}
.pm-email {
    font-size: 0.78rem;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.pm-role-pill {
    font-size: 0.72rem;
    font-weight: 600;
    color: #3730a3;
    background: #e0e7ff;
    padding: 0.15rem 0.6rem;
    border-radius: 999px;
    flex-shrink: 0;
}
.pm-joined {
    font-size: 0.74rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
    width: 5.5rem;
    text-align: right;
}

@media (max-width: 820px) {
    .pm-panel {
        padding: 1rem;
    }
    .pm-joined {
        display: none;
    }
}
</style>
