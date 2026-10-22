// Existing hash links, explicit index.html, desktop and demo always open the workspace.
export function isLandingEntry(location, desktop = false, floating = false) {
    return (
        !desktop &&
        !floating &&
        !new URLSearchParams(location.search).has('demo') &&
        location.pathname === '/' &&
        !location.hash.startsWith('#/')
    )
}
