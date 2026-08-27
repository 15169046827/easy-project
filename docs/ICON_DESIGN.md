# EasyProject application icon

The EasyProject icon uses a compact task timeline to represent planning, progress, and completion. Its blue-to-indigo tile follows the application's existing primary palette; yellow, cyan, and green nodes reuse the product's status language without adding shadows, glow, or an outer card.

## Source and generated assets

- Editable vector source: `src-tauri/icons/icon.svg`
- 512 px RGBA source: `src-tauri/icons/icon.png`
- Windows package: `src-tauri/icons/icon.ico`
- macOS package: `src-tauri/icons/icon.icns`
- Windows and Store PNG variants: `src-tauri/icons/*.png`
- Validation script: `scripts/generate-icon-validation.py`
- Validation output and scenario previews: `docs/assets/icon-*`

## Windows geometry

- Canvas: 512 × 512 RGBA.
- Tile: 424 px, or 82.8125% of the canvas.
- Transparent margin: 44 px per side, or 8.59375%.
- Tile corner radius: 89 px, or 20.9906% of the tile width.
- Subject bounds: 300 × 284 px, or 58.5938% × 55.4688% of the canvas.
- Canvas corner alpha: 0; tile center alpha: 255.
- ICO frames: 16, 24, 32, 48, 64, 128, and 256 px.

The checked-in previews validate the icon at desktop 48 px, Start menu 40 px, and taskbar 24 px. `icon-embedded-exe.png` is extracted from the release executable to confirm that the generated icon is actually linked into the Windows binary.

## Regeneration

Run from the repository root:

```powershell
npm.cmd run tauri -- icon src-tauri\icons\icon.svg
python scripts\generate-icon-validation.py
```

The Tauri icon generator also creates mobile assets that are not used by this desktop project; do not add those generated Android or iOS directories unless mobile targets are intentionally introduced. The validation script replaces `icon.ico` with the required Windows frame set and fails if transparency, geometry, or frame coverage drifts from the specification.

`src-tauri/build.rs` watches `icons/icon.ico` so a changed Windows icon triggers relinking. Release builds use the Windows GUI subsystem and therefore do not open a console window when launched from Explorer, the Start menu, or the taskbar.
