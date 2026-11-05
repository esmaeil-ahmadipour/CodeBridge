import type { Dictionary } from '@/i18n/translations';
import { downloads } from '@/lib/site';
import { Icon } from './Icons';
import { InstallCard } from './InstallCard';

export function Download({ t }: { t: Dictionary['download'] }) {
  const os = [
    { name: t.win, sub: t.winSub, href: downloads.windows },
    { name: t.mac, sub: t.macSub, href: downloads.macos },
    { name: t.linux, sub: t.linuxSub, href: downloads.linux },
  ];
  return (
    <section id="download" className="wrap stack16">
      <div className="stack8">
        <div className="mono" dir="ltr">{t.eyebrow}</div>
        <h2 className="big">{t.title}</h2>
        <p className="mut">{t.sub}</p>
      </div>
      <div className="cols2">
        <InstallCard t={t} />
        <div className="stack12">
          <b>{t.desktop}</b>
          {os.map((o) => (
            <a key={o.name} className="os" href={o.href} rel="noopener">
              <span className="ico"><Icon name="desktop" /></span>
              <span className="grow"><b className="blk">{o.name}</b><span className="mut sm">{o.sub}</span></span>
              <Icon name="download" style={{ color: 'var(--ac)' }} />
            </a>
          ))}
          <p className="mut sm">{t.note}</p>
        </div>
      </div>
    </section>
  );
}
