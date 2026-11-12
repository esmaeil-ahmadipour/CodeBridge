import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';
import { flags } from '@/lib/flags';
import { formatReleaseDate, getLatestRelease } from '@/lib/release';
import { downloads, getApplicationVersion, latestReleaseUrl, platforms } from '@/lib/site';
import { Icon } from './Icons';
import { InstallCard } from './InstallCard';
import { PlatformCards, type PlatformItem } from './PlatformCards';

const fmt = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? '');

export async function Download({ t, locale }: { t: Dictionary['download']; locale: Locale }) {
  if (!flags.downloads) return null; // the flag also guards this component, not only its call site
  const applicationVersion = getApplicationVersion();
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
    <section id="dl" className="ref-download">
      <div className="ref-wrap">
        <div className="ref-download-card">
          <div className="ref-download-heading">
            <h2>{t.title}</h2>
            <p>{t.sub}</p>
          </div>
          <p className="ref-download-prompt">{t.osPrompt}</p>
          <div className="ref-download-grid">
            <div className="ref-download-desktop">
              <h3>{t.desktop}</h3>
              <PlatformCards
                items={items}
                t={{ recommended: t.recommended, hintDefault: t.hintDefault, hintDetected: t.hintDetected, hintMobile: t.hintMobile, downloadFor: t.downloadFor, dlAria: t.dlAria }}
              />
              <div className="row wrap8 dl-rel">
                <span className="dl-ver" dir="ltr">{fmt(t.relVersion, { v: applicationVersion })}</span>
                {release && date && <span className="download-published">{fmt(t.relPublished, { date })}</span>}
                <a className="dl-notes" href={latestReleaseUrl}>
                  {t.releaseChecksums}<Icon name="arrow" size={16} />
                </a>
              </div>
              <p className="download-note">{t.note}</p>
              <p className="ref-download-note">{t.desktopNote} <a href="#mobile">{t.browserCta}</a></p>
            </div>
            <details className="ref-install-details">
              <summary>{t.installMore}</summary>
              <div className="ref-install-panel">
                <InstallCard t={t} />
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
