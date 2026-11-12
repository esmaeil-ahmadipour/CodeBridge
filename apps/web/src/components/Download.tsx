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
    <section id="download" className="wrap stack16">
      <div className="stack8">
        <div className="mono" dir="ltr">{t.eyebrow}</div>
        <h2 className="big">{t.title}</h2>
        <p className="mut">{t.sub}</p>
      </div>
      <div className="stack12">
        <h3>{t.desktop}</h3>
        <PlatformCards
          items={items}
          t={{ recommended: t.recommended, hintDefault: t.hintDefault, hintDetected: t.hintDetected, hintMobile: t.hintMobile, downloadFor: t.downloadFor, dlAria: t.dlAria }}
        />
        <div className="row wrap8 dl-rel">
          <span className="dl-ver" dir="ltr">{fmt(t.relVersion, { v: applicationVersion })}</span>
          {release && date && <span className="mut sm">{fmt(t.relPublished, { date })}</span>}
          <a className="dl-notes" href={latestReleaseUrl}>
            {t.releaseChecksums}<Icon name="arrow" size={16} />
          </a>
        </div>
        <p className="mut sm">{t.note}</p>
      </div>
      <InstallCard t={t} />
    </section>
  );
}
