"""Verifier regression tests use only disposable databases under process TEMP."""
import importlib.util
import os
import shutil
import sqlite3
import tempfile
import unittest
from contextlib import contextmanager
from pathlib import Path

spec = importlib.util.spec_from_file_location('status_verifier', Path(__file__).with_name('verify-status-migration.py'))
verifier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verifier)

@contextmanager
def connect(path):
    db=sqlite3.connect(path)
    try:
        with db:
            yield db
    finally:
        db.close()


class PreservationTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='status-verifier-'))
        self.before, self.after = self.root/'before.db', self.root/'after.db'
        self.pid = 'PROJECT:'+'a'*32
        self.sid = 'TASK_STATUS:'+'b'*32
        with connect(self.before) as db:
            db.executescript('PRAGMA user_version=6; CREATE TABLE project(id TEXT PRIMARY KEY,name TEXT); CREATE TABLE task(id TEXT PRIMARY KEY,project_id TEXT,status TEXT,progress INTEGER);')
            db.execute('INSERT INTO project VALUES(?,?)', (self.pid, 'Synthetic'))
            db.execute('INSERT INTO task VALUES(?,?,?,?)', ('TASK:'+'c'*32,self.pid,'Todo',0))
        shutil.copyfile(self.before,self.after)
        with connect(self.after) as db:
            db.executescript("PRAGMA user_version=7; ALTER TABLE task ADD COLUMN status_id TEXT; CREATE TABLE task_status(id TEXT PRIMARY KEY,project_id TEXT,name TEXT,is_default INTEGER,is_completed INTEGER,stateflag TEXT);")
            db.execute('INSERT INTO task_status VALUES(?,?,?,?,?,?)',(self.sid,self.pid,'Pending',1,0,'0'))
            db.execute('UPDATE task SET status_id=?',(self.sid,))

    def tearDown(self):
        shutil.rmtree(self.root)

    def test_preserves_original_fields(self):
        self.assertTrue(verifier.verify(self.before,self.after)['originalFieldsPreserved'])

    def test_rejects_changed_original(self):
        with connect(self.after) as db:
            db.execute("UPDATE project SET name='changed'")
        with self.assertRaises(ValueError):
            verifier.verify(self.before,self.after)

    def test_rejects_missing_default_and_foreign_reference(self):
        for sql in ['UPDATE task_status SET is_default=0',"UPDATE task_status SET project_id='foreign'"]:
            with connect(self.after) as db:
                db.execute(sql)
            with self.assertRaises(ValueError):
                verifier.verify(self.before,self.after)

    def test_rejects_changed_completion_meaning(self):
        with connect(self.after) as db:
            db.execute('UPDATE task_status SET is_completed=1')
        with self.assertRaises(ValueError):
            verifier.verify(self.before,self.after)


if __name__ == '__main__':
    unittest.main()
