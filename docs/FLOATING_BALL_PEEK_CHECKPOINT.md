# 悬浮球半圆吸附/悬停弹出检查点

## 2026-10-17 恢复与自动化里程碑

- 已先读旧检查点、核对Git及相关文件；基线/分支与WACAS/UPARS适用标准不变。五小时开工剩余99%、里程碑83%，周81%，未重置或设置唤醒。
- 改为精确32px位移，四边各露出56px球体的一半；吸附根容器取消圆角，避免裁切成透镜。折叠吸附边状态及PrimeVue控件/CSP/减少动态效果保持。
- 全部未提交文件：README.md、CHANGELOG.md、docs/PROJECT_PLAN.md、docs/FLOATING_BALL_PEEK_CHECKPOINT.md、e2e/floating-peek.spec.js、e2e/test-globals.d.ts、e2e/ui-consistency.spec.js、src/__tests__/components/FloatingTaskWindow.test.js、src/__tests__/components/floatingWindowActions.test.js、src/modules/floating/FloatingTaskWindow.vue、src/modules/floating/windowActions.js。忽略目录内仅安装辅助脚本的安全副本目录更新为本轮唯一E盘路径。
- 已通过：ESLint零警告、类型检查、206单测/42文件、生产构建、release:check、Rust格式/40单测+真实stdio1、UPARS1.1.0。生产回归新增9项全部通过（四边×深浅、hover离开、键盘、悬空、减少动态效果、严格nonce）；全量首次54通过/1旧测试重试通过，旧测试在加载前读取0列，已改为等待名称列可见后计数，正在全量无重试复验。未关闭检查或减少断言。
- 环境差异：默认C盘隔离TEMP使测试加载EPERM，改用E盘已有TEMP后206项通过；本机服务在隔离网络不可达，获准在宿主运行回归。UPARS脚本以显式Root调用后通过；先前无PSScriptRoot的脚本块调用失败不算通过。
- 未完成/下一步：最终完整界面复验；E盘NSIS构建、唯一安全副本保护后覆盖安装、真实Windows半圆/hover/拖动/展开检查；核对数据保留，Git/Wolai同步闭环。当前已安装仍是53D438AE旧包，不称交付。
- 文档同步：本地说明/检查点更新，Git未提交、Wolai仅已读未写；未修改真实业务数据或MCP权限。设备确认本Windows与演示浏览器，其它设备未连接。正式发布原有限制保持。

### 最终自动化复验

- 最终生产回归55/55通过，1.4分钟，单worker、无重试；修正旧测试加载时序后的断言未削弱。四边深浅半圆/完整圆截图已目视检查，演示浏览器外观正常。
- 曾将打包的前端重建与生产回归重叠运行，静态文件替换使该次后段回归失效，已停止该次并在dist稳定后全量重跑，通过结果为上述最终55项，不把环境故障计为通过。
- 首次npm参数转发丢失--bundles，导致cargo收到多余nsis参数，未生成新包；已改用本地tauri.cmd入口，正在E盘构建NSIS。500KB既有块警告保留。
- 安装前只读真实库：完整性ok、外键0，project1/task5/task_dependency4/member0/project_member0/plan_baseline5。原程序已关闭，尚未覆盖。
- 下一步保持源码冻结，等待NSIS完成，核对包SHA并用本轮E盘唯一安全副本覆盖；原生验证后保存安装/数据证据并同步Git与Wolai。五小时剩余79%、周80%（构建前查询），未重置/唤醒。

## 2026-10-17 安装与桌面验收完成

- 最终NSIS：src-tauri/target/release/bundle/nsis/EasyProject_0.1.0_x64-setup.exe，6,229,925字节，SHA256 3C7C39A06BDF780D11DEDCED0514276BEBC785C3F94262CA94E5FD33D695DE4E。E盘构建成功（release编译1分56秒），仍0.1.0未签名内部版。
- 静默覆盖原E盘runtime-current-user/app退出0，11个原有数据文件安装前后SHA逐一相同；本轮独立安全副本src-tauri/target/audit-tools/floating-ball-peek-20261017/safety-copy已校验并保留，未覆盖旧副本、未装共享运行时或C盘程序。安装exe SHA256 C5923E494D55E2515BAA856A31017A610C5073733CA3E6C4BF175A605F2149DD；唯一完整UNK→NSS bundle标记内存归一后与release逐字节一致，无二进制写入。
- 真实Windows：已安装版连续拖动响应正常，球拖至上边缘时原生位置y=0，移出鼠标截图显示半圆；鼠标进入半圆弹出完整圆，点击主窗空白后收回；从半圆拖离到y=48恢复悬空整圆，点击展开恢复340×360任务窗。深浅模式原生浮窗与球外观正常；深色以重开浮窗读取主题验证，不宣称已打开浮窗跨窗口即时主题同步。真实上边验证，其余三边/键盘/减少动态效果由严格CSP生产回归覆盖，不冒充四边多DPI原生全矩阵。
- 原生工具初次启动报accessibility window-opened handler did not become ready，重建JS会话后恢复；少数AX索引点击失效改用新截图坐标完成，无系统安全变更。
- 验收后真实库只读完整性ok、外键0，六表计数仍1/5/4/0/0/5，未增删改业务数据，MCP保持只读。已恢复原浅色主题，关闭验收浮窗，主程序保留；临时开发服务已关闭。
- 最终门禁：ESLint零警告、类型检查、206单测42文件、55生产E2E无重试、Rust格式40单测+stdio1、构建/NSIS、release:check、UPARS1.1.0、diff检查通过。既有大块警告保留。正式签名/其它平台/多屏混合DPI等既有限制未关闭，无通用标准变更。
- 全部未提交文件仍为本轮11文件清单，未发现无关用户变更；准确下一步仅Git提交/非强制同步和Wolai追加读回，再写闭环检查点，不新增功能或公开Release。WACAS未定义/待确认，基线/分支/适用标准不变；仅本Windows和演示浏览器确认，其他设备未连接。五小时剩余47%、周75%，未重置/唤醒。

## 交付同步闭环

- 产品源码与验收记录提交caef9b8c265dee6b611eda025b8f4294190cf5e9，11文件，已校验父提交、源码树与提交SHA并非强制同步原GitHub分支；提交后工作区干净。
- Wolai产品页h4VsMhyWaL9UHrYLEkfnLx状态块28dPKMDkPpLCFu557s8exF已追加本轮范围、验证、包SHA、数据保护、设备及限制，版本50读回确认。
- 当前只剩本检查点闭环文档需提交同步，产品/已安装包不再改变；同步后无未提交文件。下一步等待用户试用反馈，本轮半圆吸附开发、自动回归、当前Windows安装与限定原生验收已完成；不自动公开Release或扩展功能。既有正式发布限制和未验证平台保持，不冒充正式发布通过。

2026-10-16，目标：四边吸附时露出半圆，鼠标悬停/键盘可见焦点时平滑弹出完整圆，移开收回；保持点击展开、拖动换边和悬空。尊重减少动态效果偏好。

- WACAS未定义/待确认；实际适用UPARS1.1.0及EasyProject维护、PrimeVue/CSP/数据保护/额度规范。
- 基线7f53b16b1659c9d6246688925ef90c247a19948f，分支codex/audit-release-20261006-api；开工工作区干净。五小时起始剩余13%、周86%，未重置/唤醒。
- 已实现：原64px透明窗口内四向平移并裁切半圆；hover或focus-visible弹出整圆，180ms过渡；减少动态效果时无过渡；折叠主动吸附后同步dockEdge，修复折叠路径未保存吸附边状态。保留真实PrimeVue Button，不新增窗口权限、不把窗口移到屏幕外。
- 未提交文件：src/modules/floating/FloatingTaskWindow.vue、src/modules/floating/windowActions.js、本检查点；后续测试文件以完整Git状态为准。
- 测试与结果：本轮尚未执行；上一版205单测/46界面回归只作为基线，不替代本次验收。当前已安装版仍是上轮53D438AE包，不含此改动。
- 未解决/准确下一步：补半圆四边/hover还原/键盘focus-visible/减少动态效果/悬空不裁切生产测试，以及折叠返回吸附边的单测；静态/类型/单元/生产浏览器及严格CSP验证；额度允许再构建E盘NSIS、安全覆盖新独立副本并真实Windows验证鼠标移入移出、拖动、点击。全部通过后更新README/CHANGELOG/计划、提交Git、同步Wolai。
- 文档同步：仅本地检查点保存，Git/Wolai未同步。没有业务数据写入或安装更新，正式发布限制保持。
- 设备：已确认本Windows；本轮尚未连接演示/原生窗口，其它设备未确认。

## 10%额度门禁暂停

- 五小时剩余9%、周86%，触发长期任务门禁；保存后暂停，不重置、不定时唤醒。基线7f53b16b1659c9d6246688925ef90c247a19948f与分支不变，WACAS未定义/待确认、实际UPARS1.1.0及项目规范同上。
- 本轮已验证：Vue类型检查通过，ESLint零警告通过；相关2个测试文件13/13通过（2.87秒），新增折叠返回吸附边/展开清空边状态及原生折叠返回left的断言；git diff --check通过。
- 全部未提交文件：src/__tests__/components/FloatingTaskWindow.test.js；src/__tests__/components/floatingWindowActions.test.js；src/modules/floating/FloatingTaskWindow.vue；src/modules/floating/windowActions.js；docs/FLOATING_BALL_PEEK_CHECKPOINT.md。未发现其它改动。
- 未验证：半圆四边的实际裁切/鼠标移入弹出和移出收回、键盘focus-visible、悬空不裁切、减少动态效果；浏览器/真实桌面/CSP回归；全量测试、构建、新包和安装。不能称已交付或已安装，本机程序仍为上轮53D438AE包。
- 准确下一步：用户恢复额度提醒后先读本检查点、查询额度、核对Git及上述5文件；保留仍有效13项测试，不重做实现。读取项目上下文与所需浏览器/电脑使用指引；补真实行为路径的四边hover/focus/reduced-motion界面测试（不能只修改DOM伪造通过）；检查裁切窗口的命中区域与拖动起点不受CSS平移影响。通过后完整静态/类型/单元/生产回归，E盘NSIS构建，另建安全副本覆盖，真实Windows验收后同步Git/Wolai并闭环。
- 文档同步：本地检查点已保存；Git未提交、Wolai未更新本轮，README/CHANGELOG/计划待验证后更新。业务数据、安装包、MCP权限均未改变。仅Windows已确认，其它设备未连接；未新增自动化。
