import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';
import { flags } from '@/lib/flags';
import { fmt } from '@/lib/fmt';
import { formatReleaseDate, getLatestRelease } from '@/lib/release';
import { downloads, getApplicationVersion, latestReleaseUrl, platforms } from '@/lib/site';
import { Icon } from './Icons';
import { PlatformCards, type PlatformItem } from './PlatformCards';

export async function Download({ t, locale }: { t: Dictionary['download']; locale: Locale }) {
  if (!flags.downloads) return null; // the flag also guards this component, not only its call site
  const release = await getLatestRelease(); // never throws; null on any failure
  const date = formatReleaseDate(release?.publishedAt ?? null, locale);
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
          <div className="ref-downloads-meta">
            <span className="ref-badge" dir="ltr">v{getApplicationVersion()}</span>
            {release && date && <span className="mut sm">{fmt(t.relPublished, { date })}</span>}
            <a className="ref-checksum" href={latestReleaseUrl} aria-label={t.releaseChecksums}>
              Checksum<Icon name="arrow" size={14} />
            </a>
          </div>
        </div>
        <PlatformCards
          items={items}
          t={{ recommended: t.recommended, hintDefault: t.hintDefault, hintDetected: t.hintDetected, hintMobile: t.hintMobile, downloadFor: t.downloadFor, dlAria: t.dlAria, installNotes: t.installNotes }}
        />
        <div className="ref-downloads-foot">
          <div className="ref-downloads-info">
            <p className="sm">{t.note}</p>
            <p className="sm">{t.desktopNote}</p>
          </div>
          <a className="ref-button ref-button-secondary" href="#mobile">{t.browserCta}</a>
        </div>
      </div>
    </section>
  );
}
