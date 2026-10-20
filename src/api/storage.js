import { invoke } from '@tauri-apps/api/core'

/** @typedef {{ready:boolean, activeDir:string, databasePath:string, defaultDir:string, profileDir:string, configPath:string, pendingDir:string|null, error:string|null}} StorageInfo */

export function hasDesktopStorage() {
    return Boolean(window.__EASYPROJECT_STORAGE_INFO__)
}

/** @returns {Promise<StorageInfo|null>} */
export async function getStorageInfo() {
    return hasDesktopStorage() ? invoke('storage_info') : null
}

/** @returns {Promise<StorageInfo>} */
export async function setDataDirectory(directory) {
    if (!hasDesktopStorage()) throw new Error('Desktop storage is unavailable')
    return invoke('set_data_directory', { directory })
}

export async function revealBackupDirectory() {
    return invoke('reveal_backup_directory')
}
