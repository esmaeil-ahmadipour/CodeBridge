import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';
import { fmt } from '@/lib/fmt';
import { guideShots, type Shot } from '@/lib/guide';
import { getApplicationVersion } from '@/lib/site';
import { Icon } from './Icons';

function Terminal({ shot, label }: { shot: Shot; label: string }) {
  return (
    <div className="prev gshot" role="group" aria-label={`${label}: ${shot.title}`} dir="ltr">
      <div className="prev-h">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="mono">{shot.title}</span>
      </div>
      <pre tabIndex={0}>{shot.text}</pre>
    </div>
  );
}

function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link className="btn gback" href={href}>
      <Icon name="arrow" size={18} />{label}
    </Link>
  );
}

export function Guide({ t, locale }: { t: Dictionary['guide']; locale: Locale }) {
  const applicationVersion = getApplicationVersion();
  const home = localePrefix(locale) || '/';
  return (
    <div className="wrap guide">
      <header className="stack12 ghead">
        <BackButton href={home} label={t.home} />
        <span className="chip on hero-eb">{fmt(t.eyebrow, { version: applicationVersion })}</span>
        <h1>{t.title}</h1>
        <p className="mut lead">{t.sub}</p>
        <nav className="toc" aria-label={t.toc}>
          {t.sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
        </nav>
      </header>

      {t.sections.map((s, n) => (
        <section key={s.id} id={s.id} className="gsec">
          <h2><span className="gnum" aria-hidden="true">{n + 1}</span>{s.title}</h2>
          <p className="mut">{s.intro}</p>

          {s.steps && (
            <ol className="steps">
              {s.steps.map((x, i) => <li key={x}><span className="num">{i + 1}</span><span>{x}</span></li>)}
            </ol>
          )}

          {guideShots[s.id]?.map((shot) => (
            <Terminal
              key={shot.title}
              shot={{ ...shot, text: shot.text.replace('{version}', applicationVersion) }}
              label={t.shotLabel}
            />
          ))}

          {s.keys && (
            <dl className={s.id === 'cli' ? 'keys stack' : 'keys'}>
              {s.keys.map((k) => (
                <div key={k.t}><dt><code className="kbd" dir="ltr">{k.t}</code></dt><dd className="mut">{k.s}</dd></div>
              ))}
            </dl>
          )}

          {s.qa && (
            <dl className="qa">
              {s.qa.map((q) => (
                <div key={q.t} className="card"><dt>{q.t}</dt><dd className="mut">{q.s}</dd></div>
              ))}
            </dl>
          )}

          {s.notes && (
            <ul className="gnotes">
              {s.notes.map((x) => (
                <li key={x} className="mut sm"><Icon name="info" size={16} style={{ flex: 'none', marginTop: 2 }} />{x}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <div className="gfoot">
        <BackButton href={home} label={t.home} />
      </div>
    </div>
  );
}
