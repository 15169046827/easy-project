export default {
    betaWarning:
        '公开预发布测试版，未签名/未公证，系统可能提示无法识别发行者。请核对 GitHub 来源和 SHA-256，不要关闭系统安全功能。正式生产发布验收尚未通过，重要数据请先备份。',
    betaNote:
        'Windows x64 为主要试用平台；MSI 干净安装、macOS 实机/公证及跨版本升级回滚未完成全矩阵验收。macOS 文件为实验性试用，请先阅读发布说明。',
    systemRequirements:
        'Windows 10/11 x64（需 WebView2）；macOS 10.15+（同时受硬件与 WebKit 能力限制）',
    publishedOn: '发布日期：',
    checksums: '下载 SHA-256 校验清单',
    downloads: {
        winNsis: 'Windows x64 安装程序（推荐）',
        winMsi: 'Windows x64 · MSI',
        macArmDmg: 'macOS Apple Silicon · DMG',
        macIntelDmg: 'macOS Intel · DMG',
        macArmApp: 'macOS Apple Silicon · App 归档',
        macIntelApp: 'macOS Intel · App 归档'
    },
    navFeatures: '功能',
    navModes: '使用方式',
    navDownload: '下载',
    navDocs: '文档',
    theme: '切换深浅主题',
    language: 'Switch to English',
    skip: '跳转到正文',
    online: '进入在线版',
    download: '获取桌面版',
    eyebrow: '让计划落地，让进度清晰',
    title: '项目有条理，',
    titleAccent: '每一步都清晰。',
    intro: '从一个想法到一个里程碑，把项目、任务和时间安排放在一起。浏览器随时打开，桌面端也能独立使用。',
    note: '免费开源 · 本地可离线 · AI 可接入',
    preview: '项目工作区 · 看板视图',
    previewAlt: 'EasyProject 项目看板界面，包含待办、进行中和已完成三列任务。',
    previewNote: '历史版本示例界面，仅使用演示数据；具体样式以当前版本为准。',
    featuresEyebrow: '少一点切换，多一点专注',
    featuresTitle: '从全局计划，到眼前这一件事。',
    features: [
        {
            title: '一个项目，多种视角',
            body: '任务列表、看板、甘特图、团队与工作日历都属于同一个项目，不必来回拼凑信息。',
            icon: 'pi-th-large'
        },
        {
            title: '把任务之间的关系看清楚',
            body: '用父子任务、前置依赖、负责人和进度组织工作，结合工作日历安排时间。',
            icon: 'pi-sitemap'
        },
        {
            title: '临近任务，留在手边',
            body: '桌面悬浮窗展示本地临近截止任务，可缩放、收起或吸附屏幕边缘。',
            icon: 'pi-window-minimize'
        },
        {
            title: '数据可以带走',
            body: '通过 JSON、CSV、Excel 交换数据，并使用备份与恢复保留可回退的工作记录。',
            icon: 'pi-database'
        }
    ],
    modesEyebrow: '按你的方式开始',
    modesTitle: '在线连接，或者专注本地。',
    webTitle: '浏览器，打开就开始',
    webBody: '注册并登录账号，在不同设备访问同一个远端工作区，无需安装桌面程序。',
    localTitle: '桌面端，也能不登录',
    localBody: '启动时可登录在线账号，也可选择“不登录，本地使用”。本地核心工作无需账号或网络。',
    isolation: '两种模式，清楚分开：本地数据不会自动上传或合并到账号工作区。悬浮窗显示本地任务。',
    aiEyebrow: '为 AI Agent 留一个入口',
    aiTitle: '让 AI 参与管理，而不是另建一份计划。',
    aiBody: '通过 MCP 查询和管理项目、任务与人员。在线版可在用户设置中创建个人 Token，按需选择只读、可写或完整 CRUD 权限；本地连接默认只读。',
    aiNote: '写入与删除仍需明确授权。不要把 Token 发到公开聊天或代码仓库。',
    aiLink: '查看 MCP 接入说明',
    downloadEyebrow: '桌面下载',
    downloadTitle: '把工作区带到桌面。',
    releaseStatus: '当前未提供公开安装包',
    releaseBody:
        '现有桌面包仍属于未签名内部测试版，正式发布验收尚未通过。完成核验并获准公开分发后，这里会提供版本、系统要求、更新日期和下载入口。',
    releaseAction: '查看公开发布记录',
    releaseNote: '目前可以先使用在线版；不会自动下载或运行任何安装程序。',
    privacyTitle: '关于数据与隐私',
    privacyBody:
        '官网不需要登录，不读取工作区或检查登录状态，未加入第三方统计与广告。在线版会在服务器存储账号与远端工作区；本地模式数据保存在用户设置的本地目录。',
    trialTitle: '关于当前服务',
    trialBody:
        '在线版目前处于试用阶段，通过自有服务器提供访问。网络可达性和速度可能因地区而异，不承诺生产级可用性；重要内容请自行保留导出或备份。',
    endTitle: '下一步，从一个清楚的计划开始。',
    endBody: '先试试在线版，找到适合自己的工作节奏。',
    source: '源代码',
    docs: '使用文档',
    issues: '反馈问题',
    changelog: '更新记录',
    footer: '开源项目管理工具 · MIT License'
}
