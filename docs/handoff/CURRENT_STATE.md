# EasyProject 交接时当前状态与待办

2026-10-23公开beta.2已发布：https://github.com/15169046827/easy-project/releases/tag/v0.1.1-beta.2 ，源34de5f2、成功构建39799550769；六原包本地SHA/容器/版本/架构已核验，两Windows包NotSigned/MSI0.1.1 x64，八附件含校验清单与manifest。用户批准临时CI权限，桥接39885916458成功后已在f9e797d恢复read。官网ready=true候选258单测、lint/typecheck/build、82生产UI（零重试、12专用HTTP跳过）通过，待静态安全部署；服务仍cd05e93/active（本轮SSH只读确认）。不覆盖桌面/MCP/真实库，正式生产未通过。历史“未公开/待许可”已被本段覆盖；最终部署回执见专项检查点。

最新公开测试版待权限确认：产品源34de5f2/Actions39799550769已成功，258单测、9性能、52Rust+stdio1、完整npm0、三平台六资产已生成于受保护草稿420856621/v0.1.1-beta.2，仍未公开；生产UI81直接通过+1重试通过，同用例本地零重试3/3。六份workflow备份已E盘下载，但Mac备份为展开App，不能替代原tar摘要。只读桥接fc6e2c4/39805193677读取草稿HTTP403；拟提升该job至contents:write被自动审批拒绝，已撤回，待用户明确允许，不绕过。官网仍cd05e93/ready=false，正式生产未通过，桌面/MCP/服务器/真实数据未变。本轮未新连home-host；详细续接与全部验证/限制见[公开测试版检查点](../PUBLIC_BETA_1_CHECKPOINT.md)。旧beta.1及其它草稿保留，不公开过时包。

公开候选现转beta.2：旧beta.1六job完成但完整开发链扫描3告警，未公开/未改旧资产；生产依赖0。Vite6.4.4/Vitest4.1.12定向修补、全量high门禁进行中，npm11内部错误已记录，E盘隔离npm10解析中。官网WIP仍ready=false，准确源/运行/后续以[PUBLIC_BETA_1_CHECKPOINT顶部](../PUBLIC_BETA_1_CHECKPOINT.md)为准，不能公开513旧候选或把静态包齐全当全面通过。

2026-10-22用户批准公开beta：正在准备新0.1.1应用/v0.1.1-beta.1及受保护构建流程，旧7个Release均草稿且早于最新修复，不直接改名公开。官网仍暂无公开包，需新产物门禁/逐份核验通过并实际发布后再接入；正式生产未通过。任务检查点[PUBLIC_BETA_1_CHECKPOINT](../PUBLIC_BETA_1_CHECKPOINT.md)记录未提交文件、验证和下一步，不自动覆盖安装/真实数据/配置。

最新官网已交付（2026-10-22）：原地址首页为官网，/index.html#/dashboard为在线入口，旧深链兼容；当前服务器版本目录cd05e93-landing-20261022，后端仍bca2d45同SHA，进程PID/两库全部表逻辑/账号凭据权限保持，root700副本和37旧assets保留。63交付文件/62线上静态SHA/2HTML/CSP与4匿名401边界/health、两个公网中继正常TLS200通过。本轮最终构建12真实HTTP通过；前轮255/82仍有效。线上浏览器工具超时未做真实账号UI操作，非正式生产发布、无公开桌面包；安装/独立MCP未变。后续按用户反馈，不自动重做迁移或继续其它功能。详[检查点](../LANDING_PAGE_CHECKPOINT.md)。

最新：官网候选本地复验完成，255单测、82生产UI（含存储异常/桌面/浮窗/旧深链）、独立12真实HTTP通过，lint/typecheck/build/release:check/diff通过；五小时余8%按门禁暂停。未部署官网、未覆盖桌面/MCP/真实库。恢复后只接续安全静态资源部署与上线核验，准确边界/失败/最后代码与HTTP验证时序见[检查点](../LANDING_PAGE_CHECKPOINT.md)。

2026-10-22官网任务：产品介绍/演示看板/在线入口/下载状态/MCP及隐私试用说明已实现，支持中英文、深浅、手机和键盘。255单测、官网7项和真实HTTP12项通过，完整最终生产回归进行中；曾发现桌面存储失败被官网入口误接管，已补识别并复验中。服务器未部署、桌面/MCP未覆盖、未公开内部包；准确后续见[当前检查点](../LANDING_PAGE_CHECKPOINT.md)。用户已确认马来西亚直接访问公网成功，覆盖下方“等待手机反馈”的旧阶段。

2026-10-22本轮已交付：产品2f409c3安全覆盖原E盘并启动，用户原账号确认各页和项目关联任务恢复；252单测/51文件、75生产UI串行零重试、11真实HTTP和规范/类型/构建/NSIS/元数据通过。项目表焦点列位移/遮盖和视图按钮高度已整改；白屏精确根因为历史/自定义状态翻译undefined导致Button/17，已安全原值回退，不重写真实状态。431文件新副本、428非程序SHA和DB全表逻辑一致/integrity ok/FK0，独立MCP不变。此前候选失败/诊断/并行甘特一次失败完整保留于 [专项检查点](../PROJECT_NAVIGATION_HOVER_CHECKPOINT.md)，不冒称原生多平台全矩阵通过。服务器/网页版本未部署，域名暂缓、API/权限不变；正式发布仍未通过，本轮额外覆盖授权不跨任务。

公网补充反馈：用户电脑断开Tailscale可直接打开，手机直连停在登录状态检查而开启代理后可用；一条中继复测也出现8秒TCP超时，不能判定地区封锁。用户要求先等等后停止进一步网络测试，保留已批准Funnel；详见公网检查点顶部，不能把初次6次成功当稳定性全部通过。

2026-10-22现阶段零新增预算Funnel公网试用已获用户明确批准并启用：既有HTTPS443→127.0.0.1:8080，仅AllowFunnel由无→true，原配置root700副本保留，应用/SSH/数据库权限不变。公共DNS及两个公网中继强制TLS请求初验：首页/health200、匿名401；恶意跨源403/no-store。共享限流、存储配额/告警、地区速度/容量/物理重启与移动网络尚有未验/待整改，不是正式发布通过；下一步先收手机移动网络反馈再由用户决定整改，不自动开发、付费或扩大暴露。最新手册1.10/仍79条，完整证据与回退见docs/FUNNEL_PUBLIC_ACCESS_CHECKPOINT.md。

2026-10-22已获用户明确批准并完成私有服务器/桌面覆盖、schema3/6迁移与独立MCP更新。前端源71ec2c7（含密码框右下小字“忘记密码”），后端bca2d45/CI39722557466；243单测、68生产UI+11真实HTTP、桌面52+1、服务器51及严格检查通过。服务器新root700副本与本地三阶段E盘新副本保留，所有原字段/凭据摘要/目录key/业务引用按ID映射核验，完整性ok/外键0；不进行生产注册、找回码生成或业务CRUD。服务器current=/opt/easyproject/releases/bca2d4506e33，受限easyproject身份active/enabled；正常TLS直连页面/health/主模块200且SHA与本地一致、匿名session401。普通系统代理请求出现TLS EOF，仅直连复验通过，未改系统代理/DNS/证书，不冒称普通代理链路也通过。桌面正常启动响应、WebView非C盘；独立MCP已更新EC9C6EFE...，真实18工具仅发现且DB SHA不变，但当前Codex需重连/重启后加载新进程。原生账号交互人工仍未验，正式发布未通过。准确副本/产物/验证/未验见账号资料专项检查点顶部。

2026-10-22候选就绪（源码25afe85，未部署）：头像/用户名/6—31密码/管理员码找回/DPAPI/schema3和6均已隔离验证；243前端、68生产UI+11HTTP、桌面52+1、服务器49通过，Linux39720455218成功。Apifox29目录/74接口/27参考读回。真实桌面/服务器仍13e6ab7，独立MCP仍schema5；等待新副本、ID迁移、覆盖与MCP更新重连的明确确认。详情[专项检查点](../ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md)。

2026-10-22新任务进行中（未部署）：头像正圆/上传预览裁剪压缩、用户名修改、桌面加密保存密码、密码统一6—31、管理员一次性重置码找回、全部自有表ID规范整改。实际库原本已账号/业务分离，但账号/会话/Token及部分业务ID不符合完整前缀UUID要求。源码实现与隔离迁移验证进行中，当前真实桌面/服务器仍13e6ab7。准确续接[当前任务检查点](../ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md)，库设计[DATABASE_DESIGN](../DATABASE_DESIGN.md)；不要用旧schema2/5脚本部署新schema3/6，也不要提前迁移真实库。

2026-10-21当前交付：源13e6ab7已包含头像同排菜单、独立只读Token上层弹窗、冲突刷新不退出桌面登录，已安全覆盖E盘并启动；服务器/opt/easyproject/current为13e6ab766a45，active/enabled，正常TLS健康/页面/主模块200且SHA一致。两服务器库全表（含Token/会话）及370文件桌面副本/367非程序文件与业务行保持不变。238单测、67生产UI、9真实HTTP、规范/类型/build/NSIS/元数据通过。原生登录后人工冲突未验，正式发布仍未通过，独立MCP未动。下方“部署中/暂停/未覆盖”为历史；当前证据[检查点顶部](../ACCOUNT_TOOLBAR_CHECKPOINT.md)。

2026-10-21最新：4d00头像/Token弹窗候选已安全覆盖E盘安装（344文件新副本/341非程序文件及业务行不变）；网页仍旧2cbe3f1，4d00未激活。用户新报桌面冲突刷新退出，根因整页reload丢内存Bearer，现已改只重建工作区并保留登录，238单测/规范/类型/构建通过，9HTTP专项及新包交付进行中。不得把前轮4d00覆盖当作冲突修复已安装。详细下一步和同步缺口见[当前检查点](../ACCOUNT_TOOLBAR_CHECKPOINT.md)。规则、API契约/权限及正式发布边界不变。

2026-10-21头像菜单任务已恢复，原类型错误已修，用户头像同工具栏和独立上层Token只读/复制弹窗实现完成；236单测、真实HTTP8、规范/类型/构建及Rust47+stdio1通过。当前正在末轮回归、构建、网页更新与用户已批准的安全覆盖安装；尚未部署，不将后面的暂停历史当当前阻断。准确入口[ACCOUNT_TOOLBAR_CHECKPOINT](../ACCOUNT_TOOLBAR_CHECKPOINT.md)。API/权限不变，未操作真实业务数据。

2026-10-21最新UI任务因五小时仅7%按10%门禁暂停：头像菜单同工具栏已开始，4源码文件未提交，lint通过但inject动作类型4处TS2339待修；未构建/部署。用户新增Token独立上层只读正文+复制弹窗要求已记录未开发。桌面缺注册是旧包未覆盖，不能重做已上线注册。恢复先读[用户工具栏检查点](../ACCOUNT_TOOLBAR_CHECKPOINT.md)，核对Git后续接；线上2cbe3f1e6920/原安装均未变。

2026-10-21开放注册/MCP已私有部署：功能源48b0d6d、交付源2cbe3f1；普通注册、独立工作区，个人Token7/14/18工具权限/到期撤销改密失效。home-host current=2cbe3f1e6920，easyproject服务active/enabled；升级前root私有新副本，账号schema1→2且原行摘要完全一致，仍1账号/0会话/0Token/0工作区，未做生产注册或CRUD。233单测、67生产UI+真实HTTP8、桌面Rust47+stdio1、服务端42及严格质量/构建/Linux安全检查通过；15HTTP分组/Schema/摘要权威读回，27目录/70接口、26参考保留。桌面NSIS新候选已构建，未覆盖现安装/独立MCP；原生新UI、真实多设备/新用户人工使用未验，不提供邮箱找回/OAuth发现，不公开公网/不等于正式发布。交接1.8/79条；见[检查点](../OPEN_SIGNUP_MCP_TOKEN_CHECKPOINT.md)。

2026-10-21私有浏览器连接修复：用户批准后，只在当前Clash配置为home-host.tail2956dd.ts.net添加精确DIRECT与hosts→100.65.59.38；原3852规则/general设置/手动节点选择未变，普通代理路径网页/健康200。服务器与Tailscale正常，根因是代理路由及Clash私有域名DNS NXDOMAIN；不是关闭TLS或修改系统DNS。切换/更新订阅可能覆盖本地规则，精确证据和禁止上传凭据的备份边界见[检查点](../PRIVATE_HTTPS_CONNECTIVITY_CHECKPOINT.md)。应用/API/服务器配置未变。

## 2026-10-21 默认登录与服务身份调整

最新安装覆盖：用户已批准，已在原E盘runtime-current-user/app覆盖退出0；322文件新安全副本保留E盘，安装后启动前319非程序文件SHA未变，启动后全业务行摘要一致/完整性ok/外键0。实际安装exe SHA32544A6F8F580C24EA5680B9D7236BE372EB9CB4419ED7F9A89A8DDBE31BD7A2（与release仅框架NSIS标记3字节不同，已逐字节验证），程序响应并有无地址框登录结构；Windows锁屏未继续UI。安装侧MCP随包更新为9FBA...，Codex实际独立artifacts/mcp原8C11...未动/连接未中断。详[检查点](../DESKTOP_LOGIN_SERVICE_CHECKPOINT.md)，下文“未覆盖”是历史，正式发布结论不变。

用户最新决策覆盖此前“默认本地”：每次桌面新启动展示登录，显式“不登录，本地使用”保留离线能力，不自动上传/混库/错误回退；本次启动本地选择通过启动UUID保持，重启返回登录，浮窗保持本地。服务器改独立受限easyproject系统账户和独立应用管理员easyproject_admin，旧ym_li应用账号从未与Ubuntu身份共享认证，但同名已纠正。准确实施/验证/部署状态见[检查点](../DESKTOP_LOGIN_SERVICE_CHECKPOINT.md)，不沿用下方历史运行身份/初始凭据。上次关机授权已失效，本轮不关机。

最新源4b4128769b6a2d3653beae31210643fb4801195b（最终同步见检查点）：服务器地址对用户透明，登录仅用户名密码，旧地址缓存不作为凭据目标；本地点击“登录账号”直达登录页。233单测、67零重试生产界面、8真实HTTP及Rust47+stdio1/质量构建通过。服务器独立easyproject已active/enabled、锁定密码/nologin/无sudo，数据/var/lib/easyproject700、root管理/opt版本；应用easyproject_admin初始密码仅root600文件，首次改密强制门禁通过，旧用户服务disabled/旧库原件保留。新NSIS已构建但未覆盖原安装，真实桌面已观察最终无地址框/PrimeVue/严格CSP。物理整机重启新unit自启、真实多设备人工登录等仍未验；正式发布结论不变。

## 2026-10-20 当前任务覆盖说明

最新任务（2026-10-21）：用户授权网页版、登录和多端统一远端数据，已部署Ubuntu home-host/Tailscale私有HTTPS；保留桌面默认免登录离线使用，不自动上传/合并本地库。新增headless Rust复用领域服务、每账号独立库、登录/改密/账号管理与跨端revision保护。230前端单测、Linux29共享+8鉴权/审计及严格Clippy、独立服务端RustSec零漏洞/告警通过；真实HTTP界面含多端隔离、冲突和持久化验证。初始应用管理员已创建、随机密码只留服务器600文件，首次改密前业务403。桌面新候选未覆盖原安装、独立MCP未替换。准确最终测试/产物/一次性关机状态见[网页检查点](../WEB_SERVER_CHECKPOINT.md)，不是公网正式发布验收。

最新Apifox接入与展示整改：私有EasyProject8948094/main8751742已建立20个目录、55个原生通用协议接口（18MCP/6Tauri注册命令/31分发动作），按MCP、桌面IPC与业务模块分组；26篇旧正文保留为2篇接入规范/模型和24篇历史快照，不再平铺代替接口。422已确认真实folderId要求并解决，使用MCP stdio/Tauri IPC协议，不伪造HTTP服务/调试能力。全部内容写后读回SHA和位置/协议/path；未写真实业务库或其它项目。Codex配置仅环境变量引用与版本头/prompt审批，当前聊天需重连才发现原生Apifox工具；直接正式MCP维护不依赖重启才上传。手册1.5/79规则，入口[api/README](../api/README.md)，证据[APIFOX_CHECKPOINT](../APIFOX_CHECKPOINT.md)。

最新MCP授权覆盖此前只读口径：用户明确要求正常增删改查，同名Codex连接已配置`--allow-write --allow-delete`，仍用E盘新库和原独立exe；实际18工具发现、交付exe隔离CRUD/default-denial通过，真实库仅握手发现且文件SHA未变。客户端审批策略未改，当前聊天仍7个旧查询入口，需重连/必要时重启后验收新工具加载，不等于当前已能写。后续按用户具体任务操作，不以权限开启作自动CRUD真实验收授权。详见[启用检查点](../MCP_CRUD_ENABLEMENT_CHECKPOINT.md)。下文“只读”均为对应历史阶段，不覆盖这次明确新选择。

用户要求整改C盘数据默认位置，准确证据见[存储整改检查点](../STORAGE_LOCATION_CHECKPOINT.md)。已覆盖原E盘安装，NSIS SHA EF5CBD847B030C76EA554E6E8C096F1DB8B051C8680AAC271C6BD89A330A79F3、安装exe SHA498BD72B5CBBF37A28C4F1AA4C20DDB80F19C08653DDBAB8D1489BD9B1A12D38。当前库为原安装目录下`data/project_manager.db`，全部业务行摘要与迁移前一致、完整性ok/外键0；主WebView实际使用同侧webview。旧C盘例外撤销，旧库/缓存已分别保留E盘safety-copy/legacy-archive/legacy-residual，核验后旧C路径文件数为0（目录存在不等于仍有数据）。独立MCP配置已只改新E盘库路径，原exe和只读权限不变；旧进程已停止，已有客户端会话需重新连接/必要时重启。217前端单测、59生产E2E、47Rust+1stdio、lint/类型/fmt/clippy/构建/元数据/UPARS通过。原生UI工具1909隔离账户锁定，重置重试仍失败；仅进程响应和真实存储核验通过，新设置界面原生外观/点击及本机手动重启待用户确认，不冒充已验。以下10-18安装/证据保留历史身份，正式发布结论未改变。

快照日期：2026-10-18（Asia/Shanghai）。新伙伴开始执行前必须核对Git、当前文件、额度与具体任务；本文不是自动运行清单。

持续交接规则已获用户明确确认：交接资料不再是一次性快照，今后随改动与Git/Wolai共同维护，见[RULES的DOC-05](RULES.md)。本次仅更新该治理要求；应用/安装/MCP权限与下述产品证据均未改变。手册现1.1、78条规则，初始1.0的77条记录保留历史身份。

## 1. 基线与版本口径

| 项目                 | 已确认事实                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------ |
| 仓库/本机工作区      | `https://github.com/15169046827/easy-project` / `E:\Project\Project\easy-project`          |
| 当前工作分支         | `codex/audit-release-20261006-api`，不是main                                               |
| 交接开始HEAD         | `d6393fd8d7b1e3968a1d30fb600ac4516cb46fbb`，开工Git干净；其后的交接提交仅改文档，见git log |
| 最新内部桌面候选     | `0c38194bff24730427cf263f34277b2b3f2cf1d8`，独立编号/换行修正也包含在此源集                |
| 安全锁补丁源         | `e3b0f4dcd19cc6f10138629975f118dc743bf9dd`，已在上述桌面候选中继承                         |
| 应用/交换/数据库版本 | app0.1.0；JSON当前v5兼容v1–v5；SQLite恢复只接受schema-v5                                   |
| 产品计划文档版本     | 0.6，不是应用升级到0.6                                                                     |
| 审计标准             | 仓库UPARS1.1.0；WACAS未定义/待确认                                                         |
| 已确认平台           | 本开发Windows；Mac产物可构建不等于Mac实机已验；Linux未承诺支持                             |

准确安装/资产/测试证据：[内部版2验收](../INTERNAL_RELEASE_2_ACCEPTANCE.md)；任务历史与同步：[检查点](../INTERNAL_RELEASE_2_CHECKPOINT.md)。不要从旧检查点中间的“待构建”阶段倒推当前尚未交付。

## 2. 已交付，不应重复开发

- MVP/M0–M8：项目/任务/人员/团队、任务层级与FS依赖、模板、工作日历与人天排期、甘特/看板、资源负载/关键路径/基线、搜索过滤排序、撤销重做、JSON/CSV/XLSX交换、备份恢复、ICS导出/忙碌事件导入/私有订阅按需同步。
- 最近UI反馈：跨页面统计/边框对齐、表格固定名称/显示列/省略tooltip/父任务前置关系、独立编辑Dialog、清空搜索/选择、PrimeVue替换、进度滑块+数字百分数、状态跳转、稳定hover/focus、加载闪屏缓解、自定义Windows标题栏/外层滚动约束。
- 浮窗：只读最近截止任务、30秒刷新、最小尺寸/缩放、64px悬浮球四边吸附/悬空、吸附半圆与焦点弹出、减少动态、展开尺寸保持。
- MCP：实体CRUD和团队18工具已实现；当前Codex的7个只读查询接入验收完成，真实写入/删除未启用。
- 10-18定向修复rustls到0.23.46、quinn-proto到0.11.18及必要传递依赖，9条新增漏洞清零；没有擅自升级整栈。

这些是对应版本的实现/验收结论，不承诺未来修改后自动仍通过所有测试。产品计划某些旧“推荐目录/字段/未来设计”仍是历史建议；以[架构地图](ARCHITECTURE.md)和实际模型为准。

## 3. 内部版2与本机安装

- [Actions39105705643](https://github.com/15169046827/easy-project/actions/runs/39105705643)：validate、security、prepare和三平台build六job全部成功。
- [Draft416293740](https://github.com/15169046827/easy-project/releases/tag/untagged-418e1d25d78621174692)：`v0.1.0-internal.2`，draft+prerelease，target精确绑定0c38194；Windows x64 NSIS/MSI、Mac ARM/Intel APP归档+DMG六份齐备且独立摘要/结构/版本/架构通过。Windows为NotSigned；Mac DMG只检查容器，未挂载/实机运行。
- 旧internal.1/Draft406330701六资产编号/大小/SHA保持不变，不能用它作为最新MCP/UI/安全候选。内部2编号已占用，下次按新编号预查，不重跑覆盖。
- 最新有效文件目录：`src-tauri/target/audit-tools/release-39105705643-node`（E盘，ignored），不是同名不带`-node`的旧部分下载目录。六份精确摘要见验收报告，不在本文重复维护第二套表。
- 已安装到原 `E:\Project\Project\easy-project\src-tauri\target\audit-tools\runtime-current-user\app`；NSIS SHA `49FA4D662AEA7ED342E765554C2DA6058D9C8CA2C787035F6ABBF2EC50AE7097`，已安装exe SHA `390CAF9560292F95935A9E4B8CCD257213F3FF9A0C659FD113D7C75A6A884167`（本次交接只读复核一致）。
- 安装退出0，11原数据文件摘要不变；安全副本 `src-tauri/target/audit-tools/internal-2-20261018/safety-copy` 保留。不要覆盖/清理该目录或用它回滚用户后续新数据。
- 原生基础烟测通过：状态筛选、任务旧值/取消、深浅任务页、深色浮窗5项/刷新同窗口/收起展开等。验收结束浅色仪表盘保留，测试浮窗关闭；后续用户可能已改变状态，不保证窗口现在仍处于该位置。
- 最后一次验收只读库完整性ok、外键0，六表计数1项目/5任务/4依赖/0成员/0团队/5基线；这不是可删除数据或永远固定的fixture，本次交接未读取或修改真实业务库。

## 4. 独立MCP交付，务必单独看

- 本机 `artifacts/mcp/easyproject-mcp.exe` 仍对应早期MCP实现e534644，SHA `8C11FCDFAA263BBA8E9AE52F7FE9F6162737D44A075F15FEF589EC01C50AD5B3`；本次交接只读核对该SHA一致。NSIS更新没有替换它。
- 不能把最新Cargo.lock/桌面包的安全修复和源码检查结果直接算作这份旧独立exe已更新。若用户要刷新MCP交付，必须重新按新锁构建、隔离测试、记录源/manifest/SHA，保护原文件并按具体权限批准处理客户端/进程；本交接没有执行该动作。
- 客户端当前已确认的授权仅只读7工具；18工具实现不代表客户端有18个可调用入口。真实库写入/删除和其它客户端兼容需另行批准和验收。
- 协议/资源/并发/恢复点/审计限制详见 [MCP.md](../MCP.md) 与 [Codex验收](../MCP_CODEX_ACCEPTANCE.md)。不复制本机密钥或全局客户端配置给新伙伴。

## 5. 已批准例外与未知

以下为10-18限定复审的控制条件，不是永久豁免。责任/批准人Ym_Li；最迟 **2026-10-22，或依赖/相关资源/平台变化先到者** 复查。见[复审报告](../audit/EXCEPTION_REVIEW_2026-10-18.md)。

| ID           | 状态与限定                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| EP-BUILD-002 | accepted/P3；XLSX940040字节、workCalendar1368654字节为复审基线，保留500KB警告和按需加载门禁；增长重新评估 |
| EP-SEC-006   | accepted/P3；proc-macro-error维护告警，当前目标Windows/Mac无启用路径，Linux GTK链仍在                     |
| EP-SEC-008   | accepted/P3；glib相关unsound告警，当前Windows/Mac无启用路径，不承诺Linux安全                              |
| EP-SEC-019   | accepted/P3；Linux zbus链的zvariant/zvariant_derive/zbus_names三条停止独立维护告警保留，不称已修复        |

五条信息告警对应上述三个安全finding，不能误计为五项新可利用漏洞，也不能说“扫描零告警”。限定复审新增4项=3fixed+1accepted；历史全量审计37项的数量另有基线，不与新复审简单相加成一次新全量审计。

早期“重启项目消失”现象后来用户确认可见，数据持久化检查通过但根因未知；复发再取证，不虚构修复。多屏混合DPI/其它平台/主题跨窗口即时同步等未作全矩阵承诺。

## 6. 下一步分层，不自动执行

### 近期维护事项

1. 最迟10-22或触发变更时复审四项限定例外；新增公告不能自动继承旧批准。此处是期限记录，不是定时唤醒授权。
2. 按真实试用反馈修复可复现问题并出小补丁；保留自动门禁和回归证据，不重做已交付浮窗/CRUD。
3. 若用户希望把独立MCP程序也刷新到新安全锁，先确认该具体交付任务和客户端替换边界；不要在本次交接中顺手替换。

### 正式发布缺口（单独授权/安排）

- Windows签名、Mac签名/公证、公开支持平台选择；不自动购买证书/创建密钥/发布草稿。
- MSI实际安装与独立干净Windows、Mac ARM/Intel设备、真正跨版本升级/迁移/回滚、混合DPI多屏验证。当前同版本覆盖不等价这些通过。
- 正式生产结论仍是**未通过**；内部包可以继续按既有内部试用方式使用。

### 工程候选，尚非批准实施清单

- 独立版本化迁移与恢复工程化；测量驱动的大资源/大型视图进一步优化。
- 显式强类型API演进、严格并发版本/CAS或幂等机制；必须先说明兼容、数据和权限。
- 父任务自动汇总、回收站/自动清理、浮窗主动提醒/开机启动/快捷修改、其它MCP客户端/真实库写入。
- 云同步/账号/协作/Web/移动端；需要独立范围、隐私、冲突策略和用户决策，未自动排期。

## 7. 验证证据与文档索引

内部版2源集证据：214前端单测/43文件、9项性能、55生产E2E、40Rust+1真实stdio隔离集成，以及规范/类型/构建/安全/标准/元数据门禁通过。本次仅编写交接文档，不将这些称为本轮重新运行。

- 长期规则/日常质量：[RULES](RULES.md)、[CONTRIBUTING](../../CONTRIBUTING.md)、[AGENTS](../../AGENTS.md)。
- 产品/版本：[PROJECT_PLAN](../PROJECT_PLAN.md)、[RELEASING](../RELEASING.md)、[内部版2验收](../INTERNAL_RELEASE_2_ACCEPTANCE.md)。
- 最近UI：[UI体验](../UI_EXPERIENCE_CHECKPOINT.md)、[UI交互/球](../UI_REFINEMENT_CHECKPOINT.md)、[半圆](../FLOATING_BALL_PEEK_CHECKPOINT.md)、[状态行](../DASHBOARD_STATUS_CHECKPOINT.md)、[图标](../ICON_DESIGN.md)。
- 审计：[标准](../audit/UNIVERSAL_PROJECT_AUDIT_STANDARD.md)、[模板](../audit/AUDIT_REPORT_TEMPLATE.md)、[机器规则](../../config/audit/audit-standard.json)、[完整历史报告](../audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md)、[最新限定复审](../audit/EXCEPTION_REVIEW_2026-10-18.md)。
- Wolai：[项目页](https://www.wolai.com/h4VsMhyWaL9UHrYLEkfnLx)，当前状态块 `28dPKMDkPpLCFu557s8exF`（追加式历史，读最新日期），统一样式子页 `jKsAeLwg89FM9GyCmifaxC`。外部文档不可用时记录未同步，不伪造成功。
- 接手时不必全文读取数百行历史审计检查点；先读本页及当前任务检查点，再按问题追溯原证据。旧维护技能8月快照、旧“固定internal.1”的阶段说明、规划里尚未存在的理想目录，都不能覆盖最新实现事实。
