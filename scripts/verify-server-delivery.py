"""Verify an extracted, SHA-bound EasyProject delivery before activation."""
import hashlib
import json
from pathlib import Path
import sys

directory = Path(sys.argv[1]).resolve(strict=True)
source = sys.argv[2]
releases = (Path.home() / "easyproject/releases").resolve(strict=True)
if directory.parent != releases or not directory.is_dir():
    raise SystemExit("Unexpected release directory")
manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
if manifest["serverSource"] != source:
    raise SystemExit("Server source mismatch")
actual = {
    str(item.relative_to(directory)).replace("\\", "/")
    for item in directory.rglob("*")
    if item.is_file() and item.name != "manifest.json"
}
if actual != set(manifest["files"]):
    raise SystemExit("Unexpected or missing delivery files")
for relative, expected in manifest["files"].items():
    path = directory / relative
    if path.is_symlink() or not path.resolve().is_relative_to(directory):
        raise SystemExit("Unsafe delivery path")
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise SystemExit("Delivery file digest mismatch")
binary = directory / "bin/easyproject-server"
header = binary.read_bytes()[:20]
if header[:4] != b"\x7fELF" or int.from_bytes(header[18:20], "little") != 62:
    raise SystemExit("Unexpected executable format")
binary.chmod(0o700)
print(json.dumps({"verified": True, "files": len(actual), "serverSource": source}))
