# 甘特逐行排期与层级拖动检查点

## 2026-10-31 候选已封存，等待解锁完成原生复验（未部署）

### 当前准确续接（优先于下方历史开发流水）

- 保存前额度复核：五小时剩余51%、周剩余40%；当前等待原因是锁屏/原生人工入口，不是额度不足，不自动建立唤醒任务。

- 产品提交 `b144954a7173efeeff78a5cf779f7888165e2c67` 已推送既有分支；此前cf41e90文档推送缺口随本次安全非强制push补齐。后续仅契约生成/同步回执及一天预览测试增强，产品源码没有再改。
- 最终门禁：378单元/70文件，完整生产UI130通过（13专用HTTP另跑），独立真实HTTP界面13通过；最终包的12严格nonce CSP矩阵通过，再补一天缩放预览及Escape恢复6矩阵通过。Windows76单元+真实stdio1、fmt/Clippy、server64单元+20 HTTP集成全部通过；GitHub服务器CI `41164270914` 对本产品SHA的server/security两job成功。lint/typecheck/build/release元数据及diff通过。未弱化超时/规则/测试；首轮Apifox子进程超时、悬停坐标错误及初载top动画根因与整改在下方保留。仅原生实际点击/拖动尚未通过，不能把浏览器当原生。
- Windows原程序：`src-tauri/target/release/easy-project.exe`，18,763,264字节，SHA256 `0C8107D872E6CAA72F285E812B9F8CE47DC75608637624209668BCEDE328488E`；安装包 `src-tauri/target/release/bundle/nsis/EasyProject_0.1.2_x64-setup.exe`，6,897,996字节，SHA256 `A4CE8B491C7279DFD7EBF6227E574476E742F577C150AF0FE8CF50C034BC33AA`。首次makensis系统DLL重定位623失败；仅以受审查普通环境安全重试成功，没有系统安全设置/依赖变化，不拿旧包替代。构建时仅生成契约文档未提交，产品源码与b144954一致，不能称那时工作区完全clean。
- 隔离候选：`src-tauri/target/audit-tools/row-scheduling-native-b144954`，PID43376（仅本次观测），返回窗口4196646；2合成项目/46任务，来源旧合成库`scroll-form-native-6bb85ab`经SQLite backup，源SHA保持、完整性ok/外键0，未复制账号/凭据。候选exe与上方raw SHA一致。helper `prepare-row-scheduling-native.cjs` 已执行，不能对同目录重跑；若窗口消失，先核进程，重启同候选，不重造库。
- 原生只读观测显示本地入口，但截图明确Windows锁屏，立即停止并reset桌面会话，无任何点击/键盘/拖动。用户已外出，另发一次解锁并进入候选本地的请求；用户虽授权工具操作登录页，仍不能覆盖工具的认证UI禁止规则。不得透过LockApp输入、改系统工具/安全设置或注入登录状态。候选保留，控制已释放，无SSH留跑。
- 官方Linux候选：run `41164270914`、artifact `13028179144`，唯一`easyproject-server-linux-x64`，GitHub ZIP大小4,483,048，官方digest及本地SHA同为`404497e0a04aee9741115352fd832d5a8963d6be2b127e2d83188fcb704fff4e`。E盘`src-tauri/target/audit-tools/row-scheduling-b144954-server.zip`已下载，先验证唯一安全条目再解压；`row-scheduling-b144954-server/easyproject-server`为ELF、10,972,160字节，SHA256 `DC985353C444DDD65B5CE5F263610DDBD759CD27F3B4710297AB30E610D0830D`。未执行/上传/部署，不能把CI成功说成服务器运行验收。
- Apifox：按b144954重绑文档源，保留旧独立MCP70E的23工具Schema并校验其摘要未变；66原生协议内容/名称/路径/分组及32参考已写后读回，HTTP仅更新`post__api_workspace_action`（526827488），全19主JSON/分组/权限说明复核通过。备用text/plain和空security导出差异DOC-SYNC-001仍保留，不称全媒体等价。仅内部IPC/HTTP新增order_placement；MCP公开参数/权限不变，无独立程序替换/停止许可。
- Wolai主状态`gS9pEWJsQ1eiqGEzLnNUwF`、交接`oLvsZ6M65HtTfFsJmg8ptD`已追加“2026-10-31候选b144954”并两处精确读回；规则1.24及本地架构/状态/入口/CHANGELOG已对应。正式桌面/服务器仍旧5f5bc78交付，本轮实际安装、后端重启、数据库、MCP和真实业务数据都未改变；home-host尚未本轮连接，不能沿用旧在线确认。
- 本里程碑提交前未提交项为6个API生成/manifest文件（MODELS.md、apifox-documents.json、apifox-layout.json、apifox-manifest.json、catalog.json、web-apifox-manifest.json）及e2e/gantt-edge-drag.spec.js；另本次检查点/交接/API入口收尾纳入同一回执提交。恢复必须以git status复核，勿丢弃新用户改动。WACAS仍未定义/待确认，实际UPARS1.1.0；额度最后五小时余66%、周余42%，无重置/关机/定时唤醒授权。

准确下一步：用户解锁并完成同一候选本地入口后，先核Git/额度/进程与包SHA，然后原生合成任务验证逐行＋确认/取消、已排期行无效、末行新增、一天保存、名称整列前后/子任务拖动及环拒绝、子树随动、键盘、深浅和窄窗。结束正常关闭候选并立即释放控制。通过后才执行本轮已批准的全新E盘和服务器受限安全副本交付：安装脚本须重读并重新绑定新包/正式路径/全部原文件与逻辑库，后台只更新本轮共享后端及静态，不迁移、不清理、不扩MCP权限，不公开Release。服务器须先新鲜只读核home-host身份/current/旧后端SHA及配置/两库，再准备绑定新DC9853和b144954的守护部署脚本，不能盲跑旧182/edge helper；保留旧assets及配置Funnel、原数据核验、正常TLS/匿名边界，最后Git/Wolai/交接实际交付回执。不要重建/重下载已封存有效产物，除非原生发现产品问题必须改源。

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
