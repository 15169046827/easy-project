# EasyProject API维护入口（Apifox）

用户已授权在私有Apifox **EasyProject / 8948094** 项目维护本项目API；主分支8751742，默认模块8741707。不操作同账户其它项目，不公开分享/发布，不上传令牌或真实业务数据。

## 当前覆盖

2026-10-22真实部署回执：本机/服务器schema6与账号3已升级；独立MCP已更新并实际只读发现18工具，API来源71ec2c7、二进制EC9C6EFE...。现有29目录/74接口/27参考已重绑来源并读回；用户仍需重连Codex加载新exe。HTTP18契约不变，不因内部部署自动改为公开发布。下方候选段为历史。

2026-10-22最新候选契约已同步并逐项读回：源码25afe853482ec6aa341feba56a522444b90ecbfa，56原生接口、18HTTP操作、27参考；HTTP保持testing，不等于当前服务器已部署。新增资料独立分组；旧15HTTP和55原生ID均保留。`sync-web-apifox.ps1`默认只读计划，`-Apply`先校验所有已管理SHA再增量导入、分组、更新及读回；中断须先检查远端/manifest，再以`-ResumeFrom <operationId>`续接未完成项，不盲重试。无说明须传空字符串而非null；请求/响应以实际Schema核验，保留原响应ID，不把写入成功当读回。原生参考同步仍使用原两个脚本。

2026-10-22候选契约：56原生条目（18 MCP/7注册IPC/31动作）及18 HTTP操作/15路径，新资料编辑、管理员重置码/凭码找回、desktop_credentials与schema6规范。最终Apifox写入/读回和部署状态以[新任务检查点](../ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md)为准，尚不能把本段当作已同步或已上线。旧独立MCP与新schema6不兼容，更新与重连前不得迁移其实际数据库。

2026-10-21已同步15个HTTP操作/12路径：新增普通注册、个人MCP凭据、远端MCP传输两个分组；总27目录/70接口，原55原生协议条目和26参考保留。15项权威详情状态testing/分组、请求Schema、说明及SHA读回通过；结构搜索可能缓存旧状态，不以写入success代替权威读回。实际ID/摘要见web-apifox-manifest及[检查点](../OPEN_SIGNUP_MCP_TOKEN_CHECKPOINT.md)，下方9操作为此前部署基线。

- 新增真实HTTP服务：`04 Web HTTP 接口`按认证与会话/账号管理/工作区/运行状态组织9个操作（8路径），契约[web-openapi.json](web-openapi.json)、远端ID与读回摘要[web-apifox-manifest.json](web-apifox-manifest.json)。与下列55个非HTTP原生接口分开维护，合计64接口。HTTP账号、cookie/Bearer、Origin/CSRF、revision冲突边界不能套用本地MCP权限。`verify-web-apifox.ps1`验证远端HTTP定义；首次导入须先读项目结构、忽略同名覆盖，不能用批量导入覆盖旧条目。导入器可能按tags额外建同名目录，应核对并归回既定模块，勿遗留重复层级。

- 55个原生通用协议接口条目：18项MCP工具、6项Tauri注册命令和31个model/action。按以下目录分组，不再用平铺Markdown代替接口；本地stdio/IPC仍不是HTTP服务，新增HTTP操作只属于独立远端服务。

    ```text
    01 MCP 对外接口：项目 / 任务 / 人员 / 项目团队
    02 桌面 IPC 内部接口：项目 / 任务 / 人员 / 项目团队 / 任务依赖 /
                         计划基线 / 数据与备份 / 工作日历 / 窗口与悬浮窗 / 存储位置
    03 接入规范与模型：总览 / 模型
    04 Web HTTP 接口：认证与会话 / 账号管理 / 工作区 / 运行状态
    99 历史文档快照：MCP 原文快照 / IPC 原文快照
    ```
- [catalog.json](catalog.json)：从实际交付MCP的tools/list及Rust分发器生成，包含严格inputSchema、权限注解、二进制源SHA/摘要和接口基线。不会因为生成文档就替换旧独立exe。
- [OVERVIEW.md](OVERVIEW.md)：握手、返回/错误、审批、恢复点、审计、关系/隐私与重试边界。
- [DESKTOP_IPC.md](DESKTOP_IPC.md)：内部31动作参数表、其它窗口/存储命令、响应及调用边界。
- [MODELS.md](MODELS.md)：生成的真实Rust模型和原生请求结构/serde默认，MCP inputSchema优先于桌面原生类型，不能混用默认值。
- [apifox-layout.json](apifox-layout.json)：20个目录、55个接口的生成布局；[apifox-documents.json](apifox-documents.json)：保留的26篇参考正文；[apifox-manifest.json](apifox-manifest.json)：远端ID、目录和逐项读回SHA256，不含凭据。

## 接入与凭据

当前Codex已配置官方新版Streamable HTTP `https://api.apifox.com/mcp`，仅引用`ApiFox_MCP_TOKEN`环境变量，版本头`X-Apifox-Api-Version: 2025-09-01`，默认prompt审批。令牌值不放配置/Git/Wolai/输出，客户端需要在账户环境变量更新后重连/必要时重启；配置不代表当前聊天已动态加载工具。

仓库维护辅助脚本使用同一正式MCP协议，在内存读取进程/账户环境变量，只允许官方HTTPS且不跟随重定向；EasyProject目标ID/动态工具白名单/显式-AllowWrite保护。它不是新的MCP Server，也不开放端口、不安装依赖或缓存到C盘。需要Windows PowerShell7（pwsh）及Node22；其它环境须单独确认，不假称已跨平台验收。

## 更新流程

1. 先核对实现、当前任务授权、Git/额度及Apifox目标。先读既有文档，不对其它项目写入。
2. 修改API时同步手工协议/IPC说明，运行生成器（仅发现工具，前后校验库SHA；不会CRUD）：

    ```powershell
    node scripts/build-api-catalog.js <数据页显示的已有E盘数据库绝对路径>
    node scripts/build-apifox-layout.js
    npx.cmd prettier --write scripts/build-api-catalog.js scripts/build-apifox-layout.js docs/api/*.json
    npx.cmd vitest run scripts/apifox-contract.test.js
    ```

3. 先执行`./scripts/sync-apifox-api.ps1`及`./scripts/group-apifox-api.ps1`只读计划；确认范围再分别加`-Apply`。前者更新参考正文并保留分组，后者维护目录和55个通用协议接口并移动参考资料。仅更新已管理且远端摘要匹配的条目；目录/未管理同名冲突、内容手改或结果不明时停止，不盲覆盖或重试。每次写后立即保存ID并读回字段/正文SHA。
4. 早期422已定位并解决：通用接口必须使用真实folderId，不能使用Markdown可接受的0。现已用真实根97870489及其子目录创建通用协议接口，协议为MCP stdio/Tauri IPC。接口详情承载Markdown协议说明是Apifox通用协议形式，不再是独立Markdown文档；它不提供HTTP请求调试或把本地IPC变为远程服务。
5. 验证后同步Git、Wolai、交接资料和Apifox相关契约；不涉及API的UI小改不机械重传26文档。源SHA、二进制版本、已验/未验、远端ID及同步缺口必须可追溯。

本轮逐份读回证据、失败/未验及下一步见[APIFOX_CHECKPOINT](../APIFOX_CHECKPOINT.md)。创建了文档不等于可在Apifox通过HTTP直接调本地应用，测试只能用隔离库，不以文档维护名义写真实业务数据。

官方来源：[新版Apifox MCP](https://docs.apifox.com/8395000m0)、[通用协议文档](https://docs.apifox.com/custom-protocol-api)、[Codex MCP配置](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)。
