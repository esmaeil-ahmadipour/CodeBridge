'use client';

import { useEffect, useState } from 'react';

type Tab = { id: string; title: string };

/** Sections that are lookup material, not steps of the flow: shown after a divider. */
const REFERENCE = new Set(['cli', 'trouble']);

function currentId(ids: string[]): string {
  const raw = decodeURIComponent(window.location.hash.slice(1));
  if (!raw) return ids[0];
  const el = document.getElementById(raw);
  const own = el?.closest('.gsec')?.id ?? raw; // hash may point inside a section
  return ids.includes(own) ? own : ids[0];
}

export function GuideTabs({ tabs, label }: { tabs: Tab[]; label: string }) {
  const ids = tabs.map((x) => x.id);
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    // Arriving from another page (e.g. the footer link) keeps the old scroll offset: start at the header.
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    const sync = () => setActive(currentId(ids));
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')]);

  const index = Math.max(0, ids.indexOf(active));
  const firstRef = tabs.findIndex((x) => REFERENCE.has(x.id));

  return (
    <div className="gtabs">
      <nav className="gtabs-nav" aria-label={label}>
        {tabs.map((s, n) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`gtab${n === firstRef ? ' ref-start' : ''}${REFERENCE.has(s.id) ? ' ref' : ''}`}
            aria-current={s.id === active ? 'location' : undefined}
            aria-label={s.title}
            title={s.title}
          >
            <span className="gtab-n" aria-hidden="true">{n + 1}</span>
            <span className="gtab-t">{s.title}</span>
          </a>
        ))}
      </nav>
      {/* Phone: the title of the open section, since the circles carry no text. */}
      <p className="gtabs-now" aria-hidden="true">
        <span className="mono">{index + 1}/{tabs.length}</span> {tabs[index].title}
      </p>
    </div>
  );
}
