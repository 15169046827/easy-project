# EasyProject headless server

新增账号式在线工作区，复用`src-tauri/src/{common,models,db,services}`；服务器不依赖Tauri/GTK，不适用旧Linux桌面链风险例外。桌面仍默认本地离线、无需登录；显式选择远端后才认证，不自动上传/合并本地库。

## 模式与安全边界

- 同一账号跨设备共享一份服务端工作区；不同账号独立数据库，不等于跨账号项目协作/团队权限系统。人员模型不等于登录账号。
- 管理员只能创建普通账号/查看账号列表，不能通过接口指定其他账号的业务库。无公开注册；首次改初始密码后才开放业务。密码Argon2id+随机盐，长度12–128字符；会话随机令牌摘要入库，12小时过期、每账号最多20，改密码撤销全部会话。
- Web使用HttpOnly/Secure/SameSite=Strict cookie；桌面使用仅内存Bearer，不进localStorage。仅同源和三个精确Tauri origin，写请求需Origin及专用请求头；无通配CORS。服务只绑定loopback，通过Tailscale Serve私有HTTPS反代，不启用Funnel、不开放公网。登录30次/15分钟/socket IP，反代下共享限额，不信任客户端X-Forwarded-For。
- 数据动作严格白名单、2MiB请求上限；跨端每写必须携带精确workspace revision，陈旧409，不盲重试。每次修改先保存安全备份并持久失效旧revision；重启/恢复后换epoch。15秒轮询检测其它端变化，用户手动刷新并重新编辑，不静默覆盖草稿。离线队列/自动冲突合并未实现。
- 账号库schema-v1，初始化DDL/版本提交同事务，拒绝未来版本；业务库沿用schema-v5。每工作区`web-audit.jsonl`仅记录随机操作ID、时间、固定model/action和阶段，不记录名称、正文、密码、令牌或完整参数；审计达到10MiB停写，需操作者归档。审计/网络结果不明时先读回，不自动重试。业务阻塞操作最多8个、密码哈希最多2个并发。
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

## 当前私有部署（2026-10-21）

home-host已部署到`/home/ym_li/easyproject/releases/`，`current`指向逐文件摘要验证的版本。持久数据独立位于`/home/ym_li/easyproject/data`（700），用户systemd服务easyproject已启用，linger=yes；仅监听127.0.0.1:8080，Tailscale Serve代理私有HTTPS。已验证正常证书链、登录/退出、首次改密业务限制和恶意Origin拒绝；未创建真实业务项目或上传桌面数据。开机服务已配置，但未进行物理重启验收。

应用管理员为`ym_li`，随机初始密码只在服务器`data/initial-admin-password`（600）中；从自己的SSH终端查看并首次登录改密，不要复制进Git/Wolai/API文档。该凭据不是SSH密码。

Windows WebView仅在EasyProject自身主窗/浮窗进程使用`--no-proxy-server`，确保Tailscale直连，不更改系统或其它应用代理、不禁用证书验证。普通浏览器如使用代理，需要自行允许此私有域名直连；宿主机默认代理请求曾超时，而无代理的正常TLS请求200。最终产物与未验边界见检查点。
