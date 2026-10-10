// Apply the saved theme before the application paints; no inline script/CSP exception.
try {
    const saved = localStorage.getItem('easyproject-theme')
    const dark =
        saved === 'dark' ||
        (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('app-dark', dark)
} catch {
    // A storage-denied environment uses the default light background.
}
