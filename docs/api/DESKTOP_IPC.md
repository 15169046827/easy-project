# EasyProject桌面内部IPC契约

只供受控Tauri窗口调用，不是HTTP接口，也不是对外MCP工具。应用来源提交见catalog.json；候选schema版本6（旧schema5须受保护迁移）。IPC不可通过浏览器地址直接调用。

新增`desktop_credentials`：仅Windows主窗口，`{action:'read'|'save'|'clear',credentials:{username,password}|null}`；读取返回凭据/null，保存/清除返回null。仅安装侧非C盘受控DPAPI文件，不接受路径/服务器地址，默认关闭/不自动登录，不进入业务导出。不记录参数/响应/密码，失败不伪装成功或登出。不是HTTP/MCP接口，浮窗不能调用。

## 统一分发

`invoke('crud_action', {model, action, data})`，正常返回`{success:boolean,message:string,data:object|null}`。业务拒绝可为success=false；解析/存储错误也可reject字符串，两层都要处理。MCP的structuredContent不是此ApiResponse包裹，不能混用。

所有动作如下（31项，生成器从Rust分发器逐项核对）：

| model           | action               | data及行为                                                                                                                   |
| --------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| project         | add                  | ProjectCreateRequest；name/version/type/status/owner字段由桌面传齐，日历字段有serde默认；返回id                              |
| project         | create_from_template | `{project:ProjectCreateRequest,tasks:ProjectTemplateTaskRequest[]}`，模板key/parent_key/predecessor_keys关联与排期，事务创建 |
| project         | get_all              | pageIndex默认1/pageSize默认20，页大小1–1000；返回list/total/pageIndex/pageSize/totalPage                                     |
| project         | update               | id及待修改项目字段；负责人必须存在且自动加入团队                                                                             |
| project         | delete               | `{ids:string[]}`非空；软删除，有活跃任务拒绝                                                                                 |
| task            | add                  | TaskCreateRequest；project_id必须有效；负责人属于团队，parent可空，排期有效，Done进度100                                     |
| task            | get_all              | 分页默认1/20，pageSize1–1000；可选projectId/keyword/status/priority/assignee/sortBy/sortDirection，默认sort_order/asc        |
| task            | swap_order           | `{source_id,target_id}`，限定同项目同层级，两次排序写入事务原子交换                                                          |
| task            | update               | id及待修改字段；保留项目/父子/依赖/基线边界，不能让任务跨项目后关系悬空                                                      |
| task            | delete               | `{ids:string[]}`非空，软删除，活跃子任务等关联会阻止                                                                         |
| member          | add                  | MemberCreateRequest；桌面传齐name/email/phone/role/avatar，availability_exceptions默认JSON数组字符串                         |
| member          | get_all              | pageIndex默认1/pageSize默认50，页大小1–1000；返回分页对象                                                                    |
| member          | update               | id及待修改成员字段                                                                                                           |
| member          | delete               | `{ids:string[]}`非空；仍有项目负责人/任务分配/团队关系时拒绝                                                                 |
| member          | search               | `{query:string}`；返回`{list}`                                                                                               |
| project_member  | add                  | `{project_id,member_id,role}`；校验项目/成员有效和重复加入                                                                   |
| project_member  | get_by_member        | `{memberId}`，返回`{list}`                                                                                                   |
| project_member  | get_by_project       | `{projectId}`，返回`{list}`                                                                                                  |
| project_member  | delete               | `{ids:string[]}`非空；项目负责人/仍有任务分配的成员不能退出                                                                  |
| task_dependency | get_all              | `{projectId}`非空；返回`{list}`                                                                                              |
| task_dependency | set_for_task         | `{taskId,predecessorIds:string[]}`；空数组清空，替换校验同项目/自身/重复/环                                                  |
| plan_baseline   | save                 | `{project_id,tasks:[{task_id,task_name,start_time,end_time}]}`；替换该项目基线，返回`{saved}`                                |
| plan_baseline   | get_by_project       | `{projectId}`；返回`{list}`                                                                                                  |
| plan_baseline   | clear                | `{projectId}`非空；清除指定项目基线                                                                                          |
| data            | export_json          | `{}`；返回schema-v5原生交换包，含六模型数据                                                                                  |
| data            | import_json          | `{payload}`；兼容JSON v1–v5、关系预校验/事务/安全副本，失败保持原库                                                          |
| data            | backup               | `{reason?:string}`默认manual；受管备份及信息，不接收任意目标目录                                                             |
| data            | list_backups         | `{}`；返回`{list,directory}`                                                                                                 |
| data            | preview_backup       | `{path}`受管备份路径；schema-v5/必需表/完整性校验，返回`{counts}`                                                            |
| data            | restore              | `{path}`受管备份路径；先安全快照，再事务恢复，不能任意文件替换                                                               |
| calendar        | fetch_ics            | `{url}`；仅安全公共远程地址，拒绝凭据/私有目标/重定向，返回`{text}`                                                          |

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
