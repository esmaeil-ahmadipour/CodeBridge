import type { Dictionary } from '@/i18n/translations';
import { Icon } from './Icons';

const WEB_ICONS = ['filter', 'shield', 'split'] as const;
const DESKTOP_ICONS = ['shield', 'filter', 'check'] as const;

// Decorative, language-neutral examples: the card text carries the meaning.
function TokensViz() {
  return (
    <>
      <div className="brow"><span className="btrack"><span className="bar" style={{ width: '100%' }} /></span><b>41,320</b></div>
      <div className="brow"><span className="btrack"><span className="bar ac" style={{ width: '31%' }} /></span><b>12,900</b></div>
      <span className="save">−69%</span>
    </>
  );
}

function SecretViz() {
  return (
    <>
      <code className="dl del">- api_key = &quot;9f3a1c7e52b8&quot;</code>
      <code className="dl add">+ api_key = &quot;[REDACTED]&quot;</code>
    </>
  );
}

function SplitViz() {
  return (
    <div className="parts">
      {[1, 2, 3].map((n) => (
        <span className="part" key={n}><Icon name="file" size={18} />part{n}.txt<b>1 MB</b></span>
      ))}
    </div>
  );
}

const VIZ = [TokensViz, SecretViz, SplitViz];

export function Features({ t, downloads }: { t: Dictionary['features']; downloads: boolean }) {
  const items = downloads ? t.items : t.itemsWeb;
  const icons = downloads ? DESKTOP_ICONS : WEB_ICONS;
  return (
    <section className="wrap stack16">
      <div className="stack8">
        <h2 className="big">{t.title}</h2>
        <p className="mut">{t.sub}</p>
      </div>
      <div className="cols3">
        {items.map((i, n) => {
          const Viz = downloads ? null : VIZ[n];
          return (
            <div className="card fcard" key={i.t}>
              <span className="ico"><Icon name={icons[n] ?? 'check'} /></span>
              <h3>{i.t}</h3>
              <p className="mut">{i.s}</p>
              {Viz && (
                <div className="viz" dir="ltr" aria-hidden="true">
                  <span className="chip ex">{t.example}</span>
                  <Viz />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
