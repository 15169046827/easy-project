"""Root-only, stopped-service snapshot and logical verification for schema 1 -> 2.

Never restores automatically. Existing users or post-upgrade writes must not be lost.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import sys

DATA = Path('/var/lib/easyproject')
BACKUPS = Path('/var/backups/easyproject')


def inventory(root):
    result = {}
    paths = [root / 'accounts.db', *sorted((root / 'workspaces').glob('*/project_manager.db'))]
    for path in paths:
        if path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
            raise SystemExit('Unsafe database path')
        connection = sqlite3.connect(f'{path.as_uri()}?mode=ro', uri=True)
        try:
            if connection.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                raise SystemExit('Database integrity failed')
            if connection.execute('PRAGMA foreign_key_check').fetchall():
                raise SystemExit('Foreign-key check failed')
            tables = connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
            digests = {}
            for (table,) in tables:
                if table in ('mcp_token', 'web_revision', 'sqlite_sequence'):
                    continue
                quoted = '"' + table.replace('"', '""') + '"'
                rows = connection.execute(f'SELECT * FROM {quoted}').fetchall()
                encoded = sorted(json.dumps(row, ensure_ascii=True, separators=(',', ':')) for row in rows)
                digests[table] = {'rows': len(rows), 'sha256': hashlib.sha256('\n'.join(encoded).encode()).hexdigest()}
            result[str(path.relative_to(root))] = digests
        finally:
            connection.close()
    return result


def main():
    if os.geteuid() != 0 or len(sys.argv) != 3:
        raise SystemExit('Run as root: schema2-safety.py snapshot|verify <40-character source SHA>')
    action, source = sys.argv[1:]
    if len(source) != 40 or any(c not in '0123456789abcdef' for c in source):
        raise SystemExit('Exact source SHA required')
    if DATA.is_symlink() or DATA.resolve() != DATA:
        raise SystemExit('Unexpected data root')
    backup = BACKUPS / source
    os.umask(0o077)
    if action == 'snapshot':
        if subprocess.run(['systemctl', 'is-active', '--quiet', 'easyproject'], check=False).returncode == 0:
            raise SystemExit('Stop EasyProject before taking a snapshot')
        if any(path.is_symlink() for path in DATA.rglob('*')):
            raise SystemExit('Symlinks are not permitted in this snapshot')
        before = inventory(DATA)
        BACKUPS.mkdir(mode=0o700, parents=True, exist_ok=True)
        if BACKUPS.is_symlink() or BACKUPS.resolve() != BACKUPS:
            raise SystemExit('Unexpected backup root')
        backup.mkdir(mode=0o700, exist_ok=False)
        shutil.copytree(DATA, backup / 'data', symlinks=False)
        if inventory(backup / 'data') != before:
            raise SystemExit('Snapshot logical comparison failed; original data untouched')
        (backup / 'inventory.json').write_text(json.dumps(before, indent=2) + '\n')
        print(json.dumps({'snapshot': str(backup), 'databases': len(before), 'verified': True}))
    elif action == 'verify':
        before = json.loads((backup / 'inventory.json').read_text())
        after = inventory(DATA)
        if before != after:
            raise SystemExit('Logical data differs: investigate concurrent activity; do not auto-restore')
        with sqlite3.connect(f'{(DATA / "accounts.db").as_uri()}?mode=ro', uri=True) as connection:
            if connection.execute('PRAGMA user_version').fetchone()[0] != 2:
                raise SystemExit('Account schema migration not completed')
        print(json.dumps({'verified': True, 'databases': len(after), 'accountSchema': 2, 'existingRowsUnchanged': True}))
    else:
        raise SystemExit('Unknown operation')


if __name__ == '__main__':
    main()
