# EasyProject 审计例外复审与整改报告

- 标准：UPARS 1.1.0；WACAS未定义/待确认。仓库标准比全局技能包1.0.0更严格，本次遵循仓库正文/模板/机器规则；未改全局标准。
- 日期：2026-10-18；模式：限定例外复审＋经授权的定向整改，不是重新开展全项目审计。
- 版本：0.1.0内部测试版；基线：`2f33168571c99a283406b76730885e284621bbce`；分支：`codex/audit-release-20261006-api`，开工干净。
- 目标：Windows x64、macOS ARM/Intel内部候选；Linux不属于当前支持目标。Vue/PrimeVue/Vite、Rust/Tauri/rusqlite/reqwest；操作人Codex，批准/责任人Ym_Li。

## 1. 结论

旧三个例外的限定条件重新核对：资源未增长，两个GTK依赖仍仅在Linux启用。新公告库使旧锁命中9条漏洞及新增3条停止维护公告，不能沿用10-08安全扫描结论。用户授权后，仅将rustls升至0.23.46、quinn-proto升至0.11.18及补丁必需传递锁项；9条漏洞已清零。三个新维护公告获用户单独批准为当前Windows/macOS内部测试限定例外，未忽略任何ID。

本次范围新增4项：P0=0、P1=0、P2=1、P3=3；3 fixed、1 accepted、open=0。另复核原3 accepted，均未延期。**本次限定代码/例外复审通过（含4项限定例外），不代表整个当前源集已重新全库审计通过；正式发布仍未通过。** Windows补丁构建及交付状态见检查点，未把未构建/未安装事项算通过。

## 2. 范围与排除项

已检查：Cargo.toml/lock、package.json/lock、vite.config.js、重资源加载门禁及正负例、四目标逆依赖、当前RustSec与npm报告、日历HTTP/TLS调用边界、CI/release工作流、项目计划与近期交付检查点。对本次改变的所有第一方文件逐项检查；工具缓存、依赖源码只用于证据。

排除：未重新逐文件审全部业务代码；真实库写入、MCP权限、客户端配置、当前安装、系统安全设置、Mac/Linux设备、签名公证、公开Release均不操作。不将生成包当作设备验收。用户另行明确授权的整改仅限两个兼容补丁，不升级Tauri/GTK整链。

## 3. 技术栈与门禁

| 范围             | 规范/验证                                                            | 结果                                                        |
| ---------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Vue/JS与加载边界 | ESLint、vue-tsc、Vitest、生产build、生产E2E                          | 0规范/类型错误；206测试/42文件、55 E2E通过；473模块构建成功 |
| Rust补丁锁       | locked/offline metadata、fmt、all-targets Clippy `-D warnings`、test | 通过；40单测＋1真实stdio隔离集成                            |
| npm供应链        | 官方registry全量 `npm audit --json`                                  | 447依赖，0问题；未更新npm锁                                 |
| Rust供应链       | cargo-audit 0.22.2，当前公告库，`--deny yanked`                      | 补丁后退出0，0漏洞/0撤包，5信息告警保留                     |
| 标准/发布元数据  | verify-audit-standard.ps1、release:check、diff                       | UPARS1.1.0及元数据/差异检查通过                             |

## 4. 编码规范审计

本次没有业务函数或可见控件改动。初始前端lint/类型、Rust格式/Clippy均0错误；依赖锁由Cargo定向生成，人工核对差异，撤回无关cssparser-macros从syn2改指syn3的解析漂移，`--locked --offline`验证有效。quinn补丁必需rand0.10/getrandom0.4/chacha20/rand_pcg及关联包更新，移除不再使用的rand_chacha/ppv，不是全栈升级。最终规范仍0错误，未添加忽略、降低阈值或删测试。

CI继续运行规范、类型、生产加载正负例、RustClippy/测试、npm与RustSec门禁；500KB块警告及所有Rust告警保留。计划清理区分文档版本0.6与应用0.1.0、已交付与候选、历史证据与当前结论。

## 5. 发现与整改闭环

| ID           | 状态/等级/置信度     | 范围、证据与触发                                                                          | 影响及发布可达性                                                                                                                  | 整改/控制与验证                                                                                           |
| ------------ | -------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| EP-BUILD-002 | accepted/P3/高（原） | XLSX940040字节、workCalendar1368654字节；加载对应功能                                     | 超500KB，低配加载成本；动态功能可达，入口不静态加载完整重依赖                                                                     | 相比原例外未增长；保留加载门禁4个正负例、真实XLSX往返E2E与500KB告警；未宣称已解决体积问题                 |
| EP-SEC-006   | accepted/P3/高（原） | proc-macro-error1.0.4；RUSTSEC-2024-0370未维护                                            | Linux glib/gtk宏链；Windows/Mac两架构启用树无路径                                                                                 | 不强制跨主版本替换；新扫描告警仍在，四目标逆依赖复核                                                      |
| EP-SEC-008   | accepted/P3/高（原） | glib0.18.5；RUSTSEC-2024-0429，特定迭代器不安全                                           | 同Linux GTK链，当前三发布目标无启用路径；不代表未来Linux安全                                                                      | 官方修复>=0.20但现GTK0.18不兼容；告警保留，支持Linux前处理                                                |
| EP-SEC-017   | fixed/P2/高（新）    | rustls0.23.45命中2026-0346/0347/0348/0349；自定义会话Debug、ECH、Brotli或KX预测等特定条件 | reqwest在当前Windows启用；实际特性ring/std/tls12，未见自定义会话/ECH/Brotli配置，不能把所有公告当已证实可利用；锁版本仍需安全维护 | 定向0.23.46，4公告清零；锁/严格Clippy/40+stdio1/含撤包扫描通过                                            |
| EP-SEC-018   | fixed/P3/高（新）    | quinn-proto0.11.15命中2026-0338/0339/0340/0341/0342；QUIC特殊帧/流条件                    | Windows/Mac/Linux当前启用树均无路径，属于锁中可选依赖，不冒充当前远程DoS入口                                                      | 定向0.11.18及必需传递包，5公告清零；locked metadata、全锁扫描通过，不启用HTTP3                            |
| EP-SEC-019   | accepted/P3/高（新） | zvariant5.7.0、zvariant_derive5.7.0、zbus_names4.2.0；2026-0370/0372/0371停止独立维护公告 | Linux opener→zbus5链可达；当前Windows/Mac ARM/Intel均无启用路径。不是3个已证实可利用漏洞                                          | 用户10-18明确接受下节最窄例外；5信息告警中这3条不消失；不擅自迁移到不兼容zbus6                            |
| EP-DOC-001   | fixed/P3/高（新）    | PROJECT_PLAN仍将浮窗手动选择/CRUD/已完成拆分与许可等写为待开发；阅读路线图触发            | 可能重复开发或错误报告进度；文档可达，不是运行时数据缺陷                                                                          | 改为当前状态总览、已交付/历史/未来边界，引用已验收检查点；人工逐项与实现/测试/交付记录核对、diff/格式检查 |

## 6. 分域结论

### 正确性与可靠性

只改变兼容依赖锁，未更改业务状态或界面。补丁后Rust40+stdio1通过；本轮前端源码未变，206单测/55生产E2E仍有效（本轮已实际运行，先于锁更新），不冒充补丁后真实桌面运行。

### 安全与隐私

官方公告核对与本地扫描相互佐证。TLS保持证书验证，无系统DNS/代理/证书或全局Git信任修改，无ignore ID。初次扫描注册表超时失败，不能算通过；补齐缓存并使用进程级HTTP兼容选项后严格完整扫描退出0。单独`--no-yanked`结果只用于中间诊断。日历仍每跳校验DNS并绑定连接、no_proxy、15秒超时，相关负例随Rust测试通过；不因此宣称互联网端到端已验。

### 数据与存储

不访问/写入用户业务库；测试只用隔离库，原SQLite版本和恢复规则未改。迁移独立化仍是工程候选，不在本轮重构。

### UI、无障碍与国际化

无UI改动；55生产回归覆盖深浅/窄窗/焦点/严格CSP。原生状态行与悬浮球验收为10-17历史证据，本轮不重复冒充新包实测。

### 构建、测试与发布

加载边界仍有效，两大块未增长。release.yml内部标签目前固定internal.1，下一候选不能直接dispatch覆盖旧资产；本轮未改工作流或创建/公开新草稿。未来要独立编号、绑定精确SHA并重新验证六资产，当前本机包不能代替Mac/MSI验收。

## 7. 最终验证与证据

- 公告库：1338条，提交`999ec89d5d3f10f20be14750ec8c2d8b44e0ac9b`，2026-10-17T23:23:59+08:00。基线525依赖/9漏洞/5警告；修复528依赖/0漏洞/5警告。
- 完整扫描：E盘cargo-audit，`audit --file src-tauri/Cargo.lock --db <E盘advisory-db> --no-fetch --deny yanked --json`，退出0且无诊断。`--no-fetch`使用本轮刚更新的库，不是陈旧缓存豁免。进程级CARGO_HTTP_MULTIPLEXING=false、短超时/重试只为兼容，不降低TLS。
- `cargo tree --locked --offline --target <三发布目标> -i <五告警包/补丁quinn>`：18项均无启用路径；Linux另证glib/GTK和zbus/opener链，quinn无路径。
- Rust补丁后：fmt、Clippy全目标零警告、40单测0.56秒＋stdio1测试1.10秒通过。
- 前端：lint/typecheck通过；206单测42文件49.98秒，生产构建14.33秒；55生产E2E 1.2分钟无重试。构建加载门禁及4加载正负例包含在上述结果。另运行1000任务性能专项9/9通过（计算29ms，环境启动耗时不等于算法时间）；官方npm生产/全量两次扫描均0问题。
- 未运行签名/公证、新版NSIS安装、Mac设备或新远程发布流程；打包状态见本轮检查点。
- 新NSIS已构建并静态验收：6,230,544字节，ProductVersion0.1.0，Authenticode NotSigned，SHA256 `C1F9AB8D7B1F2A60F6065ABAEE39F988A8075C8712B97D34D220366F1BD34242`，产物检查Validated1 exe；锁定离线release编译2分22秒。独立候选保留E盘`src-tauri/target/audit-tools/exception-review-20261018/EasyProject_0.1.0_security_x64-setup.exe`。原1BCA8B3C UI包已校验备份为同目录previous-ui-setup.exe，未覆盖当前安装或远程历史资产；新包安装验收尚未执行。

## 8. 例外、未知与责任

原EP-BUILD-002/SEC-006/SEC-008维持10-08批准范围。新EP-SEC-019由用户10-18明确答复“接受上述限定例外”：**仅当前Windows x64/macOS ARM/Intel内部测试；保留告警；责任Ym_Li；最迟2026-10-22或依赖/资源/平台变化先到者复查；新增Linux支持前必须处理。** 不自动批准新依赖、永久豁免或正式发布。

未知：其它平台实机、混合DPI、签名公证和真正跨版本迁移矩阵。风险归发布负责人，发布前关闭或另经明确决策；未被本报告掩盖。

## 9. 发布判定

- 本次新增P0/P1/P2未关闭：0/0/0；新增P3 accepted1，其余2 fixed；原3 accepted维持。
- 本次代码/安全复审：通过，含4项最窄例外；不是全库新审计结论，也不是Linux支持承诺。
- 正式发布：不通过。可继续准备独立未签名内部候选；打包成功不等于可公开发布。

## 10. 变更与证据索引

- Cargo.lock：仅两个补丁及必要锁图；PROJECT_PLAN.md：清理状态；本报告与[检查点](EXCEPTION_REVIEW_CHECKPOINT_2026-10-18.md)。原历史[完整审计](EASYPROJECT_AUDIT_REPORT_2026-09-13.md)不覆写旧数量。
- [RustSec rustls 0346](https://rustsec.org/advisories/RUSTSEC-2026-0346.html)、[0349](https://rustsec.org/advisories/RUSTSEC-2026-0349.html)、[quinn 0338](https://rustsec.org/advisories/RUSTSEC-2026-0338.html)。各同组其它ID及修复范围由完整扫描核对。
- [proc-macro-error](https://rustsec.org/advisories/RUSTSEC-2024-0370.html)、[glib](https://rustsec.org/advisories/RUSTSEC-2024-0429.html)、[zvariant](https://rustsec.org/advisories/RUSTSEC-2026-0370.html)、[zbus_names](https://rustsec.org/advisories/RUSTSEC-2026-0371.html)、[zvariant_derive](https://rustsec.org/advisories/RUSTSEC-2026-0372.html)。
