from contextlib import closing
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest

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


if __name__ == '__main__':
    unittest.main()
