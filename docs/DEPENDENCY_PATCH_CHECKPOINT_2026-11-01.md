# 兼容依赖补丁隔离验证检查点

## 恢复里程碑（2026-11-01）

最终收件：重试80110正常结束exit0，130生产UI通过1.6分钟，13HTTP按配置跳过（非本候选HTTP验证）；日志dependency-i18n-ui-retry.log。待办缩小为i18n专用安全负例、候选npm扫描授权、19HTTP全字段及DOC-SYNC-001。没有原生桌面候选、部署或真实数据变化。

最新：UI26257因预览服务30秒启动超时exit1，未开始测试；已批准以可启动本机测试服务的权限重试，进程80110，日志dependency-i18n-ui-retry.log，恢复先收该结果，不并行再开服务。i18n锁白名单与原根摘要再次一致。npm扫描审批仍待，19HTTP全字段及i18n专门安全用例待，不标安全通过。

补充：Apifox新原生连接66原生及32参考全文已逐项一致，19HTTP仅结构清单已读回、全字段未复验；DOC-SYNC-001仍保留。候选npm audit联网查询被审批机制拒绝（依赖名称/版本元数据外发需确认），未换路执行，不能报告新告警数。i18n完整UI进程26257结果待收；根源码/锁保持，下一步先收UI，再申请npm扫描授权与补HTTP契约读回。旧脚本通道HTTP0不能覆盖新原生连接已恢复事实。

额度已由用户恢复，本次查询五小时余83%、周97%，未调用重置。原Git基线/分支及5个未提交文档保持，无源码或根依赖变化。新Apifox连接读取8948094/main8751742成功，66原生接口逐项内容/名称/协议/路径/分组完全一致；32参考及19HTTP全字段仍待核对，旧环境变量脚本本次HTTP0失败，不冒充全部同步。i18n隔离ci初次明确ENOTFOUND；获允许联网后严格ci成功448包，保留peer/弃用警告，无生命周期脚本。lint/type/384单测70文件/生产build8.06秒通过，chunk警告保留。下一步候选audit/130UI及i18n安全负例、32/19读回，之后Git/Wolai/交接同步；不部署/不改真实库，设备无桌面/SSH连接。下方旧“未安装/403”仅历史，以上覆盖。

## 当前范围与基线

2026-11-01；UPARS1.1.0/WACAS未定义，规则1.25。基线26813a6a74908d0e26fd2fa6815fbffc6efdf29b，分支codex/audit-release-20261006-api。用户批准最新Apifox令牌重试及其他任务逐步验证；本阶段仅隔离候选，不升级原项目/部署/真实库/MCP权限。

## 已完成

- Apifox在独立命令内显式从账户User环境读取最新ApiFox_MCP_TOKEN，覆盖该子进程可能过时的Process值，未输出令牌；首只读请求仍HTTP403，立即停止，66/32/19重新读回未完成，不声称最新token有效或接口已同步。
- E盘全新隔离目录`src-tauri/target/audit-tools/dependency-patch-candidate-20261101`由git archive基线创建，不带.git/凭据。候选Vite6.4.4→6.4.5，undici7.29.1→7.30.1；上游jsdom允许^7.25.0，Node要求>=20.18.1、本机24满足。
- npm锁写器移除了5个Tauri Linux包的libc元数据，已按原锁保留，无版本变化。语义深比较只允许根manifest/Vite/undici三节点变化，原仓库package/lock摘要与候选创建前一致。首次比较受对象键顺序影响拒绝，改Node isDeepStrictEqual后通过，未放宽允许列表。
- 候选严格peer npm ci --ignore-scripts成功447包，保留ERESOLVE peer提示和旧依赖弃用警告；未执行依赖生命周期脚本。@types/node22.20.5实际满足Vite声明范围，semver独立验证true，但不把警告隐藏或算作已解决所有peer问题。
- 候选lint/typecheck通过，384单元/70文件通过，生产构建通过6.78秒；大chunk警告保留。仅隔离产物，不作为可交付包或正式build身份。
- Vite只监听127.0.0.1的合成`.env.handoff-probe`正负例：主页200，?raw/?import&raw/?import&url&inline均403、不含合成marker；子进程与合成探针已正常清理，不读取真实.env。
- 官方候选npm audit为25（high4/moderate18/low3），Vite与undici节点告警均消失；i18n/minimatch/glob/deepmerge仍未整改，安全验收仍不通过。

## 未完成与准确下一步

- 完整生产UI已通过130项（4.1分钟），13项HTTP按该运行配置跳过；结果保存在E盘`dependency-patch-ui.log`。当前没有独立候选HTTP测试服务器，不把根目录13HTTP旧结果冒充补丁后结果。
- 独立`dependency-i18n-candidate-20261101`已由同一26813a6快照创建，继承已验证兼容补丁，完成vue-i18n11.4.16锁解析；已恢复5项无关libc元数据，严格白名单仅根及5项intlify/i18n组变化，原根摘要一致。安装进程92917持续无输出、ci日志为空，额度接近门禁时发送中断并确认exit1；安装未确认完成，lint/type/单测均未开始，不计通过。失败原因未定，不猜测为网络或包问题。下一步核对该候选安装残态，额度恢复后重试严格ci，再逐步lint/type/384单测/build/audit/130UI及安全正负例；不自动改旧minimatch分支或downgrade清零。安装/服务器更新另批准。
- Apifox需用户确认服务端权限/套餐/令牌适用范围，本轮不能盲重试或绕过403。DOC-SYNC-001继续保留。
- 最新额度：五小时余14%、周余10%；每个里程碑复核，五小时低于10%不启动长阶段，任一窗口<=5%只保存停止；不重置或建立唤醒。无桌面控制/SSH，正式产品01cfb13/后端DC9853/独立MCP70E保持。
- 本次未提交：本检查点、验收报告及交接README/CURRENT_STATE/CHECKPOINT的状态增补，以git status为准；无源码/锁变更。Git/Wolai/交接同期保存，不声称交接最终安全签收完成。
