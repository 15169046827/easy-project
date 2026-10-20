# EasyProject API维护入口（Apifox）

用户已授权在私有Apifox **EasyProject / 8948094** 项目维护本项目API；主分支8751742，默认模块8741707。不操作同账户其它项目，不公开分享/发布，不上传令牌或真实业务数据。

## 当前覆盖

- 26篇Markdown文档：18项MCP工具、6项Tauri注册命令、协议/权限总览和模型/请求类型。crud_action文档包含完整31个model/action。Apifox的HTTP接口数为0是正确现状，本地stdio/IPC不是HTTP服务。
- [catalog.json](catalog.json)：从实际交付MCP的tools/list及Rust分发器生成，包含严格inputSchema、权限注解、二进制源SHA/摘要和接口基线。不会因为生成文档就替换旧独立exe。
- [OVERVIEW.md](OVERVIEW.md)：握手、返回/错误、审批、恢复点、审计、关系/隐私与重试边界。
- [DESKTOP_IPC.md](DESKTOP_IPC.md)：内部31动作参数表、其它窗口/存储命令、响应及调用边界。
- [MODELS.md](MODELS.md)：生成的真实Rust模型和原生请求结构/serde默认，MCP inputSchema优先于桌面原生类型，不能混用默认值。
- [apifox-documents.json](apifox-documents.json)：本轮上传的全部正文；[apifox-manifest.json](apifox-manifest.json)：远端ID及逐篇读回SHA256，不含凭据。

## 接入与凭据

当前Codex已配置官方新版Streamable HTTP `https://api.apifox.com/mcp`，仅引用`ApiFox_MCP_TOKEN`环境变量，版本头`X-Apifox-Api-Version: 2025-09-01`，默认prompt审批。令牌值不放配置/Git/Wolai/输出，客户端需要在账户环境变量更新后重连/必要时重启；配置不代表当前聊天已动态加载工具。

仓库维护辅助脚本使用同一正式MCP协议，在内存读取进程/账户环境变量，只允许官方HTTPS且不跟随重定向；EasyProject目标ID/动态工具白名单/显式-AllowWrite保护。它不是新的MCP Server，也不开放端口、不安装依赖或缓存到C盘。需要Windows PowerShell7（pwsh）及Node22；其它环境须单独确认，不假称已跨平台验收。

## 更新流程

1. 先核对实现、当前任务授权、Git/额度及Apifox目标。先读既有文档，不对其它项目写入。
2. 修改API时同步手工协议/IPC说明，运行生成器（仅发现工具，前后校验库SHA；不会CRUD）：

    ```powershell
    node scripts/build-api-catalog.js <数据页显示的已有E盘数据库绝对路径>
    npx.cmd prettier --write scripts/build-api-catalog.js docs/api/*.json
    npx.cmd vitest run scripts/apifox-contract.test.js
    ```

3. 先执行`./scripts/sync-apifox-api.ps1`只读计划；确认范围再加`-Apply`。仅更新manifest中已管理且远端摘要仍匹配的文档，新增同名冲突拒绝；每次写后立即保存ID、读回比较SHA。已有内容手改/结果不明确时停止，不盲覆盖或重试。
4. Apifox通用接口POST在本轮返回422、官方工具未提供可用自定义协议管理参数；未继续猜参数或伪造HTTP。Markdown覆盖不等于已配置可视化通用协议类型/HTTP调试。若后续需要通用协议实体，应先核实该参数契约再迁移，不删除现有文档掩盖失败。
5. 验证后同步Git、Wolai、交接资料和Apifox相关契约；不涉及API的UI小改不机械重传26文档。源SHA、二进制版本、已验/未验、远端ID及同步缺口必须可追溯。

本轮逐份读回证据、失败/未验及下一步见[APIFOX_CHECKPOINT](../APIFOX_CHECKPOINT.md)。创建了文档不等于可在Apifox通过HTTP直接调本地应用，测试只能用隔离库，不以文档维护名义写真实业务数据。

官方来源：[新版Apifox MCP](https://docs.apifox.com/8395000m0)、[通用协议文档](https://docs.apifox.com/custom-protocol-api)、[Codex MCP配置](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)。
