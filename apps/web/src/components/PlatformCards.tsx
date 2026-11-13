'use client';

import { useEffect, useState } from 'react';
import { detectPlatform, type Detected } from '@/lib/platform';
import { Icon } from './Icons';

export interface PlatformItem { id: 'windows' | 'macos' | 'linux'; name: string; arch: string; format: string; hint: string; href: string }
export interface PlatformLabels {
  recommended: string; hintDefault: string; hintMobile: string; downloadFor: string; dlAria: string; installNotes: string;
}

interface ArchitectureHints { architecture?: string; bitness?: string }
interface NavigatorWithHints extends Navigator {
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<ArchitectureHints>;
  };
}

const fmt = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? '');
const renderHint = (text: string) => text.split(/(`[^`]+`)/g).map((part, index) =>
  part.startsWith('`') && part.endsWith('`')
    ? <code key={index} dir="ltr">{part.slice(1, -1)}</code>
    : part,
);

// Detection runs after mount, so server and first client render are identical (no hydration mismatch).
// The badge slot and hint line always occupy their space, so nothing shifts when detection finishes.
export function PlatformCards({ items, t }: { items: PlatformItem[]; t: PlatformLabels }) {
  const [det, setDet] = useState<Detected>(null);
  useEffect(() => {
    let active = true;
    const n = navigator as NavigatorWithHints;
    const detect = async () => {
      let architecture = '';
      let bitness = '';
      try {
        ({ architecture = '', bitness = '' } = await n.userAgentData?.getHighEntropyValues?.(['architecture', 'bitness']) ?? {});
      } catch {
        // Keep the neutral recommendation when the browser withholds architecture hints.
      }
      if (active) setDet(detectPlatform(n.userAgent, n.userAgentData?.platform, n.maxTouchPoints, architecture, bitness));
    };
    void detect();
    return () => { active = false; };
  }, []);
  const found = items.find((i) => i.id === det);
  const hint = det === 'mobile' ? t.hintMobile : found ? '' : t.hintDefault;
  return (
    <div className="stack12">
      <p className="mut sm dl-detect-hint" aria-live="polite">{hint}</p>
      <ul className="dl-rows">
        {items.map((i) => {
          const rec = det === i.id;
          const label = fmt(t.downloadFor, { os: i.name });
          return (
            <li key={i.id} className={rec ? 'dl-card rec' : 'dl-card'} data-os={i.id}>
              <div className="dl-card-top">
                <span className="ico"><Icon name={i.id} fill={i.id === 'windows' ? 'currentColor' : 'none'} /></span>
                <span className={rec ? 'dl-recommended on' : 'dl-recommended'} aria-hidden={!rec}>{t.recommended}</span>
              </div>
              <div className="dl-info">
                <b>{i.name}</b>
                <span className="dl-spec" dir="auto">{i.arch} · {i.format}</span>
              </div>
              <a className="btn pri dl-btn" href={i.href} aria-label={fmt(t.dlAria, { label, arch: i.arch, format: i.format })}>
                <Icon name="download" size={18} />{label}
              </a>
              <details className="dl-notes-d">
                <summary>{t.installNotes}</summary>
                <p className="dl-install-hint">{renderHint(i.hint)}</p>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
