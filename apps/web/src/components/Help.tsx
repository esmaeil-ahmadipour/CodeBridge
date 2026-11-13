import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';
import { helpTargets } from '@/lib/guide';
import { Icon } from './Icons';

export function Help({ t, locale }: { t: Dictionary['help']; locale: Locale }) {
  const guide = `${localePrefix(locale)}/guide`;
  return (
    <section id="help" className="ref-wrap ref-support stack16" aria-labelledby="help-title">
      <div className="stack8">
        <h2 id="help-title">{t.title}</h2>
        <p className="mut">{t.sub}</p>
      </div>
      <ul className="cols3 hlist">
        {t.items.map((i, n) => (
          <li key={i.t}>
            <Link className="card hcard" href={`${guide}#${helpTargets[n] ?? ''}`}>
              <h3>{i.t}</h3>
              <p className="mut">{i.s}</p>
              <span className="dl-notes">{t.cta}<Icon name="arrow" size={16} /></span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className="btn pri hbtn" href={guide}>{t.cta}</Link>
    </section>
  );
}
