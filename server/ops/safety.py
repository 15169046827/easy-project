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
import time
import uuid


class Deadline:
    """Cooperative deadline; a service-level timeout must bound stalled filesystem I/O."""
    def __init__(self, seconds=300):
        self.end = time.monotonic() + seconds

    def check(self):
        if time.monotonic() >= self.end:
            raise TimeoutError('Operation deadline exceeded')

    def progress(self, *_):
        self.check()


def digest(path, deadline):
    checksum = hashlib.sha256()
    with path.open('rb') as stream:
        while chunk := stream.read(1024 * 1024):
            deadline.check()
            checksum.update(chunk)
    return checksum.hexdigest()


def require_capacity(path, additional_bytes):
    """Keep disk headroom for the app; never rely on filling the disk to stop backup."""
    while not path.exists():
        path = path.parent
    usage = shutil.disk_usage(path)
    reserve = max(1024 ** 3, int(usage.total * 0.1))
    if usage.free - additional_bytes < reserve:
        raise OSError('Insufficient safe backup capacity')


def safe_root(value):
    path = Path(value)
    if not path.is_absolute() or '..' in path.parts:
        raise ValueError('Absolute directory without traversal required')
    for ancestor in (path, *path.parents):
        if ancestor.is_symlink():
            raise ValueError('Linked directories are not allowed')
    return path


def fingerprint(connection, deadline=None):
    deadline = deadline or Deadline()
    deadline.check()
    connection.set_progress_handler(lambda: int(time.monotonic() >= deadline.end), 1000)
    if connection.execute('PRAGMA integrity_check').fetchall() != [('ok',)]:
        raise ValueError('Database integrity failed')
    if connection.execute('PRAGMA foreign_key_check').fetchone() is not None:
        raise ValueError('Database references failed')
    tables = []
    for (name,) in connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
        quoted = '"' + name.replace('"', '""') + '"'
        records = []
        for row in connection.execute('SELECT * FROM ' + quoted):
            deadline.check()
            records.append(repr(row))
        records.sort()
        deadline.check()
        tables.append([name, len(records), hashlib.sha256('\n'.join(records).encode()).hexdigest()])
    return {'schema': connection.execute('PRAGMA user_version').fetchone()[0], 'tables': tables}


def readonly(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError('Expected existing regular database')
    return sqlite3.connect(path.as_uri() + '?mode=ro', uri=True, timeout=10)


def backup(data_dir, output_dir, deadline=None):
    deadline = deadline or Deadline()
    deadline.check()
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
    estimates = []
    for source in databases:
        if source.is_symlink() or not source.is_file():
            raise ValueError('Expected existing regular database')
        wal = Path(str(source) + '-wal')
        if wal.is_symlink():
            raise ValueError('Linked database journal')
        estimates.append(source.stat().st_size + (wal.stat().st_size if wal.exists() else 0))
    # The complete bundle and one restored database coexist during verification.
    require_capacity(output, sum(estimates) + max(estimates))
    output.mkdir(parents=True, exist_ok=True, mode=0o700)
    bundle = output / ('snapshot-' + uuid.uuid4().hex)
    bundle.mkdir(mode=0o700)
    entries = []
    for source in databases:
        deadline.check()
        target = bundle / source.relative_to(data)
        target.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        with closing(readonly(source)) as live, closing(sqlite3.connect(target)) as saved:
            page_size = live.execute('PRAGMA page_size').fetchone()[0]

            def progress(status, remaining, total):
                deadline.progress(status, remaining, total)
                require_capacity(target.parent, remaining * page_size)

            live.backup(saved, pages=256, sleep=0.01, progress=progress)
            logical = fingerprint(saved, deadline)
        target.chmod(0o600)
        entries.append({'path': source.relative_to(data).as_posix(), 'bytes': target.stat().st_size,
                        'sha256': digest(target, deadline), 'logical': logical})
    manifest = {'version': 1, 'consistency': 'per-database-online-not-cross-database-atomic', 'databases': entries}
    path = bundle / 'manifest.json'
    path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    path.chmod(0o600)
    return {'bundle': str(bundle), 'databases': len(entries), 'crossDatabaseAtomic': False}


def verify(bundle_dir, deadline=None):
    deadline = deadline or Deadline()
    deadline.check()
    bundle = safe_root(bundle_dir)
    manifest_file = bundle / 'manifest.json'
    if manifest_file.is_symlink() or manifest_file.stat().st_size > 16 * 1024 * 1024:
        raise ValueError('Invalid manifest')
    manifest = json.loads(manifest_file.read_text(encoding='utf-8'))
    if (not isinstance(manifest, dict) or manifest.get('version') != 1
            or not isinstance(manifest.get('databases'), list)
            or not 1 <= len(manifest['databases']) <= 1001):
        raise ValueError('Unsupported manifest')
    seen = set()
    with tempfile.TemporaryDirectory(prefix='restore-drill-', dir=bundle) as temporary:
        for entry in manifest['databases']:
            deadline.check()
            relative = Path(entry['path'])
            if relative.is_absolute() or '..' in relative.parts or entry['path'] in seen:
                raise ValueError('Unsafe or repeated manifest path')
            seen.add(entry['path'])
            parts = relative.parts
            if parts != ('accounts.db',) and not (
                len(parts) == 3 and parts[0] == 'workspaces'
                and len(parts[1]) == 32 and all(c in '0123456789abcdefABCDEF' for c in parts[1])
                and parts[2] == 'project_manager.db'
            ):
                raise ValueError('Unsafe manifest database identity')
            source = safe_root(bundle / relative)
            if not source.is_file() or source.stat().st_size != entry['bytes'] or digest(source, deadline) != entry['sha256']:
                raise ValueError('Snapshot checksum mismatch')
            # Exercise SQLite recovery into an isolated copy, not merely a file hash.
            restored = Path(temporary) / (uuid.uuid4().hex + '.db')
            require_capacity(restored.parent, source.stat().st_size)
            with closing(readonly(source)) as saved, closing(sqlite3.connect(restored)) as copy:
                saved.backup(copy, pages=256, sleep=0.01, progress=deadline.progress)
                if fingerprint(copy, deadline) != entry['logical']:
                    raise ValueError('Restored logical content differs')
    if 'accounts.db' not in seen:
        raise ValueError('Account snapshot missing')
    return {'verifiedDatabases': len(seen), 'restoreDrill': True, 'liveDataTouched': False}


def health(data_dir):
    data = safe_root(data_dir)
    if not data.is_dir():
        raise ValueError('Data directory missing')
    usage = shutil.disk_usage(data)
    return {'freeBytes': usage.free, 'freeRatio': usage.free / usage.total,
            'diskWarning': usage.free < 1024 ** 3 or usage.free / usage.total < 0.1,
            'accountDatabasePresent': (data / 'accounts.db').is_file()}


def duration(value):
    seconds = int(value)
    if not 1 <= seconds <= 3600:
        raise argparse.ArgumentTypeError('Timeout must be 1 to 3600 seconds')
    return seconds


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['backup', 'verify', 'health', 'run'])
    parser.add_argument('--data-dir')
    parser.add_argument('--output-dir')
    parser.add_argument('--bundle-dir')
    parser.add_argument('--timeout-seconds', type=duration, default=300)
    parser.add_argument('--receipt', help='Fresh operator-owned JSON file outside live data and snapshots')
    parser.add_argument('--receipt-dir', help='Existing private directory for a unique run receipt')
    args = parser.parse_args(argv)
    required = {'backup': ['data_dir', 'output_dir'], 'verify': ['bundle_dir'],
                'health': ['data_dir'], 'run': ['data_dir', 'output_dir']}
    if any(not getattr(args, key) for key in required[args.command]):
        parser.error('Required command directories are missing')
    if args.receipt and args.receipt_dir:
        parser.error('Choose one receipt destination')
    os.umask(0o077)
    started = time.monotonic()
    receipt = None
    try:
        if args.receipt_dir:
            directory = safe_root(args.receipt_dir)
            if not directory.is_dir():
                raise ValueError('Existing private receipt directory required')
            args.receipt = str(directory / ('run-' + uuid.uuid4().hex + '.json'))
        if args.receipt:
            path = safe_root(args.receipt)
            for protected in (args.data_dir, args.bundle_dir):
                if protected and (path == safe_root(protected) or safe_root(protected) in path.parents):
                    raise ValueError('Receipt cannot be stored in live data or immutable snapshots')
            receipt = os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), 'w', encoding='utf-8')
        deadline = Deadline(args.timeout_seconds)
        if args.command == 'backup':
            result = backup(args.data_dir, args.output_dir, deadline)
        elif args.command == 'verify':
            result = verify(args.bundle_dir, deadline)
        elif args.command == 'health':
            result = health(args.data_dir)
        else:
            result = {'health': health(args.data_dir)}
            if not result['health']['diskWarning']:
                result['backup'] = backup(args.data_dir, args.output_dir, deadline)
                result['verification'] = verify(result['backup']['bundle'], deadline)
        deadline.check()
        warning = result.get('diskWarning', result.get('health', {}).get('diskWarning', False))
        status = {'ok': not warning, 'command': args.command, 'result': result,
                  'errorCode': 'DISK_WARNING' if warning else None}
        code = 2 if warning else 0
    except (OSError, ValueError, KeyError, TypeError, sqlite3.Error) as error:
        status = {'ok': False, 'command': args.command,
                  'errorCode': 'TIMEOUT' if isinstance(error, TimeoutError) or (
                      'deadline' in locals() and time.monotonic() >= deadline.end
                  ) else 'OPERATION_FAILED'}
        code = 1
    status['elapsedSeconds'] = round(time.monotonic() - started, 3)
    try:
        if receipt:
            json.dump(status, receipt)
            receipt.flush()
            os.fsync(receipt.fileno())
    except OSError:
        status = {'ok': False, 'command': args.command, 'errorCode': 'RECEIPT_FAILED'}
        code = 1
    finally:
        if receipt:
            receipt.close()
    print(json.dumps(status))
    return code


if __name__ == '__main__':
    raise SystemExit(main())
