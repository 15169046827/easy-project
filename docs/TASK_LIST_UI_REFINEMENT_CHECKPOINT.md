# 任务列表/统计/子任务抽屉统一整改

## 完整回归与契约候选里程碑（2026-10-27）

产品源码已封存并推送af72eb5fbec2e10061443789c786a3fa61e07bfa，分支codex/audit-release-20261006-api。clean生产110项通过；真实HTTP首轮12/13，唯一失败是旧统计总高<=80断言与新增工具栏/完整卡片冲突，已改为卡片精确76px、统计不裁剪及原列表>=120px检查，完整13/13复跑通过。最后lint通过，350单测/桌面74+1/服务器62+19/fmt/Clippy等既有本轮证据继续有效。Linux CI40429081924的server/security均success。

clean release MCP已构建，SHA256=187715E8CE2946CEEE470E90EBADB20470FA21AE661342D5740F417DB91FFF43；仅target/release候选，独立artifacts/mcp仍旧53521FBD。通过匹配候选manifest在既有合成库仅initialize/tools/list发现23工具、7命令36动作，数据库摘要不变；catalog/66协议布局已生成，Apifox远端同步尚待。未迁移/清理/操作真实库。NSIS与本轮原生仍待。

本节点未提交准确路径：docs/api/MODELS.md、docs/api/apifox-documents.json、docs/api/apifox-layout.json、docs/api/catalog.json、e2e/web-server.spec.js，加本检查点及交接CURRENT_STATE回执。WACAS未定义/UPARS1.1.0/交接1.16；下一长阶段前5h余16%/周72%，仍高于10%。先提交检查点，再构建NSIS候选、下载并核Linux产物、同步Apifox并读回；原生隔离候选需用户自行选择本地。新UI部署询问尚未回复，不覆盖现安装/服务器/独立MCP，不停止新连接。旧西语线上70ad16e及桌面31656保持，服务器之前SSH成功后已退出；无关机/重置/唤醒授权。Git/Wolai此节点待更新，更新后记录实际源。

本任务拥有的两个1420预览session42712/64614均已正常Ctrl-C停止；上文“仍运行”为历史，不据此声称当前预览在线。HTTP隔离测试已完成并退出，未公开监听。


## 封存候选前复验/失败记录（2026-10-27）

最终350/65单测、桌面74+stdio1、服务器62+19、双方fmt/严格Clippy、类型/lint/build有效。首个新6矩阵因断言误取关联目录get_all（无status）而非带status列表请求全部失败；限定正确查询后又发现测试写成“查询”而项目按钮实为“搜索”、筛选已自动展开父节点导致等待“展开”按钮，均按真实交互修正，未删除断言。折叠后嵌入列表实际增高约22px，移除未经需求规定的至少30px阈值，保留1280正增长/其它尺寸不缩小断言。

完整生产第一轮98/110：旧固定4统计/旧column-toolbar定位、随机初始色不再固定Blue，以及新增嵌入h2造成项目标题严格定位歧义。已使用语义h3、共用filter-bar定位与可用随机色集；动态统计仍保留76px/所有横向对齐及其它页面全部纵向断言，只允许任务的动态统计后区域纵向自然变化。第二轮105/110：统计卡实际77.1875而非76，修文字行高并定高；甘特日期用例点击其它输入时仍开着日历弹层，先断言输入值/正常Escape关闭再移焦，业务排期与保存参数断言保留。上述5项定向全部通过，最终完整110生产/13真实HTTP、clean产物仍待；新增6矩阵此前已全部通过，现另补图标tooltip/Enter及折叠Enter检查。

IAB曾对线上及本机预览超时，按文档恢复后错误页data:URL被Browser Use策略阻断，不绕过、不改系统网络/防火墙/代理，不虚称IAB通过。使用已有项目Playwright生产矩阵截图和后续真实原生验证；仅本任务127.0.0.1:1420宿主预览仍运行session42712，受限旧session64614已Ctrl-C停止。两者不对公网监听。

进入clean封存/完整门禁/构建前5h余24%/周74%，大于10%，先保存本检查点。全部未提交路径（本节点准确清单）：

```text
M AGENTS.md
 M CHANGELOG.md
 M docs/MCP.md
 M docs/PROJECT_PLAN.md
 M docs/TASK_LIST_UI_REFINEMENT_CHECKPOINT.md
 M docs/handoff/ARCHITECTURE.md
 M docs/handoff/CURRENT_STATE.md
 M docs/handoff/README.md
 M docs/handoff/RULES.md
 M e2e/smoke.spec.js
 M e2e/ui-consistency.spec.js
 M src-tauri/src/common/task_status.rs
 M src-tauri/src/mcp/tests.rs
 M src-tauri/src/mcp/tools.rs
 M src-tauri/src/services/task_status_service.rs
 M src/__tests__/components/TaskStatuses.test.js
 M src/__tests__/components/statusColors.test.js
 M src/components/TaskStatusManager.vue
 M src/i18n/locales/en-US.js
 M src/i18n/locales/es-ES.js
 M src/i18n/locales/task-status-en.js
 M src/i18n/locales/task-status-es.js
 M src/i18n/locales/task-status-zh.js
 M src/i18n/locales/zh-CN.js
 M src/modules/task/components/TaskBoard.vue
 M src/modules/task/components/TaskChildrenDrawer.vue
 M src/modules/task/components/TaskList/TaskList.vue
 M src/modules/task/components/TaskStatusStatistics.vue
 M src/utils/statusColors.js
?? e2e/task-list-refinement.spec.js
?? src/__tests__/components/TaskStatusStatistics.test.js
```

下一步：提交/推送候选触发Linux CI→clean build后串行完整110生产UI/13HTTP并继续失败闭环→Windows NSIS/独立MCP候选（不覆盖当前70ad16e）→按实际二进制生成API/Apifox读回→原生合成数据复验→收到新部署许可后新副本交付，MCP停止连接需当时另确认。用户尚未回复本轮部署询问，不将70ad16e交付许可无限扩展。标准交接已1.16，WACAS未定义/UPARS1.1.0。Git/Wolai候选同步待本封存节点；线上70ad16e/后端PID1320与本机PID31656未改变、SSH已退出，无关机授权。


## 已确认需求（2026-10-27）

- 行下子任务抽屉保持左缩进，右侧延伸至接近表格右边界并保留一致间距，不画连接线。
- 状态统计隐藏数量为0的卡片，完整换行展示，不设统计区内部滚动条；支持整体折叠，列表自适应扩展。
- 顶层/全部任务用真实PrimeVue切换图标及悬停提示代替下拉框，显示当前维度并支持键盘；维度与现有分页/筛选语义保持一致。
- 卡片染色清晰不过淡；三种默认状态跨项目固定相同颜色，自定义新增且未选色时随机分配可用颜色集，颜色持久化不随刷新改变。用户已指定的颜色保留，不批量重写历史字典。
- 列表状态与对应统计卡片使用同一字典颜色；点击卡片按稳定状态ID筛选，不通过名称猜测或跨项目合并ID。
- 项目关联任务列表和全局任务列表复用布局、统计、筛选、抽屉与交互，避免两套分叉。项目内固定项目/隐藏重复项目列，全局保留项目列和跨项目筛选。

## 范围、顺序与验证

## 2026-10-27首轮实现里程碑（候选，未部署）

基线48af68e80fc58be44b3e852e0ed4153282ca4db9，分支不变，进入本轮时Git干净，WACAS未定义/UPARS1.1.0/交接1.15。已收敛TaskList的两套头部/筛选/列工具为同一模板（项目内只固定项目/隐藏项目列）；统计为真实PrimeVue按钮、图标维度切换/提示/整体折叠/隐藏0计数/状态ID筛选，去统计内部滚动。table-card测量宽度驱动行下抽屉留边延展；列表/抽屉/看板与统计共用字典染色及黑白高对比文字，不用低透明度。

共享状态新增未给颜色时，从现有八色集中随机选择最少使用色并持久化，显式自定义hex保留；默认Pending/InProgress/Done显示固定灰/蓝/绿，UI编辑未重命名的内置状态时禁用改色并解释，共享服务拒绝相应不同显式颜色；不批量重写历史记录或按自定义名称猜语义。默认名更改后成为自定义状态，可改色。MCP schema已公开该规则和可用色集。新增中英西统计控制/固定色说明，并纠正旧重复名提示漏提西语。

已验350/65单测（其中统计3、配色2新例），桌面74单测+真实stdio1通过；typecheck首轮仅新测试HTMLElement/空状态类型缺失，已补准确类型/字段且复跑通过；lint通过，当前working tree生产build通过（常规大块警告保留）。后续新locale提示改动后最终单测/类型仍需完整复验。server全量正在运行，6个新生产UI矩阵（每例含全局与项目、1280/960/375深浅、严格nonce、折叠/动态筛选/抽屉边界）即将执行；原104+13/Clippy/clean构建/原生与交付未做，不能复用西语交付的测试数称本轮已验。新共享默认颜色/受控配置交付已另向用户询问，尚未回复；停止新MCP进程仍须单独确认。

进入较长界面矩阵前5h余49%/周77%。当前未提交完整20路径：src-tauri/src/common/task_status.rs、src-tauri/src/mcp/tests.rs、src-tauri/src/mcp/tools.rs、src-tauri/src/services/task_status_service.rs、src/__tests__/components/TaskStatuses.test.js、src/__tests__/components/statusColors.test.js、src/components/TaskStatusManager.vue、src/i18n/locales/en-US.js、src/i18n/locales/es-ES.js、src/i18n/locales/task-status-en.js、src/i18n/locales/task-status-es.js、src/i18n/locales/task-status-zh.js、src/i18n/locales/zh-CN.js、src/modules/task/components/TaskBoard.vue、src/modules/task/components/TaskChildrenDrawer.vue、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/components/TaskStatusStatistics.vue、src/utils/statusColors.js、新e2e/task-list-refinement.spec.js、新src/__tests__/components/TaskStatusStatistics.test.js；另本文回执（最终以Git为准）。Git/Wolai本轮候选尚未封存同步；之前48af68e西语/邮箱交付已三方同步读回。设备线上spanish-70ad16e/PID1320、桌面31656，SSH已退出；无真实数据操作/关机。准确下一步：新UI矩阵与失败闭环→完整回归/清洁源封存→契约生成Apifox及原生→获准后全新副本安全交付，不迁移/清理旧数据。

2026-10-27前序西语/邮箱阶段已交付，接下来正式进入本轮UI。恢复起点当前产品70ad16e、文档源5de9522；服务器spanish-70ad16e-20261027/PID1320及桌面已更新，原数据均保持，SSH已退出。尚无本轮UI源码修改；下一步核查TaskList两套头部/统计与抽屉宽度、共享色彩默认和统计状态ID筛选契约，再有界实现与完整回归。5h开工99%有效，下一长节点重新查额度。

用户已确认以上方案，2026-10-27通知额度恢复并继续。先完成当前西语/邮箱候选原生验收及安全交付，再实施本轮UI；不修改父子完成/汇总、估算、字典归属或自动清理真实数据。新增默认颜色策略若改变共享写入默认值，须同步MCP/API及共享边界，不仅在UI随机。

基线1f372783159e94f5361dd063e3612dbcc4784b1d、分支codex/audit-release-20261006-api，开工Git干净。WACAS未定义，实际UPARS1.1.0/交接1.15。开工5h余99%、周85%。当前只记录需求，无本轮UI实现或测试。TaskList已由ProjectWorkspace以embedded复用，但外层统计/布局仍有明显差异，后续先检查再收敛。需覆盖深浅、1280/960/375、键盘/悬停、空数据、动态状态、筛选分页与展开及折叠布局，真实桌面CSP合理复验。

未提交：本文及后续国际化续接/交接记录。Git/Wolai待此节点同步；设备原生spanish-native-70ad16e重开PID27068/window199428，用户已再次切本地并sky核实合成任务，当前主窗无真实账号；home-host SSH首次超时，已请用户确认开机与Tailscale，未连接或变更服务器。无关机/重置/定时唤醒授权。下一步准确见I18N_SPANISH_CHECKPOINT，完成交付后再开始本文件UI实施。
