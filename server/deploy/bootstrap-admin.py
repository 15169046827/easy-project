"""One-time operator bootstrap; never prints or passes a password in argv."""
import os
from pathlib import Path
import secrets
import subprocess

root = Path.home() / "easyproject"
data = root / "data"
data.mkdir(mode=0o700, parents=True, exist_ok=True)
secret_path = data / "initial-admin-password"
# Exclusive creation prevents overwriting an existing operator recovery secret.
descriptor = os.open(secret_path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
password = secrets.token_urlsafe(24)
with os.fdopen(descriptor, "w", encoding="utf-8") as output:
    output.write(password + "\n")
environment = os.environ.copy()
environment["EASYPROJECT_DATA_DIR"] = str(data)
subprocess.run(
    [str(root / "current/bin/easyproject-server"), "bootstrap-admin", "ym_li"],
    input=(password + "\n").encode(),
    env=environment,
    check=True,
)
print("Initial credential stored privately on the server; not printed.")
