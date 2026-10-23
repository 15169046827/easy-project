export default {
    betaWarning:
        'Public prerelease, unsigned and unnotarized. Your OS may warn about an unidentified publisher. Verify the GitHub source and SHA-256; do not disable system security. Formal production acceptance is incomplete. Back up important data first.',
    betaNote:
        'Windows x64 is the primary trial platform. Clean MSI installs, native macOS/notarization and cross-version upgrade/rollback matrices remain incomplete. macOS downloads are experimental; read the release notes first.',
    systemRequirements:
        'Windows 10/11 x64 (WebView2 and writable local storage required; drive C supported); macOS ARM/Intel is experimental, requires a user-writable app directory and has not completed real-device compatibility acceptance',
    publishedOn: 'Published:',
    checksums: 'Download SHA-256 checksums',
    downloads: {
        winNsis: 'Windows x64 installer (recommended)',
        winMsi: 'Windows x64 · MSI',
        macArmDmg: 'macOS Apple Silicon · DMG',
        macIntelDmg: 'macOS Intel · DMG',
        macArmApp: 'macOS Apple Silicon · App archive',
        macIntelApp: 'macOS Intel · App archive'
    },
    navFeatures: 'Features',
    navModes: 'Your workspace',
    navDownload: 'Download',
    navDocs: 'Docs',
    theme: 'Toggle color theme',
    language: '切换到中文',
    skip: 'Skip to content',
    online: 'Open web app',
    download: 'Get desktop app',
    eyebrow: 'Turn plans into visible progress',
    title: 'Clear projects.',
    titleAccent: 'Confident next steps.',
    intro: 'Bring projects, tasks and schedules together, from your first idea to your next milestone. Open your workspace in a browser, or work independently on desktop.',
    note: 'Free and open source · Local offline use · MCP integration',
    preview: 'Project workspace · Board view',
    previewAlt: 'EasyProject project board with pending, in-progress and completed tasks.',
    previewNote:
        'Earlier-version example using demonstration data only. Current appearance may differ.',
    featuresEyebrow: 'Less switching, more focus',
    featuresTitle: 'From the big picture to the task at hand.',
    features: [
        {
            title: 'One project, several perspectives',
            body: 'Task lists, boards, Gantt charts, teams and work calendars stay together in the same project.',
            icon: 'pi-th-large'
        },
        {
            title: 'Make the relationships visible',
            body: 'Organize work with subtasks, predecessors, assignees and progress, then schedule around your work calendar.',
            icon: 'pi-sitemap'
        },
        {
            title: 'Keep nearby deadlines at hand',
            body: 'The desktop floating window shows upcoming local tasks. Resize it, collapse it, or dock it to a screen edge.',
            icon: 'pi-window-minimize'
        },
        {
            title: 'Take your data with you',
            body: 'Exchange data through JSON, CSV and Excel, with backup and recovery for a way back.',
            icon: 'pi-database'
        }
    ],
    modesEyebrow: 'Start your way',
    modesTitle: 'Connected online. Independent locally.',
    webTitle: 'Open a browser and get started',
    webBody:
        'Register and sign in to access the same remote workspace across devices, without installing the desktop app.',
    localTitle: 'Desktop, without a required account',
    localBody:
        'Sign in at startup, or choose local use without signing in. Core local work needs neither an account nor a network.',
    isolation:
        'Separate by design: local data is not automatically uploaded or merged into your account workspace. The floating window shows local tasks.',
    aiEyebrow: 'A place for your AI agent',
    aiTitle: 'Let AI work with your plan, not create another copy.',
    aiBody: 'Query and manage projects, tasks and members through MCP. Create personal tokens in online user settings with read-only, write or full CRUD access. Local connections default to read-only.',
    aiNote: 'Writes and deletion still require explicit authorization. Never share tokens in public chats or repositories.',
    aiLink: 'Read the MCP setup guide',
    downloadEyebrow: 'Desktop downloads',
    downloadTitle: 'Bring your workspace to desktop.',
    releaseStatus: 'No public installer available yet',
    releaseBody:
        'Current desktop packages are unsigned internal test builds. Formal release acceptance is not complete. Once verified and approved for public distribution, this section will list versions, requirements, dates and download links.',
    releaseAction: 'View public releases',
    releaseNote:
        'Try the web app in the meantime. No installer is automatically downloaded or executed.',
    privacyTitle: 'Data and privacy',
    privacyBody:
        'This landing page needs no login, reads no workspace, performs no session checks and includes no third-party analytics or ads. The web app stores accounts and remote workspaces on the server; local mode stores data in your configured local directory.',
    trialTitle: 'About this service',
    trialBody:
        'The web app is currently a trial hosted on a personally operated server. Availability and speed may vary by region, with no production uptime commitment. Keep exports or backups of important work.',
    endTitle: 'Start with a plan you can see.',
    endBody: 'Try the web app and find your own working rhythm.',
    source: 'Source code',
    docs: 'Documentation',
    issues: 'Report an issue',
    changelog: 'Changelog',
    footer: 'Open-source project management · MIT License'
}
