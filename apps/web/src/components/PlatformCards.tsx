'use client';

import { useEffect, useState } from 'react';
import { detectPlatform, type Detected } from '@/lib/platform';
import { Icon } from './Icons';

export interface PlatformItem { id: 'windows' | 'macos' | 'linux'; name: string; desc: string; arch: string; format: string; href: string }
export interface PlatformLabels {
  recommended: string; hintDefault: string; hintDetected: string; hintMobile: string; downloadFor: string; dlAria: string;
}

const fmt = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? '');

// Detection runs after mount, so server and first client render are identical (no hydration mismatch).
// The badge slot and hint line always occupy their space, so nothing shifts when detection finishes.
export function PlatformCards({ items, t }: { items: PlatformItem[]; t: PlatformLabels }) {
  const [det, setDet] = useState<Detected>(null);
  useEffect(() => {
    const n = navigator as Navigator & { userAgentData?: { platform?: string } };
    setDet(detectPlatform(n.userAgent, n.userAgentData?.platform, n.maxTouchPoints));
  }, []);
  const found = items.find((i) => i.id === det);
  const hint = det === 'mobile' ? t.hintMobile : found ? fmt(t.hintDetected, { os: found.name }) : t.hintDefault;
  return (
    <div className="stack12">
      <p className="mut sm dl-hint" aria-live="polite">{hint}</p>
      <ul className="dlgrid">
        {items.map((i) => {
          const rec = det === i.id;
          const label = fmt(t.downloadFor, { os: i.name });
          return (
            <li key={i.id} className={rec ? 'dl-card rec' : 'dl-card'} data-os={i.id}>
              <div className="row dl-top">
                <span className="ico"><Icon name="desktop" /></span>
                <span className="grow"><b className="blk">{i.name}</b><span className="mut sm blk">{i.desc}</span></span>
              </div>
              <div className="row wrap8 dl-meta">
                <span className="cnt" dir="ltr">{i.arch}</span>
                <span className="cnt" dir="ltr">{i.format}</span>
                <span className={rec ? 'dl-rec on' : 'dl-rec'}>{t.recommended}</span>
              </div>
              <a className={rec ? 'btn pri' : 'btn'} href={i.href} rel="noopener" aria-label={fmt(t.dlAria, { label, arch: i.arch, format: i.format })}>
                <Icon name="download" size={18} style={{ marginInlineEnd: 8 }} />{label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
