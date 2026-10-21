# EasyProject headless server

新增账号式在线工作区，复用`src-tauri/src/{common,models,db,services}`；服务器不依赖Tauri/GTK，不适用旧Linux桌面链风险例外。桌面默认展示登录，同时提供“不登录，本地使用”，离线本地能力保留，不自动上传/合并/错误切换本地库。最新部署状态见[登录与服务检查点](../docs/DESKTOP_LOGIN_SERVICE_CHECKPOINT.md)，下方初期用户服务说明仅历史迁移参考。

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

## 初期私有部署（2026-10-21，独立账户整改前）

home-host已部署到`/home/ym_li/easyproject/releases/`，`current`指向逐文件摘要验证的版本。持久数据独立位于`/home/ym_li/easyproject/data`（700），用户systemd服务easyproject已启用，linger=yes；仅监听127.0.0.1:8080，Tailscale Serve代理私有HTTPS。已验证正常证书链、登录/退出、首次改密业务限制和恶意Origin拒绝；未创建真实业务项目或上传桌面数据。开机服务已配置，但未进行物理重启验收。

应用管理员为`ym_li`，随机初始密码只在服务器`data/initial-admin-password`（600）中；从自己的SSH终端查看并首次登录改密，不要复制进Git/Wolai/API文档。该凭据不是SSH密码。

Windows WebView仅在EasyProject自身主窗/浮窗进程使用`--no-proxy-server`，确保Tailscale直连，不更改系统或其它应用代理、不禁用证书验证。普通浏览器如使用代理，需要自行允许此私有域名直连；宿主机默认代理请求曾超时，而无代理的正常TLS请求200。最终产物与未验边界见检查点。

## 独立服务身份与启动命令

### 私有域名与浏览器代理

2026-10-21本机浏览器连接故障已定位为Clash规则与其内置DNS：Tailscale/服务器正常，直连200，Clash DNS对私有域名NXDOMAIN。当前配置仅新增该域名DIRECT和精确hosts→100.65.59.38后，普通代理路径网页/健康200；未改系统DNS/代理模式或TLS验证。切换配置/更新订阅可能覆盖本地两行，Tailscale地址变化也须重新核对。完整证据及私有备份边界见[连接检查点](../docs/PRIVATE_HTTPS_CONNECTIVITY_CHECKPOINT.md)，不要把代理凭据/备份上传。

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
