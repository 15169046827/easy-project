# EasyProject 架构、代码地图与验证工作流

2026-10-22状态显示边界：useStatusLabels只将Object.hasOwn确认的内置枚举映射传入vue-i18n，未知/历史字符串原样按文本展示；禁止`t(map[value]) || value`，因为`t(undefined)`会先抛INVALID_ARGUMENT/17。Todo/Pending同待办，空值维持缺省，不为渲染修复重写真实状态或收紧API。生产回归需含非枚举历史状态，不能只用InProgress理想fixture。

2026-10-22 UI入口增补：App 的路由区改由 `src/components/WorkspaceRouteView.vue` 承接，Vue Router 异步模块错误及子页渲染错误分别转为脱敏诊断码和 PrimeVue 提示/重试/返回。恢复只重挂当前路由子树，不整页reload、不销毁RemoteRoot内存登录或切换数据源。ProjectList用命名路由传完整ID；hover样式精确匹配真实PrimeVue组件，不能用全局覆盖破坏其它控件。详见项目跳转专项检查点；API、数据库、权限及部署拓扑均未改。

2026-10-22现阶段零新增预算Funnel公网试用已获用户明确批准并启用：既有HTTPS443→127.0.0.1:8080，仅AllowFunnel由无→true，原配置root700副本保留，应用/SSH/数据库权限不变。公共DNS及两个公网中继强制TLS请求初验：首页/health200、匿名401；恶意跨源403/no-store。共享限流、存储配额/告警、地区速度/容量/物理重启与移动网络尚有未验/待整改，不是正式发布通过；下一步先收手机移动网络反馈再由用户决定整改，不自动开发、付费或扩大暴露。最新手册1.10/仍79条，完整证据与回退见docs/FUNNEL_PUBLIC_ACCESS_CHECKPOINT.md。

2026-10-22实际已部署账号3/业务6，旧上部候选说明按此覆盖。server/maintenance.rs提供操作员离线migrate-storage，预检现有路径/链接，不建缺失库；必须停服/外部新副本，每库事务备份而非跨库原子。scripts/verify-id-migration.py逐字段核对原值/ID图/凭据摘要/目录key，允许服务重启epoch单独变化；验证器只输出数量与结论。MCP仍只接受已有schema6，不负责迁移，新独立exe需重连。账号资料检查点是准确部署来源。

2026-10-22待交付源码：account_schema负责账号schema3事务迁移，账号ID与workspace_key分离；profile负责本人头像/用户名校验，password_reset负责管理员短时一次性码/摘要/原子撤销旧凭据。common/id与id_migration统一大写语义+完整UUID、业务schema6全关联迁移及原备份；credentials为Windows当前用户DPAPI加密、安装侧非C盘文件，不进入业务导出。准确实现/验证/尚未部署状态见新账号资料检查点，尚不能替换当前13e6ab7部署事实。

2026-10-21冲突刷新修复：`remote.js::refreshRemoteWorkspace`与业务操作共用队列，更新revision后由RemoteRoot增加workspaceVersion仅重建App。不得调用整页reload处理工作区冲突，否则桌面仅内存Bearer丢失；网络失败保留登录/冲突，真正401仍回登录。显式退出/切换模式的整页重载不受此改动影响，Token不持久化。

2026-10-21账户UI入口调整：RemoteRoot提供菜单回调，RemoteConnect现在渲染PrimeVue头像菜单于App header-actions中（沿用文件名，不再独立云按钮）；用户设置/MCP/管理员账号管理/退出均由该菜单进入。App notice插槽将冲突/错误放在工具栏下，不再挤动标题栏。RemoteMcpTokens的Secret仅内存，上层Dialog正文/code+显式复制，关闭/管理页关闭即清理，viewEpoch拒绝旧响应重新显示。API、鉴权及Token生命周期后端规则不变；最新验证/部署见专项检查点。

2026-10-21新增入口：`server/src/auth.rs`账号schema2管理个人MCP Token摘要，注册仅普通角色；`http.rs`分离交互会话与专用PAT，`mcp.rs`通过源码路径复用原`mcp/tools.rs`，不复制业务逻辑。`Workspace::mcp_call`与Web共用账号互斥/epoch，原MCP工具负责写前快照和审计。`RemoteRoot`提供注册，`RemoteMcpTokens`使用PrimeVue管理一次性Secret，不持久保存Token。`/mcp`为新远端无状态HTTP入口，不影响stdio。CI监视共享tools.rs变更。部署/验证见[检查点](../OPEN_SIGNUP_MCP_TOKEN_CHECKPOINT.md)。

核对日期：2026-10-20（本轮更新存储/启动入口，其它架构复核无变）。此处描述真实目录和调用关系；规划中的理想模块名称不能用来假定文件已存在。规则见 [RULES.md](RULES.md)。

## 1. 实际技术栈与入口

- Vue3 + Vite6 + PrimeVue4/Aura，Vue Router hash路由、vue-i18n中英文；主要业务代码仍为JS/Vue，`vue-tsc`含JS检查，不是已全量TypeScript化。
- Tauri2 / Rust2021 edition，Cargo声明最低Rust1.90，CI采用stable；SQLite由rusqlite bundled提供。依赖准确解析以package-lock.json/Cargo.lock为准，不因文档版本表而升级。
- CI使用Node22；本机工具版本可能不同，先查再选，不把环境差异误报产品问题。已有Tauri前置环境及WebView2，不应在交接时重装。
- 前端入口 [src/main.js](../../src/main.js)；根据浮窗初始化标记选择主App或独立FloatingTaskWindow。主入口 [src/App.vue](../../src/App.vue)负责导航、主题/历史操作及全局设计变量；[路由](../../src/router/index.js)懒加载页面。
- Rust [main.rs](../../src-tauri/src/main.rs)只调用库入口，release声明Windows GUI子系统；[lib.rs](../../src-tauri/src/lib.rs)通过[storage.rs](../../src-tauri/src/storage.rs)解析安装侧配置、准备/迁移数据、初始化数据库和启动备份，再手动创建主窗口并指定Windows WebView目录。启动失败只进入DesktopRoot/StorageSettings设置界面，不装载业务App或创建空替代库。目录命令仅主窗口可用，备份打开改为Rust受控路径，前端不再获得任意AppData opener权限。

## 2. 多入口共享一套业务规则

2026-10-21入口变更：Rust每次新启动注入随机`__EASYPROJECT_LAUNCH_ID__`；主窗默认RemoteRoot登录，显式本地选择只对同次启动ID有效，刷新保持本地、重启回登录。浮窗不受登录入口门禁影响，远端失败不切本地。远端登录前不发业务命令；登录页带既有窗口栏/PrimeVue表单/nonce。服务器目标为受限easyproject系统账户、/opt/easyproject只读版本与/var/lib/easyproject数据、系统级unit，应用管理员与SSH身份分开。最新实际部署结果见[检查点](../DESKTOP_LOGIN_SERVICE_CHECKPOINT.md)；旧%h用户服务仅历史迁移参考。

地址透明补充：src/api/remote.js的DESKTOP_SERVER_ORIGIN与Tauri精确CSP绑定；登录页无地址输入、RemoteConnect直接回登录，忽略历史localStorage服务器地址，避免把密码发到旧用户配置目标。Web仍使用同源，未改变9HTTP接口或独立MCP。systemd当前已使用easyproject专用系统账户，旧用户unit已禁用，数据库与root私有初始密码分权。

新增第三入口（2026-10-21已私有部署）：`server/`是独立Cargo headless工程，通过源码模块复用common/db/models/services，没有Tauri/GTK运行依赖；HTTP认证、每账号工作区和revision在server/src，账号与人员模型独立。`src/api/remote.js`是显式远端适配，Web同源cookie、桌面精确HTTPS源+内存Bearer，`RemoteRoot`处理登录/初始改密/账号管理；本地依旧走原Tauri invoke，不登录/不联网，不自动上传。Windows主窗/浮窗同侧profile、仅本应用禁用代理以直连Tailscale，不变更系统代理或TLS校验。HTTP接口不改旧MCP或IPC契约；见[服务说明](../../server/README.md)与[检查点](../WEB_SERVER_CHECKPOINT.md)。

API维护地图（2026-10-20）：[docs/api](../api/README.md)记录实际18MCP工具inputSchema、6注册Tauri命令和31分发动作；build-api-catalog.js从交付程序/源码提取，build-apifox-layout.js生成20目录/55接口布局，group-apifox-api.ps1维护原生通用协议接口及参考分组，sync-apifox-api.ps1维护26篇参考正文且保留folderId；逐份读回字段/摘要，不是运行期依赖、HTTP网关或新增业务服务。令牌环境变量读取且不落盘，远端手改SHA不符停止覆盖。

```text
Vue页面/组件 -> composable -> src/api/index.js -> Tauri crud_action
                                                    |
stdio客户端 -> bin/easyproject-mcp.rs -> mcp/tools ----+--> services/entity_api
                                                           |
                                           各实体service -> db -> SQLite
```

这张图概括实体CRUD；数据交换、日历、依赖和基线在桌面命令分发中有各自service，并不是MCP工具全部开放。MCP进程使用同一份服务实现，但有自己的连接/权限/恢复点/审计协议边界，不是复用桌面IPC连接。

桌面当前协议：`invoke('crud_action', { model, action, data })`，返回既有ApiResponse，前端解包并向上抛错。`crudAction`同时维护最多30步撤销/重做快照；恢复成功后才移动栈项。实际模型/动作白名单以分发器为准，不接受任意SQL或任意JSON字段。未来强类型显式命令是设计方向，不要为交接重写协议。

- [Tauri分发](../../src-tauri/src/cmds/crud_action.rs)
- [实体事务入口](../../src-tauri/src/services/entity_api.rs)
- [MCP协议与工具](../../src-tauri/src/mcp/mod.rs)
- [前端API和历史栈](../../src/api/index.js)

## 3. 领域与存储

六个主要模型：Project、Task、TaskDependency、Member、ProjectMember、PlanBaseline。以稳定ID关联，不以名称做身份；表/字段详见 [models](../../src-tauri/src/models/mod.rs) 和 [DbState/schema初始化](../../src-tauri/src/common/db_state.rs)。

- Project拥有任务、工作日历配置和基线；Member是全局人员库，ProjectMember是项目团队关联。
- Task有 `project_id`、`parent`、`sort_order`、`progress`、状态/优先级、日期、工作量/排期模式和负责人。旧兼容字段仍可能存在，不按规划样例自动改名或删字段。
- TaskDependency保存前驱/后继、FS类型和lag；PlanBaseline保留项目/任务归属与计划日期，不得在导入/移动/删除中丢失。
- SQLite schema-v5，桌面自动初始化与幂等升级在 `common/db_state.rs`，外键启用、未来版本拒绝、历史团队关系补齐。DB由Mutex保护，锁中毒应返回错误而不是二次崩溃。
- `services/*`负责字段/关系/事务，`db/*`负责受控持久化，不能把核心校验只放Vue或新增直接SQL旁路。
- `data_service.rs`处理版本化交换、备份预览/恢复及安全快照；`calendar_service.rs`处理受控外部ICS获取。前端负责相应XLSX/ICS解析、映射和可视化，实际边界必须读相关实现。

## 4. 前端需求定位

| 需求区域                 | 主要入口                                                                                                         | 关键协作模块/回归                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 仪表盘、状态跳转         | `src/modules/dashboard/components/DashboardView.vue`                                                             | `useStatusLabels`、router、UI consistency E2E                                                        |
| 项目列表与详情           | `src/modules/task/components/ProjectList/ProjectList.vue`、`src/modules/project/components/ProjectWorkspace.vue` | 模板、团队、日历、ProjectWorkspace测试                                                               |
| 任务表与Dialog           | `src/modules/task/components/TaskList/TaskList.vue`                                                              | `useTaskListQuery`、`useTaskRowEditor`、`taskRowPersistence`、taskColumns/taskTree                   |
| 任务排序                 | `useTaskReordering.js`                                                                                           | task service/db、项目边界/稳定ID回归                                                                 |
| 甘特图                   | `src/modules/gantt/components/GanttView.vue`                                                                     | navigation/viewport/presentation/projectData/taskDragging/dependencyDragging/create/edit等composable |
| 任务进度                 | `src/components/ProgressEditor.vue`                                                                              | 任务Dialog与Gantt共用，组件/生产回归                                                                 |
| 看板与团队               | `TaskBoard.vue`、`ProjectMemberPanel.vue`                                                                        | 共享实体规则和成员选择器                                                                             |
| 工作日历、资源与关键路径 | `modules/calendar`、`ResourceLoadPanel.vue`、`gantt/utils/criticalPath.js`                                       | 排期/节假日/1000任务专项                                                                             |
| 数据导入导出/恢复        | `modules/data/components/DataView.vue`、`modules/data/utils/xlsx.js`                                             | data service、交换/备份/加载边界测试                                                                 |
| 浮窗、悬浮球与几何       | `modules/floating/FloatingTaskWindow.vue`                                                                        | taskSelection/useFloatingTasks/useFloatingBall/windowActions/windowGeometry、Rust floating_window    |
| 主题、布局与窗口栏       | `App.vue`、`assets/workspace-layout.css`、`components/WindowTitleBar.vue`                                        | main.js PrimeVue preset、styleNonce、useTheme、Windows配置                                           |
| 国际化                   | `src/i18n/locales/zh-CN.js`、`en-US.js`                                                                          | 同时改两种语言，不散落硬编码可见文案                                                                 |

部分历史composable名字仍含“RowEditor”，不代表当前交互仍是行内编辑。不要仅根据文件名恢复已取消的UX。

### 路由约定

- `/dashboard`、`/projects`、`/tasks`、`/members`、`/data`是主导航；`/project/:id`是项目内多视图。
- `/tasks?project=...&status=...`是显式筛选；支持历史Todo/Pending、InProgress、Done、Overdue，非法状态不注入筛选。
- 浮窗不是普通一级路由页面：Rust只允许指定窗口调用固定创建/返回主窗入口，单实例标记驱动独立前端挂载。窗口权限见 [main capability](../../src-tauri/capabilities/default.json) 和 [浮窗capability](../../src-tauri/capabilities/task-floating.json)。

## 5. 开发与隔离验证

以下在仓库根目录执行；安装依赖前确认E盘环境和授权，不在交接任务中自动运行安装。

```powershell
npm.cmd ci
npm.cmd run tauri:dev
```

普通开发浏览器 `http://127.0.0.1:1420/?demo=1` 使用开发demo数据，只说明前端行为；生产模式不依赖该分支。原生Tauri连接真实库，不能把两者混用进行破坏性试验。生产E2E有自己的受控IPC/mock与严格CSP场景，查看 [e2e](../../e2e/smoke.spec.js) 的实际覆盖范围。

常规完整门禁（不是要求仅改本文时无意义重跑）：

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run test:performance
npm.cmd run build
npm.cmd run test:e2e:production
npm.cmd run release:check
```

Rust可从根目录显式指定manifest，避免工作目录混淆：

```powershell
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml --locked
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets --locked -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml --locked
```

- `npm.cmd run test:e2e`是开发测试入口；发布门禁使用build后的 `test:e2e:production`，脚本管理127.0.0.1:4173服务并清理。Playwright使用Chrome，CI一个worker、允许两次重试；重试通过也要如实记录。
- npm生产安全门禁 `npm.cmd audit --omit=dev --audit-level=high`，全量风险复审还检查开发链；不能把生产0项称全依赖0项。
- RustSec按工作流先完整fetch锁依赖，再 `cargo audit --file src-tauri/Cargo.lock --deny yanked`，工具当前固定0.22.2；本机工具必须在E盘。离线/缓存/不含撤包的结果必须声明边界，不能冒充新鲜完整扫描。
- 标准校验：`& ./scripts/verify-audit-standard.ps1`；PowerShell策略阻止时用允许的单进程方式或读取为scriptblock执行，不改机器级策略。scriptblock方式须显式传 `-Root (Get-Location).Path`，因为它没有脚本文件的 `$PSScriptRoot`；先核对参数和工作目录，不直接复制省略上下文的片段。
- 最后 `git diff --check`。本地已安装Chrome/工具权限、缓存、E盘TEMP和网络可能影响结果；环境失败与业务失败分开诊断。

## 6. 构建与产物定位

- Windows NSIS：`npm.cmd run tauri -- build --bundles nsis`，默认 `src-tauri/target/release/bundle/nsis`；指定CARGO_TARGET_DIR/target后目录会变化，不能只凭文件名拿旧包。
- MCP：`cargo build --manifest-path src-tauri/Cargo.toml --locked --release --bin easyproject-mcp`；[打包脚本](../../scripts/package-mcp.ps1)生成 `artifacts/mcp` 中exe、文档和manifest，不自动更改客户端。
- `scripts/check-release-artifacts.js`检查所要求的文件/APP目录存在且非空；独立摘要/签名/架构和安装验收仍须另做，该脚本并不包办全部验收。
- `.github/workflows/ci.yml`覆盖main push/PR；release工作流覆盖tag/manual、规范/测试/安全、草稿预留及三平台构建。当前release六job，旧记录“五job”属于旧流程。
- `scripts/prepare-internal-release.js`先检查编号/精确SHA/tag/draft，再创建新内部草稿；当前内部2已经存在。正式/tag路径保持既有行为，不表示获准公开发布。
- 忽略目录工具只作本机辅助，跨机器必须重新建立环境并核验。不要复制整个target/node_modules/真实数据库作为交接资料。

## 7. 规划设计到交付的建议工作流

此节是接手工作方法，不是新增功能授权：明确需求与非目标 → 查相关实现/测试与数据权限 → 给出有界设计和验收条件 → 按需取得选择 → 保存检查点/查额度 → 最小实现和根因测试 → 相称全量回归/原生检查 → 校对数据与发布边界 → 同步文档/Git/Wolai → 记录下一步。

若用户只要规划，交付设计与待办即可，不应进入编码、安装或真实库修改。若要代码审计，切换到完整UPARS工作流而不是把本架构阅读当成已审计。
