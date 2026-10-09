# 本地MCP开发检查点

日期：2026-10-09。目标：本地stdio MCP，项目/任务/人员增删改查，复用Rust业务规则，无HTTP端口或自动启用。

- 标准：项目维护及既有质量门禁、UPARS1.1.0；WACAS未定义/待确认。
- 基线：codex/audit-release-20261006-api / 2a74a2b2c7b6819e662f98c2d8c0377526ef815f，开始工作区干净。
- 额度：五小时剩余88%、周66%；长期10%门禁、所有窗口5%硬底线继续，未重置或定时唤醒。
- 范围：独立程序显式数据库路径，默认只读；显式启用写入及删除，删除目标名称确认；写前备份，操作审计记录不存业务正文或联系方式；不暴露SQL/导入/恢复接口。
- 已完成：显式本地stdio协议、18工具目录/严格参数契约、默认只读及写入/删除开关、名称确认、共享DbState服务与原子写入边界、写前完整性校验恢复点和脱敏审计。增加团队列表/加入/退出，使分配任务及人员关联解除不依赖直接SQL。修复Done任务仅更新progress可低于100的共享服务问题。
- 验证里程碑：38项Rust单元测试+1项真实stdio子进程CRUD集成测试、Clippy零警告通过；包括跨连接写锁、失败回滚、默认拒绝、审计/备份失败拒绝写入、固定输出字段不泄露未来列和备份完整性。178前端单测/36文件、24生产浏览器回归、9项1000任务专项、类型/ESLint零警告/Rust格式/生产构建/发布配置/UPARS验证通过，既有大chunk警告保留。首次CRUD测试因正确的团队关联阻止人员删除失败，补团队退出工具后按业务顺序复验通过，未关闭校验。完成Done进度及跨项目移动孩子/依赖/基线归属的共享服务整改和对应复验。
- 未提交范围：.gitignore；scripts/package-mcp.ps1；src-tauri/Cargo.toml；src-tauri/src/cmds/crud_action.rs；src-tauri/src/db/{member_db,plan_baseline_db,project_db,project_member_db,task_db,task_dependency_db}.rs；src-tauri/src/lib.rs；src-tauri/src/services/{calendar_service,data_service,member_service,mod,plan_baseline_service,project_member_service,project_service,task_dependency_service,task_service,entity_api}.rs；src-tauri/src/bin/easyproject-mcp.rs；src-tauri/src/mcp/{mod,protocol,tools,tests}.rs；src-tauri/tests/mcp_stdio.rs；docs/MCP.md；docs/MCP_CHECKPOINT.md；docs/PROJECT_PLAN.md；README.md；CHANGELOG.md。恢复时以git status --untracked-files=all核对，保护新增其它用户文件。仅忽略生成的artifacts/mcp交付目录，不忽略源码、测试或门禁。
- 本地交付：MCP release已构建；最终Tauri构建会同时重编译MCP，因此以最终文件而非先前构建摘要为准，正在对最终文件再次执行隔离stdio验收。MCP SHA256 `8C11FCDFAA263BBA8E9AE52F7FE9F6162737D44A075F15FEF589EC01C50AD5B3`，3124736字节；NSIS `src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe` SHA256 `1966162237D5CDCF0CAA24946614E6B4709F76A2495000B9E16E823A40A3D054`。未安装、未签名、未覆盖原内部Release草稿。
- 准确下一步：最终release子进程通过后提交/sync Git，使用package-mcp.ps1 -SkipBuild将已验证程序及文档复制到E盘artifacts/mcp并摘要核对；同步Wolai与最终检查点。随后由用户选择可信客户端接入，按权限开启；真实库不自动测试，Mac/全部客户端兼容与正式发布仍未验。
- 里程碑额度：五小时77%、周64%，允许进入构建阶段；不重置。
- 构建后额度：五小时71%、周64%，仍满足门禁，无重置或自动唤醒。
- 数据：不删除或修改当前用户数据；当前应用和原Release草稿不替换。测试仅用E盘隔离库。
- 设备：仅本开发Windows；Mac/干净设备未连接。原生预览工具因sandbox helper失败不可用，MCP协议可用子进程隔离验证。
- 文档同步：本地开始检查点已保存，Wolai尚为悬浮窗阶段；里程碑同步并读回。原正式发布未通过结论不变。

## 最终验证里程碑

- 39项Rust单元测试+1项真实stdio集成测试通过；团队加入/重复拒绝/任务分配/安全退出分支已补齐。Clippy零警告、Rust格式、diff检查通过。最终Tauri构建后的MCP文件（上述8C11…摘要）再次通过release真实子进程CRUD与默认拒绝验收，未用之前已被重编译的文件冒充。
- 桌面生产构建及NSIS成功；178单测、24生产浏览器回归、9专项及完整既有门禁成功。没有新增依赖或修改Cargo.lock，没有关闭检查/删除测试。
- 下一步仅保存提交并同步Git/Wolai、运行交付脚本核对复制摘要；随后等待用户选择可信MCP客户端接入。客户端授权、版本兼容和真实库写入演练不在本轮自动执行范围。测试库均为E盘唯一隔离目录，不改变当前用户项目数据。
- 原安装程序和内部Release草稿不变，原生安装/置顶交互、Mac/独立设备/签名、公证/正式发布仍未通过；当前代码增量验证不能替代上述验收。
