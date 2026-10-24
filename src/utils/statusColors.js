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

export function suggestStatusColor(states = []) {
    const counts = new Map(STATUS_COLORS.map(color => [color.value, 0]))
    for (const state of states) {
        const color = String(state.color || '').toLowerCase()
        if (counts.has(color)) counts.set(color, counts.get(color) + 1)
    }
    return STATUS_COLORS.reduce((best, color) =>
        counts.get(color.value) < counts.get(best.value) ? color : best
    ).value
}
