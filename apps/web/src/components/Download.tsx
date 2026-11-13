import type { Dictionary } from '@/i18n/translations';
import { flags } from '@/lib/flags';
import { downloads, platforms } from '@/lib/site';
import { PlatformCards, type PlatformItem } from './PlatformCards';

export function Download({ t }: { t: Dictionary['download'] }) {
  if (!flags.downloads) return null; // the flag also guards this component, not only its call site
  const names = { windows: t.win, macos: t.mac, linux: t.linux };
  const hints = { windows: t.winHint, macos: t.macHint, linux: t.linuxHint };
  const items: PlatformItem[] = platforms.map((p) => ({
    id: p.id,
    name: names[p.id],
    arch: p.id === 'macos' ? `${t.appleSilicon} · ${p.arch}` : p.arch,
    format: p.format,
    hint: hints[p.id],
    href: downloads[p.id],
  }));
  return (
    <section id="dl" className="ref-downloads" aria-labelledby="download-title">
      <div className="ref-wrap ref-downloads-card">
        <div className="ref-downloads-head">
          <h2 id="download-title">{t.osPrompt}</h2>
        </div>
        <PlatformCards
          items={items}
          t={{ recommended: t.recommended, hintDefault: t.hintDefault, hintMobile: t.hintMobile, downloadFor: t.downloadFor, dlAria: t.dlAria, installNotes: t.installNotes }}
        />
        <div className="ref-downloads-foot">
          <div className="ref-downloads-info">
            <p className="sm">{t.note}</p>
            <p className="sm">{t.desktopNote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
