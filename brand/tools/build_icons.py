#!/usr/bin/env python3
"""Render favicon/app icons from the CodeBridge mark. Run from the repo root.

Needs: pip install playwright && playwright install chromium   (one-off, not part of the website)
"""
import struct, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(sys.argv[1] if len(sys.argv) > 1 else "apps/web")
TEAL, INK = "#2DD4BF", "#06201D"
ARCH = "M7 24v-7c0-6 4-9 9-9s9 3 9 9v7M5 24h22"
ARCH_S = "M6.5 24.5v-7c0-6.2 4-9.5 9.5-9.5s9.5 3.3 9.5 9.5v7M4.5 24.5h23"

def svg(size, kind):
    if kind == "small":      # 16-32 px master: heavier stroke, bigger node
        body = (f'<rect width="32" height="32" rx="7" fill="{TEAL}"/><path d="{ARCH_S}" fill="none" stroke="{INK}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="16" r="3" fill="{INK}"/>')
    else:
        rx = {"round": 8, "bleed": 0, "mask": 0}[kind]
        sc = 0.8 if kind == "mask" else 1.0   # maskable: glyph inside the central 80% safe zone
        g = (f'<g transform="translate(16 16) scale({sc}) translate(-16 -16)"><path d="{ARCH}" fill="none" stroke="{INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="15" r="2.2" fill="{INK}"/></g>')
        body = f'<rect width="32" height="32" rx="{rx}" fill="{TEAL}"/>' + g
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 32 32">{body}</svg>'

def write_svg(path, kind):
    s = svg(32, kind).replace(' width="32" height="32"', '')
    path.write_text(s + "\n", encoding="utf8")

jobs = {  # file -> (size, kind)
    "app/icon.png": (96, "round"), "app/apple-icon.png": (180, "bleed"),
    "public/icons/icon-192.png": (192, "round"), "public/icons/icon-512.png": (512, "round"),
    "public/icons/maskable-512.png": (512, "mask"),
}
write_svg(ROOT / "app/icon.svg", "small")
png = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    def render(size, kind):
        pg = b.new_page(viewport={"width": size, "height": size})
        pg.set_content(f'<body style="margin:0;background:transparent">{svg(size, kind)}</body>')
        data = pg.screenshot(omit_background=True, clip={"x": 0, "y": 0, "width": size, "height": size})
        pg.close(); return data
    for f, (size, kind) in jobs.items():
        (ROOT / f).write_bytes(render(size, kind)); print(f, size)
    for s in (16, 32, 48):
        png[s] = render(s, "small")
    b.close()
# PNG-in-ICO
n = len(png); off = 6 + 16 * n; head = struct.pack("<HHH", 0, 1, n); ent = b""; blob = b""
for s, d in png.items():
    ent += struct.pack("<BBBBHHII", s, s, 0, 0, 1, 32, len(d), off + len(blob)); blob += d
(ROOT / "app/favicon.ico").write_bytes(head + ent + blob); print("app/favicon.ico", sorted(png))
