import type { Dictionary } from '@/i18n/translations';
import { Icon } from './Icons';

const POINT_ICONS = ['noupload', 'offline', 'user', 'code'] as const;

export function Privacy({ t }: { t: Dictionary['privacy'] }) {
  const [a, b, c, srv] = t.flow;
  const steps = [{ n: a, i: 'zip' }, { n: b, i: 'browser' }, { n: c, i: 'file' }] as const;
  return (
    <section id="privacy" className="wrap">
      <div className="feat narrow">
        <div className="row between"><span className="ico"><Icon name="shield" /></span><span className="chip on">{t.badge}</span></div>
        <div className="stack6">
          <h2>{t.title}</h2>
          <p className="mut">{t.text}</p>
        </div>

        <div className="pflow" role="img" aria-label={t.flowLabel}>
          <div className="pdev">
            <span className="pdev-l"><Icon name="lock" size={14} />{t.deviceLabel}</span>
            <div className="psteps">
              {steps.map((s, i) => (
                <span key={s.i} className="pwrap">
                  {i > 0 && <span className="parr flip" aria-hidden="true">→</span>}
                  <span className="pstep"><span className="ico"><Icon name={s.i} size={20} /></span><span>{s.n}</span></span>
                </span>
              ))}
            </div>
          </div>
          <div className="pcut" aria-hidden="true"><span className="cutx">✕</span><span>{t.blocked}</span></div>
          <div className="psrv" aria-hidden="true"><Icon name="server" size={20} /><span className="name">{srv}</span></div>
        </div>

        <ul className="pts">
          {t.points.map((p, i) => (
            <li key={p.t} className="pt">
              <span className="ico sm36"><Icon name={POINT_ICONS[i] ?? 'check'} size={18} /></span>
              <span><b>{p.t}</b><span className="mut sm blk">{p.s}</span></span>
            </li>
          ))}
        </ul>

        <p className="pnote mut sm"><Icon name="info" size={16} style={{ flex: 'none', marginTop: 2 }} />{t.note}</p>
      </div>
    </section>
  );
}
