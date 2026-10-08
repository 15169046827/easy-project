const DEFERRED_PACKAGES = [
    'date-holidays',
    'date-holidays-parser',
    'moment-timezone',
    'exceljs',
    'html2canvas'
]

// Check the complete static import closure, not only the entry chunk's name.
export function checkBundleLoading(output) {
    const chunks = new Map(
        Object.values(output)
            .filter(item => item.type === 'chunk')
            .map(item => [item.fileName, item])
    )
    const entries = [...chunks.values()].filter(item => item.isEntry)
    if (!entries.length) throw new Error('Bundle loading check requires an entry chunk')
    const visited = new Set()
    const pending = entries.map(item => item.fileName)
    while (pending.length) {
        const name = pending.pop()
        if (visited.has(name)) continue
        visited.add(name)
        const chunk = chunks.get(name)
        if (!chunk) continue
        for (const id of Object.keys(chunk.modules)) {
            const normalized = id.replaceAll('\\', '/')
            const dependency = DEFERRED_PACKAGES.find(item =>
                normalized.includes(`/node_modules/${item}/`)
            )
            if (dependency) {
                throw new Error(`Deferred dependency ${dependency} is eagerly loaded by ${name}`)
            }
        }
        pending.push(...chunk.imports)
    }
    return [...visited].filter(name => chunks.has(name))
}

export function bundleLoadingGate() {
    return {
        name: 'easyproject-bundle-loading-gate',
        generateBundle(_options, output) {
            checkBundleLoading(output)
        }
    }
}
