# 受信Tailscale代理与认证限流

候选实现：`server/src/rate_limit.rs`。是否已部署以`docs/NEXT_PHASE_CHECKPOINT.md`最新回执为准，不能只凭本文判断线上已启用。

默认无`EASYPROJECT_TRUSTED_PROXY`或值`none`时，始终使用真实socket IP，忽略所有转发头。仅维护者确认机器上Tailscale HTTP反向代理后可设`tailscale-loopback`；其它值启动失败，且该模式要求HTTPS origin，主程序仍强制只监听回环，不改Funnel入口或认证授权。

该模式只在socket peer为回环时检查：X-Forwarded-For必须恰有一个字段、一个可解析IP；X-Forwarded-Host必须单值且与受控origin主机/端口匹配；X-Forwarded-Proto必须单值https。缺失、重复、列表、格式错误或不一致均回退真实peer共享桶，不选取任意“第一/最后一跳”。IPv4映射IPv6规范为同一桶，不根据Forwarded/X-Real-IP或Tailscale身份头认证用户。

依据为本机已核实的Tailscale **1.104.1**及[官方同版本源代码](https://github.com/tailscale/tailscale/blob/v1.104.1/ipn/ipnlocal/serve.go#L1014)：`addProxyForwardedHeaders`覆盖为单一来源IP，并填充Host/HTTPS；不是将调用者的XFF链直接透传。升级代理、引入其它反代或开放后端监听前必须复核，不能把此结论推广到任意代理。Funnel没有登录身份头，IP更不是账号身份；[官方Serve说明](https://tailscale.com/docs/features/tailscale-serve#identity-headers)亦要求后端保持localhost监听。

信任边界包含该服务器本地进程：它们若直接连接回环，可伪造这些头，因此该配置**不是抵抗已入侵服务器的措施**，也不能用于账号、MCP权限或租户选择。进程内仍有独立全局预算，不能只轮换IP绕过总预算；保留2个密码哈希并发位/8个业务位和所有Origin/CSRF/会话/Token限制。

| 操作         | 每客户端    | 整个进程     |
| ------------ | ----------- | ------------ |
| 登录         | 30次/15分钟 | 300次/15分钟 |
| 注册         | 10次/小时   | 100次/小时   |
| 一次性码重置 | 10次/15分钟 | 100次/15分钟 |

均为尝试次数（成功也计数），固定窗口满后429；操作分别计数，总客户端键最多1024，满时拒绝新增键但不无条件封禁已有键。内存计数重启清空，不是假称持久锁定或抵御所有分布式攻击；限流状态不返回IP或用户名、不记凭据。限流值为当前零预算公开试用的保守服务保护，未来随容量与实测调整必须同步契约/测试。
