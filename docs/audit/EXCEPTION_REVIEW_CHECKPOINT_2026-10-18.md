# 例外复审与计划清理检查点

- 日期：2026-10-18；目标：复核EP-BUILD-002/EP-SEC-006/EP-SEC-008的当前资源体积、依赖版本/目标可达性及官方公告，整理过时计划描述，产出限定范围复审报告。不重复声称全库重审，不自动延长例外批准期限。
- 范围：当前构建/依赖锁、加载门禁与CI、项目计划和发布记录；不改业务代码/真实数据/安装/MCP权限，不公开Release、购证书或改变系统网络安全设置。内部包更新仅在复审后另行确定精确候选/草稿，不能覆盖历史发布资产。
- WACAS未定义/待确认；实际仓库UPARS1.1.0（比全局技能包1.0.0更严格），已完整读正文/模板/机器规则与全局技能引用。没有仓库专用审计profile。
- 基线2f33168571c99a283406b76730885e284621bbce，分支codex/audit-release-20261006-api，开工Git干净；五小时剩余96%、周99%，不重置/唤醒。
- 已完成：确认最近状态行修复已安装/验收完成；确认计划底部仍有手动选择浮窗、待开发CRUD、旧MVP待确认等过时内容。官方RustSec页面仍列proc-macro-error无已修复版本、glib修复>=0.20；这不是当前锁完整扫描结果。
- 未提交文件：本检查点。忽略目录的既有工具只读查看，未执行安装。待执行安全扫描、四目标逆依赖、生产构建与加载回归；有结果再按模板写限定复审报告和计划清理。
- 准确下一步：以E盘TEMP/CARGO_HOME跑现有扫描器/官方注册表安全审计，保留TLS与所有警告，无法联网则记录未知而非通过；核对XLSX/日历精确字节及目标路径；再文档整改/校验/保存里程碑与额度，Git/Wolai同步。只有本开发Windows确认，其它设备未连接。
- 文档同步：仅本地检查点，Git/Wolai尚未同步；三个例外原责任Ym_Li、2026-10-22或依赖/资源/平台变更先到者复查的条件不变。

## 新公告与定向修复授权

- 当前生产构建XLSX940040字节、workCalendar1368654字节，原限定范围未增长，500KB告警/加载门禁保留；lint/typecheck/206单测42文件/构建已通过。
- 官方npm全量安全审计0项（447依赖）。RustSec更新至999ec89d5d3f10f20be14750ec8c2d8b44e0ac9b，1338公告，更新时间2026-10-17 23:23:59+08:00；当前525依赖命中9漏洞（quinn-proto5、rustls4）及5警告（原2+新增zbus_names/zvariant/zvariant_derive未维护3）。严格含撤包扫描退出1，注册表检查有超时，不能称撤包0；单独--no-fetch --no-yanked扫描用于列漏洞，不冒充完整门禁。
- 原glib/proc-macro-error在Windows/Mac ARM/Mac Intel逆依赖无路径；Linux GTK有路径。quinn-proto在Windows/Linux启用树无路径；rustls经reqwest在Windows启用；新zbus_names在Linux opener链有路径。实际TLS功能ring/std/tls12，无brotli；尚不宣称每条公告的攻击条件均被当前程序启用。
- 用户明确批准“允许定向修复并复验”：仅rustls目标0.23.46、quinn-proto目标0.11.18的兼容锁升级，检查附带变化并全量复验；不升级整个Tauri/GTK栈，不扩大权限/真实数据/发布。
- 新问题稳定编号：EP-SEC-017（rustls4公告，P2）、EP-SEC-018（quinn-proto5公告，P3，当前未启用）、EP-SEC-019（Linux zbus3未维护公告，P3，待上游/平台策略）；EP-DOC-001（过时计划，P3）。不自动把新警告纳入旧批准例外。
- 全部未提交文件：本检查点、docs/PROJECT_PLAN.md。计划已区分交付/候选/历史，尚未提交。准确下一步先定向更新两个锁项，再复扫/目标树/严格Clippy/Rust测试/前端门禁，按结果写报告；内部发布草稿暂不dispatch（现工作流固定internal.1，避免覆盖旧资产）。其它设备与文档同步状态不变。

## 定向锁升级里程碑

- rustls0.23.46、quinn-proto0.11.18已更新；quinn新版本必需的rand0.10/getrandom0.4/chacha20/rand_pcg等传递依赖随生成锁变更，旧rand_chacha/ppv移除。未升级Tauri/GTK；resolver顺带把cssparser-macros依赖改指syn3，已恢复原syn2链接，--locked --offline metadata通过。
- 首次在线更新等待索引，使用已有索引离线更新rustls成功，quinn缺chacha20索引后按正常严格TLS联网补齐；cargo fetch --locked成功下载8个补丁/必需包到E盘。未修改系统DNS/代理/证书或全局Git信任配置。
- 补丁后独立漏洞扫描--no-fetch --no-yanked：0漏洞、5警告（原2+Linux新3）；此命令不含撤包，完整--deny yanked门禁正在重试，不能提前报通过。严格Clippy/Rust复验运行中；修复前基线206单测/55生产E2E/40Rust+stdio1及格式/类型/lint/build通过，不冒充补丁后Rust结果。
- 当前全部未提交文件：src-tauri/Cargo.lock、docs/PROJECT_PLAN.md、本检查点。准确下一步等待补丁后Rust/完整扫描，核对三目标依赖图与加载边界；写限定复审报告（旧3accepted不延期，新Linux维护风险不自动accepted），构建补丁候选但不覆盖旧Release/当前安装。五小时剩余67%、周95%（升级前），无重置/唤醒；设备/业务数据/文档同步边界不变。

## 完整门禁与新例外批准

- 严格完整cargo-audit（--no-fetch仅复用本轮已更新库，仍--deny yanked）退出0、0漏洞/0撤包/5信息告警、无诊断；进程级HTTP_MULTIPLEXING=false后正常。没有ignore、stale豁免或证书关闭。
- 补丁后fmt、严格Clippy、40 Rust测试0.56秒＋真实stdio1测试1.10秒通过；528锁依赖。五告警包及quinn在Windows/Mac ARM/Intel18项逆依赖全无启用路径，Linux另有GTK/zbus路径。前端源码不变，本轮206单测/55生产回归/加载边界/构建结果仍有效。
- 用户单独明确接受EP-SEC-019三条新告警的最窄例外：仅当前Windows/macOS内部测试，责任Ym_Li，最迟2026-10-22或依赖/平台变化先到者复审，Linux支持前处理。原三例外不延长。新增4项=3fixed+1accepted/open0；不将维护告警称修复，不新增Linux支持。
- 报告已按仓库模板覆盖六域并明确限定范围，新报告docs/audit/EXCEPTION_REVIEW_2026-10-18.md；历史完整报告只加新报告指引，不覆写旧37项数量。
- 全部未提交：src-tauri/Cargo.lock、docs/PROJECT_PLAN.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、本检查点、新复审报告。准确下一步保存原本机NSIS到独立E盘证据目录后构建新NSIS（不安装），核对版本/签名/摘要，再格式/标准/元数据检查、Git/Wolai同步。远程草稿仍不dispatch，内部编号变化要独立阶段处理。五小时剩余62%、周94%（长阶段前），无重置/唤醒；其它设备/业务/权限边界不变。

## 本地候选与交付准备

- 新NSIS已锁定离线构建，release2分22秒，6,230,544字节，ProductVersion0.1.0/NotSigned，SHA256 C1F9AB8D7B1F2A60F6065ABAEE39F988A8075C8712B97D34D220366F1BD34242，Validated1 exe。独立E盘候选exception-review-20261018/EasyProject_0.1.0_security_x64-setup.exe摘要匹配；原1BCA8B3C UI包保留为previous-ui-setup.exe且摘要匹配。没有覆盖本机安装、远程Release或真实数据。
- 原500KB告警/精确两块大小不变；新增性能专项9通过，官方npm生产/全量均0问题。当前Cargo.lock SHA256 D4614C5190F6C82DF45A7E25CDD1DED70A5B12550BD655689E1BD64A7D88367A；已安装仍上轮CA484D91 exe（本轮未读取/改变安装，不冒充新包验收）。
- 当前全部未提交7文件：src-tauri/Cargo.lock、docs/PROJECT_PLAN.md、docs/RELEASING.md、docs/audit/EASYPROJECT_AUDIT_REPORT_2026-09-13.md、docs/audit/EASYPROJECT_REMEDIATION_PLAN.md、本检查点、新复审报告。后两旧报告只追加当前指引，保留历史数量。
- 复审与计划清理阶段完成，准确下一步只做格式/标准/元数据/diff检查并提交同SHA非强制同步、Wolai读回；此后新版内部发布需独立编号/精确候选/重新构建Mac与MSI资产，不能把本地NSIS当作全平台交付。本机安装升级需独立数据保护与原生验收阶段，不在本轮隐式执行。
- 文档同步尚待Git/Wolai闭环，只有本Windows确认、其它设备未连接。WACAS未定义/UPARS1.1.0，原3例外及新EP-SEC-019期限最迟10-22或变更先到者，未自动延期。五小时剩余52%、周93%（打包里程碑前查询），无额度重置或定时唤醒，无通用标准变更。

## 交付同步闭环

- 安全锁补丁/计划/报告提交e3b0f4dcd19cc6f10138629975f118dc743bf9dd（7文件）已校验父提交/源码树/提交SHA，非强制同步GitHub；保存后工作区干净。该提交对应本地安全候选，报告/安装包/依赖证据一致。
- Wolai页h4VsMhyWaL9UHrYLEkfnLx状态块28dPKMDkPpLCFu557s8exF版本56追加本轮发现、授权、三项新告警最窄批准、全部验证、包SHA及未安装/未发布事实，已读回确认。
- 仅本闭环检查点待文档提交，其它无未提交文件；本阶段任务完成。下一步是独立新内部发布候选/历史草稿保护，或用户授权的数据保护覆盖与新包原生验收；都不能冒充本轮已执行。现有安装及Codex只读配置保持原样，正式发布/设备限制不变。五小时剩余47%、周92%（提交里程碑查询），不重置/唤醒。
