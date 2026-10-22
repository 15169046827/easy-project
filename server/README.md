# EasyProject headless server

2026-10-22用户批准零预算Funnel公网试用，现有`https://home-host.tail2956dd.ts.net`已可经公网中继访问，不再要求访客加入Tailnet；后端仍只监听127.0.0.1:8080、受限easyproject身份/原账号隔离不变。原Serve配置root700副本和精确切换/回退见[公网检查点](../docs/FUNNEL_PUBLIC_ACCESS_CHECKPOINT.md)。仅开放应用，SSH/数据库仍不公开；下方私有部署/Funnel禁用段是此前阶段。当前共享限流和缺少细粒度存储配额未整改，公网可达不代表正式发布通过。后台bg持久性为配置/官方行为，物理重启未验。

离线升级入口：先`sudo systemctl stop easyproject`并创建受保护的新副本，再以受限服务身份执行`sudo -u easyproject env EASYPROJECT_DATA_DIR=/var/lib/easyproject <新版本目录>/bin/easyproject-server migrate-storage`。只迁移现有账号库及已存在的工作区库，不创建缺失库/账号，不输出凭据；预检全部目录/链接，每库原副本和事务保护，但不宣称跨库原子性。全部字段/ID映射核验通过才切换current并启动，失败保持停服、保存现场并人工决定回滚，不能仅切旧程序读取新库。

2026-10-22候选：账号schema3/业务schema6，独立字符串ID统一完整语义前缀+32位UUID。account新增avatar/workspace_key，目录key与账号ID分离，用户名改变不迁库；账号/会话/MCP/重置码仍独立accounts.db，业务另库。头像/改名接口POST /api/account/profile；新密码与登录6—31字符。忘记密码为管理员15分钟一次性码，POST /api/admin/reset-codes发码，POST /api/auth/reset-password凭码重置并撤销旧会话/Token。仅保存摘要/一次显示，不提供用户名直接改密或邮件找回。

唯一应用管理员也忘记密码时，服务器维护者可在自己的SSH终端执行`sudo -u easyproject env EASYPROJECT_DATA_DIR=/var/lib/easyproject /opt/easyproject/current/bin/easyproject-server issue-reset-code <应用用户名>`。只在新候选已部署后使用，输出是敏感一次性码，不发到聊天/日志/云文档。此命令依赖对账号库的系统文件权限，不能给普通网页用户开放；不是重用SSH密码。正常界面优先由已登录应用管理员发码。

升级必须停服务新安全副本、迁移映射/密码哈希/会话/Token/工作区引用核验；旧schema2/5程序不能直接回退读取新库。业务备份原件保留，schema5恢复受控迁移，JSON导入1—6/导出6。受控backups/id-map-schema6-*.json记录预期旧→新ID映射，需核对实际schema/新ID确认提交，文件存在不等于迁移成功。旧ID和深链/外部脚本需重新查询，不自动使用旧独立stdio exe读schema6。精确状态见[当前检查点](../docs/ACCOUNT_PROFILE_DATABASE_CHECKPOINT.md)，本段不代表已更新实际服务器。

2026-10-21新增开放注册与用户MCP：`POST /api/auth/register`仅注册普通账号、自设密码无需首次改密（管理员分配账号仍须改密）；10次/小时/socket IP且总账号上限1000，反代共享限额。不提供邮箱验证/自助找回。账号库事务升级schema2，原身份/密码/会话保留。升级前须备份，旧schema1程序不能直接读取schema2；回滚不能仅切旧二进制，更不能未经核对恢复旧库丢失新用户记录。

登录后“MCP 接入”生成个人Token，一次显示、只存SHA256摘要、7/30/90天、最多20个有效Token；read/write/delete分别开放7/14/18工具，默认只读，删除包含写权限。支持撤销，改密撤销全部会话和Token。Token仅用于`https://home-host.tail2956dd.ts.net/mcp`的Authorization Bearer，不用cookie/网页登录令牌、不放URL或日志，与本地stdio独立。无状态Streamable HTTP以JSON响应、通知202、GET405；Accept为application/json与text/event-stream，版本为2025-03-26/06-18/11-25。无OAuth发现/SSE；需支持手动Bearer的客户端。Origin存在时必须同源。工具复用本地schema/领域校验/恢复点/审计，仅访问本人库、与Web共享锁和revision失效，不自动重试写入。契约见docs/api/web-openapi.json，部署状态见[检查点](../docs/OPEN_SIGNUP_MCP_TOKEN_CHECKPOINT.md)。

新增账号式在线工作区，复用`src-tauri/src/{common,models,db,services}`；服务器不依赖Tauri/GTK，不适用旧Linux桌面链风险例外。桌面默认展示登录，同时提供“不登录，本地使用”，离线本地能力保留，不自动上传/合并/错误切换本地库。最新部署状态见[登录与服务检查点](../docs/DESKTOP_LOGIN_SERVICE_CHECKPOINT.md)，下方初期用户服务说明仅历史迁移参考。

## 模式与安全边界

- 同一账号跨设备共享一份服务端工作区；不同账号独立数据库，不等于跨账号项目协作/团队权限系统。人员模型不等于登录账号。
- 管理员只能创建普通账号/查看账号列表，不能通过接口指定其他账号的业务库。已开放普通账号自助注册；管理员分配初始密码仍须改密，自设密码无需重复改密。密码Argon2id+随机盐，长度12–128字符；会话随机令牌摘要入库，12小时过期、每账号最多20，改密撤销全部会话及个人MCP Token。
- Web使用HttpOnly/Secure/SameSite=Strict cookie；桌面使用仅内存Bearer，不进localStorage。仅同源和三个精确Tauri origin，写请求需Origin及专用请求头；无通配CORS。服务只绑定loopback，通过Tailscale Serve私有HTTPS反代，不启用Funnel、不开放公网。登录30次/15分钟/socket IP，反代下共享限额，不信任客户端X-Forwarded-For。
- 数据动作严格白名单、2MiB请求上限；跨端每写必须携带精确workspace revision，陈旧409，不盲重试。每次修改先保存安全备份并持久失效旧revision；重启/恢复后换epoch。15秒轮询检测其它端变化，用户手动刷新并重新编辑，不静默覆盖草稿。离线队列/自动冲突合并未实现。
- 账号库schema-v2，初始化/兼容升级DDL和版本提交同事务，拒绝未来版本；业务库沿用schema-v5。每工作区`web-audit.jsonl`/`mcp-audit.jsonl`只记录受限操作元数据，不记录名称、正文、密码、Token或完整参数；审计达到10MiB停写，需操作者归档。审计/网络结果不明时先读回，不自动重试。业务阻塞操作最多8个、密码哈希最多2个并发。
- 远端关闭全库快照式撤销重做，避免回滚其它设备；本地功能保留。导入/恢复仍是显式替换当前账号工作区，不是双向同步。备份按既有策略保留，服务器安全快照`web`不自动删；需关注磁盘配额，非公网生产承诺。

## 启动

环境变量必须显式指定：`EASYPROJECT_DATA_DIR`（绝对目录）、`EASYPROJECT_ASSETS_DIR`（Vite dist）、`EASYPROJECT_ORIGIN`（精确HTTPS源）。`EASYPROJECT_LISTEN`默认`127.0.0.1:8080`，拒绝非loopback。

当前用户服务设置进程级`TZ=Asia/Shanghai`以匹配既有无时区本地业务时间字符串；不修改Ubuntu系统时区，审计/会话仍用UTC。跨时区用户的完整时间模型迁移尚未承诺。

```powershell
cargo test --manifest-path server/Cargo.toml --locked
cargo clippy --manifest-path server/Cargo.toml --all-targets --locked -- -D warnings
cargo build --manifest-path server/Cargo.toml --release --locked
```

第一次用`easyproject-server bootstrap-admin <username>`，密码从标准输入提供，不要放命令参数/历史。只允许空账号库bootstrap；应用管理员与SSH/Ubuntu账户完全不同，不复用操作系统密码。以普通用户运行、目录权限700、umask077。数据库为`accounts.db`和`workspaces/<服务端生成账号ID>/project_manager.db`，不能由请求传任意路径。

部署与回滚：版本目录保存bin/web与源SHA，`current`指向已核验版本；systemd用户服务固定读当前版本、持久数据另存。升级前暂停写入并备份数据，失败切回旧版本；禁止把本机真实库当服务器初始数据或自动回滚新用户记录。Linux构建CI使用Ubuntu22.04及Rust1.90，产物仅私有测试部署，不创建公开Release。

本机当前连接地址为`https://home-host.tail2956dd.ts.net`；设备需要加入同一Tailnet。更换服务器时必须同步桌面精确CSP allowlist，不放宽为任意HTTPS。公网IP、域名、可信反代/独立限流、MFA/账号禁用恢复、运维告警/异地备份与完整生产审计另行安排。当前服务不替代本地MCP，不自动把本地MCP改为远端。

当前进度/验证/一次性关机授权状态见[检查点](../docs/WEB_SERVER_CHECKPOINT.md)。

## 初期私有部署（2026-10-21，独立账户整改前）

home-host已部署到`/home/ym_li/easyproject/releases/`，`current`指向逐文件摘要验证的版本。持久数据独立位于`/home/ym_li/easyproject/data`（700），用户systemd服务easyproject已启用，linger=yes；仅监听127.0.0.1:8080，Tailscale Serve代理私有HTTPS。已验证正常证书链、登录/退出、首次改密业务限制和恶意Origin拒绝；未创建真实业务项目或上传桌面数据。开机服务已配置，但未进行物理重启验收。

应用管理员为`ym_li`，随机初始密码只在服务器`data/initial-admin-password`（600）中；从自己的SSH终端查看并首次登录改密，不要复制进Git/Wolai/API文档。该凭据不是SSH密码。

Windows WebView仅在EasyProject自身主窗/浮窗进程使用`--no-proxy-server`，确保Tailscale直连，不更改系统或其它应用代理、不禁用证书验证。普通浏览器如使用代理，需要自行允许此私有域名直连；宿主机默认代理请求曾超时，而无代理的正常TLS请求200。最终产物与未验边界见检查点。

## 私有域名与浏览器代理

2026-10-21本机浏览器连接故障已定位为Clash规则与其内置DNS：Tailscale/服务器正常，直连200，Clash DNS对私有域名NXDOMAIN。当前配置仅新增该域名DIRECT和精确hosts→100.65.59.38后，普通代理路径网页/健康200；未改系统DNS/代理模式或TLS验证。切换配置/更新订阅可能覆盖本地两行，Tailscale地址变化也须重新核对。完整证据及私有备份边界见[连接检查点](../docs/PRIVATE_HTTPS_CONNECTIVITY_CHECKPOINT.md)，不要把代理凭据/备份上传。

## 独立服务身份与启动命令

普通用户不输入服务器地址，桌面内置`DESKTOP_SERVER_ORIGIN`并与精确CSP绑定；本地模式点击“登录账号”直接回登录页。旧用户缓存地址不作为凭据目标。更换域名由维护者改应用受控配置/CSP/systemd环境并重新验证。

目标系统服务`easyproject.service`以锁定密码、nologin、无sudo权限的`easyproject`系统账户运行，不再使用`ym_li`用户会话。只读版本`/opt/easyproject/releases/<源码>`和`current`由root管理；持久数据`/var/lib/easyproject`归服务账户所有且700。系统unit为`deploy/easyproject-system.service`，启用ProtectSystem=strict/ProtectHome/NoNewPrivileges，仅数据目录可写；既有用户unit必须停用，不能同时监听8080。

应用管理员`easyproject_admin`与Linux服务账户/SSH管理员均不同；新初始密码随机生成，只留root可读`/etc/easyproject/initial-admin-password`（600），首登强制改密。仅空账号库可用`deploy/bootstrap-system-admin.py`，旧账号/数据不得盲目覆盖。实际完成状态以检查点为准。

在服务器终端启动、查看状态和重启：

```bash
sudo systemctl start easyproject
sudo systemctl status easyproject --no-pager
sudo systemctl restart easyproject
```

部署时一次性配置开机自启：`sudo systemctl enable --now easyproject`。查看日志：`sudo journalctl -u easyproject -n 50 --no-pager`。初始密码仅在自己的SSH终端使用`sudo cat /etc/easyproject/initial-admin-password`查看，不复制到代码或云文档。登录地址仍是`https://home-host.tail2956dd.ts.net`，只在Tailnet可用。
