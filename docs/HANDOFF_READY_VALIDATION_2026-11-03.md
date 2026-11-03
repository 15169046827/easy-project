# 交接Ready验收证据

日期2026-11-03；基线6135c2fa00df685187a53a07655e0eb77c6c56be；分支codex/audit-release-20261006-api；UPARS1.1.0/规则1.25，WACAS未定义。目标是可独立接手的源码、规则、验证、风险和待办包，不是自动部署/正式发布或新一轮全部代码人工审计。

## 当前门禁

| 范围 | 实际执行与结果 | 边界 |
| --- | --- | --- |
| 前端/依赖 | 同日绑定源bd8ef71的lint/type/402单元、build/130生产UI/独立13HTTP、npm3低/0中高、36日历等价通过 | 本收尾未改前端源/JS锁，沿用有效结果，不伪称重跑；两类版本/SHA补丁保留 |
| Windows Rust | 新Tokio锁fmt/Clippy(-D warnings)/76单元+真实stdio隔离CRUD/默认拒绝1通过 | 只读写合成库，非真实数据；不是安装包/原生窗口验收 |
| Server Rust | fmt/Clippy/64单元+20HTTP集成通过，server锁最终与基线逐字一致 | 未部署；无必要的Tokio降级已撤回，不改用户修改 |
| RustSec | 官方当前HEAD 6c5fedf8ff03c485ed674d8f941e0180f3f72d70，日期2026-11-03T09:44:19Z；两锁deny-yanked扫描exit0、普通vulnerability0 | 桌面全平台锁仍有5项信息告警，见下；服务端0告警 |
| 平台图 | 默认产品features下Windows x64/macOS ARM及Intel，五告警包共15个cargo tree查询均未启用 | 元数据图不等于Mac编译/安装/运行通过；Linux桌面不在交付范围 |
| MCP/契约 | 两端客户端实际各发现23工具；API源未变，66原生/32参考及19HTTP原始约束已有读回保持 | 未调用真实数据；工具发现不证明今天服务器在线；OAS导出损失DOC-SYNC-001不关闭 |
| 资料/交接 | 当前入口、规则/架构、源与运行差异、待办/授权、证据及历史定位齐备 | Git/Wolai最终回执与可携带证据清单见本轮收尾 |

## 新发现并整改

EP-HANDOFF-RUST-001/P2/fixed，高置信度：RUSTSEC-2026-0386指出tokio::io::unix::AsyncFd安全构造不保证描述符所有权/生命周期，错误复用可能破坏I/O安全。Windows无该Unix构造，自有代码无直接调用，但Mac/Unix构建存在依赖原语风险，不能忽略新unsound告警。

仅桌面/MCP锁Tokio1.47.1→官方修复维护线1.51.6；必要mio1.0.4→1.2.4、socket2 0.6.0→0.6.5，Tokio不再需要的backtrace/io-uring支链被resolver移除，无全栈升级。服务端原1.54.1已修复，初次统一更新造成不必要变化，已精确撤回全部本任务生成的server锁差异，未降级。新fmt/Clippy/76+1及两锁当前公告复扫通过；未部署独立MCP程序或桌面。

## 告警与未验，不隐瞒

- npm3低是同一deepmerge原版号公告传播，本地三入口防护及攻击负例已通过，不改名改版号或忽略清零；持续复核上游补丁。
- 桌面全平台Rust锁仍列proc-macro-error、zbus_names、zvariant、zvariant_derive的unmaintained，以及glib的unsound。十五个当前支持目标图未启用这些包；原例外已过期限，不自动延期，新增Linux桌面/feature/依赖图变化前必须重新处理，不能沿用历史例外发布。服务端无这些GTK依赖。
- Clippy只有Windows增量缓存硬链接失败后复制的环境提示；代码检查以-D warnings通过。Cargo.lock检出行尾提示保留，未通过禁用检查掩盖。
- 首次cargo-audit命令不在PATH；发现原E盘0.22.2后停止重复安装。默认git更新超时，空数据库和默认索引读取失败结果均不计通过；改为官方当前SHA快照，明确E盘CARGO_HOME。快照无git元数据故用--no-fetch/--stale，时效由官方API HEAD/日期独立核对，未ignore任何公告或撤包。归档SHA256为B02B52EA4920CCEBFBF5ED61169E9F87CEBE55CD48F5749E7F6A3993A0A9E791。默认索引尝试的写入情况未核实，不声称本轮完全未触及默认索引；之后所有操作显式E盘。
- DOC-SYNC-001是Apifox OAS导出备用媒体、空security、requestBody.required/请求头enum等表示损失；原始HTTP实体约束正确。权威契约为仓库web-openapi及原始实体，不能用导出生成客户端时默默丢掉约束。
- 本次安全源码尚未真实交付、无新签名/公证/干净设备/跨平台原生验收；正式发布仍不通过。公网/设备可达性本轮未重验，无SSH/桌面控制。

## 可携带证据

原始日志在ignored E盘工具目录，不是唯一交付。`docs/handoff/evidence/VALIDATION_2026-11-03.json`保存脱敏结果、源/契约/锁摘要、原日志摘要、官方公告来源及平台图。伙伴可在新的隔离工作区按既有门禁复现，不能将摘要当测试实际重跑。

## Ready结论

源码与资料交接条件已完成，标记HANDOFF READY；源251ed21785aa253dcedc8e39d7ea82dd669346de已精确Git同步，Wolai主/交接核验段精确读回。伙伴尚未实际接收，不伪称其已确认。代码阶段验收、全库新审计、真实交付、正式发布分别判定。接手先复述核心规则并只读核Git/本页；没有新任务时等待，不自动清库、CRUD、部署、重置或关机。
