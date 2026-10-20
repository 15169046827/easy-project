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
    it('records all 18 MCP tools, 6 commands and 31 dispatcher actions without inventing HTTP', () => {
        expect(catalog.tools).toHaveLength(18)
        expect(new Set(catalog.tools.map(tool => tool.name)).size).toBe(18)
        expect(catalog.commands).toHaveLength(6)
        expect(Object.values(catalog.actions).flat()).toHaveLength(31)
        expect(catalog.transport.mcp).toContain('no HTTP')
        expect(catalog.tools.every(tool => tool.inputSchema.additionalProperties === false)).toBe(
            true
        )
    })
    it('keeps generated documentation keys unique and exactly covers the registered API', () => {
        const docs = JSON.parse(readFileSync('docs/api/apifox-documents.json', 'utf8'))
        expect(docs).toHaveLength(26)
        expect(new Set(docs.map(doc => doc.key)).size).toBe(docs.length)
        for (const tool of catalog.tools)
            expect(
                docs.some(doc => doc.key === tool.name && doc.content.includes('JSON Schema'))
            ).toBe(true)
        for (const command of catalog.commands)
            expect(docs.some(doc => doc.key === `tauri_${command}`)).toBe(true)
    })
    it.skipIf(!powerShellAvailable).each([
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
