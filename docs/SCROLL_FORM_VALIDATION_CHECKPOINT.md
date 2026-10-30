# 甘特滚动与表单逐字段校验（2026-10-30）

范围：甘特纵向滚动及任务新增/修改必填提示。用户已确认指“任务表单”，不改人员表单。全局/项目内共用TaskList，必填红星、提交逐字段校验与中英西错误；日期、工作量、父任务和前置任务不新增必填。

基线03b662d43926ba5e50f65198af13ecb96df04dc8，分支codex/audit-release-20261006-api，开始干净。WACAS未定义，适用UPARS1.1.0/交接1.21/PrimeVue与nonce规范。额度5h余86%/周68%，无关机/重置/唤醒授权。本轮尚未接管桌面或连接服务器，不沿用旧占用进程停止许可。

原因：甘特隐藏全部scrollbar且外wrap不是flex，内部flex高度不生效；大量行被页面overflow:hidden裁切。候选改wrap为受限flex容器、显示主题滚动条，使内部纵向滚动；存在纵向溢出时普通滚轮上下滚，保留Shift纵向/Ctrl缩放，无纵向溢出保留原日期导航，触控板deltaX水平滚。新增6矩阵各44行验证溢出、滚轮scrollTop以及末行可达；单元补普通滚轮与水平手势。

候选：任务名/项目/类型/优先级/状态/排期方式标红星，PrimeVue invalid与字段下Message，首次提交后动态纠错、首个错误获焦；TaskStatusSelect转发真实Select的ARIA/invalid。仅字段必填错误下移，网络及关联保存错误仍保留上方提示。新增共用纯校验器及三语测试。

当前全部未提交：本文；src/modules/gantt/components/GanttView.vue；src/modules/gantt/composables/useGanttNavigation.js；src/__tests__/composables/useGanttNavigation.test.js；e2e/gantt-hierarchy.spec.js；e2e/test-globals.d.ts；src/modules/task/components/TaskList/TaskList.vue；src/components/TaskStatusSelect.vue；src/modules/task/utils/taskFormValidation.js；src/__tests__/taskFormValidation.test.js；src/i18n/locales/{zh-CN,en-US,es-ES}.js；e2e/ui-consistency.spec.js；e2e/smoke.spec.js。

验证：lint/type/build、369单测/69文件通过；44行甘特浅深1920/1280/960共6矩阵通过；逐字段三语×浅深960共6矩阵通过。首次完整界面117通过/13跳过/1失败：旧依赖重试用例草稿未填写类型与优先级，新必填校验正确阻止保存；已在此场景显式选择合法必填项，保留重试且不重复创建断言，完整137项重新执行中。未称全回归/原生通过。

里程碑：完整生产UI已124通过/13真实HTTP由单独门禁执行，独立真实HTTP13通过；最终ARIA条件引用及键盘首错焦点补验6组严格nonce CSP三语浅深通过。lint/type/release一致性通过，构建通过。源代码未改Rust，因此既有Rust复验证据可继承，未声称本轮重新执行。docs/handoff四入口及规则1.22、CHANGELOG已同步候选状态；未提交还包括这些5份文档。既有DOC-SYNC-001备用Apifox导出差异与正式发布未通过结论不变。

下一步：提交候选/隔离原生包复验→在用户本轮许可后安全覆盖桌面/仅网页静态资源→Git/Wolai/handoff同步及读回。已询问本轮安全更新许可，待回复；不沿用前轮授权。2026-10-30本阶段额度5h余67%/周65%，无重置/唤醒/关机授权。当前未连接服务器、未接管桌面；正式环境仍182/独立MCP70E，外部文档未写，部署/原生尚待，API未变无需改契约。
