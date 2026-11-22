#!/usr/bin/env python3
"""Generate CodeBridge logo SVGs with the wordmark converted to outlines.

Usage:  python3 brand/tools/build_logos.py apps/web/public/fonts/jetbrains-mono-latin.woff2 apps/web/public/brand
Needs:  pip install fonttools brotli      (one-off, nothing is added to the website)
Font:   JetBrains Mono variable (wght axis). "Code" at 500, "Bridge" at 800.
"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

FONT, OUT = sys.argv[1], sys.argv[2]
FS, GAP, TRACK = 26.0, 10.0, -0.02   # font size in a 32-unit tall lockup, gap after mark, tracking (em)

ARCH = "M7 24v-7c0-6 4-9 9-9s9 3 9 9v7M5 24h22"
def num(v): return ("%.2f" % v).rstrip("0").rstrip(".")

def outline(text, wght, x0):
    f = instancer.instantiateVariableFont(TTFont(FONT), {"wght": wght})
    gs, cm, upm = f.getGlyphSet(), f.getBestCmap(), f["head"].unitsPerEm
    s = FS / upm
    base = 16 + f["OS/2"].sCapHeight * s / 2
    x, d = x0, []
    for ch in text:
        g = cm[ord(ch)]
        pen = SVGPathPen(gs, ntos=num)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, base)))
        d.append(pen.getCommands())
        x += f["hmtx"][g][0] * s + TRACK * FS
    return "".join(d), x

x0 = 32 + GAP
code, x1 = outline("Code", 500, x0)
bridge, x2 = outline("Bridge", 800, x1)
W = round(x2 - TRACK * FS + 1)  # right edge
H = 32

def tile(fill, glyph):
    return (f'<rect width="32" height="32" rx="8" fill="{fill}"/>'
            f'<path d="{ARCH}" fill="none" stroke="{glyph}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="16" cy="15" r="2.2" fill="{glyph}"/>')
def bare(c):
    return (f'<path d="{ARCH}" fill="none" stroke="{c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle cx="16" cy="15" r="2.2" fill="{c}"/>')
def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')
def lock(mark, c1, c2):
    return svg(W, H, mark + f'<path fill="{c1}" d="{code}"/><path fill="{c2}" d="{bridge}"/>', "CodeBridge")

files = {
  "mark.svg":            svg(32, 32, tile("#0F766E", "#FFFFFF"), "CodeBridge"),
  "mark-dark.svg":       svg(32, 32, tile("#2DD4BF", "#06201D"), "CodeBridge"),
  "logo-light.svg":      lock(tile("#0F766E", "#FFFFFF"), "#12161C", "#0F766E"),
  "logo-dark.svg":       lock(tile("#2DD4BF", "#06201D"), "#E9EEF5", "#2DD4BF"),
  "logo-mono-black.svg": lock(bare("#000000"), "#000000", "#000000"),
  "logo-mono-white.svg": lock(bare("#FFFFFF"), "#FFFFFF", "#FFFFFF"),
}
files["logo.svg"] = files["logo-light.svg"]
for n, c in files.items():
    open(f"{OUT}/{n}", "w", encoding="utf8").write(c)
    print(n, len(c.encode()), "bytes")
print("lockup viewBox", W, "x", H)
