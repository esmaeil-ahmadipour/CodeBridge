'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { hiddenKind, LOCK_PROJECTS, sizeStr, type ProjectType, type Options } from '@/core';
import type { Dictionary } from '@/i18n/translations';

interface Leaf { path: string; size: number }
interface Dir { name: string; dirs: Map<string, Dir>; files: Leaf[] }

function build(files: Leaf[]): Dir {
  const root: Dir = { name: '', dirs: new Map(), files: [] };
  for (const f of files) {
    const parts = f.path.split('/');
    let n = root;
    for (let i = 0; i < parts.length - 1; i++) {
      let d = n.dirs.get(parts[i]);
      if (!d) { d = { name: parts[i], dirs: new Map(), files: [] }; n.dirs.set(parts[i], d); }
      n = d;
    }
    n.files.push(f);
  }
  return root;
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg className="ficon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      {open
        ? <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3z" /><path d="M2.5 11h19l-2 7.5a2 2 0 0 1-2 1.5H5.5a2 2 0 0 1-2-1.5z" /></>
        : <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />}
    </svg>
  );
}

const leaves = (d: Dir): Leaf[] => [...d.files, ...[...d.dirs.values()].flatMap(leaves)];
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

interface TreeProps { d: Dir; depth: number; off: Set<string>; base: Set<string>; toggle: (ls: Leaf[], select: boolean) => void }

// Module-level (not nested) so React keeps each folder's expanded state across re-renders.
function Folder({ d, depth, off, base, toggle }: TreeProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const ls = leaves(d);
  const sel = ls.filter((l) => !off.has(l.path)).length;
  const state = sel === 0 ? 'none' : sel === ls.length ? 'all' : 'some';
  return (
    <li>
      <div className="trow" style={{ paddingInlineStart: depth * 16 }}>
        <button type="button" className="tog" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          <span aria-hidden="true">{expanded ? '▾' : '▸'}</span>
        </button>
        <label>
          <input
            type="checkbox"
            checked={state === 'all'}
            ref={(el) => { if (el) el.indeterminate = state === 'some'; }}
            onChange={() => toggle(ls, state !== 'all')}
          />
          <FolderIcon open={expanded} />
          <span className="fp">{d.name}</span>
          <span className="mut sm">{sel}/{ls.length}</span>
        </label>
      </div>
      {expanded && <Children d={d} depth={depth + 1} off={off} base={base} toggle={toggle} />}
    </li>
  );
}

function Children({ d, depth, off, base, toggle }: TreeProps) {
  return (
    <ul>
      {[...d.dirs.values()].sort(byName).map((c) => <Folder key={c.name} d={c} depth={depth} off={off} base={base} toggle={toggle} />)}
      {[...d.files].sort((a, b) => a.path.localeCompare(b.path)).map((f) => (
        <li key={f.path} className={off.has(f.path) !== base.has(f.path) ? 'trow chg' : 'trow'} style={{ paddingInlineStart: depth * 16 + 36 }}>
          <label>
            <input type="checkbox" checked={!off.has(f.path)} onChange={() => toggle([f], off.has(f.path))} />
            <span className="fp">{f.path.split('/').pop()}</span>
            <span className="mut sm">{sizeStr(f.size)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

export type Hide = Pick<Options, 'hideImages' | 'hideLocks' | 'project' | 'hideTests'>;

interface Props {
  open: boolean;
  files: Leaf[];
  off: Set<string>;
  hide: Hide;
  onApply: (off: Set<string>, hide: Hide) => void;
  onClose: () => void;
  t: Dictionary['tool'];
}

const PROJ: Record<Exclude<ProjectType, ''>, string> = {
  nextjs: 'Next.js', react: 'React', node: 'Node.js', nestjs: 'NestJS', python: 'Python', flutter: 'Flutter',
};
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

export function SelectDialog({ open, files, off, hide, onApply, onClose, t }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const root = useMemo(() => build(files), [files]);
  // Changes are staged in `draft` / `dHide`; the report only changes when the user confirms.
  const [draft, setDraft] = useState<Set<string>>(off);
  const [dHide, setDHide] = useState<Hide>(hide);
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle');
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) { setDraft(new Set(off)); setDHide(hide); setPhase('idle'); el.showModal(); }
    if (!open && el.open) el.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (ls: Leaf[], select: boolean) => {
    const next = new Set(draft);
    for (const l of ls) { if (select) next.delete(l.path); else next.add(l.path); }
    setDraft(next);
  };

  const none = { hideImages: false, hideLocks: false, project: '' as ProjectType, hideTests: false };
  const nImg = useMemo(() => files.filter((f) => hiddenKind(f.path, { ...none, hideImages: true })).length, [files]); // eslint-disable-line react-hooks/exhaustive-deps
  const nLock = useMemo(
    () => (dHide.project ? files.filter((f) => hiddenKind(f.path, { ...none, hideLocks: true, project: dHide.project })).length : 0),
    [files, dHide.project], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const nTest = useMemo(
    () => (dHide.project ? files.filter((f) => hiddenKind(f.path, { ...none, hideTests: true, project: dHide.project })).length : 0),
    [files, dHide.project], // eslint-disable-line react-hooks/exhaustive-deps
  );

  let removed = 0, restored = 0;
  for (const f of files) {
    const was = off.has(f.path), now = draft.has(f.path);
    if (now && !was) removed++;
    else if (!now && was) restored++;
  }
  // Lock and test hiding only count once a project type is chosen.
  const eff = (h: Hide) => ({ img: h.hideImages, lock: h.hideLocks && !!h.project, test: h.hideTests && !!h.project, project: h.project });
  const e0 = eff(hide), e1 = eff(dHide);
  const optsChanged =
    e0.img !== e1.img || e0.lock !== e1.lock || e0.test !== e1.test ||
    ((e1.lock || e1.test) && e0.project !== e1.project);
  const changes = removed + restored + (optsChanged ? 1 : 0);
  const locked = phase !== 'idle';

  async function apply() {
    setPhase('busy');
    await frame(); // let the spinner paint before the (synchronous) report rebuild
    const t0 = Date.now();
    onApply(new Set(draft), dHide);
    await frame(); // wait for the rebuilt report to render
    const left = 400 - (Date.now() - t0);
    if (left > 0) await wait(left);
    if (!alive.current) return;
    setPhase('done');
    await wait(1000);
    if (alive.current) onClose();
  }

  const pend = [
    removed + restored ? t.pendChanges.replace('{r}', String(removed)).replace('{a}', String(restored)) : '',
    optsChanged ? t.pendOpts : '',
  ].filter(Boolean).join(' · ');

  return (
    <dialog
      ref={ref}
      className="dlg"
      onClose={onClose}
      onCancel={(e) => { if (locked) e.preventDefault(); }}
      onClick={(e) => { if (e.target === ref.current && !locked) onClose(); }}
      aria-labelledby="dlg-title"
      aria-busy={phase === 'busy'}
    >
      <div className="dlg-in">
        <div className="dlg-h">
          <h2 id="dlg-title">{t.dlgTitle}</h2>
          <p className="mut sm">{t.dlgHint}</p>
          <p className="mut sm" aria-live="polite">{t.pickCount.replace('{a}', String(files.length - draft.size)).replace('{b}', String(files.length))}</p>
          <p className="sm pend" aria-live="polite">{pend || t.pendNone}</p>
        </div>
        <div className="dlg-o" inert={locked}>
          <b className="sm">{t.hideTitle}</b>
          <div className="ocard">
            <label className="orow">
              <input type="checkbox" checked={dHide.hideImages} onChange={(e) => setDHide({ ...dHide, hideImages: e.target.checked })} />
              <span className="grow">{t.hideImages}</span>
              <span className="cnt">{nImg}</span>
            </label>
            <div className="oblk">
              <label className="orow">
                <span className="grow">{t.projLabel}</span>
                <select
                  value={dHide.project}
                  onChange={(e) => {
                    const v = e.target.value as ProjectType;
                    setDHide(v ? { ...dHide, project: v } : { ...dHide, project: '', hideLocks: false, hideTests: false });
                  }}
                >
                  <option value="">{t.projNone}</option>
                  {LOCK_PROJECTS.map((k) => <option key={k} value={k}>{PROJ[k]}</option>)}
                </select>
              </label>
              {!dHide.project && <p className="mut sm ohint">{t.lockHint}</p>}
            </div>
            <label className="orow sub">
              <input type="checkbox" checked={e1.lock} disabled={!dHide.project} onChange={(e) => setDHide({ ...dHide, hideLocks: e.target.checked })} />
              <span className="grow">{t.hideLocks}</span>
              <span className="cnt">{dHide.project ? nLock : '–'}</span>
            </label>
            <label className="orow sub">
              <input type="checkbox" checked={e1.test} disabled={!dHide.project} onChange={(e) => setDHide({ ...dHide, hideTests: e.target.checked })} />
              <span className="grow">{t.hideTests}</span>
              <span className="cnt">{dHide.project ? nTest : '–'}</span>
            </label>
          </div>
        </div>
        <div className="dlg-b" dir="ltr" inert={locked}><Children d={root} depth={0} off={draft} base={off} toggle={toggle} /></div>
        <div className="dlg-f">
          <button type="button" className="btn" disabled={locked} onClick={() => setDraft(new Set())}>{t.selAll}</button>
          <button type="button" className="btn" disabled={locked} onClick={() => setDraft(new Set(files.map((f) => f.path)))}>{t.selNone}</button>
          <button type="button" className="btn" disabled={locked} onClick={onClose}>{t.cancel}</button>
          <button type="button" className="btn pri grow" disabled={locked || !changes} onClick={() => void apply()}>
            {phase === 'busy' && <><span className="spin" aria-hidden="true" />{t.applying}</>}
            {phase === 'done' && <><span aria-hidden="true">✓&nbsp;</span>{t.applied}</>}
            {phase === 'idle' && t.applyChanges}
          </button>
        </div>
        <p className="vh" role="status">{phase === 'busy' ? t.applying : phase === 'done' ? t.applied : ''}</p>
      </div>
    </dialog>
  );
}
