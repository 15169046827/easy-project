# 甘特图层级与统计筛选口径（2026-10-29）

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
