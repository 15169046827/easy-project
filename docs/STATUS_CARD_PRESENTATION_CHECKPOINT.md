# 状态卡固定尺寸与筛选独立统计（2026-10-27）

## 首轮候选封存前里程碑

已获本轮桌面/网页静态安全更新许可。最终353单测/65文件、lint/typecheck/build及15项定向通过；六矩阵第二轮全过，首轮6失败只是innerText插入视觉换行与toHaveText/textContent比较方式不一致，已改为逐卡完整textContent比较，仍精确验证名称/计数及卡片数量。后加状态名前置（项目名后置）避免192px内只看到相同项目名，并增加相应断言，最终完整110+13仍待。新增真实HTTP例在合成项目加已完成兄弟根任务，验证选择待办时表格过滤但两卡文字/数量不变，随后清除回全部。

IAB本轮已成功后台打开127.0.0.1:1420/?demo=1#/tasks，真实演示4任务/卡计数1、2、1，点击进行中表格变2而三卡仍在；深浅截图已目检中性底色/固定宽度/圆点，状态名前置后再次目检。仅内存演示，无账号/数据库写入；临时tab已close，dev session83012已Ctrl-C停止，不保留桌面控制。此前IAB超时为旧任务现场，本轮不冒称仍阻断。

规则1.17/79条、AGENTS已同步本需求。当前准确未提交12路径：AGENTS.md、CHANGELOG.md、docs/handoff/RULES.md、docs/handoff/CURRENT_STATE.md、docs/handoff/ARCHITECTURE.md、e2e/task-list-refinement.spec.js、e2e/web-server.spec.js、src/__tests__/components/TaskStatusStatistics.test.js、src/__tests__/composables/useTaskListQuery.test.js、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/components/TaskStatusStatistics.vue、src/modules/task/composables/useTaskListQuery.js，加本文（合计13，最终以Git为准）。保存后提交/推送clean候选→353及110+13最终回归→主程序/NSIS保留70E伴随，不重建交付后端/MCP→新合成原生及新副本交付。WACAS未定义/UPARS1.1.0，最近5h余31%/周60%，进入后续长阶段重新检查；Git/Wolai本节点待同步，无真实安装/服务器变更，未再次接管桌面。

## 目标、范围与授权

用户要求状态卡不要扎眼，允许圆点配色；固定尺寸不填满整行，状态筛选只影响表格不让其它卡片消失。采用192×76px中性主题底色/字典色圆点、选中边框、固定宽度换行。统计忽略状态条件，保留项目/搜索/优先级与顶层/全部口径，实际刷新而非固定旧快照；不修改字典色或后端契约。

用户已明确批准验证后新E盘/服务器受限副本并更新桌面及网页静态，不改后端、schema、独立MCP、地址/权限，不公开Release。无MCP进程停止、额度重置、唤醒或关机授权。本轮不需要接管桌面时立即清理控制会话，不能占用用户操作。

基线84ed1cfab0d22822cf5d73b670a1afde3a9ce362，分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义，实际UPARS1.1.0/交接原1.16，本轮规则1.17（79条）。开工5h余43%/周62%，长阶段前/里程碑重查10%门禁，5%硬停。

## 已实现与初验

- TaskStatusStatistics使用真实PrimeVue Button，主题底色、字典色小圆点与边框，固定192×76不扩展，标题省略仍有完整tooltip。标签/看板保留原字典颜色，不改数据。
- useTaskListQuery在有状态筛选时增加一个同口径status空、pageIndex1/pageSize1的只读统计查询，与列表原子提交；失败保留原快照并报错，requestSequence防旧响应覆盖。不扩大接口或下载全部数据，CRUD/MCP/数据库不变。
- 新单测覆盖无结果时兄弟状态计数保留、统计失败不发布部分数据及旧统计延迟竞态；E2E fixture真正按状态缩减列表/统计，断言卡片不变、192px宽及圆点与标签同字典色，保留所有原断言。
- 首次14项定向单测通过；lint因useTaskListQuery新增逻辑超过100行（110行）失败，已提取loadTaskPage辅助函数，不忽略/放宽门禁。最终lint/type/build及6生产矩阵进行中；新增竞态用例尚待跑，不能声称完整回归通过。

## 下一步与状态

先收六矩阵/类型等结果并继续失败闭环→353预期单测（最终以实际为准）/110生产UI/13真实HTTP完整回归→clean主程序构建，保持已验70E伴随MCP再NSIS→严格CSP及真实桌面合成候选深浅/窄窗/筛选与卡片尺寸复验→按已获许可新副本桌面/网页静态交付→Git/Wolai/交接同步读回。真实桌面每次新启动仍由用户自行本地入口，不自动认证。旧任务列表专项已完成不重复部署后端/MCP。

当前全部未提交：src/modules/task/components/TaskStatusStatistics.vue、src/modules/task/composables/useTaskListQuery.js、src/__tests__/components/TaskStatusStatistics.test.js、src/__tests__/composables/useTaskListQuery.test.js、e2e/task-list-refinement.spec.js、AGENTS.md、docs/handoff/RULES.md及本文。Git/Wolai/交接状态尚待本节点保存；当前实际桌面B159/网页c2ca28b/独立70E未变，未连接服务器或接管本机桌面，历史设备PID不冒称本次已核。桌面控制上轮已清理，只有本轮隔离浏览器测试进程在运行。
