import Link from 'next/link';
import { localePrefix, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/translations';
import { fmt } from '@/lib/fmt';
import { guideShots, type Shot } from '@/lib/guide';
import { getApplicationVersion } from '@/lib/site';
import { Icon } from './Icons';

function Terminal({ shot, label, head = true }: { shot: Shot; label: string; head?: boolean }) {
  return (
    <div className="prev gshot" role="group" aria-label={`${label}: ${shot.title}`} dir="ltr">
      {head && (
        <div className="prev-h">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="mono">{shot.title}</span>
        </div>
      )}
      <pre tabIndex={0}>{shot.text}</pre>
    </div>
  );
}

// The first screen is always visible; the others open on demand so a section stays short.
function Shots({ shots, label }: { shots: Shot[]; label: string }) {
  const [first, ...rest] = shots;
  return (
    <div className="gshots">
      <Terminal shot={first} label={label} />
      {rest.map((shot) => (
        <details key={shot.title} className="gdet">
          <summary dir="ltr"><span className="mono">{shot.title}</span></summary>
          <Terminal shot={shot} label={label} head={false} />
        </details>
      ))}
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

          {guideShots[s.id] && (
            <Shots
              shots={guideShots[s.id].map((shot) => ({ ...shot, text: shot.text.replace('{version}', applicationVersion) }))}
              label={t.shotLabel}
            />
          )}

          {s.keys && (
            <dl className={s.id === 'cli' ? 'keys stack' : 'keys'}>
              {s.keys.map((k) => (
                <div key={k.t}><dt><code className="kbd" dir="ltr">{k.t}</code></dt><dd className="mut">{k.s}</dd></div>
              ))}
            </dl>
          )}

          {s.qa && (
            <div className="qa">
              {s.qa.map((q) => (
                <details key={q.t} className="qa-item">
                  <summary>{q.t}</summary>
                  <p className="mut">{q.s}</p>
                </details>
              ))}
            </div>
          )}

          {s.notes && (
            <ul className="gnotes">
              {s.notes.map((x) => (
                <li key={x} className="mut"><Icon name="info" size={16} style={{ flex: 'none', marginTop: 2 }} />{x}</li>
              ))}
            </ul>
          )}

          {t.sections[n + 1] && (
            <a className="btn gnext" href={`#${t.sections[n + 1].id}`}>
              {t.sections[n + 1].title}<Icon name="arrow" size={16} />
            </a>
          )}
        </section>
      ))}
      <div className="gfoot">
        <BackButton href={home} label={t.home} />
      </div>
    </div>
  );
}
