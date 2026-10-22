import { readFileSync, writeFileSync } from 'node:fs'

const catalog = JSON.parse(readFileSync('docs/api/catalog.json', 'utf8'))
const user = {
    type: 'object',
    required: ['id', 'username', 'admin', 'mustChangePassword', 'avatar'],
    properties: {
        id: { type: 'string', pattern: '^ACCOUNT:[0-9a-f]{32}$' },
        username: { type: 'string' },
        admin: { type: 'boolean' },
        mustChangePassword: { type: 'boolean' },
        avatar: {
            type: 'string',
            description: '空串或已去元数据的128×128 PNG data URL；管理账号列表返回空串。'
        }
    }
}
const credentials = {
    type: 'object',
    additionalProperties: false,
    required: ['username', 'password'],
    properties: {
        username: { type: 'string', minLength: 3, maxLength: 48 },
        password: { type: 'string', format: 'password', minLength: 6, maxLength: 31 }
    }
}
const jsonContent = schema => ({ 'application/json': { schema } })
const response = schema => ({ description: '成功', content: jsonContent(schema) })
const object = { type: 'object' }
const groups = {
    auth: {
        name: '认证与会话',
        paths: {
            '/api/auth/register': {
                post: {
                    summary: '自助注册普通账号',
                    description:
                        '直接开放注册，仅创建普通账号和独立工作区，不接受admin/账号ID/路径。不上传本地数据。用户名3—48位ASCII字母、数字、_或-，密码6—31字符；用户自设密码无需首次改密。10次/小时真实socket IP限流（私有反代共享），总账号上限1000；重复用户名拒绝。成功后登录，不直接签发会话。无邮箱验证；忘记密码使用管理员一次性重置码。',
                    security: [],
                    requestBody: { required: true, content: jsonContent(credentials) },
                    responses: {
                        200: response({
                            type: 'object',
                            properties: { user, loginRequired: { type: 'boolean' } }
                        })
                    }
                }
            },
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
            '/api/auth/reset-password': {
                post: {
                    summary: '使用管理员一次性码找回密码',
                    description:
                        '匿名但须同源/请求标记。用户名+epreset_高熵码+6—31字符新密码；码15分钟/一次有效，仅存摘要。10次/15分钟socket IP限流；未知账号/错误/到期统一失败。事务撤销全部会话、MCP Token及重置码，不自动登录、不改变工作区。',
                    security: [],
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['username', 'code', 'newPassword'],
                            properties: {
                                username: credentials.properties.username,
                                code: { type: 'string', pattern: '^epreset_[0-9a-f]{64}$' },
                                newPassword: credentials.properties.password
                            }
                        })
                    },
                    responses: { 200: response(object) }
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
                    summary: '修改密码并撤销全部会话及MCP Token',
                    description:
                        '首次登录也允许调用；原密码须匹配，新密码6—31字符且不同于原密码。成功后全部设备重新登录，全部用户MCP Token及待用重置码同时撤销。',
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
                                    minLength: 6,
                                    maxLength: 31
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
            '/api/admin/reset-codes': {
                post: {
                    summary: '管理员生成一次性密码重置码',
                    description:
                        '仅已改初始密码管理员。目标账号必须存在/未停用，替换该账号以前的重置码，15分钟有效、只存SHA256摘要。原码/会话不在此时撤销，只有实际成功重置时撤销。码仅本次返回，不记录/持久保存/自动重试。',
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['username'],
                            properties: { username: credentials.properties.username }
                        })
                    },
                    responses: {
                        200: response({
                            type: 'object',
                            properties: {
                                code: { type: 'string', readOnly: true },
                                expiresIn: { type: 'integer', enum: [900] }
                            }
                        })
                    }
                }
            },
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
                        '与自助注册并存；不接受admin或工作区ID参数；管理员分配的初始密码必须修改。用户名ASCII字母/数字/_/-，3—48字符，重复拒绝。',
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
    account: {
        name: '用户MCP凭据',
        paths: {
            '/api/account/profile': {
                post: {
                    summary: '修改本人的头像和登录用户名',
                    description:
                        '须已改初始密码的交互会话，不能用MCP Token。更改用户名需当前密码，账号ID/workspace_key/业务库不变，重名拒绝。头像空串移除，或静态128×128/8位RGB(A) PNG data URL，解码<=128KiB/JSON字段<=180000字符，后端解码并重编码去除元数据；拒绝SVG/外部URL/动画/超限。客户端负责居中裁剪压缩和方形预览，不接受其它账户/管理员字段。',
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['username', 'avatar'],
                            properties: {
                                username: credentials.properties.username,
                                avatar: { type: 'string', maxLength: 180000 },
                                currentPassword: {
                                    ...credentials.properties.password,
                                    description: '改用户名时必需；仅改头像可省略。'
                                }
                            }
                        })
                    },
                    responses: { 200: response({ type: 'object', properties: { user } }) }
                }
            },
            '/api/account/mcp-tokens': {
                get: {
                    summary: '查询自己的MCP Token元数据',
                    description:
                        '仅交互登录会话且已改初始密码；返回本账号有效Token元数据及MCP endpoint，永不返回secret或摘要。不接受MCP Token作为网页登录凭据。',
                    responses: {
                        200: response({
                            type: 'object',
                            properties: {
                                tokens: { type: 'array', items: object },
                                endpoint: { type: 'string', format: 'uri' }
                            }
                        })
                    }
                },
                post: {
                    summary: '生成用户MCP Token（仅显示一次）',
                    description:
                        '仅交互登录会话；最多20个有效Token，默认UI只读。read=7查询，write=14查询/新建/修改，delete=18完整CRUD；权限仅限本人远端工作区，与管理员身份/本地stdio无关。有效期7/30/90天，数据库仅存SHA256摘要。secret只在本次创建返回，禁止日志/URL/持久前端存储/自动重试。',
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['name', 'scope', 'days'],
                            properties: {
                                name: { type: 'string', minLength: 1, maxLength: 64 },
                                scope: { type: 'string', enum: ['read', 'write', 'delete'] },
                                days: { type: 'integer', enum: [7, 30, 90] }
                            }
                        })
                    },
                    responses: {
                        200: response({
                            type: 'object',
                            properties: {
                                token: object,
                                secret: { type: 'string', readOnly: true }
                            }
                        })
                    }
                }
            },
            '/api/account/mcp-tokens/revoke': {
                post: {
                    summary: '撤销自己的MCP Token',
                    description:
                        '只允许撤销本账号Token；后续请求立即失效，不回滚已提交或已获授权执行中的操作。改密同时撤销全部Token。',
                    requestBody: {
                        required: true,
                        content: jsonContent({
                            type: 'object',
                            additionalProperties: false,
                            required: ['id'],
                            properties: { id: { type: 'string' } }
                        })
                    },
                    responses: { 200: response(object) }
                }
            }
        }
    },
    mcp: {
        name: '远端MCP传输',
        paths: {
            '/mcp': {
                get: {
                    summary: 'MCP SSE能力探测（不提供流）',
                    description:
                        '需要用户MCP Bearer Token；不提供SSE流，鉴权后405。不是网页会话。Origin存在时仅允许服务器同源。',
                    security: [{ mcpToken: [] }],
                    responses: { 405: { description: '不提供SSE流' } }
                },
                post: {
                    summary: '账号隔离的MCP Streamable HTTP',
                    description:
                        '无状态单JSON-RPC消息，最大256KiB；支持initialize/ping/tools/list/tools/call及通知202空体。无Session-ID/SSE/OAuth自动发现。需专用epmcp_ Bearer（不能使用cookie或网页登录token）；Accept必须包含application/json与text/event-stream；后续MCP-Protocol-Version支持2025-03-26/06-18/11-25，缺省按03-26。Origin若存在必须同源，原生客户端可不带。18工具复用既有MCP inputSchema/业务校验，7/14/18按Token权限过滤；不接收账号ID或数据库路径。写前恢复点、脱敏审计，与Web共用账号锁并使旧revision失效；删除保留名称匹配和关联约束，客户端仍须审批。不得自动重试写操作。',
                    security: [{ mcpToken: [] }],
                    parameters: [
                        {
                            in: 'header',
                            name: 'Accept',
                            required: true,
                            schema: {
                                type: 'string',
                                example: 'application/json, text/event-stream'
                            }
                        },
                        {
                            in: 'header',
                            name: 'MCP-Protocol-Version',
                            schema: {
                                type: 'string',
                                enum: ['2025-03-26', '2025-06-18', '2025-11-25']
                            }
                        }
                    ],
                    requestBody: { required: true, content: jsonContent(object) },
                    responses: {
                        200: response(object),
                        202: { description: '通知已接收，无响应体' }
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
// Keep profile editing separate from the existing personal MCP-credential group.
groups.profile = {
    name: '用户资料',
    paths: { '/api/account/profile': groups.account.paths['/api/account/profile'] }
}
delete groups.account.paths['/api/account/profile']
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
            if (method === 'post' && path !== '/mcp')
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
            desktopSession: { type: 'http', scheme: 'bearer' },
            mcpToken: { type: 'http', scheme: 'bearer', bearerFormat: 'epmcp_ personal token' }
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
