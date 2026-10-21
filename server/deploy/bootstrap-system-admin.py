"""Bootstrap an empty dedicated service installation without exposing credentials."""
import os
from pathlib import Path
import secrets
import subprocess

if os.geteuid() != 0:
    raise SystemExit("Run as root only after creating the dedicated easyproject service account")
os.umask(0o077)
data = Path("/var/lib/easyproject")
binary = Path("/opt/easyproject/current/bin/easyproject-server")
secret_path = Path("/etc/easyproject/initial-admin-password")
if not data.is_dir() or not binary.is_file() or (data / "accounts.db").exists():
    raise SystemExit("Require an initialized service account directory and an empty account store")
descriptor = os.open(secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
password = secrets.token_urlsafe(24)
with os.fdopen(descriptor, "w", encoding="utf-8") as output:
    output.write(password + "\n")
subprocess.run(
    [
        "runuser", "-u", "easyproject", "--", "env",
        "EASYPROJECT_DATA_DIR=/var/lib/easyproject",
        str(binary), "bootstrap-admin", "easyproject_admin",
    ],
    input=(password + "\n").encode(),
    check=True,
)
print("Application administrator created; initial credential retained in a root-only file.")
