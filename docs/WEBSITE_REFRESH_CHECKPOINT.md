# 官网当前截图与下载整理（2026-10-26）

## 当前状态

最终单测323/63、类型/lint通过；发布元数据与索引未改变。正在封存候选后清洁源build与完整94生产/13真实HTTP最终回归；原生/业务代码未改，不重跑迁移或替换桌面。当前新增文档PRODUCT_PREVIEWS及handoff/CHANGELOG已更新，本节点Git提交/推送与Wolai候选同步随后核对。

里程碑：修正测试焦点顺序后7/7官网生产回归零重试通过（1280/960/375深浅、截图切换、下载收纳和旧深链）；随后将新切图/展开操作改为Enter键，最终全量生产矩阵仍待。IAB已实际核对1280浅色及960×640深色下载结构、其他格式展开；不下载/运行包。两PNG视觉检查通过，SHA tasks=E3A2C395B2FDD2DA85EA6D42105AE65F9301EECF7AEB42E5DAA97AA0B91BA42B、board=5665645AA853628B5FB2A5D5DE1F9A3E24E6D35FE53779CC86BB0291155E9928。额度本节点5h余67%/周95%。全量单测在运行，未上线。

版本检查已完成本轮安全交付，Git回执c9a6e1a415b45c8d9cb7d366afb097578e1e8913与Wolai主/交接读回一致；不重复安装/后端/迁移。用户明确批准本阶段与后续es-ES各自验证后逐阶段新安全副本/桌面及网页静态更新；不新公开Release、不迁移、不改后端/独立MCP/地址/权限。

本阶段候选：两张1280×800清晰PNG（任务列表/看板）均从本地内置内存演示捕获，不访问账号或远端接口。PrimeVue SelectButton切预览；说明捕获日期、合成数据及示例项目版本不等于产品版本，公开桌面包可能不同。官网下载按Windows/macOS分组，默认3常用安装入口，PrimeVue可折叠Panel收纳MSI/两App归档，同一版本6资产不变，校验清单/签名及未验说明保留。文档链接更新到已验证31c756e源码，不冒称已发新包。

## 验证与失败历史

- typecheck/lint/build已通过；两既有大资源警告保留。新版图片均已视觉检查，不从模糊IAB JPEG生成产品图。
- 截图生成器最初使用不存在的.task-table选择器超时，修正为真实.table-card table；再因首次引导覆盖看板点击失败，改为正常点击“跳过引导”并等待关闭，不强制点击/隐藏元素。最终两张PNG生成成功，animations=disabled仅结束截图时过渡，未篡改UI或数据。
- 首轮官网7生产场景1通过/6失败：新截图切换交互放在首个Tab断言之前，焦点起点已变。保持键盘断言并将切图验证移至首次键盘跳正文之后，正在复验；不得把此轮失败称产品键盘缺陷或已通过。
- 完整323单测/94生产UI/13真实HTTP属于上一版本检查源，当前官网候选最终全量仍待，不冒称复用为新验证。

## 续接与范围

基线c9a6e1a，分支codex/audit-release-20261006-api，开工干净；WACAS未定义/待确认，UPARS1.1.0/交接1.15不变。当前未提交：src/modules/landing/LandingPage.vue、src/i18n/locales/landing-zh.js/landing-en.js、e2e/landing.spec.js、e2e/web-server.spec.js、scripts/capture-product-preview.js、public/landing/project-tasks-20261026.png/project-board-20261026.png、本文（后续以git status为准）。

下一步：7项官网定向复验→完整单测/94生产UI/13HTTP/静态门禁→封存清洁源重建→新root700副本后仅切服务器静态资源并核后端PID/2库/unit/Funnel/旧资源保持→正常TLS独立核验并同步Git/Wolai/交接→按顺序开始es-ES。官网改动不影响桌面工作区，原则上不为此无意义重装桌面。

设备：本机已有安装版本检查新包，原数据保持，未代登录；本轮只在127.0.0.1:1420内存demo操作，临时dev服务本任务所有，缓存/TEMP在E盘。home-host SSH在线，当前线上version-check-31c756e-20261026/PID2608，备份/健康timer active，本阶段尚未更新线上。无关机/重置/自动唤醒。接口/数据/权限/架构无变化，Apifox19HTTP/66原生已复核无须重传。本文为里程碑保存，Wolai本阶段候选仍待同步，不能声称官网已更新。
