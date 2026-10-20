import { readFileSync, writeFileSync } from 'node:fs'

const catalog = JSON.parse(readFileSync('docs/api/catalog.json', 'utf8'))
const user = {
    type: 'object',
    required: ['id', 'username', 'admin', 'mustChangePassword'],
    properties: {
        id: { type: 'string' },
        username: { type: 'string' },
        admin: { type: 'boolean' },
        mustChangePassword: { type: 'boolean' }
    }
}
const credentials = {
    type: 'object',
    additionalProperties: false,
    required: ['username', 'password'],
    properties: {
        username: { type: 'string', minLength: 3, maxLength: 48 },
        password: { type: 'string', format: 'password', minLength: 12, maxLength: 128 }
    }
}
const jsonContent = schema => ({ 'application/json': { schema } })
const response = schema => ({ description: '成功', content: jsonContent(schema) })
const object = { type: 'object' }
const groups = {
    auth: {
        name: '认证与会话',
        paths: {
            '/api/auth/login': {
                post: {
                    summary: '登录',
                    description:
                        '12小时会话。Web返回HttpOnly/Secure/SameSite=Strict cookie且token=null；X-EasyProject-Client=desktop时返回内存Bearer。首次须改密码。30次/15分钟真实socket IP限流，反代后共享。禁止记录凭据或返回令牌。',
                    security: [],
                    requestBody: { required: true, content: jsonContent(credentials) },
                    responses: {
                        200: response({
                            type: 'object',
                            properties: { user, token: { type: 'string', nullable: true } }
                        })
                    }
                }
            },
            '/api/auth/session': {
                get: {
                    summary: '当前登录账号',
                    responses: { 200: response({ type: 'object', properties: { user } }) }
                }
            },
            '/api/auth/logout': {
                post: {
                    summary: '退出并撤销当前会话',
                    requestBody: { content: jsonContent(object) },
                    responses: { 200: response(object) }
                }
            },
            '/api/auth/password': {
                post: {
                    summary: '修改密码并撤销全部会话',
                    description:
                        '首次登录也允许调用；原密码须匹配，新密码12—128字符且不同于原密码。成功后全部设备重新登录。',
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['currentPassword', 'newPassword'],
                            properties: {
                                currentPassword: { type: 'string', format: 'password' },
                                newPassword: {
                                    type: 'string',
                                    format: 'password',
                                    minLength: 12,
                                    maxLength: 128
                                }
                            }
                        })
                    },
                    responses: { 200: response(object) }
                }
            }
        }
    },
    admin: {
        name: '账号管理',
        paths: {
            '/api/admin/users': {
                get: {
                    summary: '管理员查询账号',
                    description:
                        '仅已修改初始密码的管理员；账号不是人员模型，不返回密码哈希/会话或他人业务数据。',
                    responses: {
                        200: response({
                            type: 'object',
                            properties: { users: { type: 'array', items: user } }
                        })
                    }
                },
                post: {
                    summary: '管理员创建普通账号',
                    description:
                        '无公开注册，不接受admin或工作区ID参数；初始密码必须修改。用户名ASCII字母/数字/_/-，3—48字符，重复拒绝。',
                    requestBody: { required: true, content: jsonContent(credentials) },
                    responses: { 200: response({ type: 'object', properties: { user } }) }
                }
            }
        }
    },
    workspace: {
        name: '工作区',
        paths: {
            '/api/workspace/revision': {
                get: {
                    summary: '读取账号工作区版本',
                    description:
                        '首次改密后可用。版本是安全整数epoch，重启/恢复/缓存重开会失效；不是业务ID或递增序号。15秒检测变化后显式刷新，不静默覆盖草稿。',
                    responses: {
                        200: response({
                            type: 'object',
                            properties: { revision: { type: 'integer', format: 'int64' } }
                        })
                    }
                }
            },
            '/api/workspace/action': {
                post: {
                    summary: '执行账号工作区业务动作',
                    description: `服务端按登录账号选择独立数据库，请求不能指定账号/路径。原生参数/返回复用DESKTOP_IPC.md与MODELS.md，不套用MCP默认值。严格model/action白名单：${JSON.stringify(catalog.actions)}。读返回data/revision；写须携带精确X-Workspace-Revision，旧值409且不写业务。写前UUID快照、持久失效旧epoch；传输中断先读回，禁止盲重试。JSON导入/恢复替换本账号全工作区，不是双向同步；远端不提供全库撤销。ICS沿用SSRF边界。`,
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['model', 'action'],
                            properties: {
                                model: { type: 'string', enum: Object.keys(catalog.actions) },
                                action: {
                                    type: 'string',
                                    enum: [...new Set(Object.values(catalog.actions).flat())]
                                },
                                data: { type: 'object', default: {} }
                            }
                        })
                    },
                    parameters: [
                        {
                            in: 'header',
                            name: 'X-Workspace-Revision',
                            required: false,
                            description: '所有写动作必需；只读可省略，缺失或陈旧均409。',
                            schema: { type: 'integer', format: 'int64' }
                        }
                    ],
                    responses: {
                        200: response({
                            type: 'object',
                            properties: {
                                data: { nullable: true },
                                revision: { type: 'integer', format: 'int64' }
                            }
                        })
                    }
                }
            }
        }
    },
    operations: {
        name: '运行状态',
        paths: {
            '/api/health': {
                get: {
                    summary: '健康检查',
                    security: [],
                    responses: {
                        200: response({
                            type: 'object',
                            properties: { status: { type: 'string', enum: ['ok'] } }
                        })
                    }
                }
            }
        }
    }
}
const paths = {}
for (const group of Object.values(groups)) {
    for (const [path, methods] of Object.entries(group.paths)) {
        paths[path] = methods
        for (const [method, operation] of Object.entries(methods)) {
            operation.tags = [group.name]
            operation['x-easyproject-group'] = group.name
            operation.operationId = `${method}_${path.replace(/[^a-z0-9]/gi, '_')}`
            for (const code of [400, 401, 403, 409, 413, 415, 422, 429, 500]) {
                operation.responses[code] = {
                    description: '请求/认证/权限/并发/资源错误；不自动重试',
                    content: {
                        ...jsonContent({
                            type: 'object',
                            properties: { error: { type: 'string' } }
                        }),
                        'text/plain': { schema: { type: 'string' } }
                    }
                }
            }
            if (method === 'post')
                operation.parameters = [
                    ...(operation.parameters || []),
                    {
                        in: 'header',
                        name: 'Origin',
                        required: true,
                        schema: { type: 'string' },
                        description: '浏览器自动携带同源Origin；桌面仅允许三个精确Tauri Origin。'
                    },
                    {
                        in: 'header',
                        name: 'X-EasyProject-Request',
                        required: true,
                        schema: { type: 'string', enum: ['1'] }
                    }
                ]
        }
    }
}
const document = {
    openapi: '3.0.3',
    info: {
        title: 'EasyProject Web HTTP API',
        version: '0.1.0',
        description:
            '真实HTTP接口；独立于既有MCP stdio/Tauri IPC。只描述契约与合成模型，不含真实凭据/业务记录。server/src为实现权威。'
    },
    security: [{ browserSession: [] }, { desktopSession: [] }],
    components: {
        securitySchemes: {
            browserSession: { type: 'apiKey', in: 'cookie', name: 'ep_session' },
            desktopSession: { type: 'http', scheme: 'bearer' }
        }
    },
    paths
}
writeFileSync('docs/api/web-openapi.json', JSON.stringify(document, null, 2) + '\n')
// Refresh only the changed overview. Native interface provenance remains bound
// to its existing catalog; adding HTTP does not pretend to rebuild the MCP exe.
const references = JSON.parse(readFileSync('docs/api/apifox-documents.json', 'utf8'))
const overview = references.find(entry => entry.key === 'overview')
const provenance = overview.content.slice(overview.content.lastIndexOf('\n\n接口基线：'))
if (!provenance.startsWith('\n\n接口基线：')) throw new Error('Missing native contract provenance')
overview.content = readFileSync('docs/api/OVERVIEW.md', 'utf8') + provenance
writeFileSync('docs/api/apifox-documents.json', JSON.stringify(references, null, 2) + '\n')
console.log(
    JSON.stringify({
        paths: Object.keys(paths).length,
        operations: Object.values(paths).reduce(
            (sum, methods) => sum + Object.keys(methods).length,
            0
        )
    })
)
