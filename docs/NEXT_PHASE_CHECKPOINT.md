# 后续阶段：公网稳定性、更新体验与国际化

## 2026-10-26运维备份/容量监测已部署（最新）

- 源d9fe3ac9225302d1a2fc033defc796bb9a8a50c8已推送，CI40245676939/server与security两job成功，包含20Python/原生隔离systemd及原Rust检查/安全扫描；不扩展为桌面全依赖新扫描。Wolai主/交接候选里程碑已读回；本段实际部署回执随后同步。
- root新保护目录/var/backups/easyproject/ops-install-d9fe3ac-20261026保存主unit原件/原PID和current/安装结果，既有运维目录与同名unit先确认不存在；root只读代码/opt/easyproject/ops/safety.py与0644 unit已安装。受限作业源/var/lib/easyproject只读、仅ops副本目录可写、无网络，flock/超时保护保持。
- 首次真实数据**只读**备份及隔离恢复通过2DB，bundle=/var/backups/easyproject/ops/snapshots/snapshot-e8348bf22ecca4db49b846413a470eace；逐库一致、不是跨库原子，不恢复覆盖在线库/调用业务CRUD。原主程序PID680未变/active，正常TLS官网与health200，没有重启主程序、迁移数据库或删历史副本。
- easyproject-backup.timer及easyproject-health.timer均enabled/active；run和health作业Result=success/ExecMainStatus=0。日备份03:00按服务器UTC加随机15分钟（首次下次时间2026-10-26 03:11:08 UTC，即上海11:11:08），健康每15分钟；并非Codex定时唤醒。仅本地journal/受限回执告警，没有站外通知或自动清理/硬存储配额/异地备份。
- 安装辅助脚本audit-tools/install-ops-d9fe3ac.py语法通过，root副本实际SHA92388357662641AB95AF0FDC13978FE8A6E2D4863081A1350A7C9040A8C8068B，最终候选包97F4BC17...已在root私有目录再次比对来源字节。新systemd timer文件补LF约束，未改变应用权限。
- 下一步继续第一阶段：核对可信Funnel转发边界后改善共享登录/注册限流，再补工作区写入预算及可见告警，不信任任意转发头、不改Funnel/域名/来源授权。目前home-host实际Tailscale1.104.1；官方同版本serve.go表明代理覆盖为单一X-Forwarded-For，后续仍需显式受信回环配置、单值/格式/Host/Proto校验、默认不信任及全局预算，不能只读Header就放宽。此前方案来源只为研究，不代表已改限流。
- 基线d9fe3ac，分支不变；WACAS未定义/实际UPARS1.1.0/交接1.15；最新额度上节点五小时剩76%/周66%，下一长阶段前重新查询。当前未提交.gitattributes、本文与后续交接/服务文档部署回执，无未提交产品代码。SSH维护连接仍开，本机桌面已关闭，MCP需客户端重连；不关机。

## 2026-10-26运维安全候选本地与Linux复验通过（最新，未部署）

- 候选补齐备份/恢复空间预算：完整bundle及最大恢复副本预算、复制中剩余页容量检查，额外保留至少1GiB和10%空间；并发系统写入仍可能耗空间，不冒称硬配额。20项Windows测试、20项home-host Python3.10测试、真实systemd只读源写入拒绝/WAL快照/实际恢复/缺源/锁冲突/硬超时均通过。最终包97F4BC176FA41F429AFC3292715C9DEE05D9EA1EB21B37480C17D5192115CD5F，隔离代码/var/tmp/easyproject-ops-candidate-20261026-d，隔离证据/var/lib/easyproject-safety-check-o5kbhmuj。
- 首轮NAMESPACE失败已通过journal证明PrivateTmp隐藏/var/tmp测试根，测试移至与生产数据无包含关系的/var/lib/easyproject-safety-check-\*，未关闭保护；旧失败现场保留。候选unit权限已显式0644，systemd语法验证通过，唯一余警告为系统snapd旧键，不修改非项目服务。两轮中间成功证据jccevsk5/6greqrcr是过程，最终以o5kbhmuj为准。
- 新CI门禁覆盖20Python测试、systemd模板语法和sudo隔离原生验证；未改Rust/UI/API权限契约，本次不重复已有效业务测试。lint、10契约、release:check、Python3文件AST及diff检查通过。ops候选尚未部署或启用timer，线上主服务active/enabled，/opt/easyproject/ops及目标unit/ops副本目录检查为尚不存在。
- 下一步：本候选提交/推送并等待CI；核对服务器无同名运维文件后，新root700运维部署副本、安装root管理代码/只读源作业、先执行一次真实只读备份与隔离恢复；成功并核对主服务未重启后启用原计划的每日备份/15分钟磁盘监测timer，不自动清理副本。随后继续第一阶段的共享限流/容量与可见告警，不能把本候选或本机测试当作整个公网验收通过。
- 本节点未提交：.github/workflows/server.yml、server/ops/{safety.py,test_safety.py,README.md,verify_linux_safety.py}、server/deploy/{easyproject-safety@.service,easyproject-backup.timer,easyproject-health.timer}、本检查点、父子专项最终同步回执及随后交接/文档。基线d5e1c55，分支不变；WACAS未定义，实际UPARS1.1.0/规则1.15。Wolai上次已记候选/18本地/ Linux进行中，本20+Linux最终状态待本里程碑同步。SSH仍在本次授权维护会话，未改真实业务库或主服务，不关机。

## 2026-10-26恢复后续阶段：运维安全候选验证中（最新）

- 父子改造已真实交付桌面/服务器/独立MCP，升级与契约回执d5e1c55e36c1155b2937456c38268d956027941d已推送/完整远端SHA读回，Wolai主/交接读回通过；准确保护副本/23工具只读发现/原字段与ID保留见PARENT_CHILD_TASK_DISCUSSION顶部。客户端须重连，正式生产仍未通过。下方“状态设计仅讨论”的早期方案已由最终项目字典方案覆盖，不再开发隐藏三分类。
- 用户授权完成本步后按原开发顺序继续，本阶段接续本文件原批准公网安全/稳定性计划，不新增公网入口、账户权限、付费服务或删除数据。WACAS未定义/待确认；AGENTS、维护skill、交接1.15和UPARS1.1.0适用；基线d5e1c55，分支codex/audit-release-20261006-api。阶段最近五小时余84%/周67%，无门禁，不重置/唤醒/关机。
- 已实现候选：safety.py共享300秒协作时限（备份回调/查询/分块hash）、唯一成功/失败回执、diskWarning非零退出及不开始新备份、manifest路径身份限制、真实隔离恢复。新增systemd只读源/仅副本可写/禁网络/并发flock/360秒硬超时及每日备份/15分钟健康timer模板；未启用。18项Windows合成测试通过，10契约测试/lint通过；文档明确逐库而非跨库原子、不自动清理、无站外告警。
- Linux首次隔离验证失败，尚未算通过：home-host已SSH确认Python3.10.12/systemd249；候选包SHA FDF20CEF876A660CFDADF1DAB14D274AEC326CF5FEEF457D060B15C6845F51D2，root私有解压目录/var/tmp/easyproject-ops-candidate-20261026；tar时间偏差、Windows归档模式导致仅候选unit world-writable警告，须修正为0644再复验。系统自带snapd的RestartMode警告不属于本项目，不修改系统snapd。首个success隔离临时unit启动失败，正在检查日志/命名空间（PrivateTmp可能隐藏/var/tmp测试根），不得关掉保护来制造通过。
- 准确下一步：证明隔离失败原因并修测试位置/诊断，复验Linux的只读WAL源、真正恢复、源缺失拒绝、锁冲突与硬超时；补CI与文档/数据安全检查后再考虑受保护部署运维作业，不能把源码模板当已启用。然后继续限流/存储预算与可见告警，完成第一阶段再做版本检查、官网截图/下载、冲突可见性、发布矩阵、浮窗/MCP体验与贯穿es-ES。
- 全部未提交（本节点）：.github/workflows/server.yml、server/ops/{safety.py,test_safety.py,README.md,verify_linux_safety.py}、server/deploy/{easyproject-safety@.service,easyproject-backup.timer,easyproject-health.timer}、本检查点（随后文档以Git为准）。父子交付已独立提交，不把运维候选混入已交付范围。Wolai只同步“候选/18本地/ Linux进行中”，本阶段新代码尚未Git提交/推送。
- 设备/数据：本机Colin与home-host SSH已确认，无其它设备连接；测试只写E盘及服务器新私有合成目录/临时单元，不读取生产账号业务正文、不修改/恢复生产库、不启用定时器，不影响主服务。失败测试保留隔离现场，旧一次性关机授权失效。

2026-10-23新增状态设计讨论（未授权直接迁移）：用户发现MCP写入“持续维护/等待决策/受阻”等任意状态，列表显示但看板遗漏。已核对Task.status为String、服务只精确Done触发100%，TaskBoard固定Pending/InProgress/Done且精确过滤；Todo旧别名也未入Pending列。建议稳定三大生命周期+受控项目自定义状态（独立ID/分类/排序/颜色/归档），MCP先发现合法状态再引用ID，不允许任意文本隐式建状态；现有未知值先保留并显示“未分类”，不擅自猜分类/改真实任务。受阻宜独立阻塞标记，持续维护可能是标签/任务类型，由用户决定；完整自定义状态是跨数据库/API/MCP/统计/看板/国际化的独立需求，待确认方案后实施。

第一阶段里程碑：新增server/ops/safety.py与test_safety.py，本地6测试通过，覆盖两库在线备份/实际隔离恢复内容核验/损坏拒绝/穿越拒绝/缺源不建空库/输出路径重叠/磁盘报告。显式声明仅per-database online一致性，不冒称跨库原子；工具不覆盖在线数据库、不输出账号正文。PATH无python，读取已有应用内置Python执行，TEMP/TMP与测试临时目录E盘、禁写pycache；未安装工具。当前尚未部署、未设定时器/告警/配额，未改限流，不称公网稳定性已完成。下一步增加运行时限/失败回执、运维文档与CI门禁，并在隔离Linux验证权限/计时任务，再安全部署；备份保留/容量策略不能自动删除现有数据。当前未提交本文、handoff README与server/ops两文件，无其它产品代码；Git/Wolai待首阶段保存，服务器/本机程序/真实库未动。

2026-10-23用户授权逐项推进后续六项，并新增官网历史截图更新与西班牙语。

- 顺序：1 公网安全/稳定性（限流、配额、告警、定时备份和恢复演练）；2 桌面版本检查；3 官网下载简化及当前版本隔离演示截图；4 本地/在线工作区及冲突可见性；5 补正式发布矩阵；6 浮窗/MCP文档体验。国际化检查作为跨阶段基础，扩展es-ES，覆盖官网、桌面/网页入口、PrimeVue控件、日期数字、词条键完整性，不用英文展开假称西语完成。
- 基线603e161126820920ca5c51fc5971ad5bbca98f91，codex/audit-release-20261006-api，开工干净。WACAS未定义；实际AGENTS/交接1.12/UPARS1.1.0。五小时余99%、周余93%；重要里程碑复查。
- 已确认：现i18n集中zh-CN/en-US，语言保存及html lang已有；官网中英toggle写死，其他日期/控件语言与完整键尚待审查。官网project-board.png确为旧合成截图。新图仅从当前隔离demo生成，不采集真实项目/账号。
- 安全现状：HTTP有socket-IP登录30/15分钟、注册10/小时、重置10/15分钟，Funnel下共享反代限额，拒绝不可信X-Forwarded-For；密码哈希2并发/工作8并发，正文2MiB，1000账号上限与Token数量上限已存在。不能称完全没做限流。仍需完善共享限流策略、磁盘预算、告警与可恢复备份，保持精确Origin/CSRF/revision/权限。
- 下一步：先补本地可测试的运维安全备份/恢复验证与健康报告，不在生产做注册/CRUD或恢复覆盖；再按阶段实现与验证。生产部署需新受限副本，不能把单库在线备份说成跨库事务快照，不自动删用户数据/备份。
- 当前未提交：本文（以及随后明确列出的阶段文件，以Git核对）。Git/Wolai/交接待首个里程碑；API若变化必须同步Apifox。服务器/桌面/MCP/真实库本轮未动，未重新确认设备连接；最近一次连接证据仍上一安装/官网下载任务。
- 发布边界：现0.1.2-beta.1桌面已安全覆盖并启动，官网新下载已上线；正式生产仍未通过，不自动付费签名/域名、不扩大SSH/数据库暴露、不继承此前临时CI写权限授权。
