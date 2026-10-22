# EasyProject API：协议、权限与错误

2026-10-22实际部署已完成，HTTP18/原生56与账号3/业务6已生效；独立本机MCP已安全更新至schema6兼容构建EC9C6EFE...，保留原18工具授权，客户端须重连。接口来源71ec2c7、后端bca2d45，精确证据见专项检查点；以下“候选/旧独立程序”仅为历史升级说明，不代表仍待部署。

2026-10-22候选新增18个HTTP操作/15路径：本人头像/用户名、管理员一次性重置码、匿名凭码重置；新密码及登录统一6—31字符，无长密码兼容，账号schema3/业务schema6。新增desktop_credentials仅Windows主窗加密保存，原生56条=18MCP+7注册IPC+31动作。全部自有记录ID统一大写语义前缀+完整32位UUID，业务ID升级会变化，外部脚本/旧深链须重新查询；不改变内容/关系。部署/实际独立MCP兼容身份必须看专项检查点，不把候选当已上线。账号与业务本来分库，目标设计见../DATABASE_DESIGN.md；本机MCP不自动迁移，旧schema5独立exe不得连接schema6，须受保护更新/重连。下方旧15/55条为历史。

本页描述本地桌面/MCP协议：MCP JSON-RPC over stdio与受控Tauri invoke内部IPC共享Rust业务校验，两者自身不监听HTTP。另有账号式网页版/headless HTTP服务，真实契约见[web-openapi.json](web-openapi.json)与[服务说明](../../server/README.md)。桌面默认登录并提供显式“不登录，本地使用”，本地能力仍离线可用、不自动上传/混库，也不自动把本地MCP接到远端；启动入口变化不改变协议认证或权限契约。

## 接入与能力

MCP独立程序使用已有schema-v6数据库的绝对路径启动，不创建空库、不迁移。默认7项查询；`--allow-write`增加创建/修改，另加`--allow-delete`提供完整18工具。当前用户已明确选择完整CRUD；能力开启不等于可以任意改真实数据，仍按具体任务及客户端审批执行。程序、数据库路径以本地配置/数据页为准，非C盘；不要上传真实库、个人资料或令牌到Apifox。

## 消息流程

1. 客户端发送initialize（protocolVersion、capabilities对象、clientInfo对象）；支持2025-03-26/06-18/11-25，未知版本回选2025-11-25，不承诺所有未来版本。
2. 客户端发送无id的notifications/initialized，再调用tools/list、tools/call；ping可作活性检查。单条JSON一行，stdout仅协议，消息最大256KiB。
3. tools/call参数为`{name,arguments}`；详情中的JSON Schema即arguments结构，不是HTTP请求体。拒绝未知字段、空白名称、错误类型/范围和非法关系。

只读调用示例（占位符，不包含用户数据）：

```json
{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": { "name": "easyproject_task_list", "arguments": { "pageIndex": 1, "pageSize": 20 } }
}
```

## 返回与错误

成功的tools/call在result内包含content文字JSON、structuredContent结构对象及isError=false。列表返回分页对象（团队列表为list）；get返回记录；写入返回`{record,operation_id,recovery_point}`；删除record为`{id,deleted:true}`。不要把桌面ApiResponse外壳套在MCP结果上。

工具业务/权限/输入拒绝使用result.isError=true和文字说明；协议错误使用JSON-RPC error：-32600请求无效，-32601方法不存在，-32602参数错误，-32002尚未完成握手。协议消息解析还有-32700解析错误。调用方必须区分传输失败、协议error和工具isError，不能仅看HTTP状态（本项目stdio没有HTTP状态）。

## 写入与隐私边界

- 项目/任务/人员软删除，不自动级联。删除前查询当前名称并提供confirm_name；团队退出提供confirm_member_name。名称匹配不能代替用户授权。
- 任务负责人必须属于项目团队；项目负责人自动入队；任务层级/依赖不得环或跨项目破坏关联，Done为100%。进度0–100，日期为空或YYYY-MM-DD；日历/可用性配置沿用JSON数组字符串。
- expected_update_time是秒级过期检测，不是严格CAS；写入不是幂等接口，传输中断、提交后审计错误时先查询确认，禁止盲重试。
- 通过参数校验的写入尝试先生成UUID恢复点，并记录脱敏审计。备份/审计失败不开始修改，失败事务回滚；提交后审计失败会提示已提交状态。审计超过10MiB停止新写入，恢复点不自动清理。
- 第一版写会话建议关闭桌面，不与导入/恢复或旧版编辑并行；UI非实时订阅，操作结束重进页面/重开查看。只信任指定客户端和本机账户，不防御同账户恶意程序。
- MCP不暴露原始SQL、任意文件、批量删除、依赖写入、模板、导入或恢复工具；Tauri内部支持这些功能不等于自动对外开放。

## 文档与运行验证

2026-10-21新增远端契约：Web开放`POST /api/auth/register`普通账号注册；`/api/account/mcp-tokens`查询/生成个人Token，`/revoke`撤销。专用Bearer仅用于`/mcp`无状态Streamable HTTP（JSON响应、通知202、GET405），不接受网页登录cookie/会话，提供7/14/18工具的只读/可写/完整CRUD选择。工具业务Schema复用下文stdio目录，账号锁/旧Web revision失效、恢复点/脱敏审计共同保护。它不是把原stdio改成HTTP；旧本机连接、exe和权限不变。无OAuth发现/邮箱验证/找回，不公开公网。新HTTP共15操作/12路径，详web-openapi.json；实现/部署边界见开放注册检查点。

catalog.json保留实际交付exe工具Schema、二进制源SHA/摘要和当前桌面分发清单；不声称旧独立exe已更新到新安全锁。测试只能在隔离库CRUD，文档同步只上传接口定义/合成示例，不携带真实业务记录。Apifox为私有项目8948094/main，文档维护不公开发布、不修改其它项目。
