export {}

declare global {
    interface Window {
        __EASYPROJECT_FLOATING_WINDOW__?: boolean
        __EASYPROJECT_STORAGE_INFO__?: {
            ready: boolean
            activeDir: string
            databasePath: string
            defaultDir: string
            profileDir: string
            configPath: string
            pendingDir: string | null
            error: string | null
        }
    }
}
