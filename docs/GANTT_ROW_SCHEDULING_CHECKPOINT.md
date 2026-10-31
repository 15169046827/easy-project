# 甘特逐行排期与层级拖动检查点

## 2026-10-31 开发中（不是已部署）

### 验证里程碑（本节优先于下方早期流水）

- 收尾门禁：修正hover定位后完整生产UI130通过、13专用HTTP场景在该命令中按设计跳过；独立真实HTTP UI13正在执行。最终378单测/70文件、lint/typecheck/build/release元数据过；Windows最新76+stdio1及fmt/Clippy重跑通过，server64+20过。最后仅把日期偏移文本glyph改成PrimeVue angle图标，lint/type/build再过，定向UI收尾待。没有提高超时或忽略失败。

- 用户已批准本轮新副本后更新桌面/网页/必要共享后端，保留数据、不迁移/扩权/公开Release；独立MCP替换及停止连接仍须另核。用户亦授权测试进入本地，但Windows工具禁止自动操作认证页面，不能以用户许可覆盖工具限制；最终候选若停在登录页需人工进入，先完成其它安全检查。
- 最新前端378项/70文件通过（maxWorkers=2，未放宽超时）；先前一次Apifox子进程测试5秒超时已保留证据。定向12生产UI矩阵通过，含未排期逐行选择、日期带入编辑、取消不写入、常驻新增、前后/子任务落点及原边缘/编辑防误触；完整最终UI正在重跑。
- Windows共享Rust76单元+真实stdio1通过、Clippy通过（工具链E盘硬链接失败改复制警告，不是源码告警）；新增5层级测试含原子移动/循环/无效目标回滚/完成父限制。随后补显式parent要求已由server共享编译验证。server64单元+20真实HTTP集成通过。无数据库schema变更。
- 发现并修复初载新增行top动画造成点击错行：取消top动画、保留目标transform反馈。两轮完整UI的悬停测试原先用了被sticky名称列遮挡/异步滚动中的原始坐标，改用Playwright真实可操作hover后定向12全过；最终完整结果待收。未删测试/关闭检查/提高超时。
- 代码/API本地说明/规则1.24/交接已更新，远端Git/Wolai/Apifox仍待同步。正式桌面、服务器和MCP仍保持旧交付，本轮未触碰真实库、未接管桌面或连接SSH。下一步收最终全量UI，真实HTTP前端、最终静态/Rust，再提交候选、同步契约/交接/Wolai、封存Windows包及隔离原生候选；新副本部署必须在相应验证完成后。
- 最新额度：五小时余79%、周余44%，不使用重置/关机/自动唤醒。

- 目标：未排期叶子行框选日期、行内蓝色＋待确认块、显式编辑后保存；末行常驻＋新增及框选新增；一天日期范围；日期偏移箭头居中；名称整列拖动前后插入/作为子任务、拖动影像及树形层级。父汇总日期继续只读。
- 标准：WACAS 未定义/待确认；适用 UPARS 1.1.0、EasyProject长期规则1.23及用户本轮明确的新交互（覆盖旧同级限定/跨行框选创建）。开发在E盘，不操作真实库。
- 基线：分支 codex/audit-release-20261006-api，cf41e9015265b5aaf4f296e6b396adbd8c9390a1。此前最后文档提交网络推送未确认，不能按旧“全部同步”断言远端已有。
- 已改：CreationDragging按来源行保存绝对日序，松手仅草稿；pending按钮再开新增/编辑并带日期，取消不保存。底部新增行不参与排序。移除resize等日拒绝及4rem最小条宽。名称区pointer拖动+阈值/尾随点击抑制，before/after/inside落点、禁止自身/后代目标；既有task/update新增可选order_placement，指定parent并在共享事务内验证落点、整型同级顺序重排，保留现有层级/完成约束。
- 验证：首轮lint曾报CreationDragging超100行，已提取样式函数整改；其后lint/typecheck通过，前端377项/70文件通过（之后新增Esc/同日测试尚待重跑）。定向42项通过。旧服务端层级4项通过，但那次编译未包含刚新增的placement测试；新测试正在单独编译。没有完成全量UI、HTTP、Rust或原生/打包/部署，不宣称验收通过。
- 工作区：e2e/gantt-edge-drag.spec.js、e2e/gantt-hierarchy.spec.js、e2e/smoke.spec.js；src-tauri/src/common/task_hierarchy.rs、db/task_db.rs、services/task_service.rs；src/__tests__/composables/useGanttCreationDragging.test.js、gantt/interaction.test.js；src/i18n/locales/{zh-CN,en-US,es-ES}.js；src/modules/gantt/components/GanttView.vue；composables/useGanttCreateEditor.js、useGanttCreationDragging.js、useGanttPresentation.js、useGanttRowReordering.js；utils/interaction.js及本检查点。后续以git status完整复核。
- 下一步：复核最新静态检查及新增Rust事务回滚测试；补全新交互E2E（未排期编辑、已有日期无效、末行新增、一天、层级拒绝/整树移动/取消）；全量门禁；更新权威API/Apifox、规则1.24、交接/Wolai并读回；再做隔离原生和新包。不能用历史覆盖许可部署；本轮新桌面/网页/共享后端安全更新许可已询问，尚未收到回复。MCP权限不扩展，独立程序是否需替换另核。
- 同步：当前仅本地候选，Git/Wolai/Apifox未同步新行为；既有DOC-SYNC-001仍开，正式发布未通过。
- 设备：本轮没有接管桌面、SSH连接或改正式安装/服务器/真实数据；未重新探测home-host连通性，不沿用昨天在线状态。无重置、关机、自动唤醒授权。额度首次核五小时余97%、周余47%。
