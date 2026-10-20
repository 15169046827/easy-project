# EasyProject 交接时当前状态与待办

## 2026-10-20 当前任务覆盖说明

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
