# 国际化规范与西班牙语（2026-10-26）

## 开工与授权

前两阶段版本检查/官网截图下载已安全交付，不重复安装或部署。基线c96b9f4e2a1efb6ba1683b70f112a97037991e89，codex/audit-release-20261006-api，开工Git干净；官网里程碑Git/Wolai主及交接已读回。用户明确批准本阶段开发与验证后的新安全副本、桌面覆盖及网页静态更新；不迁移、不改后端/独立MCP/地址/权限、不发新公开Release。

WACAS未定义/待确认，UPARS1.1.0/交接1.15；开始长阶段5h余59%/周94%，继续遵守10%长阶段/5%硬停，不重置或定时唤醒。

## 必须覆盖

1. es-ES完整应用/官网/项目状态词条，键集合、占位符、数组结构与中英一致；不能靠整套英文回退冒充翻译。
2. 统一三语言选择入口，覆盖桌面/Web工作区、公开官网与登录页；当前官网仅二选切换、登录没有语言入口，需要改为真实PrimeVue选择器。
3. PrimeVue自身日历、上传、密码提示、空结果、分页与aria采用响应式本地化，保留nonce/CSP。当前未配置locale，导致中文也显示Enter a password等英文默认内容。
4. 日期/数字显示尊重应用选择语言，不依赖宿主系统undefined locale；存储/API/状态ID/日期计算/字典校验语义不变。自定义状态及用户数据原样显示，不为翻译重命名真实数据。
5. 专项回归语言切换/持久化/无效语言、组件locale、占位符与完整性、1280/960/375浅深及键盘、真实HTTP入口和桌面合理验证。记录所有未验，不因西语上线改正式生产结论。

## 当前调查/下一步

2026-10-26共享候选最终与实际独立MCP交付（最新）：源70ad16e7b9a89fd59b4fd8bcfbf7f1e6b4f1a689已推送；345/64前端完整复跑通过、lint/type/release、桌面73+stdio1、服务器62+集成19、双方fmt/严格Clippy通过。最终104生产UI零重试及新显式构建服务程序的13真实HTTP串行通过。Linux CI40327970525/server及security成功；artifact12652491089官方归档SHA95D3A709E5C411BB90F296CFA9AD21CFAF867CD160E2EF9FAC18021D000CCF7E，E盘spanish-linux-70ad16e下载核验；唯一ELF10983304字节，SHA C648F69E9BA8830DC177FD1B0D7FED0F9E6268432F51F30004BFE95DCFE727A1，尚未部署。

clean源NSIS SHA47D6E9A23E8338963F39236BD9704DD9F8C80FCF1314CF36B16A8CA6032AD137，桌面exe86B731C0E2B7B449303B31BC6612A61AF9288EC6367E004AE8609AD04126BFEC；首次受限打包makensis系统DLL623失败，宿主环境同源重试成功，未修改系统设置。独立MCP release SHA53521FBD289F406EA1ED422D31E672252B481BBD4593A76DE9277F6B222F927F。发现辅助首次传相对DB路径被拒，改绝对路径后23唯一工具/合成DB摘要不变，无实体写入。用户已逐项授权仅停止PID5836（2026-10-26T16:30:45），新受限副本spanish-mcp-70ad16e-backup-20261026核验后实际停止并替换artifacts/mcp，替换后再23发现/DB保持通过；未改配置/权限，客户端需重连，不等于本聊天已加载新工具。

真实桌面复验等待用户：隔离spanish-native-70ad16e已启动PID26056，窗口ID17960116；只复制既有合成库，不复制账号/密码/WebView，安装侧storage.json明确隔离E盘。通过sky只读确认仍为空登录页，已请用户自行点“不登录，本地使用”，尚未收到回复；不能自动操作认证表单。原安装未覆盖，服务器仍旧网页website-refresh-83adac3与后端31d9b7c，SSH未新连接，无关机。准确下一步：用户切本地→用sky复验中英西切换/PrimeVue日历及深浅/可达窄窗，不操作真实数据→新受限安全副本覆盖桌面→基于CI产物与同源dist制作完整服务器候选，保留旧静态assets、受限服务/unit/Funnel/预算/timers、停服快照及逐字段/ID核验后只更新程序/前端，启动正常TLS及匿名边界核验；不迁移/清库，不发新Release。部署前重新额度门禁，不能因已启动构建而绕过10%长阶段门槛。

新增失败记录：最终生产矩阵首轮103/104，导航几何基准x变化约2.42px；测试未等字体/初始布局，补document.fonts.ready及两帧布局等待（原hover/focus完整几何断言保留）后该用例5次连续通过、随后全104零重试通过；不伪称首轮通过。原前端并行PowerShell超时保留上一条，345低并发完整通过。日志spanish-navigation-repeat、spanish-shared-production-final、spanish-shared-http-final、spanish-contract-final（11通过）、spanish-clean-nsis-retry、spanish-clean-mcp；之前日志保留。

契约已由实际新release在合成库只读发现生成：23工具/7IPC/36动作、66接口/32参考，私有Apifox分组及参考脚本已逐项VERIFIED读回，ID/分组保留；日志spanish-apifox-interfaces（66行）/references（32行）。HTTP19契约/地址/权限未改，不机械重传。当前未提交准确列表：docs/api/MODELS.md、docs/api/apifox-documents.json、docs/api/apifox-layout.json、docs/api/apifox-manifest.json、docs/api/catalog.json、e2e/ui-consistency.spec.js；另本检查点与随后API/交接回执，以最终Git为准。Wolai本轮共享实现/实际MCP交付回执待本节点同步，之前仅前端候选记录有效。标准WACAS未定义/UPARS1.1.0/交接1.15不变，最近额度5h余13%/周86%，未触硬停，但下一长阶段前必须重查。

共享候选里程碑：桌面73单测+1stdio、服务器62单测+19集成、双方fmt/严格Clippy、前端lint/typecheck通过。Clippy仅有宿主增量缓存硬链接失败后复制的编译器环境告警，不是代码lint，也未关闭检查。345前端首次1项失败为Apifox边界脚本在高并发Rust/前端同时运行下超过Vitest既有5秒（实际PowerShell启动7.4秒）；不加超时、不删断言，停止重型并发后以maxWorkers=4完整复跑进行中。未部署，独立MCP不使用会直接覆盖artifacts的package-mcp脚本；先在target构建并隔离发现，停止/替换真实占用另获准。进入clean NSIS/伴随MCP及Linux CI前门禁5h余19%/周87%，大于10%，此节点已保存。准确源以随后提交SHA为准。

2026-10-26用户已明确允许补齐共享校验并安全更新后端/MCP，覆盖下方历史“等待许可”；占用MCP停止进程仍需单独确认。续接基线a92d8b33a6308d4ff5dde8ed5e5e2e9d3df40518，分支不变且开工干净；5h余23%/周88%。已改common/task_status.rs中三条西语别名，UI taskStatus.js同步；MCP tools.rs公开三语冲突名，创建/重命名/导入共用现有边界，不改schema、不清理旧状态、不改权限。增加Rust只读冲突校验/跨项目保留测试与MCP创建/重命名拒绝后原值保持测试、前端所有注册语言默认显示名防漏门禁。桌面Rust73单元+1真实stdio通过；服务器与345前端完整验证进行中。当前7未提交路径：docs/MCP.md、src-tauri/src/common/task_status.rs、src-tauri/src/mcp/tests.rs、src-tauri/src/mcp/tools.rs、src/__tests__/components/TaskStatuses.test.js、src/__tests__/i18n/catalog.test.js、src/utils/taskStatus.js（另本文回执）。下一步完整静态/服务器验证→封存clean候选触发Linux CI/构建NSIS和MCP→契约生成并私有Apifox同步→原生及实际安全部署。设备/线上版本保持前条；没有新SSH或实际库操作。

2026-10-26最终候选复验：产品源5d64039e23665a7f04ae00532aab58143c7d7e86已推送且远端完整SHA读回，工作区干净后build通过；344/64单测、lint、typecheck、release:check、104生产UI（零重试）及独立13真实HTTP全部通过。生产UI中的13 HTTP仅由专用运行器执行并通过，不把跳过算通过。日志在src-tauri/target/audit-tools/spanish-complete-vitest.log、spanish-clean-build.log、spanish-full-production-ui.log、spanish-real-http.log。Rust/数据库/协议无修改，未重跑Rust编译；NSIS与本轮原生复验、安装/服务器交付未做，不能宣称上线或正式发布通过。5小时余24%、周88%，非额度停止。

已将候选源/测试/邮箱与共享校验许可缺口同步Wolai主页面及交接并读回，最终全量结果另同步。此次文档回执修改仅本文与docs/handoff/CURRENT_STATE.md、docs/handoff/README.md；基线分支/标准/设备保持顶部记录，无新设备连接、无关机。准确下一步：等待用户确认是否允许西语状态别名共享服务端/MCP校验及安全部署；同意后定向实现和契约/Apifox同步、完整复验、新安全副本及桌面/Web/MCP相应交付，停止占用连接需另行确认；不同意则按用户选择隔离邮箱单独交付。未获得答复不开始后端修改，不自动清理历史状态。邮箱候选已可点击mailto，未发送邮件，当前线上仍没有该新增入口。

2026-10-26续接：五小时余26%、周余88%；共享服务端/MCP西语别名扩展许可仍未收到，继续只验证并封存前端候选，不部署。联系邮箱仅候选，尚未上线。封存前全部43个未提交路径如下（其中新增9个）：CHANGELOG.md、README.md、docs/NEXT_PHASE_CHECKPOINT.md、docs/PROJECT_PLAN.md、docs/handoff/ARCHITECTURE.md、docs/handoff/CURRENT_STATE.md、docs/handoff/README.md、e2e/landing.spec.js、e2e/project-navigation.spec.js、e2e/smoke.spec.js、index.html、src/App.vue、src/__tests__/components/ProgressEditor.test.js、src/components/ProgressEditor.vue、src/components/RemoteRoot.vue、src/components/TaskEffortInput.vue、src/components/TaskStatusManager.vue、src/i18n/index.js、src/i18n/locales/en-US.js、src/i18n/locales/landing-en.js、src/i18n/locales/landing-zh.js、src/i18n/locales/zh-CN.js、src/main.js、src/modules/calendar/components/CalendarSyncPanel.vue、src/modules/calendar/components/WorkCalendarSettings.vue、src/modules/dashboard/components/DashboardView.vue、src/modules/data/components/DataView.vue、src/modules/gantt/composables/useGanttViewport.js、src/modules/gantt/utils/viewportCalendar.js、src/modules/landing/LandingPage.vue、src/modules/member/components/MemberList.vue、src/modules/project/components/ProjectMemberPanel.vue、src/modules/project/components/ProjectWorkspace.vue、src/modules/task/components/ProjectList/ProjectList.vue；新增docs/I18N_SPANISH_CHECKPOINT.md、docs/INTERNATIONALIZATION.md、e2e/i18n.spec.js、src/__tests__/i18n/catalog.test.js、src/components/LanguageSelect.vue、src/i18n/locales/es-ES.js、src/i18n/locales/landing-es.js、src/i18n/locales/task-status-es.js、src/i18n/primeLocales.js。当前开始完整单测；下一步清洁源构建及104生产UI/13HTTP回归，然后保存实际结果并同步Wolai候选，等待必要扩展权限。无真实账号/项目数据操作。

封存前状态：新增注册语言完整性门禁20/20通过，可自动覆盖未来SUPPORTED_LOCALES，不靠英文回退隐藏漏译；343全量/64文件在最后新增此门禁前通过，后续完整应为344并须实际复跑。无障碍导航/统计/项目视图/日期标签已本地化，原E2E按真实中文标签同步；日期/数字/ISO语义保持。主应用与官网/登录入口均采用真实PrimeVue选择器，已手动IAB切西语并读到Contacto y comentarios · li_you_mu@126.com，未点击邮件链接。

准备提交干净前端候选并跑完整104生产UI+13真实HTTP、344全量及发布静态门禁；NSIS/原生/真实安装部署尚不开始，因为扩展共享状态别名许可仍待。当前5h余29%/周89%，不是额度暂停。服务器仍website-refresh-83adac3-20261026/PID2608，SSH已正常退出，本机已交付安装/独立MCP未动。后端原文诊断和用户数据明确不猜测翻译；共享默认状态西语重复校验不得仅前端补丁。

最终前端阶段：当前主词典701项全部三语言一致，完整343/64单测、类型/lint通过；新10西语+7官网生产定向共17零重试通过，包含三语言持久化/无API请求/strict nonce、日历西语月名与取消不写入。后续补无障碍导航/统计/视图和成员日期标签本地化，同步原测试的实际标签，最终完整104生产UI+13HTTP仍待。IAB960深色手动切Español、官网全文及联系邮箱已实际读回，未点击mailto或发送邮件。发布资料INTERNATIONALIZATION.md已补。

原生/NSIS及真实部署尚未开始，仍等待共享西语状态别名的后端/MCP扩展许可。产品反馈邮箱已在候选页脚展示且有mailto断言，但尚未公开上线。准备封存前端候选并运行最终全量；五小时最新余35%/周90%，不把等待授权说成额度耗尽，不自动重置。仍无数据库/schema/权限/API变化。

2026-10-26候选里程碑：西语主词典原697项与中英键/占位符完全匹配，另新增统一启动错误词条（现698），官网及项目状态西语完整加入。统一LanguageSelect覆盖App/官网/登录，PrimeVue全部已安装locale键/aria与Intl日历名响应式配置；日期显示改显式所选语言，3种数字输入接语言。存储/日期计算/字典ID未改。用户追加公开联系邮箱li_you_mu@126.com，官网页脚已加mailto并补中英西标签及测试，未发送邮件。

已验：19词典/组件locale测试+8相关组件/甘特=27通过，随后完整342/64测试通过，类型通过。lint首轮仅DataView一项格式问题，格式化后通过。编译全词条发现原英文邮箱占位符未转义@，新西语也同样，已用literal interpolation修复并断言correo@ejemplo.com正常。中英引导“内联编辑”纠正为弹窗。PrimeVue locale覆盖避免共享aria对象被修改，测试确认defaultOptions不受影响。

新增西语生产矩阵（官网6+工作区4）与既有官网7正在复验。首次E2E因受限环境回环服务等待超时，未进入UI断言；已在允许的宿主环境重跑，不把环境失败称产品失败。当前没有真实部署/安装/后端/独立MCP变动。

重要待用户授权：新增西语默认状态显示名可能与MCP创建的同名自定义状态冲突；现共享重复校验只含中英别名。为遵循统一服务端校验，已询问是否允许补齐共享西语别名并安全更新后端/MCP（超出先前仅前端许可），未回复前不改后端，不以仅UI校验代替，也不自动清理历史。西语发布暂保留候选；邮箱已记录候选，若用户只先发邮箱须单独隔离交付，不能冒称已上线。

基线/标准/设备如前，阶段五小时里程碑余44%/周91%。当前未提交以git status全列表为准：前端约25已改文件，新增3西语词典、primeLocales、LanguageSelect、catalog测试、i18n E2E及本文；源码尚未封存推送，Wolai本阶段候选待同步。准确下一步：完成西语矩阵并修复→保存/同步候选→收共享别名授权后服务端/MCP与契约同步，或按用户选择仅交付邮箱；随后清洁源完整门禁/NSIS与相应安全部署。未验证原生960/完整键盘仍不冒称通过。

已完整读取en-US词条及已安装PrimeVue4 locale默认源码。日期若干位置使用undefined或系统默认（仪表盘/项目/成员/数据/日历/甘特）；工作日历目前非中文一律en。主应用只支持zh-CN/en-US，官网二选按钮，登录无语言控件。

下一步：完整西语词典→统一LanguageSelect/组件locale/日期数字与完整性门禁→全量回归和清洁源NSIS/原生→新副本安全更新及Git/Wolai/交接同步。当前只有本文未提交，无产品修改。设备：本机原安装版本检查包启动过且数据保持，1420演示服务本任务所有；home-host官网website-refresh-83adac3-20261026、后端PID2608，两timer active，SSH已退出。无关机授权，原生键盘/960工具限制沿用版本专项，不冒称解决。
