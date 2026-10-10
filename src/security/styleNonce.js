// Tauri injects a per-response nonce into the initial inline style. Reuse its
// DOM property (not getAttribute, which browsers may hide) for PrimeVue styles.
export function getStyleNonce() {
    const style = document.querySelector('style[nonce]')
    return style instanceof HTMLStyleElement ? style.nonce || undefined : undefined
}
