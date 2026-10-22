# EasyProject 数据库整体设计

核对日期：2026-10-22。账号schema3/业务schema6现已保护迁移并部署，本地与服务器所有原字段和关系按ID映射核验保持，全部自有表独立语义前缀完整UUID。下方schema2/5表格为整改前01a8593基线；当前采用后节统一设计，不再把旧表格当现状。实际证据与副本见账号资料专项检查点。

## 库的隔离

| 数据库 | 保存内容 | 不保存的内容 |
| --- | --- | --- |
| 服务器 `/var/lib/easyproject/accounts.db` | 登录账号、密码Argon2id哈希、会话摘要、个人MCP Token摘要和权限 | 项目、任务、人员业务资料 |
| 服务器 `workspaces/<账号内部key>/project_manager.db`，每账号一库 | 本账号项目、任务、人员、关系、基线、工作区并发版本 | 密码、登录会话、MCP密钥 |
| 桌面 `<用户指定非C盘目录>/project_manager.db` | 独立离线业务数据，默认安装侧data | 服务器账号密码/会话/远端业务数据 |

账号不是人员：account是认证主体，member是项目人员资料，不能互相当作登录权限。当前不同账号工作区隔离，不是跨账号团队协作。备份/恢复不跨库混入认证数据。

## 整改前表和关联（历史基线）

| 库 | 表 | 主键 | 主要字段/关联 |
| --- | --- | --- | --- |
| 账号schema2 | account | id（无前缀UUID） | username唯一、password_hash、admin、must_change、disabled |
| 账号schema2 | session | token_hash（没有独立id，不符合要求） | account_id外键、expires；只存摘要 |
| 账号schema2 | mcp_token | id（无前缀UUID） | account_id外键、name、token_hash唯一、scope、created、expires |
| 业务schema5 | project | id（PROJECT:18位片段） | name/version/type/status；owner→member；工作日历；creator/时间/软删 |
| 业务schema5 | task | id（TASK:18位片段） | project_id→project；parent→task；assignee→member；排序/排期/进度/备注/软删 |
| 业务schema5 | member | id（MEMBER:18位片段） | name/email/phone/role/avatar/不可用日期/时间/软删 |
| 业务schema5 | project_member | id（PM:18位片段） | project_id→project、member_id→member、role/joined_at/软删 |
| 业务schema5 | task_dependency | id（DEP:18位片段） | predecessor_task_id、successor_task_id→task；FS/lag；唯一边/禁止自环 |
| 业务schema5 | plan_baseline | id（BL:18位片段） | project_id/task_id，名称和起止日期快照/created_at |
| 远端业务附加 | web_revision | id=1整数 | value；服务端乐观并发/进程epoch，不是业务记录 |

六业务表都有独立ID，但目前并非完整UUID；账号后加表也没有全部沿用前缀规范，这是本轮整改项。部分关系为服务层强制校验而非SQLite外键，不能把箭头全部宣传成数据库FK。SQLite内置sqlite_sequence/schema元信息不属于项目自有业务表。

## 当前已部署的统一设计

所有自有表使用独立字符串主键`id`，格式`完整大写语义:32位小写十六进制UUIDv4`，如`PROJECT:550e8400e29b41d4a716446655440000`。前缀：ACCOUNT、SESSION、MCP_TOKEN、PASSWORD_RESET、PROJECT、TASK、MEMBER、PROJECT_MEMBER、TASK_DEPENDENCY、PLAN_BASELINE、WEB_REVISION。新增表声明TEXT；历史业务VARCHAR(32)在SQLite有文本亲和性而无实际长度截断，不为改声明冒险整表重建。摘要另设唯一索引，不用摘要替代记录ID；内部单例另设唯一singleton_key，不用数字替代ID。

候选账号schema3另增password_reset(id/account_id唯一/token_hash唯一/created/expires)，只保存管理员一次性重置码摘要，15分钟有效，成功重置时事务删除并撤销旧会话和MCP Token。管理员可从已登录账号管理生成；仅剩单管理员忘记密码时，服务器维护者可在自己的终端用受权限控制的issue-reset-code指令发码，不复用SSH密码作为应用密码，不提供匿名发码。

账号目标增加avatar（经校验压缩PNG）及内部workspace_key（安全磁盘映射，非用户显示ID）；更改用户名不移动数据，账号ID迁移也不改掉原工作区目录。密码仅保存哈希；桌面“保存密码”是另一个受系统保护的凭据文件，不进入业务库/导出/云同步。用户名与头像以认证本人接口更新，不能改admin/disabled或他人资料。

迁移必须有版本、事务、旧→新ID映射和关联完整性复验；旧备份原件保持，恢复/导入须按兼容策略迁移，不能恢复出引用断裂的旧ID。内部版本号/时间戳/排序序号不是实体ID，不必伪装成UUID。上线前验证数据数量和除ID映射外的全部字段、密码哈希、会话与Token摘要保持不变；真实数据迁移不做开发试验。
