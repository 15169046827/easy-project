# EasyProject桌面内部IPC契约

2026-10-31逐行排期/层级拖动候选：task/update可选`order_placement:{target_id:string,position:"before"|"after"|"inside"}`，必须同时显式传`parent`。before/after的parent须等于目标父ID，inside须等于目标ID；目标与来源必须活跃、不同且同项目。共享entity写事务包含普通任务/父子/完成约束和目标校验、同级整型顺序规范化，失败整体回滚；移动父任务保留子树关联，拒绝循环及完成祖先下挂载。此对象不持久化、不新增动作或数据库schema；仅IPC/HTTP内部参数，MCP task_update Schema不新增该对象（既有parent修改继续支持）。候选未部署，独立MCP暂不替换。一天日期范围start=end合法，不代表自动改为Milestone或零工作量。

2026-10-29查询候选：仅hierarchy:true的task/get_all增加可选statusScope:"top_level"|"all_tasks"，省略为兼容旧调用的all_tasks；null/非字符串/未知值拒绝。top_level在status或statusIds存在时，只以根自身状态决定是否入选，子项仍按其余条件展示；all_tasks按各层状态匹配并保留祖先context_only。keyword/priority等其它条件仍可命中后代。统计卡与当前模式共用此口径，概览仍移除状态过滤，保留其它条件。无状态条件时两值不改变根入选。Web共享同一服务及账号隔离；MCP task_list Schema不新增此输入、独立程序不替换。实际部署见GANTT_HIERARCHY_CHECKPOINT。

2026-10-28查询候选：`task/get_all`增加可选`statusIds:string[]`，最多1000个完整TASK_STATUS ID，去重后以OR匹配；省略不限制，空数组明确无结果，非法类型/ID拒绝。与projectId/keyword/status/priority/assignee等其它条件为AND，平铺与hierarchy都在服务端筛选后分页，层级模式保留匹配子项祖先上下文。跨项目统计卡仅按内置key或trim/忽略大小写的自定义名称合计，点击传各项目独立ID集合，不合并字典或猜完成属性。Web复用同一账号工作区边界。此字段仅新增IPC/HTTP内部查询能力，既有MCP task_list Schema不新增输入/权限，独立MCP不用替换；候选实际部署见TASK_PRESENTATION_V2_CHECKPOINT。

2026-10-25父子候选增补：task/get_all可传hierarchy:true，按根分页并附匹配后代/祖先context_only及statistics.top_level/all_tasks；普通平铺模式不变。task读结果新增effort_state与summary，父进度/工作量/日期派生只读；零权重summary.progress=null。task/add/update显式估算与清空规则、完成祖先/后代保护及schema8/JSON8见docs/MCP.md、DATABASE_DESIGN.md。Web共用同一服务，已认证账号可收到限定的层级冲突ID/名称说明，不返回SQL或路径，不写审计值。候选未部署；下方旧schema7候选文案为历史，真实安装状态看父子检查点。

只供受控Tauri窗口调用，不是HTTP接口，也不是对外MCP工具。应用来源提交见catalog.json；候选schema版本7（旧schema5/6须受保护迁移），真实环境尚未部署。IPC不可通过浏览器地址直接调用。

新增`desktop_credentials`：仅Windows主窗口，`{action:'read'|'save'|'clear',credentials:{username,password}|null}`；读取返回凭据/null，保存/清除返回null。仅安装侧非C盘受控DPAPI文件，不接受路径/服务器地址，默认关闭/不自动登录，不进入业务导出。不记录参数/响应/密码，失败不伪装成功或登出。不是HTTP/MCP接口，浮窗不能调用。

## 统一分发

`invoke('crud_action', {model, action, data})`，正常返回`{success:boolean,message:string,data:object|null}`。业务拒绝可为success=false；解析/存储错误也可reject字符串，两层都要处理。MCP的structuredContent不是此ApiResponse包裹，不能混用。

所有动作如下（36项，生成器从Rust分发器逐项核对）：

| model           | action               | data及行为                                                                                                                             |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| project         | add                  | ProjectCreateRequest；name/version/type/status/owner字段由桌面传齐，日历字段有serde默认；返回id                                        |
| project         | create_from_template | `{project:ProjectCreateRequest,tasks:ProjectTemplateTaskRequest[]}`，模板key/parent_key/predecessor_keys关联与排期，事务创建           |
| project         | get_all              | pageIndex默认1/pageSize默认20，页大小1–1000；返回list/total/pageIndex/pageSize/totalPage                                               |
| project         | update               | id及待修改项目字段；负责人必须存在且自动加入团队                                                                                       |
| project         | delete               | `{ids:string[]}`非空；软删除，有活跃任务拒绝                                                                                           |
| task            | add                  | TaskCreateRequest；有效项目/团队负责人及项目状态引用；parent可空，完成祖先下新增须先重开；effort_state只可unestimated/estimated，省略工作量为未估算、显式0为无工作量；聚合超范围拒绝并回滚 |
| task            | get_all              | 默认平铺1/20，pageSize1–1000；projectId/keyword/status/priority/assignee/sortBy/sortDirection；statusIds?:完整TASK_STATUS ID数组≤1000，OR去重、省略不限/空数组无结果/非法拒绝，与其它条件AND；hierarchy:true按根分页、返回匹配子项及context_only祖先、statistics.top_level/all_tasks；仅hierarchy可选statusScope=top_level或all_tasks，省略all_tasks，非法拒绝：top_level按根自身状态入选、子项仍按其它条件；all_tasks跨层状态匹配；读含effort_state/summary，派生日期排序/逾期在分页前计算 |
| task            | swap_order           | `{source_id,target_id}`，限定同项目同层级，两次排序写入事务原子交换                                                                    |
| task            | update               | id及修改字段；父progress/effort_days/effort_state/start_time/end_time只读派生，零权重summary.progress=null；状态不自动随100%完成；完成父需全部后代完成，重开子项需先重开所有完成祖先；估算来源不能写legacy_unknown；越界汇总和失败整体回滚 |
| task            | delete               | `{ids:string[]}`非空，软删除，活跃子任务等关联会阻止                                                                                   |
| task_status     | get_all              | `{projectId}`必填，返回`{list:TaskStatus[]}`，按sort_order/id排序，项目隔离                                                            |
| task_status     | get_usage            | `{id,pageIndex?:1}`，返回`{list:[{id,name,project_id,deleted}],total,pageIndex,pageSize:50}`，含软删除任务                             |
| task_status     | add                  | `{project_id,name,color?,sort_order?,is_completed?,is_default?}`；项目有效、名称1–64/唯一、颜色#RRGGBB、顺序0–1000000/布尔属性；返回id |
| task_status     | update               | `{id,name?,color?,sort_order?,is_completed?,is_default?}`；不可移动项目，重命名不改引用，完成强制进度100，默认先显式转移；返回id       |
| task_status     | delete               | `{id}`；全部任务引用即拒绝（含软删除），默认/最后项拒绝；先get_usage列冲突，返回id/deleted；禁止替换迁移                               |
| member          | add                  | MemberCreateRequest；桌面传齐name/email/phone/role/avatar，availability_exceptions默认JSON数组字符串                                   |
| member          | get_all              | pageIndex默认1/pageSize默认50，页大小1–1000；返回分页对象                                                                              |
| member          | update               | id及待修改成员字段                                                                                                                     |
| member          | delete               | `{ids:string[]}`非空；仍有项目负责人/任务分配/团队关系时拒绝                                                                           |
| member          | search               | `{query:string}`；返回`{list}`                                                                                                         |
| project_member  | add                  | `{project_id,member_id,role}`；校验项目/成员有效和重复加入                                                                             |
| project_member  | get_by_member        | `{memberId}`，返回`{list}`                                                                                                             |
| project_member  | get_by_project       | `{projectId}`，返回`{list}`                                                                                                            |
| project_member  | delete               | `{ids:string[]}`非空；项目负责人/仍有任务分配的成员不能退出                                                                            |
| task_dependency | get_all              | `{projectId}`非空；返回`{list}`                                                                                                        |
| task_dependency | set_for_task         | `{taskId,predecessorIds:string[]}`；空数组清空，替换校验同项目/自身/重复/环                                                            |
| plan_baseline   | save                 | `{project_id,tasks:[{task_id,task_name,start_time,end_time}]}`；替换该项目基线，返回`{saved}`                                          |
| plan_baseline   | get_by_project       | `{projectId}`；返回`{list}`                                                                                                            |
| plan_baseline   | clear                | `{projectId}`非空；清除指定项目基线                                                                                                    |
| data            | export_json          | `{}`；返回schema-v7原生交换包，含task_statuses与task.status_id                                                                         |
| data            | import_json          | `{payload}`；兼容JSON v1–v7、字典/默认/关系校验/事务/安全副本，失败保持原库                                                            |
| data            | backup               | `{reason?:string}`默认manual；受管备份及信息，不接收任意目标目录                                                                       |
| data            | list_backups         | `{}`；返回`{list,directory}`                                                                                                           |
| data            | preview_backup       | `{path}`受管备份路径；schema-v5/6/7、必需表/完整性及v7状态图校验，返回`{counts}`                                                       |
| data            | restore              | `{path}`受管备份路径；先安全快照，再事务恢复，不能任意文件替换                                                                         |
| calendar        | fetch_ics            | `{url}`；仅安全公共远程地址，拒绝凭据/私有目标/重定向，返回`{text}`                                                                    |

## 其它5项窗口命令

| command                 | 参数                 | 返回/边界                                                                                           |
| ----------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| storage_info            | 无                   | StorageInfo；仅main；ready/activeDir/databasePath/defaultDir/profileDir/configPath/pendingDir/error |
| set_data_directory      | `{directory:string}` | StorageInfo；仅main，非C盘本地绝对新/空目录；只保存pending，下次启动复制核验再切换，不删除源        |
| reveal_backup_directory | 无                   | void；仅main，只打开当前受管备份目录，不接受任意路径                                                |
| open_task_window        | 无                   | void；仅main，打开/聚焦单个task-floating窗口                                                        |
| show_main_window        | `{projectId:string}` | void；仅task-floating，显示主窗口并发送easyproject:open-project事件；空值由界面处理                 |

未注册的命令或model/action拒绝。不要把这些内部命令配置成公网接口；外部Agent应使用已明确授权的MCP实体工具。

## 类型来源与一致性

Project、Task、Member、ProjectMember、TaskDependency、PlanBaseline及创建/模板请求的完整Rust字段和serde默认见生成的MODELS.md。不能把MCP的name-only默认补齐策略套到桌面原生请求上。业务服务校验优先于文档；变更实现后需更新catalog、对应说明及Apifox，并读回校验。
