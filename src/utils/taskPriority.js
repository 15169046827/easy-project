// Legacy API aliases remain readable without changing stored values.
export function priorityRank(value) {
    const aliases = { High: 2, Normal: 3, Low: 4 }
    if (Object.hasOwn(aliases, value)) return aliases[value]
    const rank = Number(value)
    return Number.isInteger(rank) && rank >= 1 && rank <= 5 ? rank : null
}
