# 运维备份与恢复演练

本工具仅供维护者执行，不是HTTP/MCP接口。不登录真实账号，不改业务表，不恢复覆盖在线库、不自动删除历史副本。账号库与各工作区使用SQLite在线backup逐库取快照；**不是跨库事务快照**，有跨库一致性要求时先协调停写/停服再做全量保护副本。

## 已实现边界

- `backup`：检查源目录/工作区身份/链接，生成全新私有bundle，逐库完整性、外键、内容摘要校验；全部成功才发布manifest。超时/失败保留未完成目录，无manifest不能视为有效备份。
- `verify`：只接受受控数据库相对路径，检查字节摘要，再在bundle内临时目录进行真正SQLite恢复和逐表内容核验。只清理本次演练临时副本，不触碰原库或历史bundle。
- `health`：只读磁盘容量；可用空间低于1GiB或10%返回警告及退出码2，不输出账号/业务内容。
- 备份前预留完整bundle及最大单库演练副本空间，复制进度中继续检查剩余页预算，恢复前再检查副本预算；额外保留至少1GiB且10%磁盘空间给主应用。并发其它进程仍可消耗容量，因此不是操作系统硬配额保证；不以填满磁盘作为停止手段。
- `run`：先health；容量警告时不开始新备份。正常时backup并立即verify；任一步失败退出码1，成功0。
- 默认协作时限300秒（可设1—3600）：SQLite备份回调、查询进度、行遍历和分块文件摘要检查同一截止时间。它不能打断挂起的文件系统调用，必须由外层服务的360秒硬超时补足，不宣称任意手工运行都有强制截止保证。
- `--receipt`只允许全新文件，不能覆盖既有回执或写入源数据/被验证快照。`--receipt-dir`在既有私有目录生成唯一回执；两者不能同时用。成功/失败/耗时均结构化记录，异常不含路径/账号正文。断电/外层强制终止可能留下空/不完整回执，必须按失败处理，不能仅凭文件存在判定成功。

## Linux安装候选（需维护者检查后启用）

所需Python3、flock和systemd均使用系统已有工具，不自动安装。部署`/opt/easyproject/ops/safety.py`为root管理的只读代码；创建root:root、0700的`/var/backups/easyproject/ops`及`snapshots`、`runs`目录。不得在共享可写目录运行特权代码。

模板在`server/deploy/easyproject-safety@.service`及两个timer：每日03:00（服务器时区）加0—15分钟随机延迟备份，启动5分钟后及每15分钟监测容量；仅`run`与`health`实例。root读取0700数据是维护权限，不扩展应用或对外接口权限；服务将源数据挂为只读，仅副本目录可写、禁止网络。共用flock拒绝并发；锁冲突/硬超时由systemd失败状态和journal记录，不一定有应用回执。

启用前应先在**隔离合成数据**验证权限、锁冲突、超时、成功及失败状态，再用真实数据只读备份/隔离恢复演练，保留新副本，不能以重启主机作为测试。现有服务与数据库迁移无关，不需要重启EasyProject。

```sh
sudo systemd-analyze verify /etc/systemd/system/easyproject-safety@.service /etc/systemd/system/easyproject-backup.timer /etc/systemd/system/easyproject-health.timer
sudo systemctl daemon-reload
sudo systemctl start easyproject-safety@run.service
sudo systemctl status easyproject-safety@run.service --no-pager
sudo systemctl enable --now easyproject-backup.timer easyproject-health.timer
```

以上是操作手册，不是“已部署”回执。实际启用状态见`docs/NEXT_PHASE_CHECKPOINT.md`。回退仅停止/禁用这两个timer及其作业，不删除任何快照、不恢复生产数据、不停止主应用。

本地告警可在`systemctl --failed`、`journalctl -u 'easyproject-safety@*'`及回执中查看；**尚无邮件/短信/站外通知**。没有自动保留清理或硬存储配额，副本会增长，容量警告不等于完备容量管理。备份位于同一服务器也不能代替异地/离线备份。公网共享限流、应用配额及通知渠道仍为后续待办。
