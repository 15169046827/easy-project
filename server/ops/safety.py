"""Operator-only backup and restore drill. Never restores over live databases."""
import argparse
from contextlib import closing
import hashlib
import json
import os
from pathlib import Path
import shutil
import sqlite3
import tempfile
import uuid


def safe_root(value):
    path = Path(value)
    if not path.is_absolute() or '..' in path.parts:
        raise ValueError('Absolute directory without traversal required')
    for ancestor in (path, *path.parents):
        if ancestor.is_symlink():
            raise ValueError('Linked directories are not allowed')
    return path


def fingerprint(connection):
    if connection.execute('PRAGMA integrity_check').fetchall() != [('ok',)]:
        raise ValueError('Database integrity failed')
    if connection.execute('PRAGMA foreign_key_check').fetchone() is not None:
        raise ValueError('Database references failed')
    tables = []
    for (name,) in connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
        quoted = '"' + name.replace('"', '""') + '"'
        records = sorted(repr(row) for row in connection.execute('SELECT * FROM ' + quoted))
        tables.append([name, len(records), hashlib.sha256('\n'.join(records).encode()).hexdigest()])
    return {'schema': connection.execute('PRAGMA user_version').fetchone()[0], 'tables': tables}


def readonly(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError('Expected existing regular database')
    return sqlite3.connect(path.as_uri() + '?mode=ro', uri=True, timeout=10)


def backup(data_dir, output_dir):
    data, output = safe_root(data_dir), safe_root(output_dir)
    if not data.is_dir() or data == output or data in output.parents or output in data.parents:
        raise ValueError('Independent backup parent required')
    workspaces = data / 'workspaces'
    if workspaces.is_symlink():
        raise ValueError('Linked workspace directory')
    databases = [data / 'accounts.db']
    if workspaces.exists():
        for directory in sorted(workspaces.iterdir()):
            if directory.is_symlink() or not directory.is_dir():
                raise ValueError('Unexpected workspace entry')
            if len(directory.name) != 32 or any(c not in '0123456789abcdefABCDEF' for c in directory.name):
                raise ValueError('Unexpected workspace identity')
            databases.append(directory / 'project_manager.db')
    output.mkdir(parents=True, exist_ok=True, mode=0o700)
    bundle = output / ('snapshot-' + uuid.uuid4().hex)
    bundle.mkdir(mode=0o700)
    entries = []
    for source in databases:
        target = bundle / source.relative_to(data)
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        with closing(readonly(source)) as live, closing(sqlite3.connect(target)) as saved:
            live.backup(saved, pages=256, sleep=0.01)
            logical = fingerprint(saved)
        target.chmod(0o600)
        entries.append({'path': source.relative_to(data).as_posix(), 'bytes': target.stat().st_size,
                        'sha256': hashlib.sha256(target.read_bytes()).hexdigest(), 'logical': logical})
    manifest = {'version': 1, 'consistency': 'per-database-online-not-cross-database-atomic', 'databases': entries}
    path = bundle / 'manifest.json'
    path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    path.chmod(0o600)
    return {'bundle': str(bundle), 'databases': len(entries), 'crossDatabaseAtomic': False}


def verify(bundle_dir):
    bundle = safe_root(bundle_dir)
    manifest_file = bundle / 'manifest.json'
    if manifest_file.is_symlink() or manifest_file.stat().st_size > 16 * 1024 * 1024:
        raise ValueError('Invalid manifest')
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    if manifest.get('version') != 1 or not manifest.get('databases'):
        raise ValueError('Unsupported manifest')
    seen = set()
    with tempfile.TemporaryDirectory(prefix='restore-drill-', dir=bundle) as temporary:
        for entry in manifest['databases']:
            relative = Path(entry['path'])
            if relative.is_absolute() or '..' in relative.parts or entry['path'] in seen:
                raise ValueError('Unsafe or repeated manifest path')
            seen.add(entry['path'])
            source = safe_root(bundle / relative)
            if source.stat().st_size != entry['bytes'] or hashlib.sha256(source.read_bytes()).hexdigest() != entry['sha256']:
                raise ValueError('Snapshot checksum mismatch')
            # Exercise SQLite recovery into an isolated copy, not merely a file hash.
            restored = Path(temporary) / (uuid.uuid4().hex + '.db')
            with closing(readonly(source)) as saved, closing(sqlite3.connect(restored)) as copy:
                saved.backup(copy)
                if fingerprint(copy) != entry['logical']:
                    raise ValueError('Restored logical content differs')
    return {'verifiedDatabases': len(seen), 'restoreDrill': True, 'liveDataTouched': False}


def health(data_dir):
    data = safe_root(data_dir)
    if not data.is_dir():
        raise ValueError('Data directory missing')
    usage = shutil.disk_usage(data)
    return {'freeBytes': usage.free, 'freeRatio': usage.free / usage.total,
            'diskWarning': usage.free < 1024 ** 3 or usage.free / usage.total < 0.1,
            'accountDatabasePresent': (data / 'accounts.db').is_file()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['backup', 'verify', 'health'])
    parser.add_argument('--data-dir')
    parser.add_argument('--output-dir')
    parser.add_argument('--bundle-dir')
    args = parser.parse_args()
    os.umask(0o077)
    if args.command == 'backup':
        result = backup(args.data_dir, args.output_dir)
    elif args.command == 'verify':
        result = verify(args.bundle_dir)
    else:
        result = health(args.data_dir)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
