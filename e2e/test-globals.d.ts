interface Window {
    __GANTT_TASKS__: Array<{
        id: string
        name: string
        parent: string
        project_id: string
        start_time?: string
        end_time?: string
        sort_order?: number
        [field: string]: unknown
    }>
    __testSavedCredentials: (args: {
        action: string
        credentials?: { username: string; password: string } | null
    }) => Promise<{ username: string; password: string } | null>
    __tokenCopyCount: number
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
            args: {
                model: string
                action: string
                data: Record<string, any>
                value?: unknown
                directory?: string
                action: string
                credentials?: { username: string; password: string } | null
            }
        ) => Promise<unknown>
    }
}
