"""Read-only comparison of every original field after the documented ID migration."""
import argparse
import json
import re
import sqlite3
from pathlib import Path

PREFIX = {"project": "PROJECT", "task": "TASK", "member": "MEMBER",
          "project_member": "PROJECT_MEMBER", "task_dependency": "TASK_DEPENDENCY",
          "plan_baseline": "PLAN_BASELINE", "web_revision": "WEB_REVISION",
          "account": "ACCOUNT", "session": "SESSION", "mcp_token": "MCP_TOKEN",
          "password_reset": "PASSWORD_RESET"}
REFS = {("project", "owner"): "member", ("task", "project_id"): "project",
        ("task", "parent"): "task", ("task", "assignee"): "member",
        ("project_member", "project_id"): "project", ("project_member", "member_id"): "member",
        ("task_dependency", "predecessor_task_id"): "task",
        ("task_dependency", "successor_task_id"): "task",
        ("plan_baseline", "project_id"): "project", ("plan_baseline", "task_id"): "task",
        ("session", "account_id"): "account", ("mcp_token", "account_id"): "account"}


def read(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError("Existing regular database required")
    with sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True) as db:
        db.row_factory = sqlite3.Row
        if db.execute("pragma integrity_check").fetchone()[0] != "ok" or db.execute("pragma foreign_key_check").fetchall():
            raise ValueError("Database integrity check failed")
        tables = [r[0] for r in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")]
        return db.execute("pragma user_version").fetchone()[0], {
            t: [dict(r) for r in db.execute('select * from "' + t.replace('"', '""') + '"')] for t in tables}


def verify(before, after, allow_epoch=False):
    old_version, old = read(before)
    version, new = read(after)
    account = "account" in old
    if version != (3 if account else 6):
        raise ValueError("Unexpected target schema")
    maps = {}
    if account:
        maps["account"] = {r["id"]: "ACCOUNT:" + r["id"] for r in old["account"]}
        maps["mcp_token"] = {r["id"]: "MCP_TOKEN:" + r["id"] for r in old.get("mcp_token", [])}
    else:
        previous = {p.name for p in (before.parent / "backups").glob("id-map-schema6-*.json")}
        for path in (after.parent / "backups").glob("id-map-schema6-*.json"):
            if path.name in previous:
                continue
            if path.is_symlink():
                raise ValueError("Mapping links forbidden")
            data = json.loads(path.read_text(encoding="utf-8"))
            if data["targetSchema"] != 6:
                raise ValueError("Wrong mapping schema")
            for table, values in data["mappings"].items():
                maps.setdefault(table, {}).update(values)
    for table, rows in new.items():
        if table not in PREFIX:
            raise ValueError("Unexpected owned table")
        for row in rows:
            if not isinstance(row.get("id"), str) or not re.fullmatch(PREFIX[table] + r":[0-9a-f]{32}", row["id"]):
                raise ValueError("Noncanonical identity")
    def mapped(table, value):
        return maps.get(table, {}).get(str(value), value)
    def ordered(rows):
        return sorted(json.dumps(r, sort_keys=True, ensure_ascii=True) for r in rows)
    for table, rows in old.items():
        if table not in new:
            raise ValueError("Original table missing")
        columns = set(rows[0]) if rows else set()
        expected = []
        for original in rows:
            row = original.copy()
            if "id" in row:
                row["id"] = mapped(table, row["id"])
            for column in row:
                if (table, column) in REFS:
                    row[column] = mapped(REFS[(table, column)], row[column])
            if table == "task" and row.get("dependence"):
                row["dependence"] = ",".join(str(mapped("task", key.strip())) for key in row["dependence"].split(","))
            if table == "web_revision" and allow_epoch:
                row.pop("value", None)
            expected.append(row)
        if table == "web_revision" and allow_epoch:
            columns.discard("value")
        actual = [{c: r[c] for c in columns} for r in new[table]]
        if ordered(expected) != ordered(actual):
            raise ValueError("Original fields/relations changed: " + table)
    if account:
        by_id = {r["id"]: r for r in new["account"]}
        for row in old["account"]:
            target = by_id[mapped("account", row["id"])]
            if target["workspace_key"] != row["id"] or target["avatar"] != "":
                raise ValueError("Workspace mapping or initial avatar changed")
        if new.get("password_reset"):
            raise ValueError("Unexpected production recovery codes")
    return {"schemaBefore": old_version, "schemaAfter": version,
            "allOriginalFieldsPreserved": True, "canonicalIds": True,
            "integrity": "ok", "foreignKeys": 0,
            "counts": {t: len(r) for t, r in new.items()}}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("before", type=Path)
    parser.add_argument("after", type=Path)
    parser.add_argument("--allow-epoch", action="store_true")
    args = parser.parse_args()
    print(json.dumps(verify(args.before, args.after, args.allow_epoch)))
