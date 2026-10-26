// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const catalog = JSON.parse(readFileSync('docs/api/catalog.json', 'utf8'))
const powerShellAvailable =
    spawnSync('pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.Major'], {
        encoding: 'utf8',
        windowsHide: true,
        timeout: 10000
    }).status === 0
describe('Apifox API documentation boundary', () => {
    it.skipIf(!powerShellAvailable)(
        'rejects unknown targeted HTTP updates before network access',
        () => {
            const result = spawnSync(
                'pwsh',
                [
                    '-NoProfile',
                    '-File',
                    'scripts/sync-web-apifox.ps1',
                    '-OnlyOperations',
                    'unmanaged'
                ],
                { encoding: 'utf8', windowsHide: true, timeout: 10000 }
            )
            expect(result.status).not.toBe(0)
            expect(result.stderr).toContain('Unknown targeted Web operation')
        }
    )
    it('documents the real authenticated HTTP server separately from native protocols', () => {
        const api = JSON.parse(readFileSync('docs/api/web-openapi.json', 'utf8'))
        expect(Object.keys(api.paths)).toHaveLength(16)
        expect(Object.values(api.paths).flatMap(methods => Object.values(methods))).toHaveLength(19)
        const releaseIndex = api.paths['/release-info.json'].get
        expect(releaseIndex.security).toEqual([])
        expect(releaseIndex['x-easyproject-group']).toBe('运行状态')
        expect(releaseIndex.responses[200].content['application/json'].schema.oneOf).toHaveLength(2)
        expect(releaseIndex.responses[404]).toBeTruthy()
        expect(api.paths['/api/auth/reset-password'].post.security).toEqual([])
        expect(
            api.paths['/api/auth/register'].post.requestBody.content['application/json'].schema
                .properties.password
        ).toMatchObject({ minLength: 6, maxLength: 31 })
        expect(
            api.paths['/api/account/profile'].post.requestBody.content['application/json'].schema
                .additionalProperties
        ).toBe(false)
        expect(api.paths['/api/auth/register'].post.security).toEqual([])
        expect(api.paths['/mcp'].post.security).toEqual([{ mcpToken: [] }])
        expect(
            api.paths['/mcp'].post.parameters.some(p => p.name === 'X-EasyProject-Request')
        ).toBe(false)
        expect(api.paths['/api/auth/login'].post.security).toEqual([])
        expect(api.paths['/api/workspace/action'].post.responses[507]).toBeTruthy()
        expect(api.paths['/api/workspace/action'].post.responses[503]).toBeTruthy()
        expect(
            api.paths['/api/workspace/action'].post.parameters.some(
                parameter => parameter.name === 'X-Workspace-Revision'
            )
        ).toBe(true)
        expect(api.components.securitySchemes.browserSession.in).toBe('cookie')
        expect(
            api.paths['/api/admin/users'].post.requestBody.content['application/json'].schema
                .additionalProperties
        ).toBe(false)
    })
    it('groups all native protocol interfaces without inventing HTTP endpoints', () => {
        const layout = JSON.parse(readFileSync('docs/api/apifox-layout.json', 'utf8'))
        expect(layout.folders).toHaveLength(23)
        expect(layout.interfaces).toHaveLength(66)
        expect(new Set(layout.interfaces.map(item => item.key)).size).toBe(66)
        expect(new Set(layout.interfaces.map(item => item.path)).size).toBe(66)
        for (const item of layout.interfaces) {
            expect(layout.folders.some(folder => folder.key === item.group)).toBe(true)
            expect(['MCP stdio', 'Tauri IPC']).toContain(item.protocol)
            expect(item.name).not.toContain('undefined')
            expect(item.path).not.toMatch(/^https?:/)
        }
        expect(layout.interfaces.filter(item => item.protocol === 'MCP stdio')).toHaveLength(23)
        expect(layout.interfaces.filter(item => item.protocol === 'Tauri IPC')).toHaveLength(43)
    })
    it('records all 23 MCP tools, 7 commands and 36 dispatcher actions without inventing HTTP', () => {
        expect(catalog.tools).toHaveLength(23)
        expect(new Set(catalog.tools.map(tool => tool.name)).size).toBe(23)
        expect(catalog.commands).toHaveLength(7)
        expect(Object.values(catalog.actions).flat()).toHaveLength(36)
        expect(catalog.transport.mcp).toContain('no HTTP')
        expect(catalog.tools.every(tool => tool.inputSchema.additionalProperties === false)).toBe(
            true
        )
    })
    it('keeps generated documentation keys unique and exactly covers the registered API', () => {
        const docs = JSON.parse(readFileSync('docs/api/apifox-documents.json', 'utf8'))
        expect(docs).toHaveLength(32)
        expect(new Set(docs.map(doc => doc.key)).size).toBe(docs.length)
        for (const tool of catalog.tools)
            expect(
                docs.some(doc => doc.key === tool.name && doc.content.includes('JSON Schema'))
            ).toBe(true)
        for (const command of catalog.commands)
            expect(docs.some(doc => doc.key === `tauri_${command}`)).toBe(true)
    })
    it.skipIf(!powerShellAvailable).each([
        [
            'HTTP write without approval',
            { headers: { 'X-Project-Id': '8948094' }, pathParams: { http_api_id: 526827472 } },
            'updateHttpEndpoint',
            'require explicit EasyProject'
        ],
        [
            'HTTP import without approval',
            { pathParams: { projectId: '8948094' } },
            'importData',
            'require explicit EasyProject'
        ],
        ['wrong project', { projectId: 8948095 }, 'getProjectSummary', 'Only EasyProject'],
        [
            'conflicting project',
            {
                pathParams: { projectId: '8948095' },
                headers: { 'X-Project-Id': '8948094' },
                id: '12efa5c42b296c7c'
            },
            'executeOpenApi',
            'Only EasyProject'
        ],
        [
            'unapproved write',
            { id: '12efa5c42b296c7c', headers: { 'X-Project-Id': '8948094' } },
            'executeOpenApi',
            'require -AllowWrite'
        ],
        [
            'unreviewed operation',
            { id: 'unknown', headers: { 'X-Project-Id': '8948094' } },
            'executeOpenApi',
            'not been reviewed'
        ]
    ])(
        'rejects %s before reading credentials or making network calls',
        (_label, args, tool, error) => {
            const result = spawnSync(
                'pwsh',
                [
                    '-NoProfile',
                    '-File',
                    'scripts/apifox-mcp.ps1',
                    '-Tool',
                    tool,
                    '-ArgumentsJson',
                    JSON.stringify(args)
                ],
                { encoding: 'utf8', windowsHide: true, timeout: 10000 }
            )
            expect(result.status).not.toBe(0)
            expect(result.stderr).toContain(error)
        }
    )
})
