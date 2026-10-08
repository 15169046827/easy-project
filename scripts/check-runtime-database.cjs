const { DatabaseSync } = require('node:sqlite')

if (process.argv.length < 3) {
    throw new Error('Provide one or more SQLite database paths.')
}
for (const path of process.argv.slice(2)) {
    const database = new DatabaseSync(path, { readOnly: true })
    try {
        const tables = database
            .prepare(
                "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
            )
            .all()
        const counts = {}
        for (const { name } of tables) {
            counts[name] = database
                .prepare(`SELECT COUNT(*) AS count FROM "${name.replaceAll('"', '""')}"`)
                .get().count
        }
        const integrity = database.prepare('PRAGMA integrity_check').all()
        const foreignKeyErrors = database.prepare('PRAGMA foreign_key_check').all().length
        console.log(JSON.stringify({ path, integrity, foreignKeyErrors, counts }))
        if (
            integrity.length !== 1 ||
            integrity[0].integrity_check !== 'ok' ||
            foreignKeyErrors !== 0
        ) {
            process.exitCode = 1
        }
    } finally {
        database.close()
    }
}
