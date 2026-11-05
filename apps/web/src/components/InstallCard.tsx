'use client';

import { useEffect, useState } from 'react';
import type { Dictionary } from '@/i18n/translations';
import { Icon } from './Icons';

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

export function InstallCard({ t }: { t: Dictionary['download'] }) {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIos(/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    setInstalled(window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  async function install() {
    if (deferred) {
      await deferred.prompt();
      setDeferred(null);
    } else {
      setHint(true);
    }
  }

  return (
    <div className="feat">
      <div className="row between"><span className="ico"><Icon name="phone" /></span><span className="chip on">{t.pwaBadge}</span></div>
      <div className="stack6">
        <h3>{t.pwaTitle}</h3>
        <p className="mut">{t.pwaText}</p>
      </div>
      <div className="row gap8">
        <span className="pill"><Icon name="check" size={18} style={{ color: 'var(--ac)' }} />{t.android}</span>
        <span className="pill"><Icon name="check" size={18} style={{ color: 'var(--ac)' }} />{t.iphone}</span>
      </div>
      <ol className="steps">
        {t.steps.map((s, i) => (
          <li key={s}><span className="num">{i + 1}</span><span>{s}</span></li>
        ))}
      </ol>
      <button type="button" className="btn pri" onClick={install} disabled={installed}>
        {installed ? t.installed : t.install}
      </button>
      {hint && !installed && <p className="mut sm" role="status">{ios ? t.iosHint : t.noPrompt}</p>}
    </div>
  );
}
