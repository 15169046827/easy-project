interface Window {
    isTauri?: boolean
    __EASY_PROJECT_FAIL_BACKUP__?: boolean
    __EASY_PROJECT_CALLS__: Array<{
        command: string
        args: { model: string; action: string; data: Record<string, any> }
    }>
    __TAURI_INTERNALS__: {
        metadata?: { currentWindow: { label: string } }
        invoke: (
            command: string,
            args: { model: string; action: string; data: Record<string, any>; value?: unknown }
        ) => Promise<unknown>
    }
}
