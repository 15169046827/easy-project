# 依赖告警可达性与定向整改方案

日期2026-11-01；基线05c478925e0fe91c2ed3699693e0931ca4752f52，分支codex/audit-release-20261006-api。用户授权本阶段排查/提出方案，**不升级依赖或部署**。WACAS未定义，UPARS1.1.0/交接规则1.25。

## 结论

27项是依赖树受影响节点计数，不是27个独立应用漏洞；共享根因传播到上层组件，应分组整改。当前未确认可直接利用EasyProject真实数据的路径，但依赖安全门禁仍不通过，不能称全部误报或自动接受例外。

| 分组 | 证据/当前可达性判断 | 定向方案与兼容风险 |
| --- | --- | --- |
| vue-i18n10.0.8 / intlify | 生产依赖，命中两项公告；src/i18n/index.js固定导入中英西消息、legacy:false。src/scripts检索未发现escapeParameter、v-html、innerHTML、srcdoc；未发现把译文直接作为HTML插入的路径。故受影响组件在包中，但本次未证实公告XSS条件可达，不代表绝对安全 | 10→11是主版本变更；候选11.4.16（官方修复基线11.4.14），要求Node>=22、Vue^3，当前Vue3/本机Node24满足。单独检查Composition API、翻译插值/复数/格式、PrimeVue消息及三语全部键和旧Button17回归；不可只升级底层intlify造成错配 |
| Vite6.4.4 | 仅开发服务器漏洞，vite.config.js默认host=false，TAURI_DEV_HOST可开启网络；生产为Rust静态服务，不运行Vite开发服务器。开发暴露时风险仍有 | 升到同6.x的6.4.5；现有vitest/@vitest/mocker overrides使用$vite需同步核对。维持loopback、增加敏感文件查询负例；不升级整套构建工具 |
| undici7.29.1 | package-lock dev:true，由jsdom29.1.1引入；未发现产品src直接使用。影响Node测试/工具，不等同Rust生产HTTP漏洞 | 候选同7.x的7.30.1以上已修版；先验证上游依赖范围允许及Node引擎。此次npm元数据请求ECONNRESET，具体engines/最新修复版本仍待成功读回，不声称已兼容验证；不覆盖Node内置fetch |
| glob10.5.0 / minimatch多版本 | glob10主要由开发用js-beautify链引入，ExcelJS另有glob7/minimatch3/5链；audit将minimatch<11.0.1整体标记，但公告细节主要描述10.2.6的optimizationLevel>=2路径。不同分支不能机械认定同样可触发 | 不将全树强制override到11，也不按audit建议把ESLint降到4、ExcelJS降到4.1。分别确认旧分支是否含对应放大算法/不可信pattern输入；优先上游兼容补丁，无补丁则报告准确风险与替代组件方案，接受例外需用户另批 |
| deepmerge4.3.1 / date-holidays | 生产日历解析器utils.merge调用deepmerge.all。需要追踪攻击者能否控制合并对象键；当前只证实组件路径，不宣称无风险。官方npm查询latest仍4.3.1 | 不降级整个date-holidays到1.8.4；检查应用节假日/ICS数据是否流到merge、原型键负例与影响。若确有输入路径，优先边界限制或受控替代；无补丁时不能伪装audit清零 |

## 实施顺序（待用户批准实施）

1. 新建E盘隔离候选依赖环境，保持当前锁文件/已安装程序；复核上游元数据与完整性。
2. Vite6.4.5及兼容undici7补丁分批变更，每批静态/单元/生产构建及开发服务器反例，重新记录audit差异。
3. 单独迁移vue-i18n11.4.16，三语/键覆盖/插值安全负例/旧历史状态Button17、nonce CSP、130生产UI及13HTTP、原生浅深/窄窗/键盘；失败回退候选，不碰真实库。
4. 分支核对glob/minimatch/deepmerge根因。无法兼容修复时形成稳定编号、触发条件、可达性、负责人和期限，另请用户接受，不采用大范围忽略或降级。
5. 重新跑npm与Rust安全门禁、全量质量回归，审查锁文件仅含预期变化；新包/新副本/实际部署另行批准，不能继承上轮UI覆盖许可。

## 复核限制与Apifox

- npm ls报告现有Vite override链ELSPROBLEMS，安装版本与声明都是6.4.4；需要用干净隔离npm ci判定是否npm元数据问题，不能当作应用运行失败或擅改锁文件。
- 初次npm ls未配置npm cache，npm自动写入了工具环境C盘诊断日志；后续所有npm调用已显式改为E盘缓存。没有删除或修改C盘系统内容，不把它当合规长期缓存位置。
- 用户确认Apifox恢复后，本轮首个只读请求仍HTTP403；仅检查令牌Process/User是否存在及一致，结果两者均存在且相同，未打印令牌或其摘要。因此并非当前shell未加载账户值，具体服务授权/套餐/令牌有效性仍未知。未重复写请求、未改地址或权限；66/32/19本轮读回仍阻断。

## 官方证据

- [Vue I18n混合插值公告](https://github.com/advisories/GHSA-8rc2-428q-7ww3)、[srcdoc公告及修复版本](https://github.com/advisories/GHSA-83rm-6c8r-g728)。前者官方评为low，npm节点聚合high不能直接当应用严重度。
- [Vite暴露条件与6.4.5补丁](https://github.com/advisories/GHSA-8g5g-mxqh-grgj)。
- [minimatch公告范围与算法触发细节](https://github.com/advisories/GHSA-g3hv-75wg-m249)。
- 其余告警原始官方URL、节点和范围见E盘handoff-20261101-npm-audit.json，不提交凭据或真实数据。

## 续接检查点

本阶段仅读源码/锁文件/官方元数据并写本方案、验收附记及交接摘要；package.json/package-lock及程序均未改，无新测试或安装冒称整改完成。未提交文件以git status为准。准确下一步：用户确认实施范围，先隔离兼容补丁候选；Apifox需服务端权限恢复后再读回。设备无桌面控制/SSH；不重跑上阶段有效功能门禁。Git/Wolai/交接同步回执随后追加，无关机/重置/唤醒授权。
