// Switch ready only after the exact new prerelease and all listed assets are public and verified.
export const desktopRelease = {
    ready: false,
    version: '0.1.1',
    tag: 'v0.1.1-beta.2',
    publishedDate: '',
    url: 'https://github.com/15169046827/easy-project/releases/tag/v0.1.1-beta.2',
    base: 'https://github.com/15169046827/easy-project/releases/download/v0.1.1-beta.2/',
    assets: [
        { key: 'winNsis', file: 'EasyProject_0.1.1_windows_x64-setup.exe' },
        { key: 'winMsi', file: 'EasyProject_0.1.1_windows_x64.msi' },
        { key: 'macArmDmg', file: 'EasyProject_0.1.1_darwin_aarch64.dmg' },
        { key: 'macIntelDmg', file: 'EasyProject_0.1.1_darwin_x64.dmg' },
        { key: 'macArmApp', file: 'EasyProject_0.1.1_darwin_aarch64.app.tar.gz' },
        { key: 'macIntelApp', file: 'EasyProject_0.1.1_darwin_x64.app.tar.gz' }
    ]
}
