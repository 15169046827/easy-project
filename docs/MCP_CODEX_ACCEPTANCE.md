# Codex 本地 MCP 接入验收

日期：2026-10-10。结论：**当前Windows/Codex只读接入通过**。不代表真实库写入验收、其它客户端兼容或产品正式发布通过。

## 范围与环境

- 实现源码e534644；文档基线6bbebcebde92bd725cd845a778cf37f5e9fe5e72，分支codex/audit-release-20261006-api。
- E盘交付程序SHA256：8C11FCDFAA263BBA8E9AE52F7FE9F6162737D44A075F15FEF589EC01C50AD5B3，验收前再次核对一致。
- Codex服务器easyproject启用stdio，参数只有现有数据库路径，无allow-write/allow-delete。用户已重启客户端；本聊天真实工具目录加载7个只读工具。
- 使用token-saver及EasyProject维护规则；WACAS未定义/待确认，既有UPARS1.1.0。本次为接入验收，不冒充完整代码重审。

## 当前聊天实际调用

| 检查 | 结果 |
| --- | --- |
| project_list | 成功，1项目；分页元信息正确 |
| project_get | 成功，与列表目标记录一致 |
| task_list | 成功，5任务；均归属目标项目 |
| task_get | 成功，与列表目标记录一致 |
| member_list | 成功，空列表、total=0 |
| member_get | 现库无人员，使用不存在ID验证返回isError=true / Active record not found；未创建测试人员 |
| project_member_list | 成功，空团队列表 |
| 任务过滤/分页 | 按projectId查询第2页、每页2条，返回原列表第3/4项；total=5、totalPage=3 |
| 权限目录 | 仅7个查询工具；无create/update/delete可调用入口 |

没有保存业务内容到Wolai；本报告仅记录数量与行为。所有真实库调用只读，没有更改配置权限、真实数据、安装程序或Release资产。

## 隔离写入契约回归

运行既有编译测试mcp_stdio-44263533afa67c61.exe，EASYPROJECT_MCP_TEST_BINARY指定上述交付文件，TEMP/TMP均在E盘src-tauri/target/audit-tools/temp。real_stdio_supports_entity_crud_and_default_permission_denial：1通过、0失败，0.31秒。隔离唯一测试库覆盖实体CRUD和默认权限拒绝，不是Codex对真实库的写入测试。本次没有改产品源码，不重复已有效的全量构建/前端门禁；原39Rust单测、178前端单测、24生产浏览器及9专项证据见MCP开发检查点。

## 边界与后续

当前只读接入任务完成，可以直接在Codex查询项目、任务、人员和团队。真实库写入/删除保持关闭；启用需单独确认权限和客户端审批。人员get的真实存在记录分支未在当前空人员库中验证，以隔离契约回归作为补充，不能称真实数据分支已实测。Mac/Linux、其它客户端、远程HTTP、正式签名及产品正式发布仍不在本次结论内。
