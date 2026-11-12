import type { Dictionary } from '@/i18n/translations';
import { fmt } from '@/lib/fmt';
import { getApplicationVersion } from '@/lib/site';

export function DownloadHero({ t }: { t: Dictionary['download'] }) {
  return (
    <section id="dl" className="ref-download" aria-labelledby="dl-title">
      <div className="ref-wrap">
        <div className="ref-download-card">
          <div className="ref-download-heading">
            <span className="ref-badge" dir="auto">{fmt(t.relVersion, { v: getApplicationVersion() })}</span>
            <h2 id="dl-title">{t.title}</h2>
            <p>{t.sub}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
