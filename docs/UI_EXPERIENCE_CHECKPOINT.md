# 界面体验整改检查点

2026-10-10。目标：用户10项任务页体验整改，另统一仪表盘/项目/任务/人员/相关页面的标题、统计、筛选和外边框基准线；保持功能、数据和最小权限。

- 标准：token-saver、EasyProject维护规则、既有UPARS1.1.0及项目质量门禁；WACAS未定义/待确认。
- 基线：codex/audit-release-20261006-api / 15f99122b1296fdf6c233b56d73f974de8b8a0f6；开始工作区干净。
- 已完成第一轮：任务统计图标静态；固定名称与列宽、列选择及偏好保存；父/前置默认展示，跨分页/筛选查询项目关联目录；前置统一MultiSelect且可清空；删除改Dialog；搜索清空按钮；延迟200ms显示真实加载状态，启动主题背景提前初始化；悬浮窗入口增加文字。未修改真实库或客户端MCP权限，未安装新程序。
- 初步验证：Vue类型检查通过；ESLint发现useTaskListQuery超过100行，待拆分整改，不放宽规则。浏览器1280×800实测发现名称占位拖动区造成额外缩进、日期换行和分页选择框过宽，待修正。预览工具已可用，不再沿用历史不可用结论。
- 当前未提交文件：src/App.vue、src/i18n/locales/{zh-CN,en-US}.js、src/modules/task/components/TaskList/TaskList.vue、src/modules/task/components/ProjectList/ProjectList.vue、src/modules/member/components/MemberList.vue、src/modules/task/composables/useTaskListQuery.js、src/modules/task/utils/taskColumns.js、src/composables/useDelayedBusy.js、index.html、public/theme-init.js、本检查点。恢复必须核对完整git status --untracked-files=all，不覆盖其它用户改动。
- 未解决：上述3布局问题与函数行数；单位/浏览器回归待补；用户新增跨页面统一布局待实施；最新安装包及悬浮窗入口需交付，当前旧安装不自动覆盖。
- 准确下一步：修初步发现的问题，统一共享布局类及统计高度，补跨页面几何对齐、表格冻结/列选择/关联/弹窗/清空/加载测试；运行静态、单元、生产浏览器、构建及发布配置门禁，构建E盘NSIS并记录摘要，再同步Git/Wolai。
- 文档同步：本地开始检查点已保存；Wolai仍为MCP接入完成，尚未同步本次整改。
- 设备与额度：本开发Windows，浏览器演示可用；Mac/独立设备未连接，原生新包未验。开始五小时剩余79%、周50%，未重置或定时唤醒；重要里程碑后与昂贵阶段前继续查额度。

## 第二阶段检查点：界面复验完成，准备打包

- 目标/标准/基线同上。跨页共享布局已实施；初轮名称缩进、日期换行、分页宽度和超长函数已修正，未降低检查规则。
- 已完成：静态检查及Vue类型通过；Vitest 38文件186测试通过；Vite生产构建通过（既有XLSX/节假日大块警告保留）；生产浏览器31/31通过。新增7项界面验收覆盖4页面×两尺寸×深浅主题，标题/统计/工具栏/内容x/y/宽度误差≤1px、卡片76px、无外层滚动；冻结列、列偏好、关系全文、前置清空、删除取消/确认与搜索清空通过。第一轮5项测试失败为就绪时序、隐藏输入点击和编辑行定位，纠正定位后完整复验通过。
- 未提交文件完整清单：index.html；src/App.vue；src/main.js；src/i18n/locales/en-US.js、zh-CN.js；src/modules/dashboard/components/DashboardView.vue；src/modules/data/components/DataView.vue；src/modules/member/components/MemberList.vue；src/modules/project/components/ProjectWorkspace.vue；src/modules/task/components/ProjectList/ProjectList.vue、TaskList/TaskList.vue；src/modules/task/composables/useTaskListQuery.js；src/__tests__/composables/useTaskListQuery.test.js；e2e/smoke.spec.js；README.md；CHANGELOG.md；docs/PROJECT_PLAN.md；以及新增docs/UI_EXPERIENCE_CHECKPOINT.md、e2e/ui-consistency.spec.js、public/theme-init.js、src/__tests__/composables/useDelayedBusy.test.js、src/__tests__/task/taskColumns.test.js、src/assets/workspace-layout.css、src/composables/useDelayedBusy.js、src/modules/task/utils/taskColumns.js。恢复先核对Git完整状态。
- 未解决/准确下一步：补最终静态/单元/发布配置/UPARS/Rust门禁；E盘构建NSIS并记录hash；更新本检查点、提交Git、同步Wolai。真实数据未变、新包未安装；原生安装/悬浮窗口验收和正式签名、其它平台仍未验证。本次不改变MCP权限、不发布外部Release。
- 文档同步：README/CHANGELOG/规划和本检查点已更新；Git未提交，Wolai未同步本次工作。
- 设备：Windows和演示浏览器已确认；其它设备未连接。额度：五小时剩余47%、周45%，允许进入打包阶段，无重置/定时唤醒。

## 第三阶段检查点：最终窄窗口补正

- 实现提交72019578019cc0ef78c827c5c5db586942739bfa已校验同树/同SHA非强制同步GitHub。常规push errno10054失败后使用已有校验传输，未绕过TLS。
- 随后目视发现960px顶部帮助入口被挤出，已补≤1100px导航间距/品牌/按钮响应式样式；中文及English语言文字保持完整。内嵌任务表过滤隐藏项目列，默认列计数改5而非6，表宽不计隐藏列。
- 补正范围/未提交文件：src/App.vue、src/modules/task/components/TaskList/TaskList.vue、e2e/ui-consistency.spec.js、本检查点；基线为上述7201957提交，同分支，原目标与标准不变。
- 复验：最终生产浏览器36/36通过（新增中英文×标题栏预览/普通页四项、内嵌列计数一项）。首次补测发现English语言标签截断已调宽后通过；几何测试曾在异步重建时取得脱离文档元素，改原子文档读取与76px就绪轮询后通过，未放宽任何尺寸阈值。随后类型检查指出轮询回调赋值可能undefined，已加显式未测量失败保护，待最终类型/静态再验。
- 完整门禁此前结果：ESLint/Vue类型/186前端单测、发布元数据、UPARS1.1.0、Git差异检查通过；Rust格式通过、39单测+1真实stdio集成通过。Rust及真实库未改。
- 已构建7201957首轮NSIS，但该包不是最终补正源，不作为交付；下一步最终静态/类型与浏览器验证通过后提交补正，重建NSIS记录最终源SHA和摘要，再同步Git/Wolai。未自动安装、新数据未写，MCP保持只读。
- 同步：README/CHANGELOG/规划已记录整改，Wolai尚未写入本轮；最后五小时剩余33%、周43%，允许重建。不重置、不定时唤醒；仅Windows开发机/演示浏览器已确认。

## 最终交付验证（2026-10-10）

- 最终产品源：15c551a2c2ef7cd5433343da57dfb5baf2890544，同原分支，已经同树/同SHA非强制同步GitHub。25文件主实现+4文件窄窗口补正；之后仅增强验收测试与交付记录，未变产品代码。
- 类型检查的轮询赋值问题最终通过抽取返回真实几何对象的measureWorkspace解决，未使用类型忽略。截图复查发现仅共享容器就绪不足以证明路由已切换，已新增每个目标页面独有eyebrow等待；最终16张跨页截图对应真实目标页面，全部尺寸阈值保持。
- 最终验证：ESLint零警告、Vue类型通过；186单测/38文件通过；36/36生产浏览器回归通过，最终56.2秒，包含4页面×2尺寸×深浅主题实际路由对齐、导航完整、English文字不截断、固定左列/可选列偏好、父/前置全文与清空、搜索清空、应用删除Dialog与取消不写。Rust格式、39单测+1真实stdio集成通过；Vite构建、release:check、UPARS1.1.0验证、Git diff --check通过。保留500KB块警告（XLSX940.04KB、日历1368.65KB），未关闭检查。
- 新版NSIS：src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe；6,215,169字节；SHA256 BF5FA321D58899A8CBFA212F315D3148AA7ED4F0AC7133A06C6F8194B89C741D；16:14:57构建完成，源15c551a。构建和临时缓存均E盘；未安装、未改变旧程序/快捷方式/用户库，MCP配置与交付exe保持只读原状，GitHub内部Draft及六资产未改。
- 未验证/剩余风险：新版原生安装升级、Windows悬浮窗拖动/置顶/DPI/主窗退出、独立干净设备、Mac、签名公证；正式发布结论仍未通过。全项目既有三个P3例外和期限继续有效，不在本轮隐式关闭。正常慢加载仍展示真实忙状态，快速加载不闪遮罩；操作系统初始WebView绘制不能仅凭浏览器判定完全无闪屏。
- 下一步准确：完成本验收增强测试/记录提交与Wolai同步后，交付新包供用户安装观察；不自动进行真实数据CRUD，不自动开启MCP写权限，不新增未授权发布任务。
- 当前未提交文件：e2e/ui-consistency.spec.js、docs/PROJECT_PLAN.md、本检查点。基线/标准/范围同上；设备仅本Windows与演示浏览器确认，其它未连接。额度五小时29%、周43%；无重置、无定时唤醒。

## 同步闭环

- 上节验收增强与记录已提交9257c43b9603612a820819f6a847b76a3b92a272并精确非强制同步；产品/安装包源仍15c551a，无后续产品改动。
- Wolai相关状态块28dPKMDkPpLCFu557s8exF追加本次范围、测试、安装包摘要、限制与下一步，版本40；读回同时确认9257c43及BF5FA321D58899A8摘要，技术记录已同步，未上传真实业务内容。
- 本轮开发、复验及E盘打包完成；下一步只需用户安装新版观察实际体验。原生新包、签名与其它平台验收限制仍如上，不自动开发新需求、安装/清理用户数据或扩大MCP权限。
- 收尾本文件是唯一未提交文件；提交后核对HEAD等于远端并确认工作区干净。临时浏览器视口已复原、验收页关闭，无新增设备连接或额度重置。

## 用户授权覆盖安装（2026-10-10）

- 用户明确要求“覆盖安装我用用看”。任务范围仅当前用户E盘原目录覆盖及启动；基线da4c99260128bf39bf46a932b19e2ec626c1877b/原分支，工作区开始干净，WACAS未定义/待确认、UPARS1.1.0及维护规则不变。开始五小时23%/周42%，无重置或唤醒。
- 包摘要再次核对BF5FA321D58899A8CBFA212F315D3148AA7ED4F0AC7133A06C6F8194B89C741D；程序关闭、无SQLite侧文件，当前用户HKCU登记指向E盘runtime-current-user/app；本机已有WebView2，不安装共享运行时。
- 覆盖前14个Roaming数据/备份文件安全复制到E盘src-tauri/target/audit-tools/ui-update-20261010/safety-copy并逐一核对；NSIS静默覆盖退出0，14原文件安装后SHA全部不变，登记目录仍E盘。没有卸载、清理或回滚真实数据。
- 首次直接对比installed/release exe摘要失败，诊断发现同长度仅3字节差异，Tauri标记__TAURI_BUNDLE_TYPE_VAR_UNK→__TAURI_BUNDLE_TYPE_VAR_NSS；内存规范化该唯一标记后两文件逐字节相同，不修改任何二进制。安装exe SHA256 C2509822DF53898228002C8C3BA835B6EA8D48D96FF6EE1527317A2E711A2AE6，确认对应最终源15c551a。
- 新版已启动PID18804，窗口EasyProject、未退出、Responding=true；启动后只读SQLite完整性ok、外键0，1项目/5任务/4依赖/5基线、人员与团队0，与覆盖前相同。启动产生正常自动备份，不把启动后文件字节变动当安装期间改动。用户现在可实际试用；未进行真实数据编辑或原生点击验收。
- 下一步等待用户体验反馈；悬浮窗入口右上“任务悬浮窗”。原生拖动/置顶/DPI/主窗退出仍未验，正式发布条件及其它平台限制不变；MCP权限不变，只确认当前Windows，无其它设备。唯一未提交文件为本检查点，收尾同步Git/Wolai。

## 新反馈续接：悬浮窗任务与PrimeVue约束（2026-10-10）

- 用户要求：悬浮窗打开没有任务、仅一行文字；本轮出现原生HTML控件，UI必须使用PrimeVue，授权整改。目标覆盖悬浮窗初始展示/真实只读任务读取、主导航/悬浮按钮、任务编辑输入及本轮新控件/悬停提示；保留布局与功能，不删除数据或扩大MCP权限。应用easyproject-maintenance及token-saver；WACAS未定义/待确认，实际标准UPARS1.1.0与项目质量门禁。
- 基线49d1aacce379a6099466461e4bf9761fbf97a09c，分支codex/audit-release-20261006-api，开始工作区干净。当前只有本检查点未提交，未修改代码、配置、安装包或外部文档。
- 已确认事实：Rust floating_window创建340×72初始窗；FloatingTaskWindow expanded=false，选择器/详情/错误详细信息在展开时才显示。原生select、button、progress存在，任务表effort/progress仍原生input number，App导航/悬浮入口及树展开为原生button，新增全文提示使用HTML title。这不符合用户明确PrimeVue约束。DateTimePickerString已经是PrimeVue DatePicker，不应重复替换。
- 只读数据库汇总：任务5条均Todo，不是所有任务已完成；安装上一阶段完整性ok、外键0。初查误用is_deleted字段报错，按schema核对为stateflag后仅汇总status，不修改数据；未保存业务名称/内容。现有浮窗筛选仅排除Done/Archived，不排除Todo，因此“无任务”不能归因于状态过滤。crud_action未额外限制窗口，task-floating能力包含size/top/drag；没有据此证明实际IPC/渲染正常，根因尚待原生/独立窗口复验。
- 准确下一步：先核对本检查点/Git及相关源；将浮窗首次打开改为明显可见的任务面板（前后端360px/expanded一致，保留收起）、显示真实loading/empty/error区分；用PrimeVue Button/Select/ProgressBar及必要Message替代浮窗原生控件，Select弹层注意340px窗口内可见性与appendTo；任务数字编辑改InputNumber，导航/动作按钮改Button、全文提示改Tooltip，并检查这次改动涉及其它页面的同类控件。不得只用CSS把原生控件装成PrimeVue。
- 后续验证：更新FloatingTaskWindow单测（PrimeVue插件、初始展开/选择/错误/收起）、生产E2E真实独立窗口路径与启动标识、任务数字编辑/导航/悬停及340×360深浅主题；确认分页total/totalPage真实契约、异步/错误时显示；静态/类型/单元/生产浏览器/Rust（若修改初始尺寸）/构建/发布门禁。进入重建前查询额度；完成后E盘NSIS、授权覆盖到原E盘目录（仍应正常关闭窗口并保护数据）并复验，不能用模拟库冒充真实窗任务验收。
- 同步状态：本地反馈检查点已保存；当前反馈尚未Git提交或Wolai同步，原已安装版/源15c551a与包BF5FA321...不变，不能声称已修复。长期UI约束需补项目AGENTS或项目文档：可交互通用控件优先PrimeVue；自绘布局/拖动区域允许语义HTML，隐藏文件选择等明确例外另行记录，不豁免普通按钮/输入/下拉。
- 设备：当前Windows新版已打开，用户已实际点悬浮入口；工具未获得原生截图/点击证据，浏览器只能模拟。其它设备未连接。最后五小时剩余10%、周40%，不进入新的高耗费修改/构建阶段，保存检查点等待用户额度恢复提醒；无重置或自动唤醒。
- 保存后额度再次确认：五小时剩余9%、周39%，已触发低于10%长期门禁；暂停开发，唯一未提交文件仍为本检查点。恢复后从本节“准确下一步”继续。

### 恢复与控件整改里程碑（2026-10-10）

- 已从上述基线恢复，WACAS未定义，适用UPARS1.1.0与项目门禁；五小时剩余89%、周37%。没有使用重置。Windows本机连接有效，其它设备未确认。
- 已改浮窗前后端默认展开360px、PrimeVue Button/Select/ProgressBar/Message及加载状态；导航、仪表盘、项目工作区、项目/任务/人员列表普通按钮改Button；搜索改InputText、数字改InputNumber、人员日期改DatePicker适配器、导入确认改Checkbox，任务全文提示改Tooltip。AGENTS新增长期组件约束；隐藏文件选择器保留明确例外。
- 当前未提交文件：AGENTS.md、本检查点、e2e/smoke.spec.js、e2e/ui-consistency.spec.js、src-tauri/src/floating_window.rs、src/App.vue、src/main.js、src/__tests__/components/FloatingTaskWindow.test.js、src/__tests__/project/ProjectWorkspace.test.js、src/modules/dashboard/components/DashboardView.vue、src/modules/data/components/DataView.vue、src/modules/floating/FloatingTaskWindow.vue、src/modules/floating/useFloatingTasks.js、src/modules/member/components/MemberList.vue、src/modules/project/components/ProjectWorkspace.vue、src/modules/task/components/ProjectList/ProjectList.vue、src/modules/task/components/TaskList/TaskList.vue；新文件src/components/DatePickerDateString.vue、src/__tests__/components/PrimeVueControls.test.js。
- 初步类型检查通过。新增浮窗单测已通过；完整单测发现ProjectWorkspace浅挂载Button桩不再渲染button，已更新桩保留实际按钮交互。格式检查发现差异已修正。此前启动的一轮生产E2E未先重建dist，结果不能作为本次修改验收证据。
- 准确下一步：重新静态/类型/单元检查，重建dist后运行生产E2E，修正日期与布局回归；补原生启动标识、失败/分页测试；Rust/NSIS构建前再次检查额度。未完成真实原生任务展示验证及覆盖安装，真实数据未修改。Git/Wolai尚未同步本次整改。

### 自动复验与打包前检查点

- 基线/分支/目标和标准不变。新增usePrimeConfirmation.js（项目/人员删除PrimeVue确认）、README/CHANGELOG/PROJECT_PLAN文档修改，全部其它未提交文件同上。确认控件适配后190单测/39文件通过，静态/类型通过，Rust39+stdio1通过，release:check与UPARS1.1.0校验通过。构建仅保留原已登记的延迟加载大包警告，未关闭任何检查。
- 生产浏览器发现并整改：PrimeVue输入额外内边距导致工具栏相差14px；日期组件根span被旧“所有span隐藏”选择器隐藏，现限定分隔符；英文960px导航挤压，现降低窄屏导航内边距并禁止悬浮入口缩小。35/37曾通过，最后两例正在最新dist上复验，不把失败当通过。浮窗初始任务、原生启动标识、深浅主题、下拉窗口边界、日期实际保存、关系/清空/删除、四页布局已在测试覆盖。
- 打包前额度五小时79%、周36%，可以继续；无重置。Windows工具已初始化并能列出窗口，当前没有EasyProject运行窗口。下一步等37例完整通过后构建NSIS，安全复制真实数据后覆盖原E盘目录，使用Windows窗口工具检查真实任务展示和选择；最后Git/Wolai同步。原生/DPI/多屏尚未确认，正式发布限制保持。

- 最终自动界面复验：最新dist上37/37通过（23.5秒），190/190单测通过，lint/typecheck通过。英文挤压进一步确认为App全局按钮选择器优先级低于PrimeVue，现使用nav button.p-button和header-actions组件类选择器；语言选择器保留8.25rem避免英文截断。浮窗弹层挂body并限高140px防父容器裁切。下一步NSIS构建/安全安装/真实窗检查，忽略目录下的install-primevue-update.ps1只用于本次同版本安全覆盖，不执行卸载。当前五小时77%、周35%。

### 真实设备发现动态样式安全策略问题（继续整改）

- 首个修正版NSIS构建通过，SHA42B784D322181D59BBB9F7CFE00B057F23600ADE5D34D4329E20CDEB33D0EC85，覆盖原E盘目录成功，12个数据文件安装前后SHA全部不变，安全副本在target/audit-tools/primevue-update-20261010/safety-copy。与release仅NSIS标记3字节不同已验证。
- Windows真实窗口已确认浮窗默认展开并读取真实任务、项目、截止/进度，不能再称“没有任务”。但是实际截图发现PrimeVue动态样式未生效：Tauri自动为style-src加nonce后，未携带nonce的动态style被拒绝。已根据本地Tauri2.12.1 manager/mod.rs及PrimeVue核心config源码，将初始style的DOM nonce交给PrimeVue csp.nonce；不关闭CSP或nonce保护、不硬编码运行nonce。
- 新增src/security/styleNonce.js及nonce单测，新增严格nonce CSP生产浏览器测试；其它未提交文件同上。新一轮lint/typecheck/191单测/38生产E2E正在运行。额度五小时72%、周34%。目标/基线/分支/UPARS不变；WACAS未定义。
- 准确下一步：以上复验通过后重新打包、正常关闭程序、安全覆盖（须使用新的安全副本目录，不能覆盖已有），验证真实PrimeVue边框/下拉/任务切换/收起展开/返主界面；再Git/Wolai同步。当前安装42B784版不是最终交付，样式问题未完成原生复验。当前只有Windows，未连接其它设备，文档未同步外部。

- CSP整改复验里程碑：191/191单测（39文件）、38/38最新生产E2E（含严格nonce CSP）、lint/typecheck/build全部通过。实际主程序与浮窗已通过正常Alt+F4一同关闭，未触碰业务数据。最终NSIS重建中；安全安装脚本改用primevue-csp-update-20261010/safety-copy新目录。AGENTS已记录动态nonce与真实桌面复验规范。下一步最终安装/原生复验/同步；没有自动重置或唤醒。

- 最后补齐主题/帮助/关闭帮助图标的aria-label（Tooltip替换title不能丢失可访问名称）；静态/类型复验通过，最新38/38生产E2E再次通过（43.1秒）。打包前额度五小时66%、周34%，GitHub分支仍等于本地基线49d1aac，未发现并发改动。仅Windows设备已确认。下一步对这一最终代码重新打包，安全覆盖新副本目录并完成真实窗口复验。

### 原生功能验收与最终视觉收尾

- CSP/可访问名称版本包88E5127D86C8CA4C4546D56C8D81DFFA09E0F20D492D1451E56688D037DE4156已覆盖，安装前后11文件哈希不变，副本primevue-csp-update-20261010/safety-copy，已安装SHA5740D8ADF943CF3E2A5CD41EB60C35C2A5BE0D47BE8BE958A1BFE999BC533749。
- Windows真实截图确认PrimeVue Select边框/弹层/ProgressBar生效；真实菜单提供5个未完成任务，切换后标题和截止日期更新；72px收起保留选中任务，360px展开恢复详情；打开主窗口定位所属项目。主窗口正常关闭同时关闭浮窗已在前一版确认。没有业务增删改操作，仅任务选择的设备偏好变化；名称不写入外部文档。
- 原生截图发现仪表盘可点击统计卡片因PrimeVue默认justify-content居中，与其它两卡不一致。已明确flex-start，并为卡片/关注任务/最近项目选用PrimeVue text按钮避免实心主色悬停影响文字对比；生产E2E新增加卡片内部图标偏移对齐断言。静态/类型通过。
- 最新并行38例复验未正常退出，已中止本次自己的测试进程；不记录为通过。保持完整范围，使用CI=1单worker复验中；此前38例CSP版本通过仍有效但不能替代收尾复验。下一步完整通过后最终打包、另建安全副本覆盖、检查真实统计卡片和浮窗；同步Git/Wolai。基线/分支/UPARS/WACAS同前，所有未提交文件仍同前，目标范围不扩大。

- 单worker最新生产复验38/38全部通过（59.0秒，无重试），含新增统计卡片内部对齐断言。主程序与浮窗已正常退出，真实库复查完整性ok、外键0，1项目/5任务/4依赖/5基线不变。进入最终打包；安全副本另用primevue-final-update-20261010，保留前两个副本。后续只读原生外观复验与文档/Git同步，不增删改业务。

### 最终交付检查点（2026-10-10）

- 目标与范围已完成：默认展开的只读任务浮窗、受影响页面的真实PrimeVue通用组件、动态样式CSP nonce、导航/统计内部布局回归。WACAS未定义/待确认；实际UPARS1.1.0、项目静态/类型/测试/发布门禁及新增AGENTS组件约束。基线49d1aacce379a6099466461e4bf9761fbf97a09c，分支codex/audit-release-20261006-api。
- 最终NSIS 6,223,606字节，SHA06B74F60F7AE972515AA3147C2B2AFF6A421BE527CD39D297131173F95519231；覆盖原E盘runtime-current-user/app成功，Exit0，11个已有数据文件安装前后SHA完全一致。安全副本target/audit-tools/primevue-final-update-20261010/safety-copy；前序副本保留。已安装exe SHA2D70CABA2B11FF89647DB43BFC069368239404D2420DED7E5189161B604F4D9C，与release按NSIS标记规范归一后逐字节一致。
- 最终Windows真实截图已确认统计卡片内部图标/文本左对齐、关注列表柔和悬停、深浅主题；深色浮窗Select/进度/按钮显示正常，关闭后将主程序恢复原浅色主题，并重新开启浅色浮窗供用户试用。上一CSP版同一浮窗实现已验证5条真实Todo、切换、折叠/展开、返主项目，最终版仍能展示已记忆任务。真实库复查integrity ok、foreignKeyErrors0，1项目/5任务/4依赖/5基线未变。
- 验证：lint/typecheck通过，191单测/39文件通过；最新完整生产38例单worker59秒通过（无重试，包含nonce CSP、初始任务、分页单测、深浅/1280与960、内部/外框对齐、悬停全文、日期保存、关系清空及删除取消）；Rust39+真实stdio1通过，NSIS构建、release:check、UPARS标准校验通过。保留已登记的延迟加载大包警告，没有禁用规则或删除测试。
- 未提交文件（准备提交的全部范围）：AGENTS.md、CHANGELOG.md、README.md、docs/PROJECT_PLAN.md、docs/UI_EXPERIENCE_CHECKPOINT.md、e2e/smoke.spec.js、e2e/ui-consistency.spec.js、src-tauri/src/floating_window.rs、src/App.vue、src/main.js、src/__tests__/components/FloatingTaskWindow.test.js、src/__tests__/project/ProjectWorkspace.test.js、src/modules/dashboard/components/DashboardView.vue、src/modules/data/components/DataView.vue、src/modules/floating/FloatingTaskWindow.vue、src/modules/floating/useFloatingTasks.js、src/modules/member/components/MemberList.vue、src/modules/project/components/ProjectWorkspace.vue、src/modules/task/components/ProjectList/ProjectList.vue、src/modules/task/components/TaskList/TaskList.vue；新增src/__tests__/components/PrimeVueControls.test.js、src/components/DatePickerDateString.vue、src/composables/usePrimeConfirmation.js、src/security/styleNonce.js。
- 未解决/未验证：未做多显示器/DPI/平台外观全矩阵，当前任务不公开发布；仍为未签名内部测试版，正式发布原有限制与3项已批准P3例外/截止日期保持。跨窗口实时主题切换不属于本轮承诺，已验证打开时使用保存主题。未扩大MCP写权限，未修改业务数据。当前Windows已确认，其它设备未连接。
- 准确下一步：提交以上已验收整改，非强制同步同SHA到当前GitHub分支，追加Wolai脱敏技术状态并读回；再保存同步结果。后续等待用户试用反馈，不自动开启新功能/重置额度/定时唤醒。此时本地README/CHANGELOG/计划/检查点已更新，Git/Wolai最终同步尚未完成。

### 同步闭环

- 已验收代码/文档提交1b1653ec2630fbe113fd051a81c5c0c303b142a6（24文件）已通过校验父提交、树和提交SHA的API方式非强制同步；远端和本地同SHA，无并发改动，提交后工作区干净。
- Wolai页面h4VsMhyWaL9UHrYLEkfnLx的状态块28dPKMDkPpLCFu557s8exF已追加脱敏交付记录，报告版本43读回确认代码SHA与最终安装包SHA，未保存真实任务名称/内容。README/CHANGELOG/PROJECT_PLAN及本检查点与安装现状一致；之后只追加本同步闭环的文档提交号。
- 当前基线切换为1b1653ec2630fbe113fd051a81c5c0c303b142a6，分支不变；本段保存时唯一未提交文件是本检查点。代码/配置/安装包不再修改。WACAS未定义/待确认，UPARS1.1.0，五小时49%、周31%（最后查询），未重置额度或建立唤醒。Windows最终浅色主程序与任务浮窗已打开，暗色验收后恢复原主题；其它设备未连接。
- 本次整改与复验完成。准确下一步：提交并同步本闭环文档，确认工作区干净与远端同SHA，然后等待用户真实使用反馈；不自动开发后续功能。正式发布/多屏DPI/其它平台未验证风险仍按上节保留，内部测试交付不等同正式发布验收通过。

### 临近任务/刷新稳定性/弹窗编辑续接（2026-10-10）

- 目标与范围：只读浮窗展示最近截止5项未完成任务（含逾期、排除无日期）；后台刷新不插入加载行、不改变窗口；导航悬停/聚焦不变形；任务新增/修改改为PrimeVue独立草稿弹窗，保留隐藏列和可见取消操作。用户新反馈均纳入本轮，不涉及数据库模式或MCP权限。
- WACAS未定义/待确认；实际UPARS1.1.0与项目PrimeVue、CSP、数据保护、质量门禁。基线65f457454b610614ce35bfb8929e97e478af44a6；分支codex/audit-release-20261006-api，开工工作区干净。五小时剩余30%、周28%（里程碑查询），未重置/唤醒。
- 未提交文件：README.md、CHANGELOG.md、docs/PROJECT_PLAN.md、docs/UI_EXPERIENCE_CHECKPOINT.md、e2e/smoke.spec.js、e2e/ui-consistency.spec.js、src/App.vue、src/__tests__/components/FloatingTaskWindow.test.js、src/i18n/locales/en-US.js、src/i18n/locales/zh-CN.js、src/modules/floating/FloatingTaskWindow.vue、src/modules/floating/taskSelection.js、src/modules/floating/useFloatingTasks.js、src/modules/task/components/TaskList/TaskList.vue。
- 已完成：移除选中任务偏好依赖与下拉；分页后只读排序取5条、项目跳转、键控卡片；初次与后台加载分离、保留刷新失败前数据、关闭进度条动画；行内表单迁移到草稿弹窗，保留原持久化/失败重试逻辑；双语文本与文档。
- 验证：192单测/39文件通过；首轮生产40例39通过，导航几何1例真实失败（悬停边框/媒体查询优先级），已继续修复而未放宽断言。类型检查发现新测试函数注解不足，已修复待最终复验。其它保存重试/关系清空/弹窗取消/隐藏列回归通过。
- 未解决/下一步：最新lint/typecheck/build完成后运行完整40例生产回归，检查演示深浅与窄屏；通过后构建NSIS并安全覆盖原E盘目录、真实Windows检查刷新与弹窗、只读数据库检查；再Git/Wolai同步。现有安装仍是上一包，不能称本轮已交付。本地文档已更新，外部未同步；Windows工具可用，尚未重新确认当前窗口，其它设备未连接。正式发布原有限制保持。

- 打包前里程碑：最新lint/typecheck/build/release:check通过；完整生产40/40通过（41.2秒，无重试），192单测/39文件通过。导航尺寸断言未放宽；非几何悬停/聚焦样式解决窄窗口规则冲突。演示深色弹窗在960×640实看确认滚动正文与固定保存/取消页脚；取消后原表格保持。五小时24%、周27%，允许开始打包。未提交范围同上；下一步安全覆盖与真实设备验收、Git/Wolai。原正式发布限制不变。

- 首包安装B7B05A992904F41A88F12672F756A2734E70F4288F8ABCE9053A9D8D858F5202成功，11数据文件SHA不变，安全副本nearby-tasks-update-20261010/safety-copy保留；已安装exe1EC8883CC31EE58071BCE75A66D5B054A029E5E7E6FD531CAD9D4FE70D0032DF按NSIS标记归一后与release逐字节相同。真实浮窗展示5个Todo任务与项目/日期/进度，刷新窗口ID不变，滚动位置保持；真实PrimeVue编辑弹窗保存/取消固定可见，未写业务数据。
- 原生复验新发现：模板Todo及High/Normal/Low值不在旧选择器选项中，显示成占位；已补齐兼容值、不迁移真实数据，新增生产断言并移除数字输入冗余外框。当前五小时15%、周26%，允许开始本轮最终复验/打包；未提交范围同上。下一步最终40例通过后重打包、安全覆盖另建副本、复验旧值与取消、同步Git/Wolai。若剩余低于10%不启动新长期阶段，保存进度暂停。外部文档尚未同步；只确认Windows，正式发布限制保持。

- 最终兼容修正lint/typecheck/build/release:check通过，192/192单测再次通过；生产40例收尾中，前36例通过。主程序无草稿后正常退出，真实库完整性ok/外键0、原业务计数不变。五小时13%、周25%（最终打包前查询）；下一步本轮40例结果确认后在E盘重建NSIS、安全覆盖nearby-tasks-final-20261010副本、仅打开/取消兼容表单复验、Git/Wolai。所有未提交文件同上；无其它设备或正式发布承诺。

### 10%额度门禁暂停检查点（2026-10-10）

- 五小时剩余9%、周25%，触发长期任务门禁，保存后暂停；未使用重置或定时唤醒。目标/范围、WACAS未定义、UPARS1.1.0、分支与基线65f457454b610614ce35bfb8929e97e478af44a6不变。
- 最新完整生产40/40通过（1.3分钟，无重试），192单测/39文件通过；lint/typecheck/build/release:check与diff空白检查通过。NSIS重建通过，最终包6223939字节，SHA6F27BC81C2601F2F3C9B1B60DBFC33E352F8ABB5EFD7AC618E310383D00AA342。
- 最终包已覆盖原E盘runtime-current-user/app，Exit0；11文件安装前后SHA相同，安全副本nearby-tasks-final-20261010/safety-copy保留，前一副本也保留。已安装exeSHA2BF9E710E2DBDCCB7FFF8E2241864D1B4A0BE7965045D6CEE3359C14551FA49A，与release按NSIS标记归一后逐字节一致。最终库integrity ok、外键0、1项目/5任务/4依赖/5基线/0人员保持。
- 已确认设备：仅Windows；最终主程序已启动，没有打开编辑草稿。用户调整了窗口边界，工具已重新观察；不继续抢占操作。前包同一浮窗/弹窗逻辑已实际确认5条任务、刷新同窗口且保持滚动、固定保存/取消；最后新增Todo/High/Normal/Low选项及数字外框调整仅自动化复验通过，尚未在最终真实弹窗复核。
- 全部未提交文件仍为14个：CHANGELOG.md、README.md、docs/PROJECT_PLAN.md、docs/UI_EXPERIENCE_CHECKPOINT.md、e2e/smoke.spec.js、e2e/ui-consistency.spec.js、src/App.vue、src/__tests__/components/FloatingTaskWindow.test.js、src/i18n/locales/en-US.js、src/i18n/locales/zh-CN.js、src/modules/floating/FloatingTaskWindow.vue、src/modules/floating/taskSelection.js、src/modules/floating/useFloatingTasks.js、src/modules/task/components/TaskList/TaskList.vue。忽略目录安装脚本只改独立副本路径。
- 准确下一步：额度恢复后先读此段/查询额度/核对Git与最终包SHA；只对最终桌面打开任务编辑确认模板旧值可见、取消关闭（不修改业务），并复核浮窗；不重跑仍有效192/40门禁或重打包。随后提交14文件、非强制同步同SHA原GitHub分支，追加Wolai交付状态读回，再保存同步闭环。不要使用卸载脚本、删除业务数据、扩大MCP权限或公开Release。
- 文档同步：README/CHANGELOG/PROJECT_PLAN已更新；Git提交/远端同步尚未做。Wolai本次仅追加暂停检查点，非最终交付记录；恢复后须读回确认并完成正式同步。剩余正式发布、多屏DPI/其它平台风险保持原有记录，不宣称正式发布验收通过。

### 恢复与最终桌面复验（2026-10-11）

- 恢复后已完整读取本检查点，核对分支/基线65f4574、14个未提交文件、最终安装包SHA6F27BC81C2601F2F3C9B1B60DBFC33E352F8ABB5EFD7AC618E310383D00AA342和已安装exeSHA2BF9E710E2DBDCCB7FFF8E2241864D1B4A0BE7965045D6CEE3359C14551FA49A均一致，未发现新增代码或并发改动。五小时起始99%、桌面里程碑90%，周22%；不重置/唤醒。
- 最终原生复验通过：已安装版本PrimeVue编辑弹窗显示模板High为“P2 - 高”、Todo为“待办”，数字输入无冗余外框，保存/取消固定可见；点击取消后弹窗关闭且原表格及隐藏列保持。仅打开与取消，没有业务保存/删除。浮窗重新打开显示5项未完成任务及项目/截止/进度；手动刷新窗口ID保持、卡片及滚动布局保持，无加载行插入。主程序与浅色浮窗保持打开供试用。
- 数据复查完整性ok、外键0、1项目/5任务/4依赖/5基线/0人员不变。原192单测/40生产回归和lint/typecheck/build/release:check仍有效，未重复运行或重打包。本轮没有Rust业务代码变化，原Rust门禁结果保持；其它平台/多屏DPI与正式发布限制仍不作通过承诺。
- 目标与范围已实现；WACAS未定义/待确认，实际UPARS1.1.0和项目组件/CSP/数据安全规范。所有未提交文件同上14个。README/CHANGELOG/PROJECT_PLAN与安装行为一致；Wolai暂停记录版本45已读回。准确下一步：提交14文件并同SHA非强制同步GitHub当前分支、追加Wolai最终脱敏交付记录并读回，再保存同步闭环，等待用户反馈；不自动开启新功能或公开Release。

### 最终同步闭环（2026-10-11）

- 已验收代码与文档提交bfd401a52965166c50fb3c0e14c23b46cab9259c（14文件）已同SHA非强制同步GitHub原分支；父提交/树/提交哈希全部核对，提交后工作区干净。Wolai状态块28dPKMDkPpLCFu557s8exF追加脱敏交付记录版本46，已读回确认代码提交与最终包SHA，未同步真实业务名称或内容。
- 当前基线bfd401a52965166c50fb3c0e14c23b46cab9259c，分支不变；保存本闭环时唯一未提交文件为本检查点，代码/配置/安装包不再改变。目标范围、WACAS未定义/待确认、实际UPARS1.1.0、192单测/40生产回归及最终原生复验结论同上。Windows主程序与浅色浮窗保持打开，无编辑草稿；其它设备未确认连接。保留所有安全副本，数据计数/完整性正常。
- 本轮整改交付完成；下一步仅提交同步本闭环文档并追加其提交号到Wolai，然后等待用户反馈。没有自动扩展功能、额度重置/唤醒或公开Release；正式发布签名/平台/DPI风险保持原有结论，内部测试交付不等于正式发布验收通过。
