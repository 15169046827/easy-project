const SHEETS = {
    Projects: [
        'id',
        'name',
        'version',
        'type',
        'status',
        'owner',
        'calendar_country',
        'calendar_region',
        'weekend_days',
        'calendar_exceptions',
        'creator',
        'create_time',
        'update_time',
        'stateflag'
    ],
    Tasks: [
        'id',
        'project_id',
        'sort_order',
        'name',
        'parent',
        'dependence',
        'start_time',
        'end_time',
        'type',
        'priority',
        'status',
        'progress',
        'effort_days',
        'schedule_mode',
        'comment',
        'assignee',
        'creator',
        'create_time',
        'update_time',
        'stateflag'
    ],
    Dependencies: [
        'id',
        'predecessor_task_id',
        'successor_task_id',
        'dependency_type',
        'lag_minutes',
        'create_time'
    ],
    Members: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'avatar',
        'availability_exceptions',
        'create_time',
        'update_time',
        'stateflag'
    ],
    ProjectMembers: ['id', 'project_id', 'member_id', 'role', 'joined_at', 'stateflag'],
    Baselines: ['id', 'project_id', 'task_id', 'task_name', 'start_time', 'end_time', 'created_at']
}

const PAYLOAD_KEYS = {
    Projects: 'projects',
    Tasks: 'tasks',
    Dependencies: 'dependencies',
    Members: 'members',
    ProjectMembers: 'project_members',
    Baselines: 'plan_baselines'
}

async function excelModule() {
    const module = await import('exceljs/dist/exceljs.min.js')
    return module.default || module
}

function styleSheet(sheet) {
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    sheet.autoFilter = { from: 'A1', to: `${sheet.getColumn(sheet.columnCount).letter}1` }
    const header = sheet.getRow(1)
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    header.alignment = { vertical: 'middle' }
    header.height = 22
    sheet.columns.forEach(column => {
        const lengths = column.values.slice(1, 80).map(value => String(value ?? '').length)
        column.width = Math.min(36, Math.max(12, ...lengths) + 2)
    })
}

export async function snapshotToXlsx(snapshot) {
    const ExcelJS = await excelModule()
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'EasyProject'
    workbook.created = new Date()
    const metadata = workbook.addWorksheet('README')
    metadata.addRows([
        ['EasyProject Data Exchange', 'Do not rename worksheets or required columns.'],
        ['schemaVersion', snapshot.schemaVersion || 5],
        ['exportedAt', snapshot.exportedAt || new Date().toISOString()]
    ])
    metadata.getColumn(1).width = 24
    metadata.getColumn(2).width = 64
    metadata.getRow(1).font = { bold: true, color: { argb: 'FF1D4ED8' } }

    for (const [sheetName, headers] of Object.entries(SHEETS)) {
        const sheet = workbook.addWorksheet(sheetName)
        sheet.addRow(headers)
        for (const row of snapshot[PAYLOAD_KEYS[sheetName]] || []) sheet.addRow(row)
        styleSheet(sheet)
    }
    return workbook.xlsx.writeBuffer()
}

function cellValue(cell) {
    const value = cell.value
    if (value === null || value === undefined) return ''
    if (value instanceof Date) return value.toISOString().replace('T', ' ').slice(0, 19)
    if (typeof value === 'object') return value.text || value.result || String(value)
    return value
}

export async function xlsxToSnapshot(buffer) {
    const ExcelJS = await excelModule()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const readme = workbook.getWorksheet('README')
    const schemaVersion = Number(readme?.getCell('B2').value) || 5
    const exportedAt = String(readme?.getCell('B3').value || '')
    const payload = {
        schemaVersion,
        exportedAt,
        projects: [],
        tasks: [],
        dependencies: [],
        members: [],
        project_members: [],
        plan_baselines: []
    }
    const mappings = []
    const warnings = []

    for (const [sheetName, expectedHeaders] of Object.entries(SHEETS)) {
        const sheet = workbook.getWorksheet(sheetName)
        if (!sheet) {
            warnings.push(`Missing worksheet: ${sheetName}`)
            continue
        }
        const actualHeaders = sheet
            .getRow(1)
            .values.slice(1)
            .map(value => String(value || '').trim())
        const indexes = expectedHeaders.map(header => actualHeaders.indexOf(header) + 1)
        const missing = expectedHeaders.filter((header, index) => indexes[index] === 0)
        if (missing.length) warnings.push(`${sheetName}: missing ${missing.join(', ')}`)
        mappings.push({
            sheet: sheetName,
            matched: expectedHeaders.length - missing.length,
            total: expectedHeaders.length
        })
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1 || row.actualCellCount === 0) return
            payload[PAYLOAD_KEYS[sheetName]].push(
                indexes.map(index => (index ? cellValue(row.getCell(index)) : ''))
            )
        })
    }
    return {
        payload,
        preview: {
            mappings,
            warnings,
            counts: Object.fromEntries(
                Object.entries(PAYLOAD_KEYS).map(([sheet, key]) => [sheet, payload[key].length])
            )
        }
    }
}
