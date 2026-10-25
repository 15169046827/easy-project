from contextlib import closing
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

import safety


class SafetyTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.data = self.root / 'data'
        self.workspace = self.data / 'workspaces' / ('a' * 32)
        self.workspace.mkdir(parents=True)
        self.output = self.root / 'snapshots'
        for file in [self.data / 'accounts.db', self.workspace / 'project_manager.db']:
            with closing(sqlite3.connect(file)) as db:
                db.executescript("CREATE TABLE sample(id TEXT PRIMARY KEY, value BLOB); INSERT INTO sample VALUES('SAMPLE:abc', X'1234'); PRAGMA user_version=6;")
                db.commit()

    def test_backup_and_actual_isolated_restore_preserve_live_files(self):
        before = {p: p.read_bytes() for p in self.data.rglob('*.db')}
        result = safety.backup(self.data, self.output)
        self.assertFalse(result['crossDatabaseAtomic'])
        bundle = Path(result['bundle'])
        self.assertEqual(safety.verify(bundle)['verifiedDatabases'], 2)
        self.assertFalse(list(bundle.glob('restore-drill-*')))
        self.assertEqual(before, {p: p.read_bytes() for p in before})

    def test_corruption_is_rejected_before_restore(self):
        bundle = Path(safety.backup(self.data, self.output)['bundle'])
        with (bundle / 'accounts.db').open('ab') as file:
            file.write(b'tamper')
        with self.assertRaisesRegex(ValueError, 'checksum'):
            safety.verify(bundle)

    def test_traversal_manifest_is_rejected(self):
        bundle = Path(safety.backup(self.data, self.output)['bundle'])
        path = bundle / 'manifest.json'
        manifest = json.loads(path.read_text())
        manifest['databases'][0]['path'] = '../accounts.db'
        path.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, 'Unsafe'):
            safety.verify(bundle)

    def test_missing_source_does_not_create_empty_database(self):
        (self.data / 'accounts.db').unlink()
        with self.assertRaisesRegex(ValueError, 'existing'):
            safety.backup(self.data, self.output)
        self.assertFalse((self.data / 'accounts.db').exists())

    def test_output_cannot_overlap_data(self):
        with self.assertRaisesRegex(ValueError, 'Independent'):
            safety.backup(self.data, self.data / 'copies')

    def test_health_reports_disk_without_account_content(self):
        report = safety.health(self.data)
        self.assertTrue(report['accountDatabasePresent'])
        self.assertGreater(report['freeBytes'], 0)
        self.assertNotIn('tables', report)

    def test_expired_deadline_never_creates_snapshot(self):
        with self.assertRaises(TimeoutError):
            safety.backup(self.data, self.output, safety.Deadline(-1))
        self.assertFalse(self.output.exists())

    def test_backup_callback_timeout_keeps_incomplete_bundle_unpublished(self):
        deadline = safety.Deadline()
        deadline.progress = lambda *_: (_ for _ in ()).throw(TimeoutError())
        with self.assertRaises(TimeoutError):
            safety.backup(self.data, self.output, deadline)
        self.assertFalse(list(self.output.rglob('manifest.json')))
        self.assertTrue((self.data / 'accounts.db').is_file())

    def test_verify_timeout_cleans_only_isolated_drill_files(self):
        bundle = Path(safety.backup(self.data, self.output)['bundle'])
        deadline = safety.Deadline()
        deadline.progress = lambda *_: (_ for _ in ()).throw(TimeoutError())
        with self.assertRaises(TimeoutError):
            safety.verify(bundle, deadline)
        self.assertFalse(list(bundle.glob('restore-drill-*')))
        self.assertTrue((bundle / 'manifest.json').is_file())

    def test_unexpected_manifest_identity_and_missing_accounts_rejected(self):
        bundle = Path(safety.backup(self.data, self.output)['bundle'])
        path = bundle / 'manifest.json'
        manifest = json.loads(path.read_text())
        manifest['databases'][0]['path'] = 'unrelated.db'
        path.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, 'identity'):
            safety.verify(bundle)
        manifest['databases'] = manifest['databases'][1:]
        path.write_text(json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, 'Account snapshot'):
            safety.verify(bundle)

    def cli(self, *arguments):
        with redirect_stdout(io.StringIO()) as stream:
            code = safety.main(list(arguments))
        return code, json.loads(stream.getvalue())

    def test_cli_run_restores_and_writes_fresh_receipt(self):
        receipt = self.root / 'run.json'
        with patch('safety.health', return_value={'diskWarning': False}):
            code, report = self.cli('run', '--data-dir', str(self.data),
                                    '--output-dir', str(self.output), '--receipt', str(receipt))
        self.assertEqual(code, 0)
        self.assertTrue(report['result']['verification']['restoreDrill'])
        self.assertEqual(json.loads(receipt.read_text()), report)
        original = receipt.read_bytes()
        code, _ = self.cli('health', '--data-dir', str(self.data), '--receipt', str(receipt))
        self.assertEqual(code, 1)
        self.assertEqual(receipt.read_bytes(), original)

    def test_cli_failure_is_sanitized_and_receipted(self):
        receipt = self.root / 'failure.json'
        (self.data / 'accounts.db').unlink()
        code, report = self.cli('backup', '--data-dir', str(self.data),
                                '--output-dir', str(self.output), '--receipt', str(receipt))
        self.assertEqual(code, 1)
        self.assertFalse(report['ok'])
        self.assertNotIn(str(self.data), json.dumps(report))
        self.assertEqual(json.loads(receipt.read_text()), report)

    def test_disk_warning_skips_backup_and_returns_nonzero(self):
        with patch('safety.health', return_value={'diskWarning': True}):
            code, report = self.cli('run', '--data-dir', str(self.data),
                                    '--output-dir', str(self.output))
        self.assertEqual(code, 2)
        self.assertEqual(report['errorCode'], 'DISK_WARNING')
        self.assertFalse(self.output.exists())

    def test_receipt_inside_live_data_is_rejected_without_writes(self):
        code, _ = self.cli('health', '--data-dir', str(self.data),
                            '--receipt', str(self.data / 'receipt.json'))
        self.assertEqual(code, 1)
        self.assertFalse((self.data / 'receipt.json').exists())

    def test_timeout_argument_is_bounded(self):
        for seconds in ('0', '-1', '3601'):
            with self.assertRaises(Exception):
                safety.duration(seconds)

    def test_receipt_directory_generates_unique_receipts(self):
        receipts = self.root / 'runs'
        receipts.mkdir()
        for _ in range(2):
            code, _ = self.cli('health', '--data-dir', str(self.data), '--receipt-dir', str(receipts))
            self.assertIn(code, (0, 2))
        self.assertEqual(len(list(receipts.glob('run-*.json'))), 2)

    def test_wal_backup_includes_uncheckpointed_committed_rows(self):
        with closing(sqlite3.connect(self.data / 'accounts.db')) as live:
            live.execute('PRAGMA journal_mode=WAL')
            live.execute("INSERT INTO sample VALUES('SAMPLE:wal', X'5678')")
            live.commit()
            bundle = Path(safety.backup(self.data, self.output)['bundle'])
            with closing(sqlite3.connect(bundle / 'accounts.db')) as saved:
                self.assertEqual(saved.execute('SELECT count(*) FROM sample').fetchone()[0], 2)
            self.assertTrue(safety.verify(bundle)['restoreDrill'])

    def test_malformed_manifest_returns_sanitized_failure(self):
        bundle = Path(safety.backup(self.data, self.output)['bundle'])
        (bundle / 'manifest.json').write_text('[]')
        code, report = self.cli('verify', '--bundle-dir', str(bundle))
        self.assertEqual(code, 1)
        self.assertEqual(report['errorCode'], 'OPERATION_FAILED')

    def test_capacity_reserves_application_headroom_before_snapshot(self):
        usage = type('Usage', (), {'total': 100 * 1024 ** 3, 'free': 10 * 1024 ** 3})()
        with patch('safety.shutil.disk_usage', return_value=usage):
            with self.assertRaisesRegex(OSError, 'capacity'):
                safety.backup(self.data, self.output)
        self.assertFalse(self.output.exists())

    def test_capacity_is_rechecked_during_backup(self):
        with patch('safety.require_capacity', side_effect=[None, OSError('capacity')]):
            with self.assertRaisesRegex(OSError, 'capacity'):
                safety.backup(self.data, self.output)
        self.assertFalse(list(self.output.rglob('manifest.json')))


if __name__ == '__main__':
    unittest.main()
