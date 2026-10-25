"""Root-only, isolated systemd verification; never targets the application service/data."""
import json
import os
from pathlib import Path
import shutil
import sqlite3
import subprocess
import tempfile
import uuid


def command(arguments, expected=0):
    result = subprocess.run(arguments, capture_output=True, text=True, timeout=45, check=False)
    if (result.returncode == 0) != (expected == 0):
        raise RuntimeError('Isolated service command failed: ' + arguments[0]
                           + '\n' + result.stdout[-600:] + result.stderr[-600:])
    return result


def run():
    if os.name != 'posix' or os.geteuid() != 0 or not Path('/run/systemd/system').is_dir():
        raise RuntimeError('Linux root with a running systemd required')
    source = Path(__file__).resolve().parent
    # PrivateTmp intentionally hides /tmp and /var/tmp inside the tested service.
    # Keep this sibling test directory outside the real /var/lib/easyproject tree.
    root = Path(tempfile.mkdtemp(prefix='easyproject-safety-check-', dir='/var/lib'))
    root.chmod(0o700)
    data, output, receipts = root / 'data', root / 'snapshots', root / 'runs'
    workspace = data / 'workspaces' / ('a' * 32)
    workspace.mkdir(parents=True)
    output.mkdir(mode=0o700)
    receipts.mkdir(mode=0o700)
    script = root / 'safety.py'
    shutil.copyfile(source / 'safety.py', script)
    script.chmod(0o600)
    for path in (data / 'accounts.db', workspace / 'project_manager.db'):
        with sqlite3.connect(path) as db:
            db.executescript("CREATE TABLE sample(id TEXT PRIMARY KEY, value TEXT);"
                             "INSERT INTO sample VALUES('SAMPLE:synthetic','synthetic');")
    databases = list(data.rglob('*.db'))
    units = []

    def service(mode, name, expected=0, executable=None, timeout='15s'):
        unit = 'ep-safety-check-' + uuid.uuid4().hex + '-' + name
        units.append(unit)
        args = ['systemd-run', '--quiet', '--wait', '--pipe', '--unit=' + unit,
                '-p', 'Type=oneshot', '-p', 'UMask=0077', '-p', 'NoNewPrivileges=yes',
                '-p', 'ProtectSystem=strict', '-p', 'ProtectHome=yes', '-p', 'PrivateTmp=yes',
                '-p', 'ReadOnlyPaths=' + str(data), '-p', 'ReadWritePaths=' + str(root),
                '-p', 'RestrictAddressFamilies=AF_UNIX', '-p', 'MemoryMax=256M',
                '-p', 'TasksMax=16', '-p', 'TimeoutStartSec=' + timeout]
        payload = executable or ['/usr/bin/flock', '--nonblock', str(root / 'operation.lock'),
                                 '/usr/bin/python3', str(script), mode, '--data-dir', str(data),
                                 '--output-dir', str(output), '--receipt-dir', str(receipts)]
        return command(args + payload, expected)

    try:
        # Keep WAL open: read-only source mounts must handle uncheckpointed commits.
        with sqlite3.connect(data / 'accounts.db') as live:
            live.execute('PRAGMA journal_mode=WAL')
            live.execute("INSERT INTO sample VALUES('SAMPLE:wal','synthetic')")
            live.commit()
            successful = service('run', 'success')
            report = json.loads(successful.stdout.strip())
            if not report['ok'] or not report['result']['verification']['restoreDrill']:
                raise RuntimeError('Isolated restore drill not confirmed')
            with sqlite3.connect(Path(report['result']['backup']['bundle']) / 'accounts.db') as saved:
                if saved.execute('SELECT count(*) FROM sample').fetchone()[0] != 2:
                    raise RuntimeError('WAL snapshot omitted committed data')
            live.execute("DELETE FROM sample WHERE id='SAMPLE:wal'")
            live.commit()
            live.execute('PRAGMA wal_checkpoint(TRUNCATE)')
        service('health', 'health')
        probe = data / 'must-remain-absent'
        service('health', 'readonly', expected=1, executable=[
            '/usr/bin/python3', '-c',
            'from pathlib import Path; Path(' + repr(str(probe)) + ").write_text('probe')"])
        if probe.exists():
            raise RuntimeError('Source mount was writable')
        # Force a missing synthetic source; no production database is referenced.
        (data / 'accounts.db').rename(data / 'accounts.saved')
        service('run', 'missing', expected=1)
        (data / 'accounts.saved').rename(data / 'accounts.db')
        import fcntl
        with (root / 'operation.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            service('health', 'locked', expected=1)
        service('health', 'timeout', expected=1, timeout='1s',
                executable=['/usr/bin/python3', '-c', 'import time; time.sleep(20)'])
        failed = command(['systemctl', 'show', units[-1], '-p', 'Result', '--value']).stdout.strip()
        if failed != 'timeout':
            raise RuntimeError('Hard timeout not confirmed')
        # SQLite checkpoint may change physical layout; verify only original synthetic rows.
        for path in databases:
            with sqlite3.connect(path) as db:
                if db.execute('SELECT * FROM sample').fetchall() != [('SAMPLE:synthetic', 'synthetic')]:
                    raise RuntimeError('Synthetic live rows changed')
        result = {'isolatedSystemd': True, 'walSnapshot': True, 'restoreDrill': True,
                  'missingSourceRejected': True, 'lockRejected': True, 'hardTimeout': True,
                  'liveRowsPreserved': True, 'sourceMountReadOnly': True, 'productionTouched': False,
                  'evidenceDirectory': str(root)}
        (root / 'result.json').write_text(json.dumps(result))
        print(json.dumps(result))
    finally:
        # Only transient units created here; retain private evidence and all snapshots.
        for unit in units:
            subprocess.run(['systemctl', 'reset-failed', unit], capture_output=True, timeout=10)


if __name__ == '__main__':
    run()
