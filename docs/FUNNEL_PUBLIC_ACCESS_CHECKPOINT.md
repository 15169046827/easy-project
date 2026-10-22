# Funnel 公网试用检查点

## 已切换并完成公网初验（2026-10-22）

同步回执：33357822fd28f84b6fecddd2c67493f9eaafc5b5已精确SHA/同树非强制同步，工作区干净；Wolai主状态v85/交接入口v22读回Funnel授权、配置/公网证据、手机代理差异及原因未定。Apifox总览和本地交接1.10/79条一致；HTTP18/原生56无契约变更。仅本回执为最后纯文档修改，提交后应干净。设备/入口均保持，停止进一步网络测试，待用户决定后续诊断，不将手机号/凭据/真实数据上传云文档。

补充复测：103.84.155.217匿名session仍401/3.17秒；103.84.155.153随后TCP连接8秒超时（curl28、HTTP000），证明当前至少存在间歇性链路问题，不能只保留前6次成功结果或判定为确定地域封锁。已停止进一步网络测试，Funnel保持用户批准的公开试用状态。仅变更路由/文档，未改产品源码/数据库；本轮release:check、UPARS1.1.0验证与diff检查通过，不冒充重跑全量业务测试。

当前后续：先讨论是否继续定位移动直连/中继稳定性，以及共享限流/存储配额整改；不自动开始开发或收费服务。全部本轮未提交为AGENTS.md、README.md、server/README.md、docs/FUNNEL_PUBLIC_ACCESS_CHECKPOINT.md、docs/PROJECT_PLAN.md、docs/RELEASING.md、docs/api/OVERVIEW.md、docs/api/apifox-documents.json、docs/api/apifox-manifest.json及docs/handoff的README/RULES/ARCHITECTURE/CURRENT_STATE/CHECKPOINT。Apifox仅总览更新且读回，其余26参考UNCHANGED，接口/HTTP/权限不变。Git/Wolai收尾正在保存；SSH/本轮探测均退出，后台Funnel和原服务保持运行。

用户独立设备反馈：电脑断开Tailscale后可直接看到登录页，确认不依赖Tailnet访问。手机直连曾停在标题/载入/登录状态检查，随后开启代理可正常打开；尚不知道手机运营商/浏览器、DNS与IPv4/IPv6实际路径，不能据此认定地区封锁或应用地域限制。用户说“等一下”后停止额外网络诊断，不改代理/DNS/TLS/服务或Funnel。当前只可判定公网技术初验通过、手机直连兼容/可达性未通过，不能满足面向所有陌生用户的无代理稳定访问承诺。无需代理目标网络验收与原因定位为后续待用户决定事项；单纯换域名不保证改善线路。

正式服务版本/数据库未变，仅Tailscale入口配置新增`AllowFunnel[home-host.tail2956dd.ts.net:443]=true`。root700副本`/var/backups/easyproject/funnel-public-20261022/before.json`、after.json已保存；脚本精确比较TCP仍仅443/HTTPS、Web仍仅根路径代理127.0.0.1:8080，其它配置逐项一致。CLI明确Available on the internet、后台运行，easyproject/tailscaled均active；未重启整机/daemon、未开放SSH或数据库、未关闭防火墙/TLS。

Google公共DNS8.8.8.8查询解析到103.84.155.217/103.84.155.153及两个公网IPv6地址。公共解析器1.1.1.1的UDP请求超时、Google DoH超时、外部网页抓取工具未能访问均如实保留，不能用这些工具错误断言服务不通。本机用curl逐次临时`--resolve`强制连接上述两个公网中继IP，`--noproxy`且保留正常主机名/SNI/证书验证，6请求分别首页200/health200/匿名session401，TLS验证结果均0。公网IP不属100.x私有路径，排除本机MagicDNS直连；但仍是同一物理网络视角，不代替手机移动网络或各地区速度验收。两IP总耗时3.04—5.23秒、TCP连接0.30—1.32秒，仅6样本、非容量基准，已向用户请求手机关闭Wi-Fi/断开Tailscale只看登录页。

低影响安全检查（未登录、不注册、不写库）：首页/health200；session/admin用户/工作区revision/个人Token/MCP均401；恶意Origin登录及MCP POST均403；检查响应Cache-Control=no-store、X-Frame-Options=DENY。未做压力/限流阈值触发、生产账号CRUD、跨账号真实数据访问、登录/注册/备份恢复、物理重启，不能声称这些本轮通过。前轮243/68+11/52+1/51是已有应用验证，不是本轮重跑。

源码风险复核：登录按socket peer 30次/15分钟、注册10次/小时，Funnel反代使所有访客共享本地peer限额，单人可耗尽公共限额；不得通过直接信任任意X-Forwarded-For解决。账号总上限1000、每账号会话/有效MCP Token上限20、请求2MiB、MCP256KiB、头像压缩等现有控制仍在，但未发现完整每账号任务/磁盘/恢复点配额及磁盘告警，备份容量风险仍需后续整改。公网初步可达不等于适合广泛推广/正式发布；用户批准的是零预算公开试用，未自动授权新开发或付费服务。

回退方案（仅记录，不执行）：可用`sudo tailscale serve --bg --https=443 --yes http://127.0.0.1:8080`将此端口恢复私有，必须再读回确认AllowFunnel不再为true且TCP/Web与before一致；不要执行reset清除其它配置。官方说明bg配置会在daemon/设备重启后恢复，但本轮没有为验证重启设备，不能把文档行为当物理开机实测。

里程碑五小时余94%/周32%，无重置/唤醒/关机。新状态须同步AGENTS/handbook/server与API总览、Wolai/Git；API地址/认证/工具Schema未变，不重传所有HTTP接口或扩大原生MCP权限。全部未提交文件以Git实际状态核对，本检查点及对应治理/说明/生成物变更均属本轮。设备为当前Windows与home-host，SSH正常退出、后台Funnel/原服务保持运行。

## 目标与授权（2026-10-22）

用户要求零新增预算、无自有域名、面向陌生用户的公开试用评估，并明确允许将当前EasyProject私有Serve切换为Funnel。仅开放现有HTTPS应用入口到127.0.0.1:8080，不开放SSH/数据库，不购买域名/套餐，不扩大MCP权限或改系统代理/证书。公网切换不是正式发布验收通过。

WACAS未定义/待确认；实际UPARS1.1.0、交接1.9/79条与项目维护规范。基线1f55bab8cde64d96d0e794c03d89f706556a55b7，分支codex/audit-release-20261006-api，开工工作区干净。

开始前五小时剩4%触发硬停，未输入SSH口令、未改远端配置。用户随即告知恢复；旧SSH口令提示会话已取消，工具复核五小时余100%、周33%，未使用额度重置。此记录不是依赖自动上下文压缩。

已完成只读评估：home-host上Tailscale1.104.1；上次实际funnel/serve status均为tailnet only，代理到127.0.0.1:8080，EasyProject active。已部署应用前端71ec2c7/后端bca2d45、账号3/业务6保持原状。本机普通代理TLS EOF、直连正常为已知独立问题，不据此改系统配置。EU.org/PP.UA存在免费名称方案，但未申请/注册或绑定，Funnel不依赖其审批。

准确下一步：重新只读核对与保存Serve/Funnel JSON（新受保护副本）；核对官方当前CLI，再仅对既有EasyProject HTTPS路由启用后台Funnel。立即读回公网标记/目标/进程身份，验证正常TLS、公开DNS和外部可达性、匿名与跨源拒绝，不自动操作真实业务库；记录不能验证的公网网络/容量/账号隔离场景。有意外配置则停止，不重置全部Serve配置。随后同步Git/Wolai/交接并读回。

设备：本机Windows与home-host已于前阶段确认；本轮尚未重新认证，服务器/桌面数据和入口未改。无关机、定时唤醒或额度重置授权。文档同步：本检查点先本地保存，Git/Wolai/交接新增入口待本阶段同步。

当前全部未提交文件：docs/FUNNEL_PUBLIC_ACCESS_CHECKPOINT.md（本文件）。
