# 甘特边缘平移与拖动/编辑分离（2026-10-30）

## 最新门禁与下一步

完整lint/type/build、376单元/70文件、130生产UI及13隔离HTTP、release一致性均通过；严格CSP矩阵和视觉截图有效。首次完整UI129通过/1失败为旧availability提示只断言原生title，本轮已改真实PrimeVue；改为ARIA含成员名＋实际悬停提示含成员名后完整130通过，不删除语义检查。固定名称z7/日期头z8高于拖动条z6，避免边缘平移遮挡。Git差异确认src-tauri/server/docs/api/config无改动，API/ApiFox只复核无需重写，独立MCP70E摘要不变；Rust未重跑，继承已交付且未改源码证据。原有DOC-SYNC-001、未签名正式发布未通过边界不变。

全部25未提交文件即下方源码清单＋CHANGELOG/handoff五文件（README/CURRENT_STATE/CHECKPOINT/RULES/ARCHITECTURE）；即将整体提交后工作区应干净。进入最终构建前已保存本里程碑，WACAS未定义/交接1.23、五小时余77%/周54%，未重置或设唤醒。下一步构建当前提交的独立候选，使用新E盘SQLite副本（旧46合成任务，增三组排期，不复制账号/密码）→原生短拖/缩放不弹窗及双击/Enter、浅深复验。电脑控制工具只提供完整drag，不能声称其可模拟长按静止边缘；该持续场景以6浏览器严格CSP矩阵为证据，原生能力边界必须准确记录，必要时请求实际人工确认，不绕过工具。

覆盖许可已询问尚待回复；即使候选通过也不沿用前轮部署许可。无桌面控制/SSH，本轮设备在线状态未重新确认，正式8d80db7/服务器1308/2421/MCP70E保持。源码提交后再同步Wolai候选，不能把候选标已部署。

目标：创建选区、移动任务和左右缩放接近日历边缘时持续横向平移，抵达已加载日期边界时安全延长日期范围；鼠标仍按下但不再移动也应继续。拖动不隐式编辑；任务条双击/Enter或点击名称显式编辑。父汇总日期仍只读，不改层级/后端/API/MCP。

基线9b2a540b86b26f07ff26e4c71df20397651d9929，分支codex/audit-release-20261006-api，工作区干净。WACAS未定义，适用UPARS1.1.0/交接1.22及PrimeVue/nonce规则。五小时余99%/周57%；无关机/重置/唤醒授权。此前最终交付文档重试已成功推至9b2a540，旧Git同步缺口已消除；不重做旧覆盖或样例。

已确认根因：创建拖动只在mousemove时更新且依赖event.target.closest(.gantt)，鼠标出日历后失效，无边缘滚动；任务拖动按整日取整为0时直接openEditor，mouseup不读取释放位置，原生合并move事件时误当点击；父汇总任务mousedown立即编辑。

候选完成：共用useGanttEdgeScrolling按requestAnimationFrame持续平移（48px边缘区、最高600px/s、每次延展21天），采用本地日历日序坐标抵消左侧补日/scrollLeft补偿、避免DST偏差。8px手势阈值，读取最终mouseup坐标；不足一天/回原位不写也不编辑，拖动后650ms抑制误双击。任务条双击/Enter、名称单击显式编辑；父汇总不显示日期缩放手柄，并给真实PrimeVue三语提示。松开、Escape、失焦、隐藏、缩放或卸载停止循环；代际令牌阻止异步nextTick在取消后继续。既有同级排序不变。

验证里程碑：30定向单元通过；类型与构建通过。12组边缘/原层级严格CSP矩阵通过；最终6边缘矩阵额外覆盖实际平移/左右缩放各一次写入、日期跨度保持、提示可读背景、无误编辑，浅深1920/1280/960均过。两张截图已视觉检查；最初新增测试在取消弹窗退场未结束时手动发拖动而误测，已等待真实dialog卸载并断言dragging状态；没有削弱功能断言。最初类型发现fixture未明确返回已初始化实例，改为类型化holder+运行断言，不用ignore。完整门禁、原生候选和实际部署尚未执行。

当前全部未提交：本文、docs/SCROLL_FORM_VALIDATION_CHECKPOINT.md；e2e/gantt-edge-drag.spec.js、e2e/smoke.spec.js；src/__tests__/composables/useGantt{CreationDragging,TaskDragging,Presentation,EdgeScrolling}.test.js、src/__tests__/gantt/interaction.test.js；src/i18n/locales/{zh-CN,en-US,es-ES}.js；src/modules/gantt/components/GanttView.vue；src/modules/gantt/composables/useGantt{CreationDragging,TaskDragging,Presentation,EdgeScrolling}.js；src/modules/gantt/utils/{interaction,dragCoordinates}.js。即将同步CHANGELOG及handoff六文档，加入本清单。

下一步：完整lint/type/单元/生产UI/隔离HTTP/release门禁→保存干净源→隔离真实桌面（新窗口认证入口按工具人工边界处理，其余自主）→用户本轮许可后的新副本覆盖/仅网页静态→Git/Wolai/handoff读回。已询问本轮覆盖许可，待回复，不继承旧许可。无桌面控制/SSH，本轮设备未重新连接确认。正式部署仍8d80db7，后端1308/2421及MCP70E不变。里程碑五小时余84%/周55%，无关机/重置授权。
