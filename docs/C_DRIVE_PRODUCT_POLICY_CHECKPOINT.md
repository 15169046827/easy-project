# C盘产品限制纠正

## 2026-10-23最终交付（覆盖下方历史进行中状态）

- 公开补丁：https://github.com/15169046827/easy-project/releases/tag/v0.1.2-beta.1 ，Release421426167，published_at=2026-10-23T03:46:47Z；6原包+SHA256SUMS+manifest共8附件，prerelease且非latest。源101720104397e8ed7610eb9a4fe8cee961855f0c/成功运行39895533485。旧beta2及其它草稿/资产保留，未覆盖重传。
- 产品修复C盘默认/自选本地可写目录，开发/测试/缓存/副本仍E盘；实际权限和路径/迁移安全不变。六原始包独立大小/SHA/版本0.1.2/容器/ARM与Intel架构通过，Windows两包NotSigned/MSI x64，未安装，不在C盘写测试文件。无额外CI权限提升，Mac原压缩备份可用。
- 官网已部署：https://home-host.tail2956dd.ts.net/#download ，新网页源d3052df519171420b515edf061d69ca515c448ee，current=/opt/easyproject/releases/012-landing-20261023，新root700副本/var/backups/easyproject/012-landing-20261023。63交付文件、111旧资源保留；后端SHA904d2b3a...、PID不变/active，两库全表逻辑不变/integrity ok/FK0。
- 最终网页lint/typecheck/build/diff、258单测/53文件、82生产UI、独立12真实HTTP通过；官网专用7项额外串行零重试通过，六截图重新保存并实看375dark正常。HTTP测试曾清理截图，首次图片读取不存在，未冒称看过；重跑官网7项后目视通过。正常TLS线上2HTML/62静态SHA/CSP+nonce/安全头/4匿名401/health200通过。
- 新鲜安全结果npm完整/生产0漏洞，Rust1349公告/528依赖无漏洞撤包失败，5历史信息告警保留；签名/公证、Mac/MSI干净设备与跨版本/混合DPI矩阵未完成，正式生产未通过。首轮LF门禁失败及旧断言未更新失败保留，下方修复及完整重跑可追溯。
- WACAS未定义，实际AGENTS/交接1.12/UPARS1.1.0；任务基线95c238c，分支codex/audit-release-20261006-api，网站交付基线d3052df，保存前未提交仅本文和handoff CURRENT_STATE；无其它代码待办。Git/Wolai主与交接本轮同步并读回，API无变不重传Apifox。已确认SSH home-host/正常Funnel HTTPS，本机桌面/MCP/真实库未操作，预览与测试子进程已结束。额度五小时余62%、周余94%，未重置/唤醒/关机。
- 本轮新包与官网下载更新交付完成；后续仅按用户反馈，不自动覆盖本机或继续其它功能。恢复先读本回执/Git，不重复构建已交付版本。剩余生产验收风险不能因用户允许公开测试而自动消失。

## 2026-10-23新补丁发布进行中

新公开包里程碑：421426167/v0.1.2-beta.1已于2026-10-23T03:46:47Z显式公开预发布（非latest），匿名API八附件可见，源101720104397e8ed7610eb9a4fe8cee961855f0c/39895533485整体success。258单测、9性能、82生产UI、53Rust+stdio1及完整质量通过，npm全量/生产0漏洞；Rust1349公告/528依赖、5原信息告警保留。六原始文件通过workflow备份取回E盘，与新Release每份size/digest相等，Mac版本0.1.2与ARM/Intel Mach-O/安全tar、DMG koly、PE/MSI通过；WindowsNotSigned/EXE0.1.2/MSI0.1.2 x64，未安装。SHA256SUMS/manifest已附，旧包不变。官网下载候选改新tag/六文件/支持C盘文案；其初次单测发现旧固定0.1.1文件断言，已准确更新为0.1.2，保留六数/固定仓库/精确版本检查；最终完整单测进行中。新网站lint/typecheck/build/82生产UI通过，12真实HTTP复验中。服务器只读确认当前beta2-landing-20261023/active，待新源码提交与唯一安全静态部署；无CI权限提升。

39895533485里程碑：validate与rust-security均success，完整前端/生产UI/Rust门禁已通过，prepare进行中，尚未公开新包。后续必须等三平台build与Mac原压缩备份全部完成再逐份核验；安全信息告警/实际数量以该轮日志读回为准，不从旧轮虚构零告警。

修正后候选101720104397e8ed7610eb9a4fe8cee961855f0c/tree f01bfe8058855734bcc2530fad64382c4573fc4d已同SHA非强制推送；Actions39895533485/headSha一致，pending（与旧安全扫描串行），不重复派发。旧39895304412的安全扫描尚未结束，validate已失败；原说明“待结束再派发”具体为新运行已排队而非抢占/取消旧运行。当前工作区代码干净，准确下一步等39895533485完整结果，旧bd2e403不得发布。当前官网/桌面/MCP/服务器/真实数据未动。

首轮39895304412 validate在lint失败：既有verify-beta2-assets.mjs未列.gitattributes eol=lf，Windows checkout转CRLF后Prettier要求删除CR。本机i/lf、w/lf因此未复现；新增*.mjs text eol=lf，不改Prettier/忽略规则，不删除核验脚本。prepare/构建未达，不生成新draft；待原安全作业结束再派发同tag完整新运行，不公开失败源。

构建入口：候选bd2e403704c421b32f6bc77b0a9ed6b13c860ff3/tree f8b7ec6ccfea9224aff81afb0956a6576caa3916已同SHA非强制推送，Actions39895304412/headSha精确一致。发布metadata0.1.2/10发布脚本测试/lint/diff通过。当前质量、安全进行中，尚无新公开包。下一步只读等待该运行，失败定位不跳门禁；成功后读取新draftID及原六文件摘要，不套用旧beta2的ID/SHA/辅助脚本固定参数。原网站/安装/服务器未改。

用户“更新吧”明确批准把源码修复打成新公开测试补丁并更新官网下载；不覆盖本机安装/真实数据。基线95c238cd2ff50aa2847d7add02555a272f02f0bd，原分支开工干净。目标app0.1.2/tag v0.1.2-beta.1，五版本文件同步；旧beta2资产/官网仍保留至新六包验完公开后切换。Mac构建新增只上传原.app.tar.gz备份，避免上轮展开App无法核验压缩字节；不新增令牌权限、不复用beta2临时授权。额度五小时余80%、周余97%；WACAS未定义，实际AGENTS/交接1.12/UPARS1.1.0。准确下一步本地发布元数据/质量→提交派发原完整门禁→原六包独立核验→发布说明/SHA→显式公开→官网下载测试/安全静态部署→Git/Wolai/交接同步。当前未提交五版本文件、release workflow和本文；服务器未新连接，本机安装/MCP/真实库不动，API无变。

2026-10-23，用户明确澄清：非C盘仅是本机维护环境要求，不约束终端用户。

- 目标：允许C盘安装侧默认数据及自定义C盘可写目录，保持实际权限/网络/链接/穿越/重叠/迁移检查；不静默回退换库。WACAS未定义，实际AGENTS/交接1.12/UPARS1.1.0。
- 基线44f18ccfac20129c555e50c0fa9f55469f612cc4，codex/audit-release-20261006-api，开工干净。额度五小时余87%、周余98%。
- 已改storage.rs两处盘符拦截，保留解析后网络目录检查；凭据和WebView沿用同一校验因此一起解除盘符限制。新增Windows只读C路径验证，不写C盘；相对/网络/重叠原负例保留。中英文数据设置提示更新。
- 验证完成：存储8、完整Rust53+stdio1通过；fmt/严格clippy、前端lint/typecheck/build/diff通过。初次并行单测Apifox4超时、再次默认并行3超时（npm未转发maxWorkers参数），直接Vitest两worker全258/53文件通过，不改断言或超时。生产UI初轮80通过/2失败/12专用HTTP跳过，失败为备份告警等待与1280dark存储状态等待；随后本次四存储尺寸/主题+备份告警串行零重试5/5通过。保留初轮失败，不能称完整82一次全绿；不是新安装或写C盘验收。
- 保存前未提交：AGENTS.md、docs/handoff/RULES.md、docs/handoff/CURRENT_STATE.md、本文、src-tauri/src/storage.rs、src/i18n/locales/zh-CN.js与en-US.js。源码整改完成，下一步是独立新补丁版本/发布计划，须按该阶段范围执行，不覆盖既有beta.2附件，不提前改官网系统要求误导用户。
- 当前公开beta.2仍含旧盘符限制，官网下载文案暂保留其真实行为。服务器/安装/真实数据/MCP本轮未动；仅沿用上轮连接成功证据，不冒称新部署。Git/Wolai/交接待验证里程碑同步，API契约无变。
