# 手动版本检查

主导航右侧“版本信息”打开 PrimeVue 弹窗；点击“检查新版本”才联网。打开弹窗、启动程序和本地离线使用不会自动检查，不自动下载安装。失败只提示重试，不退出账号、不刷新或替换工作区。

当前安装版本与完整来源提交可查看；无明确公开 tag 的开发构建及 `-internal.N` 内部测试构建始终标记内部版，不能因基础版本号相同而声称“已是最新”，也不建议降级。发布页只允许本仓库 GitHub releases/tag 地址，通过默认浏览器打开。安装仍由用户决定；未签名测试版不等于正式发布验收通过。

## 公开元数据契约

`GET /release-info.json` 是官网静态公开资源，不是账号/业务 CRUD API，也不属于 MCP 工具或 Tauri invoke。无需登录；客户端不发送 Cookie/Bearer，不跟重定向，读取上限 16KiB、8秒界面截止，结果仅缓存内存5分钟。桌面只访问内置受控官网，网页使用同源；不得允许用户任意输入凭据目标或放宽 CSP。

schemaVersion=1。ready=false 时没有公开候选；ready=true 时包含 version、与之严格对应的 v 前缀 tag、YYYY-MM-DD 发布日期。拒绝未知字段、非法版本/日期；不接受元数据指定任意下载 URL。实际结构见 `public/release-info.json` 与 `docs/api/web-openapi.json`。

## 维护发布索引

1. 先按发布流程验证新资产、精确源、SHA与公开授权，实际公开 GitHub Release；不能把草稿或内部安装包纳入下载。
2. 更新唯一发布入口 `src/modules/landing/downloadRelease.js`，同步真实版本/tag/日期/下载项及未验说明。
3. 执行 `node scripts/build-release-info.js` 生成公开索引；`npm run build` 会执行 `--check`，索引与入口不一致即失败。
4. 运行版本比较、构建身份、检查器及生产界面门禁。`VITE_RELEASE_TAG` 仅可用于版本匹配、完整40位提交且 Git 干净的明确发布构建；内部构建不设 tag。不可用环境变量伪造来源。
5. 经本轮明确许可、安全副本后更新官网静态资源，正常 TLS 核对元数据、首页、在线入口及匿名接口边界；索引未实际部署前不得称版本检查已交付。
6. 同步 Git、Wolai、交接、Apifox并读回。官网索引不是在线遍历 GitHub 的服务，发布后必须随下载入口一起维护。

当前候选未安装/部署；验证与未完成项以 `VERSION_CHECK_CHECKPOINT.md` 为准。
