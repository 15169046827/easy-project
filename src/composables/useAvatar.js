const colorPalette = [
    '#2563eb',
    '#7c3aed',
    '#db2777',
    '#ea580c',
    '#16a34a',
    '#0891b2',
    '#4f46e5',
    '#b91c1c'
]

export function avatarInitial(name) {
    return (name || '?').charAt(0).toUpperCase()
}

export function avatarBg(name) {
    let hash = 0
    const s = name || ''
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
    return colorPalette[Math.abs(hash) % colorPalette.length]
}
