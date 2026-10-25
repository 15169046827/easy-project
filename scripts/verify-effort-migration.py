"""Read-only schema7 -> schema8 field/identity preservation verification."""
import argparse
import json
import sqlite3
from contextlib import closing
from pathlib import Path


def read(path):
    """Only inspect a quiescent regular snapshot; never create a database."""
    path = Path(path)
    if not path.is_file() or any(part.is_symlink() for part in [path, *path.parents]):
        raise ValueError('Existing non-linked database snapshot required')
    for suffix in ('-wal', '-journal'):
        sidecar = Path(str(path) + suffix)
        if sidecar.exists() and sidecar.stat().st_size:
            raise ValueError('Use a quiescent SQLite backup, not a live WAL database')
    with closing(sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True)) as db:
        db.row_factory = sqlite3.Row
        if db.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise ValueError('Database integrity failed')
        if db.execute('PRAGMA foreign_key_check').fetchall():
            raise ValueError('Foreign-key validation failed')
        tables = {}
        for (name,) in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"):
            quoted = '"' + name.replace('"', '""') + '"'
            tables[name] = {
                'columns': [row['name'] for row in db.execute('PRAGMA table_info(' + quoted + ')')],
                'rows': [dict(row) for row in db.execute('SELECT * FROM ' + quoted)],
            }
        objects = sorted(tuple(row) for row in db.execute(
            "SELECT type,name,sql FROM sqlite_master WHERE type IN ('index','trigger') AND sql IS NOT NULL"))
        return db.execute('PRAGMA user_version').fetchone()[0], tables, objects


def ordered(rows):
    return sorted(json.dumps(row, sort_keys=True, ensure_ascii=True) for row in rows)


def verify(before, after, allow_epoch=False):
    old_version, old, old_objects = read(before)
    version, new, new_objects = read(after)
    account = 'account' in old
    if (old_version, version) != ((3, 3) if account else (7, 8)):
        raise ValueError('Unexpected schema transition')
    if set(old) != set(new) or old_objects != new_objects:
        raise ValueError('Unexpected tables, indexes or triggers changed')
    for table, data in old.items():
        columns = data['columns']
        expected_columns = columns + (['effort_state'] if table == 'task' and not account else [])
        if new[table]['columns'] != expected_columns:
            raise ValueError('Unexpected column changes: ' + table)
        compared = [column for column in columns if not (allow_epoch and table == 'web_revision' and column == 'value')]
        expected = [{column: row[column] for column in compared} for row in data['rows']]
        actual = [{column: row[column] for column in compared} for row in new[table]['rows']]
        if ordered(expected) != ordered(actual):
            raise ValueError('Original fields or identities changed: ' + table)
    if not account:
        if 'task' not in old or 'effort_days' not in old['task']['columns']:
            raise ValueError('Expected schema7 task effort')
        if any(row['effort_state'] != ('estimated' if row['effort_days'] > 0 else 'legacy_unknown')
               for row in new['task']['rows']):
            raise ValueError('Incorrect estimate provenance backfill')
    return {
        'schemaBefore': old_version, 'schemaAfter': version,
        'originalFieldsPreserved': True, 'identitiesPreserved': True,
        'estimateProvenanceVerified': not account, 'integrity': 'ok', 'foreignKeys': 0,
        'counts': {table: len(data['rows']) for table, data in new.items()},
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('before', type=Path)
    parser.add_argument('after', type=Path)
    parser.add_argument('--allow-epoch', action='store_true')
    args = parser.parse_args()
    print(json.dumps(verify(args.before, args.after, args.allow_epoch)))
