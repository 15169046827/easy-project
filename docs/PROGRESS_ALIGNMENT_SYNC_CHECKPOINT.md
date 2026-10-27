# 进度列对齐与同步复核（2026-10-27）

## 用户截图重开：漏检子任务抽屉，新增本地人工验收数据要求

最新验证：354单测/65、类型/lint/build、8抽屉矩阵全部通过，13真实HTTP通过。首次并发完整UI111/112，唯一失败是既有甘特创建日期输入被日历覆盖回旧值（预期2026-07-17/收到2026-06-28），不是抽屉新断言；保留日志，不删测试/放宽断言，降低并发至2完整重跑进行中。本地MCP两个进程的--database均已核为安装侧E盘project_manager.db，尚未真实新增验收数据。最新5h余35%/周47%。用户要求的人工数据将仅通过正式共享服务/MCP创建新项目及示例，前置任务因现MCP未公开关系写入字段，需在已授权的新示例项目内通过PrimeVue编辑表单补充，不能直接写SQL或把前置关系伪装进备注。

用户复报“仍右对齐”并提供1920宽屏截图后，已确认前轮只验证外层TaskList，截图实际指TaskChildrenDrawer：child-main弹性填充，状态Tag及百分比宽度随内容变化、整体靠右，使长短状态与0%/100%起点不同。此前前轮外表修复/部署是事实，但不能当本问题已完全解决；本轮重开，不以缓存或用户操作解释。

当前基线a54733e0e86853361b06b2f18a89bd91ecf9f5c1/原分支codex/audit-release-20261006-api，Git原干净。候选仅TaskChildrenDrawer新增14.7rem固定度量组、8:6状态/进度双槽左对齐，Tag仍真实PrimeVue、长值截断完整tooltip，百分比等宽数字；多层递归共用，不改模型/后端/MCP/字典色。新增单测未知进度保留、8生产矩阵增1920/长短状态/0和100/多层及槽起点与宽度断言。首轮fixture tuple类型及英文断言Unestimated与实际Not estimated不符已修，保留失败记录，最终复验仍在进行。

用户新增明确授权：修复后在本地造独立“近期功能人工验收”项目，覆盖近期功能，保留原项目、不删除或覆盖、不向远端写入。计划用正式MCP共享服务创建合成项目、人员/团队、默认和自定义状态/颜色、父子孙任务、0/100及未估算/明确0、前置任务、长文本和各优先级；写前核精确本地E盘DB及程序摘要/服务自动恢复点，保存ID清单及实际读回，不盲重试。先准备/验证生成器及隔离同构样例，最终真实本地新增在安全更新后进行。尚未创建真实验收数据。

本轮仍属原“进度列修复”纠正范围，沿用已明确的新副本桌面/纯静态更新许可，不改后端/数据库结构/独立MCP/地址权限或新Release；若新增实际冲突/风险另确认。准确下一步：抽屉8矩阵及完整112/13/354门禁→保存clean源→包/隔离原生子任务抽屉深浅/合成库保全→新受限副本桌面/静态纠正交付→本地独立人工验收数据正式写入/读回→Git/Wolai/交接同步。认证人工边界仍保留，空闲及时reset，不拿真实项目做验收操作。当前未提交仅TaskChildrenDrawer.vue、TaskHierarchy.test.js、task-list-refinement.spec.js及本文；WACAS未定义/UPARS1.1.0/交接1.19。最新5h余41%/周48%，无重置/关机/唤醒/新MCP停止授权，设备本机已知、服务器本轮未重连。下方“交付完成”仅前轮外表改动历史。

## 本轮交付完成：桌面及网页已更新，控制已释放

最终同步回执：ead30abb8526c9f1466e6c9fa5d318860b094a19已Git推送/远端完整SHA一致；Wolai产品主页面和交接副本按该提交补充实际交付事实，并分别读回确认。本地入口/规则/架构/计划/发布说明/同步报告与本检查点一致，无本轮记录同步缺口；DOC-SYNC-001是已公开的HTTP格式差异待办，不等于待部署。本回执仅文档补记，不改产品/包或重复安装。

用户已明确点正确候选的本地入口；原生1282×802全局/项目内浅深50%与100%起点/条宽稳定，正常X退出后候选进程0，合成所有表hash保持/integrity ok/FK0，立即reset。未冒称本轮原生960/375或完整辅助技术测试，相关6浏览器严格CSP矩阵及353单测/110生产UI/13独立HTTP有效。主题切换即时过渡截图未作为最终证据，另取稳定主题验证；首次候选未保持运行和测试服务启动超时失败仍保留。未修改Rust或重跑全库安全审计。

网页已实际交付progress-71de9e0-20261027：新root700副本/72文件/491旧assets保留，B15571B7后端和PID1893未重启，两库全字段/schema/对象/integrity/FK、服务配置及Funnel保持；正常证书HTTPS2HTML/CSP/no-store/71静态摘要/4匿名401/health200/邮箱与西语通过。SSH49193已exit，不重复部署。

桌面已使用执行HEAD ef9f10a21b5dcf7e4efefdc100f40b00551f2289（仅文档后继、产品/clean构建71de9e0）安全覆盖。fresh观察真实window3279194实际为无草稿本地仪表盘，不是旧登录快照；正常X退出后installer守卫确认进程已停，未强杀。新E盘受限副本dictionary-overwrite-progress-71de9e0-20261027保存742文件；739非程序SHA、全部原DB行hash/完整性/外键及独立MCP保持，installer exit0。最终main45AEF6A9C58A68955532762A19A65B5D2F975585E1D784550316BA987BA76F9B，与候选0080C114仅14694112—14694114三字节UNK→NSS，18736128字节长度一致；伴随和独立均70E303F8全摘要不变。启动后PID29832/window7606276只读确认默认登录/本地入口且无PAGE_RENDER_FAILED，未操作账号字段，立即node_repl reset；再核全部原DB行hash与新副本相同/integrity ok/FK0。

本轮无待许可/待本地/待安装/待部署。仍保留DOC-SYNC-001 HTTP备用媒体导出格式待办（不是MCP状态颜色漏同步）；66原生/32参考读回一致，近期UI变化无新协议不重传Apifox。源71de9e0，交接规则1.19/79条、WACAS未定义/实际UPARS1.1.0，最新5h余49%/周50%（最终同步前）。Git/Wolai/交接本完成节点将在提交后同步并读回，有缺口须追加，不冒称正式生产发布通过或新公开Release。无关机/重置/唤醒/新MCP进程停止授权。下方全部为历史节点。

## 网页静态已交付，桌面覆盖待执行

重新核home-host/current旧status-cards-697e54f、PID1893/User easyproject、archive6360/helper4d52完整摘要及AST后，执行已批准静态专用helper。新release=/opt/easyproject/releases/progress-71de9e0-20261027，新root700受限副本=/var/backups/easyproject/progress-71de9e0-20261027；72交付文件/491旧assets保持，后端B15571B7/PID1893未改变且未重启，2DB全表/schema/对象/integrity/FK及service配置/Funnel保持，三服务/timer active。正常证书HTTPS2HTML/CSP/no-store/71静态SHA/4匿名401/health200/邮箱及西语负载通过，无真实账号登录或实体操作。SSH49193已正常exit。下一步仅桌面fresh无草稿检查→正常退出→新E盘副本覆盖及启动核验，不重复网页部署，不修改MCP。当前仅本文待提交；源包71de9e0不变。

## 原生复验通过，进入已批准安全交付

恢复基线fb1a62dc425bbf501e9972c5fd518dcb22297f03，Git干净，额度5h余57%/周51%，原生后余52%/周50%。用户已明确点击正确窗口本地入口；fresh Sky核精确progress-native路径/window2952196，3合成项目4任务。实际1282×802全局/项目内浅深50%与100%左起点一致、条宽稳定、PrimeVue样式及标题/导航正常，严格桌面CSP未放宽；主题过渡即时截图为中间态，另取过渡完成截图才判通过，不将浏览器375/960结果冒充原生窄窗。未做写入/编辑或认证操作。候选正常X退出，随后进程计数0，所有合成表hash与封存前相同、integrity ok/FK0，立即node_repl reset释放控制。

接下来新连接核home-host/current/PID及6360/4d52摘要→已许可新受限副本和静态切换→正常证书HTTPS核对→真实安装fresh观察安全关闭后新副本覆盖→启动保全/三方回执。此节点仅本文待提交，产品/包仍71de9e0，不重新构建/上传/替换MCP；WACAS未定义/UPARS1.1.0/交接1.19。此前等待用户本地入口已解除，下方为历史。

## clean候选已准备，等待正确窗口的人工本地入口

产品/clean源码71de9e0be35b7446ebd339dd8e064bbc7e12974d已推送，提交实际15文件（下方14为笔误）。353单测/65、110完整生产界面、13独立真实HTTP、6双页面/深浅/三宽矩阵、类型/lint/build/release全通过。IAB合成100/65/35/0%百分比左边同为1093.8125、条宽均56，深浅目检通过；临时tab/1420/CUA会话已清理。

clean no-bundle后恢复已验70E伴随再NSIS，独立MCP未改。main SHA0080C114969E9B9E6BD7606DE626512DEC500ACA890FA196AFC259F3D0865280；NSIS A601727983C46F003266C89C215C34935B6A94157E249C0F0943E76281667C08。新隔离progress-native-71de9e0仅3合成项目/4任务/9状态，原合成全表hash/integrity/FK基线已核，未复制账号/密码/webview。

用户说未看到候选：最初默认执行未保持候选进程，Sky启动后只发现真实安装，未将其当候选或操作认证。随后显式获准绝对路径启动正确PID28652，fresh Sky返回window2952196/app=精确progress-native路径，已激活并目检用户名/密码空白。仍需用户在此点“不登录，本地使用”；已提示置前，立即node_repl reset。真实安装PID44012/window3279194停留登录，未关闭/覆盖，不能沿用早先“不运行”快照。

服务器已SSH确认home-host/current=status-cards-697e54f-20261027、PID1893/User easyproject。72文件静态包已上传：archive6360d7f815d6297c09e78f161a831760856f14477af46b0bc8507acd2cac0a33/helper4d527507d7b5c6033c08d483e831345d7307456c60763c1dbdee3c34546d71a9，远端摘要匹配/AST_OK。SCP exit0伴socket pending提示，已独立核摘要，不盲重传。静态helper已完整审查，仅替换旧current/新路径及来源常量，保留后端/PID/两库/配置/Funnel/旧assets/仅程序回滚保护。尚未sudo执行或建立新服务器副本/切换。SSH57881已exit，无后台控制/测试/构建/上传或连接留跑。

下一步：用户确认正确候选本地→fresh枚举路径和窗口，原生表格对齐/深浅/CSP与合成库hash→正常关闭/reset→查额度→重新核服务器current/文件摘要后新受限副本纯静态交付（名progress-71de9e0-20261027），正常TLS verify-progress-https.cjs→真实安装fresh观察无草稿正常关闭→已读install-task-ui-2a5904d.ps1传新NSIS摘要/当时HEAD/新SafetySuffix progress-71de9e0-20261027→原文件/DB/独立MCP保持、main完全相同或仅标准UNK→NSS三字节→启动保全→最终三方同步。部署范围已批，不重复问，不停止新MCP或关机。

Git/Wolai主与交接已按71de9e0同步读回；本候选回执另提交。HTTP DOC-SYNC-001仍明确待办，不伪称全字段等价。最新5h余71%/周53%，WACAS未定义/UPARS1.1.0/交接1.19；下方首节点为历史。本机副本/缓存/产物均E盘。

## 当前检查点

目标：统一全局/项目内任务表进度起点，核实近期状态字典、颜色、受控写入及父子任务契约的MCP/Apifox与文档同步。WACAS未定义，实际遵循UPARS1.1.0及交接1.18。基线分支codex/audit-release-20261006-api，提交7f792fe3a94349644940e2592cd6fbfbfe41d542。

实现：TaskList进度内容改固定3.5rem进度条+固定百分比槽的左对齐grid，数字采用tabular-nums；列宽6rem→9rem，留足100%及单元格内边距。两任务列表共用同一组件。新增0%/100%起点、56px条宽、内容不溢出断言。

验证：353单测/65文件、类型/lint/build及6生产严格nonce矩阵（1280/960/375、深浅、每例全局与项目内）通过；完整生产110通过，13真实HTTP专用用例按测试入口正常跳过，不能写成123全过。首次E2E本地服务启动超时，保留失败；获本地服务执行权限后6/6通过，没有关闭CSP/跳过断言。Rust、schema、API输入输出、独立MCP未修改，不冒称本轮重跑Rust审计。

同步复核：本地与远端当前客户端均已发现task_status list/get/create/update/delete五工具，create/update公开color及自动配色/固定内置色/三语别名防重。独立程序70E与catalog来源2a5904d对应。Apifox私有8948094/main8751742的66原生协议全部明确GET读回，内容与本地layout、manifest摘要、名称、路径、协议及分组一致；32参考全部摘要一致。HTTP19均读回，但逐字段全等比较19项不通过：以health权威详情确认导出省略空security及错误text/plain备用类型；不能以此前只核JSON主Schema的门禁冒充全格式等价。详见同步复核报告，非MCP颜色功能遗漏。

授权：已明确允许新E盘/服务器受限副本后更新桌面及网页静态，保留账号/项目，不改后端、数据库、独立MCP、地址、权限，不新建公开Release。没有新的关机、停止MCP连接或额度重置授权。

下一步：保存核对报告与当前/历史边界→提交clean源码→构建前端桌面候选（保留70E伴随）→隔离原生CSP与合成库复验→新副本桌面和纯静态交付→安装/原文件数据库/正常TLS核对→Git/Wolai/交接最终回执。HTTP格式差异保留明确待办，先查Apifox多媒体响应表示能力再设计修复，不能盲写或改业务响应迁就文档。

封存前未提交准确14路径：AGENTS.md、README.md、CHANGELOG.md、docs/MCP.md、docs/PROJECT_PLAN.md、docs/api/README.md、docs/handoff/ARCHITECTURE.md、docs/handoff/CURRENT_STATE.md、docs/handoff/README.md、docs/handoff/RULES.md、e2e/task-list-refinement.spec.js、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/utils/taskColumns.js及本文/同步报告（合计15，以Git为准）。交接摘要校正为1.19，未新增规则ID。最新额度5h余71%/周53%；本机可用，服务器本轮尚未连接，不沿用昨日在线结论。尚未构建或部署本轮修复，Wolai待同步。没有接管桌面。
