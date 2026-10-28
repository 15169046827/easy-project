// Group presentation only. Dictionary IDs and completion attributes never change.
export function statusGroupKey(state) {
    return state.builtin_key
        ? `builtin:${state.builtin_key}`
        : `name:${String(state.name || '')
              .trim()
              .toLocaleLowerCase('en-US')}`
}
export function groupStatusStatistics(data) {
    const groups = new Map()
    for (const state of data.statuses || []) {
        const key = statusGroupKey(state)
        if (!groups.has(key)) groups.set(key, { ...state, id: key, statusIds: [], count: 0 })
        const group = groups.get(key)
        group.statusIds.push(state.id)
        group.count += state.count || 0
    }
    return { ...data, statuses: [...groups.values()] }
}
