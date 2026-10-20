# Apifox接口文档维护检查点

- 2026-10-20 Asia/Shanghai。用户授权用账户环境变量中的Apifox MCP token对接并维护EasyProject项目API；不操作其它项目、不公开发布、不修改本地业务库、不新增HTTP服务。
- 基线bd37fdd（codex/audit-release-20261006-api），开工Git干净。WACAS未定义/待确认，实际UPARS1.1.0与项目数据/非C盘/额度/三方交接规则。开始五小时65%、周23%，无重置/唤醒；仅本Windows确认。
- 已读Apifox官方文档：旧stdio仅文档读取，新版Streamable HTTP支持18工具CRUD，Codex官方地址https://api.apifox.com/mcp，X-Apifox-Api-Version=2025-09-01。使用账户级ApiFox_MCP_TOKEN，仅在内存读取并发送官方同源，不打印/落盘/提交值。
- 新建scripts/apifox-mcp.ps1实现直接官方MCP握手/通知/发现/调用，不安装依赖或产生C盘缓存。首次initialize协商2025-06-18成功，发现18工具；可访问项目中精确名称EasyProject唯一，ID8948094、private。其它项目不在范围。
- 当前仅查询，未写云文档。当前未提交本检查点和上述脚本。下一步确认目标主分支/模块/现有内容；按实际MCP stdio及Tauri IPC契约维护，不能捏造HTTP URL或开放端口。发现正式Markdown/自定义接口维护工具后只对EasyProject做非破坏性增补并读回；现有内容先读不盲覆盖。同步Git/Wolai/交接并标实际源SHA；配置Codex只存环境变量引用、不存明文token，新连接加载需重连。

## 接入/清单里程碑

- 目标main分支8751742、默认模块8741707，HTTP接口/Markdown/通用接口初始均空；不涉及其它项目。已按官方getOpenApiDetails读取动态操作GET/POST文档定义。一次模糊executeOpenApi请求被安全审批拒绝，已先明确其GET只读URL/ID/目标再正式批准，无绕过。首次所需通用接口创建POST参数422，读回确认未创建，不盲重试；协议管理参数未在MCP可用工具中公开，改用正式Markdown维护真实非HTTP协议契约，不伪造HTTP接口。
- 已新建所需协议总览Markdown id9567481，readEntityDetails读回有真实换行；仅定义/合成说明，不含真实业务数据。尚待补全和批量读回。维护脚本仅官方https同源、禁重定向、不输出异常请求头，内存读取账户环境变量；所有目标ID须8948094、动态操作白名单、写需-AllowWrite，无删除能力。
- 本地生成catalog：交付MCP实际18工具严格inputSchema、桌面6注册命令及31个model/action；数据库文件SHA前后不变，未业务调用。生成器/本地IPC完整说明/协议错误与权限/模型原文/云文档快照已落地，源bd37fddf33261bc4090c9aa0a88ea439bd74c9ab，独立exe仍旧源e534644及原摘要，不包装为新构建。
- Codex已新增apifox官方Streamable HTTP配置，仅bearer_token_env_var=ApiFox_MCP_TOKEN、版本头2025-09-01和prompt审批；令牌没有存入配置/仓库或输出，现有会话未重载故无内建Apifox工具，不称已加载。当前直接正式MCP调用已成功，无新增npm安装/C盘缓存。
- 下一步：测试脚本范围保护与生成覆盖，给初始总览绑定读回摘要，运行只新增/已管理文档更新并逐份回读；未管理同名和远端手改摘要不符应拒绝覆盖。完成后核对26篇Markdown完整覆盖18MCP/6Tauri及31actions/模型，配置/持续维护/交接及Git/Wolai同步。最新额度五小时53%、周21%，仍可开启本阶段。

## 文档维护与复验完成

- Apifox私有EasyProject/main已保存26篇Markdown：总览9567481、模型9567484、18个MCP工具9567485–9567502、6个Tauri命令9567503–9567508。全部写后立即readEntityDetails并SHA比对通过；后续完整只读同步26项均UNCHANGED，远端数量26/project8948094/branch8751742匹配。manifest保存每项id/name/SHA256，无凭据。通用协议实体422未掩盖，不捏造HTTP端点；本轮完整API文档以Markdown交付，未提供HTTP调试能力。
- 范围保护6项测试通过：18工具/6命令/31动作完整覆盖、26正文键唯一、错误项目/冲突项目ID/未批准写入/未审查动态操作均在凭据读取/网络前拒绝；PowerShell7两个脚本语法通过。文档写入仅已审查POST/PUT文档端点，默认计划只读、显式Apply写入、远端手改摘要不符和未管理同名冲突停止、结果不明不盲重试。平台无pwsh时只跳过Windows维护辅助测试，本Windows实际6项均通过，无业务门禁忽略。
- 全量223单测/45文件通过（含新增6），规范/类型/发布元数据/diff通过；初次生成器map(JSON.stringify/parse)两个类型错误已改为显式回调并重新通过。未修改应用Rust/Vue运行逻辑或依赖，不重新构建/安装/运行原生UI，也不把此前59E2E/47Rust当本轮重跑。生成时实际库SHA保持，不进行真实CRUD或将业务记录上传文档。
- Codex get apifox读回官方URL、ApiFox_MCP_TOKEN环境变量引用、版本头2025-09-01；配置段新增默认prompt审批。明文令牌未写配置或仓库。当前会话尚无原生Apifox工具目录，直接官方MCP已完成维护；用户下次重连/重启可加载，不需要为完成本轮文档再次重启。
- 长期新增API-03：涉及接口/模型/权限/响应变化同步实际契约与Apifox，并同Git/Wolai/交接读回；不相关UI改动不机械重传。手册1.4/79条，AGENTS、README入口及交接规则/架构/状态/检查点同步。应用版本、安装/MCP独立exe、安全例外和正式发布未通过结论复核无变。
- 当前全部未提交19文件：AGENTS.md、README.md、docs/handoff/{ARCHITECTURE,CHECKPOINT,CURRENT_STATE,README,RULES}.md；新docs/APIFOX_CHECKPOINT.md、docs/api/{README,OVERVIEW,DESKTOP_IPC,MODELS}.md、docs/api/{catalog,apifox-documents,apifox-manifest}.json、scripts/{apifox-mcp,sync-apifox-api}.ps1、scripts/{build-api-catalog,apifox-contract.test}.js。全局Codex仅apifox段为本任务外部配置变更，不提交账户配置。下一步最终链接/敏感值扫描与Git提交推送，Wolai主状态/交接新增API-03和对应来源读回，再保存闭环。最近额度五小时47%、周20%，不重置/唤醒，仅本Windows确认。

## 交付闭环

- 19文件提交b6c40ac336f02f1c1130e6b454e1e794eb30b056/tree36c485631747cc203383f59d14ebe21b46304e8f已校验同树同SHA非强制同步；常规push errno10054失败后使用既有GitHub传输，无TLS绕过。106本地链接有效，79条规则ID唯一，暂存内容内存扫描未含令牌。PS1换行提示是既定Windows检出CRLF，不是关闭格式检查或脚本失败。
- Wolai主状态28dPKMDkPpLCFu557s8exF version70、完整交接首部oLvsZ6M65HtTfFsJmg8ptD version7、API-02/03规则块967sNbmUTn3mFmaQPeruVn version3，均读回包含源b6c40ac/API-03/79条和真实未验边界。API正文仍精确绑定既有接口基线bd37fdd及独立exe旧源e534644，不把文档/传输提交冒称程序重建。
- Apifox26文档及本地manifest的ID/SHA、当前协议/权限、Git/Wolai/交接已一致；本段及交接检查点闭环记录另提交保存。准确后续：用户可直接在Apifox EasyProject查看26篇文档；若要在当前Codex聊天用原生Apifox工具，重连/必要时重启加载，现阶段已完成的直接MCP维护无需重做。后续API变化按API-03同步，遇人工修改摘要冲突先审阅。
- 剩余限制不隐藏：通用协议实体创建参数422，未配置原生自定义协议条目；当前为完整可读Markdown API契约，不是HTTP调试或可执行MCP测试用例。无其它平台验收、无独立exe刷新、无真实业务CRUD、无公开发布或新增通用标准。任务无需新增业务开发；仅本Windows确认，无定时任务或额度重置。
