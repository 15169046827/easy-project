# EasyProject 写入字典与UI专项审计整改报告

- 标准：UPARS 1.1.0；2026-10-24；审计并整改；版本0.1.2。
- 基线：9e78fc3f41033c32ac784ec299baad9d9009a153，codex/audit-release-20261006-api。
- 目标：MCP/API写入规范、重复状态、颜色及截断全文、Windows看板拖拽。WACAS未定义。

## 1. 结论

本专项代码审计通过：P0/P1为0，六项P2与一项P3均已整改复验。275单测、90生产UI、12独立HTTP、Rust58+stdio1/server38+16及静态/构建通过；Windows原生合成任务真实拖动及Ctrl+Z撤销均有界面和只读SQL证据。产品c74bcca已安全安装桌面/独立MCP并部署服务器（后端d2e5d41，之后仅UI变化）。这是专项结论，不是全库新审计；正式生产发布仍未通过，不公开新安装包。

失败历史保留：d2e5d41仅改Tauri配置的原生候选未成功拖动且未部署；最终应用内PointerEvent方案（8px阈值、内部来源/目标ID、取消/卸载清理、拖后点击抑制）通过后才交付。下方第5节为初始候选记录，最终闭环如下。

| ID | 最终状态 | 复验证据 |
| --- | --- | --- |
| EP-DICT-001 | fixed/P2 | 共享枚举/MCP schema/实体/模板/导入检查；Rust58与server38+16含正反例通过 |
| EP-DICT-002 | fixed/P2 | trim/case/默认中英显示别名、跨项目允许、UI草稿保留/服务与导入回滚反例通过 |
| EP-DICT-003 | fixed/P2 | 周末/日历类型/标准日期及反向范围拒绝，leave/available正例通过 |
| EP-UI-001 | fixed/P2 | PointerEvent最终方案，11组件专项/90UI及Windows原生Pending→Testing→撤销SQL读回通过，旧失败未隐瞒 |
| EP-UI-002 | fixed/P2 | 任务父/前置/名称等同类字段title+PrimeVue；深浅窄窗真实tooltip及90UI/12HTTP通过 |
| EP-UI-003 | fixed/P2 | taskPriority兼容映射与task_db排序单测通过，不改旧值 |
| EP-UI-004 | fixed/P3 | 8具名预设与建议算法、快捷/管理选择保存读回通过，不批量改旧色/API默认灰色 |

## 2. 范围与排除项

覆盖全部23工具的schema/验证/共享实体分发与五种实体写服务，桌面crud命令、Web action/远端MCP、模板、导入、引用与删除保护；同类截断显示及Tauri主窗拖拽配置。检查源码、测试、构建门禁与文档契约。文件清单以本轮Git变更及以下边界矩阵为准；不冒称全库文件均重新逐行审计。

排除：账号密码/令牌实现的全量重审、已有数据自动清理、schema迁移、macOS原生交互与正式发布签名。父子任务统计/分页/层级展示是后续讨论，不实施。

### 写入边界矩阵

| 字段/路径 | 规范与核验 |
| --- | --- |
| task.priority/type/schedule_mode | 共享枚举，MCP schema公开，服务端拒绝字典外值；High/Normal/Low兼容映射2/3/4且存储不改；SQL排序与UI颜色共识 |
| project.type/status | private/public与Draft/InProgress/Paused/Done/Archived；模板的project与tasks也校验 |
| task.status_id | 显式同项目有效引用；创建MCP不接受status文字；完成按字典布尔属性，不猜名称 |
| task_status name/color/order/flags | 同项目trim/case及默认中英显示别名不重复；hex/整数范围/布尔严格；事务gate防写入竞态；软删任务仍阻止删除 |
| progress/effort | 0—100整数/非负有限数；完成进度100规则保留 |
| 日期/父子/团队/跨项目 | 既有MCP规范日期、任务起止验证、父任务环/归属、负责人团队、跨项目子任务/依赖/基线保护复审并保留测试 |
| 周末/日历/人员可用性 | JSON数组字符串；周日0至周六6整数；holiday/working；leave/available与标准起止日期；导入一并校验 |
| member.role / project_member.role | 自由文本展示标签，不是授权；MCP类型/长度限制，不虚构字典 |
| 国家/地区、名称、备注、联系方式、元信息 | 日历库配置/自由文本，不是任务状态枚举；既有schema长度/类型与关系校验，不能将展示属性当权限 |
| 依赖/基线 | MCP不暴露依赖写入/基线变更；UI依赖仅FS/0，由服务生成，关系校验保留；导入既有图校验，不新增业务能力 |
| IPC / Web / 远端MCP / 导入 | 同一field_dictionary；导入事务提交前校验，失败全回滚。旧库读取/备份不因历史非法值被阻断 |

## 3. 技术栈与门禁

Vue/PrimeVue：ESLint零警告、vue-tsc、Vitest、生产Playwright（含nonce CSP）；Rust：fmt/test/clippy-D warnings；Tauri：配置回归与真实Windows隔离验证；接口：实际MCP发现、Apifox契约读回，独立HTTP合成验证。

## 4. 编码规范审计

初始：枚举分散/缺失，优先级别名呈现不一致，同类全文提示遗漏。新增共享field_dictionary、taskPriority与statusColors，颜色Select为真实PrimeVue；复用验证不复制服务逻辑。新增函数保持职责单一，SQL排序仅固定内部表达式，值仍绑定；不打印业务参数/凭据，不放宽CSP、不删测试/忽略规则。最终lint/typecheck与Rust clippy均通过过一轮，最终候选复验见第7节。硬链接缓存改复制是环境提示，不是代码警告，未屏蔽检查。

## 5. 初始发现与整改候选（历史；最终闭环见第1节）

| ID | 状态 | 等级/置信度 | 证据/触发/影响与发布可达性 | 整改与验证 |
| --- | --- | --- | --- | --- |
| EP-DICT-001 | 候选待最终复验 | P2/高 | mcp/tools.rs原字段仅string，task优先级/类型及project状态允许任意标签；所有写客户端可达，导致排序/展示失效 | 共享枚举/schema/实体/模板/导入校验；Rust正反例、MCP与远端反例 |
| EP-DICT-002 | 候选待最终复验 | P2/高 | task_status_service仅原始名称唯一性不足，Done显示“已完成”与自定义已完成重复；UI/MCP可达 | trim/case/中英显示别名事务内校验，UI保留草稿、现有冲突提示；跨项目同名允许；不自动合并 |
| EP-DICT-003 | 候选待最终复验 | P2/高 | MCP日历仅检查外层数组，嵌套类型/周末范围错误可改变排期含义 | 共享JSON数组元素/日期/类型检查、导入校验与回滚；合法leave/available保留 |
| EP-UI-001 | 候选待原生复验 | P2/高 | 主窗缺dragDropEnabled=false，Windows Tauri默认原生拦截HTML5拖拽；真实桌面可达 | 主窗禁用Tauri拦截、内部DataTransfer、不接受外部任务ID；配置门禁与生产拖拽/undo测试，原生待验 |
| EP-UI-002 | 候选待最终复验 | P2/高 | TaskList父任务等截断只有部分提示路径，多个列表无全文后备；各端可达 | 全文title+PrimeVue，覆盖任务名/项目/父/前置/日期/备注/负责人/状态/类型/优先级，以及项目、人员、甘特、浮窗、备份；深浅窄窗父列真实tooltip测试 |
| EP-UI-003 | 候选待最终复验 | P2/高 | 接受的High/Normal/Low被拼成无效CSS类，SQL按文本排序；MCP合法值可达 | 只在呈现映射2/3/4，SQL CASE对应排序，未知旧值不假装合法；单测验证 |
| EP-UI-004 | 候选待最终复验 | P3/高 | 新UI自定义状态均灰色，无法快速区分；新增菜单可达 | 8种具名预设、优先未用/最少次数、保留自定义hex；不批量重涂，不改变API默认灰色；选择保存回读测试 |

## 6. 分域结论

正确性/可靠性：统一写入字典及优先级呈现；UI本地检查只为体验，服务端仍是权威。数据/存储：不升级schema，不自动写历史非法值/重复项；导入拒绝整次回滚，备份保留。安全/隐私：MCP权限/鉴权/CSRF/Origin/恢复点审计边界不变，远端错误脱敏；不在真实库自动CRUD。UI/无障碍/国际化：PrimeVue色选/提示，中英文同步与可访问名；深浅主题/窄窗有回归。构建发布：源码通过不等于原生或生产验收通过。

## 7. 最终验证

| 验证 | 当前结果 |
| --- | --- |
| 前端 | 最终275单测/56文件，90生产UI零重试（2并发），另12独立HTTP通过；lint/typecheck/build/release:check/diff通过 |
| Rust桌面 | 58单测+1真实stdio/clippy通过；NSIS1B79CB65…，原生1280×800严格桌面CSP合成拖动与撤销通过 |
| Rust服务端 | 38单测+16HTTP通过；语义拒绝仍留恢复点使断言16→18，未削减保护；Linux CI40077325372两job成功 |
| 失败历史 | 首次颜色控件可访问名/fixture预期已修复；初轮格式问题已修复；沙箱网络拒绝已用受控测试进程解决；全量首次89UI通过/1日期焦点失败/12HTTP另跑，保留断言明确失焦后专项重复3通过 |
| 文档契约/部署 | release MCP实际23工具/合成DB SHA不变；桌面534原文件新副本、531非程序/DB一致；服务器65文件/204旧assets/2DB一致；正常TLS两HTML/63静态SHA/4匿名401/health200通过。最终Git/Wolai/ApiFox同步回执见专项顶部 |

## 8. 例外、未知与环境缺口

真实已有非法优先级/重复状态尚不清理，需逐项确认改名/选合法值，任务关联保留。Windows仅隔离拖动/撤销已验，不冒称全原生矩阵或全量真实账号交互。macOS随平台发布另验，责任Ym_Li。

## 9. 发布判定

P0/P1未发现；本专项P2六项/P3一项均fixed，无未闭环问题。专项代码判定通过；正式生产发布仍未通过（既有签名/跨平台/运营风险不因本轮改变）。仅执行本轮安全更新，不公开新安装包。

## 10. 变更与证据索引

`docs/STATUS_COLORS_DRAG_CHECKPOINT.md`、`docs/MCP.md`、本轮Git差异、`docs/handoff/`、生产UI/单测/Rust测试输出。没有发现需要补充UPARS的新增技术栈中立规则：既有1.1.0输入约束/同类整改/真实运行验证已经覆盖，通用标准版本不变。
