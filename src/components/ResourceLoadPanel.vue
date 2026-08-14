<template>
    <section class="resource-load">
        <header class="rl-header">
            <div>
                <h3>{{ title || $t('resourceLoad.title') }}</h3>
                <span>{{
                    $t('resourceLoad.membersCount', {
                        count: membersWithLoad.length,
                        threshold: props.threshold
                    })
                }}</span>
            </div>
            <span class="rl-legend">
                <i class="rl-swatch normal"></i>{{ $t('resourceLoad.normal') }}
                <i class="rl-swatch overload"></i>{{ $t('resourceLoad.overload') }}
                <i class="rl-swatch unavailable"></i>{{ $t('resourceLoad.unavailable') }}
            </span>
        </header>

        <div v-if="membersWithLoad.length" class="rl-list">
            <div v-for="m in membersWithLoad" :key="m.id" class="rl-row">
                <span class="rl-avatar" :style="{ background: avatarBg(m.name) }" :title="m.name">{{
                    avatarInitial(m.name)
                }}</span>
                <div class="rl-main">
                    <div class="rl-top">
                        <span class="rl-name">{{ m.name }}</span>
                        <span class="rl-stats">
                            <strong>{{ m.taskCount }}</strong> {{ $t('resourceLoad.taskUnit') }}
                            <span class="rl-dot">·</span>
                            <span :class="['rl-peak', { overload: m.overloaded }]">
                                <i class="pi pi-layer-group"></i> {{ $t('resourceLoad.peak') }}
                                {{ m.peak }}
                            </span>
                            <span class="rl-dot">·</span>
                            <span class="rl-overlap">{{
                                $t('resourceLoad.overlap', { days: m.overlapDays })
                            }}</span>
                            <span v-if="m.unavailableDays" class="rl-unavailable">
                                <i class="pi pi-calendar-times"></i>
                                {{
                                    $t('resourceLoad.unavailableDays', { days: m.unavailableDays })
                                }}
                            </span>
                        </span>
                    </div>
                    <div v-if="weeks > 0" class="rl-timeline" :title="timelineTitle(m)">
                        <span
                            v-for="(v, i) in m.weekly"
                            :key="i"
                            class="rl-bar"
                            :class="{ overload: v >= threshold }"
                            :style="{ height: barHeight(v) }"
                        ></span>
                    </div>
                    <p v-else class="rl-empty">{{ $t('resourceLoad.noSchedule') }}</p>
                </div>
            </div>
        </div>
        <p v-else class="rl-none">{{ $t('resourceLoad.noData') }}</p>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { avatarBg, avatarInitial } from '../composables/useAvatar'
import { availabilityConflictDates } from '../modules/calendar/utils/memberAvailability.js'

const props = defineProps({
    tasks: { type: Array, default: () => [] },
    members: { type: Array, default: () => [] },
    threshold: { type: Number, default: 3 },
    title: { type: String, default: '' },
    project: { type: Object, default: () => ({}) }
})
const { t } = useI18n()

const DAY = 86400000
const MAX_SPAN = DAY * 366 * 4 // 超过 4 年的任务不展开时间轴，仅计数

function parseDay(value) {
    if (!value) return null
    const d = new Date(String(value).replace(' ', 'T'))
    if (Number.isNaN(d.getTime())) return null
    return Math.round(d.getTime() / DAY)
}

const memberMap = computed(() => {
    const map = new Map()
    for (const m of props.members) map.set(m.id, m)
    return map
})

const analysis = computed(() => {
    const byMember = new Map()
    let globalMin = Infinity
    let globalMax = -Infinity

    for (const task of props.tasks) {
        const id = task.assignee
        if (!id) continue
        if (!byMember.has(id)) {
            byMember.set(id, {
                dayCount: new Map(),
                taskCount: 0,
                hasDates: false,
                unavailableDates: new Set()
            })
        }
        const entry = byMember.get(id)
        entry.taskCount += 1
        const member = memberMap.value.get(id)
        availabilityConflictDates(task, member, props.project).forEach(date =>
            entry.unavailableDates.add(date)
        )
        const s = parseDay(task.start_time)
        const e = parseDay(task.end_time)
        if (s == null || e == null || e < s) continue
        entry.hasDates = true
        const span = (e - s + 1) * DAY
        if (span > MAX_SPAN) continue
        for (let d = s; d <= e; d++) {
            entry.dayCount.set(d, (entry.dayCount.get(d) || 0) + 1)
            if (d < globalMin) globalMin = d
            if (d > globalMax) globalMax = d
        }
    }

    const weeks = globalMax >= globalMin ? Math.floor((globalMax - globalMin) / 7) + 1 : 0
    const maxPeak = Math.max(1, ...[...byMember.values()].map(en => peakOf(en.dayCount)))

    const list = []
    for (const [id, en] of byMember) {
        const m = memberMap.value.get(id)
        const name = m?.name || id || t('resourceLoad.unassigned')
        const peak = peakOf(en.dayCount)
        const overlapDays = [...en.dayCount.values()].filter(c => c >= 2).length
        const weekly = new Array(weeks).fill(0)
        if (weeks > 0) {
            for (const [d, c] of en.dayCount) {
                const wi = Math.floor((d - globalMin) / 7)
                if (wi >= 0 && wi < weeks) weekly[wi] = Math.max(weekly[wi], c)
            }
        }
        list.push({
            id,
            name,
            taskCount: en.taskCount,
            peak,
            overlapDays,
            unavailableDays: en.unavailableDates.size,
            overloaded: peak >= props.threshold,
            weekly,
            hasDates: en.hasDates
        })
    }
    list.sort((a, b) => b.peak - a.peak || b.taskCount - a.taskCount)
    return { list, weeks, maxPeak }
})

function peakOf(dayCount) {
    let p = 0
    for (const c of dayCount.values()) if (c > p) p = c
    return p
}

const membersWithLoad = computed(() => analysis.value.list)
const weeks = computed(() => analysis.value.weeks)

function barHeight(v) {
    if (!v) return '2px'
    const ratio = v / analysis.value.maxPeak
    return `${Math.max(6, Math.round(ratio * 100))}px`
}

function timelineTitle(m) {
    return t('resourceLoad.timelineTitle', { name: m.name, threshold: props.threshold })
}
</script>

<style scoped>
.resource-load {
    display: flex;
    flex-direction: column;
}
.rl-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}
.rl-header h3 {
    margin: 0;
    font-size: 1rem;
}
.rl-header span {
    color: var(--color-text-secondary);
    font-size: 0.8rem;
}
.rl-legend {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: var(--color-text-secondary);
}
.rl-swatch {
    display: inline-block;
    width: 0.7rem;
    height: 0.7rem;
    border-radius: 2px;
    margin-left: 0.5rem;
}
.rl-swatch.normal {
    background: #2563eb;
}
.rl-swatch.overload {
    background: #ef4444;
}
.rl-swatch.unavailable {
    background: #f97316;
}
.rl-list {
    display: grid;
    gap: 0.85rem;
}
.rl-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
}
.rl-avatar {
    width: 2.1rem;
    height: 2.1rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
}
.rl-main {
    flex: 1 1 auto;
    min-width: 0;
}
.rl-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
}
.rl-name {
    font-weight: 600;
}
.rl-stats {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
}
.rl-stats strong {
    color: var(--color-text);
}
.rl-dot {
    color: var(--color-border);
}
.rl-peak {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    color: #1d4ed8;
    background: #dbeafe;
    font-weight: 600;
}
.rl-peak.overload {
    color: #b91c1c;
    background: #fee2e2;
}
.rl-unavailable {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.1rem 0.45rem;
    border-radius: 999px;
    color: #c2410c;
    background: #ffedd5;
    font-weight: 600;
}
.rl-timeline {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 100px;
    margin-top: 0.5rem;
    padding: 0.4rem 0.2rem;
    border-radius: 0.5rem;
    background: var(--color-subtle);
    overflow-x: auto;
}
.rl-bar {
    flex: 0 0 4px;
    min-height: 2px;
    border-radius: 2px;
    background: #93c5fd;
    transition: height 0.2s ease;
}
.rl-bar.overload {
    background: #ef4444;
}
.rl-empty {
    margin: 0.5rem 0 0;
    color: var(--color-text-secondary);
    font-size: 0.8rem;
}
.rl-none {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
}
</style>
