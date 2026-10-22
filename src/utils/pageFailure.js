// Local UI diagnostics only: no account data, arbitrary Error messages, URLs,
// record IDs or long credential-shaped strings are retained or transmitted.
export function describePageFailure(error, instance) {
    const names = ['TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'URIError']
    const name = names.includes(error?.name) ? error.name : 'Error'
    const component = String(instance?.$options?.__name || instance?.$options?.name || 'Page')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 64)
    const message = name === 'Error' ? '' : String(error.message || '')
    const safe = message
        .replace(/(?:https?|tauri|file):\/\/\S+/gi, '[URL]')
        .replace(/[A-Z_]+:[0-9a-f]{32}/gi, '[ID]')
        .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[email]')
        .replace(/[a-z0-9_+/=-]{24,}/gi, '[redacted]')
        .slice(0, 240)
    return `${name} · ${component}${safe ? ` · ${safe}` : ''}`
}
