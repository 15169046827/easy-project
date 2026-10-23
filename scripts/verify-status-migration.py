"""Read-only schema6 -> schema7 preservation check; never prints business values."""
import argparse
import json
import re
import sqlite3
from contextlib import closing
from pathlib import Path


def read(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError('Existing regular database required')
    with closing(sqlite3.connect(path.resolve().as_uri() + '?mode=ro', uri=True)) as db:
        db.row_factory = sqlite3.Row
        if db.execute('pragma integrity_check').fetchone()[0] != 'ok' or db.execute('pragma foreign_key_check').fetchall():
            raise ValueError('Database integrity failed')
        tables = [r[0] for r in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")]
        return db.execute('pragma user_version').fetchone()[0], {t: [dict(r) for r in db.execute('select * from "' + t.replace('"', '""') + '"')] for t in tables}


def verify(before, after, allow_epoch=False):
    old_version, old = read(before)
    version, new = read(after)
    account = 'account' in old
    if (old_version, version) != ((3, 3) if account else (6, 7)):
        raise ValueError('Unexpected schema transition')
    if set(new) != set(old) | (set() if account else {'task_status'}):
        raise ValueError('Unexpected table changes')
    def ordered(rows):
        return sorted(json.dumps(row, sort_keys=True) for row in rows)
    for table, rows in old.items():
        columns = set(rows[0]) if rows else set()
        expected = [dict(row) for row in rows]
        if table == 'web_revision' and allow_epoch:
            columns.discard('value')
        if table == 'task':
            for row in expected:
                if row.get('status') == 'Done':
                    row['progress'] = 100
        expected = [{c: row[c] for c in columns} for row in expected]
        actual = [{c: row[c] for c in columns} for row in new[table]]
        if len(rows) != len(new[table]) or ordered(expected) != ordered(actual):
            raise ValueError('Original fields changed: ' + table)
    if not account:
        states = {row['id']: row for row in new['task_status']}
        projects = {row['id'] for row in new['project']}
        for state in states.values():
            if not re.fullmatch(r'TASK_STATUS:[0-9a-f]{32}', state['id']) or state['project_id'] not in projects:
                raise ValueError('Invalid status identity or project')
        for project in projects:
            if sum(s['is_default'] == 1 and s['stateflag'] == '0' for s in states.values() if s['project_id'] == project) != 1:
                raise ValueError('Invalid default status')
        for task in new['task']:
            state = states.get(task['status_id'])
            if not state or state['project_id'] != task['project_id'] or state['stateflag'] != '0':
                raise ValueError('Invalid task reference')
            label = 'Pending' if task['status'] in ('', 'Todo') else task['status']
            if state['name'] != label or bool(state['is_completed']) != (label == 'Done'):
                raise ValueError('Legacy status meaning changed')
    return {'schemaBefore': old_version, 'schemaAfter': version, 'originalFieldsPreserved': True,
            'integrity': 'ok', 'foreignKeys': 0, 'counts': {t: len(rows) for t, rows in new.items()}}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('before', type=Path)
    parser.add_argument('after', type=Path)
    parser.add_argument('--allow-epoch', action='store_true')
    args = parser.parse_args()
    print(json.dumps(verify(args.before, args.after, args.allow_epoch)))
