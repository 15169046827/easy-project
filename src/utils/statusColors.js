// Suggestions are presentation choices, never status identity or completion semantics.
export const STATUS_COLORS = [
    { value: '#3b82f6', key: 'blue' },
    { value: '#8b5cf6', key: 'violet' },
    { value: '#14b8a6', key: 'teal' },
    { value: '#f59e0b', key: 'amber' },
    { value: '#f43f5e', key: 'rose' },
    { value: '#06b6d4', key: 'cyan' },
    { value: '#d946ef', key: 'magenta' },
    { value: '#22c55e', key: 'green' }
]

export const BUILTIN_STATUS_COLORS = {
    Pending: '#64748b',
    InProgress: '#3b82f6',
    Done: '#22c55e'
}

export function storedStatusColor(state = {}) {
    return (
        BUILTIN_STATUS_COLORS[state.builtin_key] ||
        (/^#[0-9a-f]{6}$/i.test(state.color || '') ? state.color.toLowerCase() : '#64748b')
    )
}

export function statusColor(state = {}) {
    const stored = storedStatusColor(state)
    // Render existing dictionary colors calmly without rewriting user data.
    const palette = {
        '#64748b': '#718096',
        '#3b82f6': '#6284ad',
        '#22c55e': '#629579',
        '#8b5cf6': '#8c7aaa',
        '#14b8a6': '#5c9690',
        '#f59e0b': '#af8c55',
        '#f43f5e': '#b87585',
        '#06b6d4': '#6298aa',
        '#d946ef': '#a67eaa'
    }
    return palette[stored] || stored
}

export function statusColorStyle(state) {
    return {
        '--status-color': statusColor(state),
        backgroundColor: 'var(--p-content-background)',
        borderColor: 'var(--color-border)',
        color: 'var(--p-text-color)'
    }
}

export function suggestStatusColor(states = [], random = Math.random) {
    const counts = new Map(STATUS_COLORS.map(color => [color.value, 0]))
    for (const state of states) {
        const color = String(state.color || '').toLowerCase()
        if (counts.has(color)) counts.set(color, counts.get(color) + 1)
    }
    const minimum = Math.min(...counts.values())
    const choices = STATUS_COLORS.filter(color => counts.get(color.value) === minimum)
    return choices[Math.floor(Math.min(0.999999, Math.max(0, random())) * choices.length)].value
}
