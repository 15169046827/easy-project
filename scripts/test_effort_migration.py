"""Disposable snapshot regression tests; respect the caller's E-drive TEMP."""
import importlib.util
import shutil
import sqlite3
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path

SPEC = importlib.util.spec_from_file_location('effort_verifier', Path(__file__).with_name('verify-effort-migration.py'))
VERIFIER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFIER)


@contextmanager
def connect(path):
    db = sqlite3.connect(path)
    try:
        with db:
            yield db
    finally:
        db.close()


class PreservationTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='effort-verifier-'))
        self.before, self.after = self.root / 'before.db', self.root / 'after.db'
        with connect(self.before) as db:
            db.executescript("PRAGMA user_version=7; CREATE TABLE task(id TEXT PRIMARY KEY,effort_days REAL,name TEXT); CREATE TABLE empty_table(id TEXT PRIMARY KEY); INSERT INTO task VALUES('TASK:zero',0,'Synthetic zero'),('TASK:positive',2.5,'Synthetic estimate');")
        shutil.copyfile(self.before, self.after)
        with connect(self.after) as db:
            db.executescript("ALTER TABLE task ADD COLUMN effort_state TEXT NOT NULL DEFAULT 'legacy_unknown'; UPDATE task SET effort_state='estimated' WHERE effort_days>0; PRAGMA user_version=8;")

    def tearDown(self):
        shutil.rmtree(self.root)

    def test_preserves_every_original_field_and_source_bytes(self):
        before = self.before.read_bytes()
        self.assertTrue(VERIFIER.verify(self.before, self.after)['identitiesPreserved'])
        self.assertEqual(self.before.read_bytes(), before)

    def test_rejects_original_value_or_id_change(self):
        with connect(self.after) as db:
            db.execute("UPDATE task SET id='changed' WHERE effort_days=0")
        with self.assertRaises(ValueError):
            VERIFIER.verify(self.before, self.after)

    def test_rejects_guessing_zero_as_explicitly_estimated(self):
        with connect(self.after) as db:
            db.execute("UPDATE task SET effort_state='estimated' WHERE effort_days=0")
        with self.assertRaises(ValueError):
            VERIFIER.verify(self.before, self.after)

    def test_checks_empty_table_columns_and_trigger_changes(self):
        with connect(self.after) as db:
            db.execute('ALTER TABLE empty_table ADD COLUMN surprise TEXT')
        with self.assertRaises(ValueError):
            VERIFIER.verify(self.before, self.after)

    def test_rejects_unexpected_versions_and_missing_snapshots(self):
        with self.assertRaises(ValueError):
            VERIFIER.verify(self.root / 'missing.db', self.after)
        self.assertFalse((self.root / 'missing.db').exists())
        with connect(self.after) as db:
            db.execute('PRAGMA user_version=9')
        with self.assertRaises(ValueError):
            VERIFIER.verify(self.before, self.after)

    def test_verifies_account_database_without_business_schema_changes(self):
        account = self.root / 'accounts.db'
        with connect(account) as db:
            db.executescript("PRAGMA user_version=3; CREATE TABLE account(id TEXT PRIMARY KEY,password_hash TEXT); INSERT INTO account VALUES('ACCOUNT:synthetic','synthetic-hash');")
        copy = self.root / 'accounts-copy.db'
        shutil.copyfile(account, copy)
        self.assertFalse(VERIFIER.verify(account, copy)['estimateProvenanceVerified'])


if __name__ == '__main__':
    unittest.main()
