# 甘特图层级与统计筛选口径（2026-10-29）

## 最新续接：bcc6366候选完成，原生待解锁（尚未部署）

产品提交bcc636685d96de7e31dcfbcd37a02a66f69f0e99已推送，前轮883/c083/672文档一并补推。361/67、118严格CSP UI、13独立真实HTTP UI（含本轮顶层/全部切换）、Rust75+stdio1、服务器63+20及lint/typecheck/build/rustfmt/两端Clippy过。API66原生和32参考分段写入/读回、HTTP19主JSON验证通过；DOC-SYNC-001继续保留。规则1.21/79条、WACAS未定义/实际UPARS1.1.0。

Windows build未打包时SHA B69B01DA5C7A6568AD3A813302DAB213BD5E73C0D69D4D5AC962F00F274A53AA；Tauri bundle标准NSS标记后最终A03245EE02BDD9711871CE96EC32B556BE76A2FD0843379B2E3AE1872FEC0EFB，NSIS29976FD1E92CF519E9FA1D88BB34024B1D004342AA1B163C4CFE1F79969EF271。首次受限makensis系统DLL装载623，正常进程重试成功；因上次已写NSS标记，重试提示找不到未标记变量，不启用Updater或放松检查。新生成MCP50AA另存unused，包内companion已恢复70E，独立不改。

Linux CI40820950262成功，source bcc6366；artifact12874029588/4489855字节，ZIP SHA f9ed2f24d1a994406fee96d75e470b3c70398fe8ed2b5000853811e2bc485a6a。宿主gh两次下载网络断开，改为GitHub官方临时签名地址由自有home-host续传，未向服务器发送GitHub账户令牌，临时URL不落盘。最终服务器ZIP摘要与官方一致，ELF解包/本机封包待。

隔离候选路径src-tauri/target/audit-tools/gantt-native-bcc6366-final，2合成项目6任务，复制合成库后添加三条日期和一条FS边，源库摘要保持、无账号/真实项目复制，完整性通过。失败的首次准备目录保留，错误为测试helper误用不存在的project_id列，事务回滚后新目录纠正，不是产品库更改。候选已打开window787304；首次激活失败，刷新捕获确认桌面锁屏，已立即停止并reset控制，未操作登录表单。已请求用户解锁并点候选本地入口，其余例行检查自行完成。

设备：home-host已SSH登录、服务active、当前priority-palette-abc1e9e-20261028，服务器83GiB可用，无cargo；仅上传/下载构建包，服务/真实库未动。SSH会话17973仍用于候选准备。客户端Windows控制已释放。5h剩45%/周76%，无关机/重置/唤醒授权。用户已批准本轮副本后桌面+网页+必要后端安全更新，不迁移/清理、不改MCP权限、不公开Release。

准确下一步：核ZIP成员并解包ELF摘要→封存服务器payload/安全部署脚本→本地API生成回执和本检查点提交、Wolai主/交接同步→用户解锁/本地后原生浅深/宽窄/键盘与排序复验，立即关闭释放→新的E盘/服务器受限副本后安全交付→核全部原非程序文件/全部数据库字段ID/配置Funnel不变→正常TLS/未授权401与最终Git/Wolai/交接回执。不能把候选当已上线。

当前未提交：docs/api/{MODELS.md,apifox-documents.json,apifox-layout.json,apifox-manifest.json,catalog.json,web-apifox-manifest.json,README.md}、scripts/group-apifox-api.ps1（增加严格ResumeFrom，仅可跳过已验证且目标哈希/分组匹配的条目）、docs/GANTT_HIERARCHY_CHECKPOINT.md、docs/handoff/CURRENT_STATE.md。后续提交以git status核对。Wolai本轮同步待；本地文档与代码候选一致。

以下是开始及中间里程碑记录，不覆盖以上最新状态。

用户授权开发：顶层状态卡只按顶层状态入选，全部模式跨层并保留父上下文；搜索仍跨层。甘特图填满日历宽度、左导航移至日历边界、冲突列出任务并高亮、同级拖动排序、未排期空白行、完整父子树可折叠、父日期汇总已排期子项。拖动不改变父子关系；父条汇总不允许单独移动日期。

基线67295df2926b06275ff664373ec5fbec9972f09c，分支codex/audit-release-20261006-api，开始Git干净；WACAS未定义/待确认，实际UPARS1.1.0/交接1.20/PrimeVue与nonce规则。5h余82%/周82%，所有维护者构建/缓存/副本在E盘；无关机/重置/唤醒授权。当前真实安装/网页仍优先级abc版，不操作真实业务库。

已确认：甘特图仅遍历datedTasks、未排期移到下方，因此缺少完整层级；日历初始35天×42px可能小于视口，左按钮固定8px覆盖名称。后端已有同项目同级原子swap_order可复用；父summary已有日期聚合与禁止独立拖动的保护。顶层卡只改变统计Scope，查询仍全层status匹配，因此卡片/入选口径不一致。

## 实现与验证里程碑（2026-10-29，尚未部署）

已完成scope验证/根自身状态筛选及兼容旧all_tasks；ganttTaskRows稳定DFS包含未排期、折叠整树并只读汇总日期，全部行用于高度/依赖坐标；同级名称拖动和键盘上下复用原子swap_order；父日期按钮禁用。视口ResizeObserver扩日期填满，左导航在日历边界。固定日期冲突列真实任务名并高亮行/bar；未排期不误报固定日期冲突。深色网格/今日/休息日改用主题变量避免刺眼白格。交接规则更新1.21/仍79条，无MCP Schema或权限变化，无数据迁移。

已执行：JS361/67文件、Rust75、stdio1、服务器63+HTTP20、两端Clippy -D warnings/rustfmt、lint/typecheck/build通过；完整严格CSP UI118（另13真实服务器用例不在该入口执行）及独立真实HTTP UI13通过。甘特6矩阵覆盖1920/1280/960浅深、日期填宽/导航/未排期/父范围/折叠/同级拖动；查看截图发现并修复深色网格对比，再跑最终完整矩阵。新增真实UI顶层/全部切换回归正在复验。

失败与处理：初始普通权限本机预览超时，获准回环服务后通过，未增超时/放松CSP；旧甘特一次重试依赖警示未出现，单项重跑与完整118均过。初始lint函数长度改为小辅助函数，未屏蔽检查。HTTP新增测试首次400是测试遗漏原生必填字段，补全后过；不修改接口来迁就测试。Rust增量缓存硬链接失败自动复制属环境告警，Vite既有大chunk警告保留，未提高门槛。

2026-10-29用户已批准本轮安全副本后更新桌面/网页/必要后端，不迁移/清理数据库、不改MCP权限、不公开Release，独立MCP不替换。当前真实安装/服务器仍优先级abc版，本轮未SSH或接管桌面，设备连接未重新确认。5h剩58%、周78%，无重置/关机/唤醒授权。

最终切换回归与深色修复后完整118/真实HTTP13均通过；真实UI确认顶层Done只入选Done根、切全部显示匹配子项及祖先、切回口径还原且卡计数重新计算，未冻结旧数。所有候选门禁通过，原生和交付待。

准确下一步：干净产品提交/补推旧文档→Windows候选和新Linux CI来源→Apifox66/32/19同步读回（DOC-SYNC-001仍开）→原生合成库浅深/宽窄/键盘→新的受限副本和已批准交付→Git/Wolai/交接最终回执。所有维护者文件在E盘。Wolai本轮尚未同步；本地API和handoff已更新候选。

未提交文件（此里程碑完整清单）：AGENTS.md；docs/GANTT_HIERARCHY_CHECKPOINT.md、MCP.md、api/DESKTOP_IPC.md、api/README.md、api/web-openapi.json、handoff/{README,RULES,CURRENT_STATE,CHECKPOINT,ARCHITECTURE}.md；server/tests/web.rs；src-tauri/src/services/{task_service,task_tree_service}.rs；src/__tests__/calendar/scheduling.test.js、composables/useTaskListQuery.test.js、gantt/taskRows.test.js；src/modules/calendar/utils/scheduling.js；gantt/components/GanttView.vue、composables/{useGanttPresentation,useGanttViewport}.js、utils/taskRows.js；task/components/TaskList/TaskList.vue、composables/useTaskListQuery.js；e2e/{gantt-hierarchy,web-server}.spec.js。精确状态另以git status核对。
