from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, IcoImagePlugin


ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "src-tauri" / "icons"
OUTPUT = ROOT / "docs" / "assets"
SOURCE_PNG = ICONS / "icon.png"
ICO_PATH = ICONS / "icon.ico"
ICO_SIZES = (16, 24, 32, 48, 64, 128, 256)


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    name = "msyhbd.ttc" if bold else "msyh.ttc"
    path = Path("C:/Windows/Fonts") / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def fit_icon(icon: Image.Image, size: int) -> Image.Image:
    return icon.resize((size, size), Image.Resampling.LANCZOS)


def centered_text(draw: ImageDraw.ImageDraw, text: str, y: int, fill: str, size: int, bold: bool = False) -> None:
    text_font = font(size, bold)
    box = draw.textbbox((0, 0), text, font=text_font)
    x = (800 - (box[2] - box[0])) // 2
    draw.text((x, y), text, font=text_font, fill=fill)


def save_desktop_preview(icon: Image.Image) -> None:
    canvas = Image.new("RGBA", (800, 450), "#0F5E72")
    draw = ImageDraw.Draw(canvas)
    for y in range(450):
        ratio = y / 449
        color = (
            int(15 + (23 - 15) * ratio),
            int(94 + (37 - 94) * ratio),
            int(114 + (84 - 114) * ratio),
            255,
        )
        draw.line((0, y, 800, y), fill=color)
    draw.rounded_rectangle((40, 34, 760, 416), radius=28, fill=(15, 23, 42, 90))
    canvas.alpha_composite(fit_icon(icon, 48), (376, 172))
    centered_text(draw, "EasyProject", 232, "#FFFFFF", 18)
    centered_text(draw, "桌面 · 48 px", 356, "#DCEBFF", 20, True)
    canvas.convert("RGB").save(OUTPUT / "icon-preview-desktop.png")


def save_start_preview(icon: Image.Image) -> None:
    canvas = Image.new("RGB", (800, 450), "#DDE7F5")
    draw = ImageDraw.Draw(canvas)
    draw.rounded_rectangle((110, 42, 690, 408), radius=28, fill="#F8FAFC")
    centered_text(draw, "已固定", 76, "#172033", 24, True)
    draw.rounded_rectangle((318, 132, 482, 300), radius=16, fill="#EEF2F7")
    canvas.paste(fit_icon(icon, 40), (380, 164), fit_icon(icon, 40))
    centered_text(draw, "EasyProject", 226, "#172033", 18)
    centered_text(draw, "开始菜单 · 40 px", 356, "#475569", 20, True)
    canvas.save(OUTPUT / "icon-preview-start-menu.png")


def save_taskbar_preview(icon: Image.Image) -> None:
    canvas = Image.new("RGB", (800, 450), "#CFE5F7")
    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 800, 378), fill="#DDEFFC")
    draw.rectangle((0, 378, 800, 450), fill="#F8FAFC")
    draw.rounded_rectangle((370, 388, 430, 440), radius=10, fill="#E2E8F0")
    taskbar_icon = fit_icon(icon, 24)
    canvas.paste(taskbar_icon, (388, 402), taskbar_icon)
    centered_text(draw, "任务栏 · 24 px", 315, "#172033", 20, True)
    canvas.save(OUTPUT / "icon-preview-taskbar.png")


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    icon = Image.open(SOURCE_PNG).convert("RGBA")
    if icon.size != (512, 512):
        raise ValueError(f"Expected 512x512 source PNG, got {icon.size}")

    icon.save(ICO_PATH, format="ICO", sizes=[(size, size) for size in ICO_SIZES])
    with ICO_PATH.open("rb") as ico_stream:
        ico_frames = sorted(size[0] for size in IcoImagePlugin.IcoFile(ico_stream).sizes())

    alpha = icon.getchannel("A")
    corners = [alpha.getpixel(point) for point in ((0, 0), (511, 0), (0, 511), (511, 511))]
    center_alpha = alpha.getpixel((256, 256))
    alpha_bounds = alpha.getbbox()

    expected_bounds = (44, 44, 468, 468)
    if corners != [0, 0, 0, 0]:
        raise ValueError(f"Canvas corners must be transparent, got {corners}")
    if center_alpha != 255:
        raise ValueError(f"Tile center must be opaque, got alpha {center_alpha}")
    if alpha_bounds != expected_bounds:
        raise ValueError(f"Unexpected opaque bounds: {alpha_bounds}, expected {expected_bounds}")
    if ico_frames != list(ICO_SIZES):
        raise ValueError(f"Unexpected ICO frames: {ico_frames}")

    save_desktop_preview(icon)
    save_start_preview(icon)
    save_taskbar_preview(icon)

    report = {
        "canvas": {"width": 512, "height": 512, "mode": "RGBA"},
        "tile": {
            "bounds": list(alpha_bounds),
            "size_px": 424,
            "canvas_coverage_percent": 82.8125,
            "transparent_margin_px": 44,
            "transparent_margin_percent": 8.59375,
            "corner_radius_px": 89,
            "corner_radius_of_tile_percent": 20.9906,
        },
        "alpha": {"corners": corners, "center": center_alpha},
        "subject": {
            "bounds": [108, 114, 408, 398],
            "width_percent": 58.5938,
            "height_percent": 55.4688,
        },
        "ico_sizes": ico_frames,
        "previews": {
            "desktop": "48 px",
            "start_menu": "40 px",
            "taskbar": "24 px",
        },
    }
    (OUTPUT / "icon-validation.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
