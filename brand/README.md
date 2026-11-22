# CodeBridge brand

**Mark:** an arch bridge with one node on a rounded tile. Tile uses the site accent (`#2DD4BF` on dark, `#0F766E` on light), glyph uses the on-accent ink (`#06201D` / `#FFFFFF`).
**Wordmark:** JetBrains Mono, `Code` at 500 and `Bridge` at 800 in the accent, tracking -0.02em. Always Latin and left-to-right, also on fa/ar pages. No trailing dot.
**Small master (24 px and below):** stroke 3.1, node radius 3, tile radius 7. `apps/web/app/icon.svg` and the `Logo` component switch to it automatically.
**Diff motif:** the plus joined to a minus (`public/brand/motif-diff*.svg`) marks Apply/Undo moments. It is not a logo.

Clear space: half the tile height on every side. Minimum size: 16 px mark alone, 96 px lockup.

## Files

| File | Use |
|---|---|
| `apps/web/public/brand/logo.svg`, `logo-light.svg` | Lockup for light backgrounds |
| `apps/web/public/brand/logo-dark.svg` | Lockup for dark backgrounds |
| `apps/web/public/brand/logo-mono-black.svg`, `logo-mono-white.svg` | One-colour placements |
| `apps/web/public/brand/mark.svg`, `mark-dark.svg` | Tile only |
| `apps/web/app/icon.svg`, `icon.png`, `favicon.ico`, `apple-icon.png` | Favicons (Next.js file convention) |
| `apps/web/public/icons/*` | PWA icons (`manifest.ts`) |
| `apps/web/public/og/{home,guide}-{en,fa,ar}-v2.png` | Open Graph and Twitter/X images, 1200x630 |
| `brand/github-social-preview.png` | 1280x640, upload in GitHub repo settings > Social preview |

## Regenerating

* **OG images:** `bash brand/render-og.sh` (needs Chrome or Chromium only). Source: `brand/og/og.html`. It uses the fonts in `apps/web/public/fonts` and refuses to write anything if one fails to load. Edit the copy in the `D` object at the top of the script block, run it again, and bump the `-v2` suffix (here and in `seo.ts`) so social platforms drop their cached previews.
* **Logos:** `python3 brand/tools/build_logos.py apps/web/public/fonts/jetbrains-mono-latin.woff2 apps/web/public/brand` (`pip install fonttools brotli`). Converts the wordmark to outlines.
* **Icons:** `python3 brand/tools/build_icons.py apps/web` (`pip install playwright && playwright install chromium`).
