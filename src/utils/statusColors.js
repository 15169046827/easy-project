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

export function statusColor(state = {}) {
    return (
        BUILTIN_STATUS_COLORS[state.builtin_key] ||
        (/^#[0-9a-f]{6}$/i.test(state.color || '') ? state.color.toLowerCase() : '#64748b')
    )
}

export function statusColorStyle(state) {
    const backgroundColor = statusColor(state)
    const rgb = backgroundColor
        .slice(1)
        .match(/../g)
        .map(value => {
            const channel = parseInt(value, 16) / 255
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
        })
    const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722
    return {
        backgroundColor,
        borderColor: backgroundColor,
        color: luminance > 0.179 ? '#000000' : '#ffffff'
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
