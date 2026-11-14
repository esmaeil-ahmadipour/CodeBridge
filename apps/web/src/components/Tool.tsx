'use client';

import { useLayoutEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  buildReport, defaultOptions, loadFiles, sizeStr,
  type InFile, type LoadStats, type Options,
} from '@/core';
import type { Dictionary } from '@/i18n/translations';
import { SelectDialog } from './SelectDialog';
import { Icon } from './Icons';

const fmt = (s: string, v: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const SPLITS_KB = [0, 200, 500, 1024, 2048, 5120, 10240];
const kbLabel = (n: number) => (n >= 1024 ? `${n / 1024} MB` : `${n} KB`);

// Counts 0 -> total in `ms`, slow at first and accelerating (ease-in), regardless of how fast the ZIP was read.
const countUp = (total: number, set: (n: number) => void, ms = 1250) =>
  new Promise<void>((done) => {
    if (!total || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { set(total); done(); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      set(Math.round(total * p ** 3));
      if (p < 1) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });

// Rolling digits: every digit is a vertical 0-9 strip that slides to its value.
function Odometer({ value, digits }: { value: number; digits: number }) {
  const s = String(value).padStart(digits, '0');
  return (
    <span className="odo" dir="ltr" aria-hidden="true">
      {[...s].map((c, i) => (
        <span className="odo-d" key={i}>
          <span className="odo-s" style={{ transform: `translateY(-${Number(c) * 10}%)` }}>
            {'0123456789'.split('').map((d) => <i key={d}>{d}</i>)}
          </span>
        </span>
      ))}
    </span>
  );
}

interface Result { files: InFile[]; stats: LoadStats; name: string }

export function Tool({ t }: { t: Dictionary['tool'] }) {
  const [opts, setOpts] = useState<Options>(defaultOptions());
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [err, setErr] = useState('');
  const [warn, setWarn] = useState('');
  const [res, setRes] = useState<Result | null>(null);
  const [off, setOff] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(-1);
  const [copying, setCopying] = useState(-1);
  const [dlg, setDlg] = useState(false);
  const [fin, setFin] = useState(false);
  const srcRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const flyFrom = useRef<DOMRect | null>(null);

  // Hero animation: when the result card appears, the ZIP name and file count fly in from where the progress check mark was.
  useLayoutEffect(() => {
    const from = flyFrom.current;
    flyFrom.current = null;
    if (!res || !from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cx = from.left + from.width / 2;
    const cy = from.top + from.height / 2;
    const fly = (el: HTMLElement | null, delay: number) => {
      if (!el || !el.animate) return;
      const r = el.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(1.6)`, opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        ],
        { duration: 800, delay, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' },
      );
    };
    fly(nameRef.current, 0);
    fly(countRef.current, 120);
  }, [res]);

  const set = <K extends keyof Options>(k: K, v: Options[K]) => setOpts((o) => ({ ...o, [k]: v }));

  async function convert(f: File) {
    setErr(''); setWarn(''); setRes(null); setOff(new Set()); setBusy({ done: 0, total: 0 });
    if (f.size > 200 * 1048576) setWarn(fmt(t.errBig, { mb: Math.round(f.size / 1048576) }));
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(f);
      const entries = Object.values(zip.files)
        .filter((z) => !z.dir)
        .map((z) => ({
          path: z.name,
          size: (z as unknown as { _data?: { uncompressedSize?: number } })._data?.uncompressedSize,
          read: () => z.async('uint8array'),
        }));
      const r = await loadFiles(entries, opts);
      if (r.files.length) {
        await countUp(r.stats.total, (n) => setBusy({ done: n, total: r.stats.total }));
        setFin(true); // show the check mark for half a second, then reveal the result
        await new Promise<void>((x) => setTimeout(x, 500));
      }
      if (!r.files.length) setErr(t.errEmpty);
      else {
        flyFrom.current = (okRef.current ?? srcRef.current)?.getBoundingClientRect() ?? null;
        setRes({ files: r.files, stats: r.stats, name: f.name.replace(/\.zip$/i, '') || 'project' });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(/zip|central directory|corrupt/i.test(msg) ? t.errNotZip : fmt(t.errRead, { msg }));
    } finally {
      setBusy(null);
      setFin(false);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) { setFile(f); void convert(f); }
  }

  const selected = useMemo(() => (res ? res.files.filter((f) => !off.has(f.path)) : []), [res, off]);
  const report = useMemo(() => (res && selected.length ? buildReport(res.name, selected, opts) : null), [res, selected, opts]);

  const safe = (res?.name || 'project').replace(/[^\w.-]/g, '_');
  const nameFor = (i: number, n: number) => (n === 1 ? `code_report_${safe}.txt` : `code_report_${safe}_part${i + 1}.txt`);

  function save(text: string, name: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function copy(text: string, i: number) {
    if (copying !== -1) return;
    setCopied(-1);
    setCopying(i);
    const minimum = new Promise<void>((x) => setTimeout(x, 350)); // keep the spinner visible long enough to notice
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); ta.remove();
    }
    await minimum;
    setCopying(-1);
    setCopied(i);
    setTimeout(() => setCopied((c) => (c === i ? -1 : c)), 2000);
  }

  const chip = (label: string, key: keyof Options) => (
    <button type="button" key={key} className={`chip${opts[key] ? ' on' : ''}`} aria-pressed={Boolean(opts[key])} onClick={() => set(key, !opts[key] as never)}>
      {label}
    </button>
  );

  return (
    <section id="web" className="ref-wrap ref-web-tool">
      <div className="ref-web-tool-card">
        <div className="stack6">
          <h2>{t.title}</h2>
          <p className="mut">{t.sub}</p>
        </div>

        <label className="ref-button ref-button-secondary ref-upload">
          <input type="file" accept=".zip,application/zip,application/x-zip-compressed" onChange={onPick} className="vh" />
          <span>{t.choose}</span>
        </label>

        {file && (
          <div className="ref-tool-options">
            <div className="row wrap8">
              {chip(t.optGitignore, 'useGitignore')}{chip(t.optRedact, 'redact')}{chip(t.optCompact, 'compact')}
              {chip(t.optHeader, 'header')}{chip(t.optTree, 'tree')}
            </div>
            <div className="selects">
              <label className="sel"><span>{t.split}</span>
                <select value={opts.splitBytes / 1024} onChange={(e) => set('splitBytes', Number(e.target.value) * 1024)}>
                  {SPLITS_KB.map((n) => <option key={n} value={n}>{n ? kbLabel(n) : t.splitOff}</option>)}
                </select>
              </label>
            </div>
            {opts.splitBytes > 0 && <p className="mut sm">{t.splitNote}</p>}
            <button
              type="button"
              className={`ref-button ref-convert ${res || err ? 'ref-button-secondary' : 'ref-button-primary'}`}
              disabled={!!busy}
              onClick={() => void convert(file)}
            >
              {res || err ? t.convertAgain : t.convert}
            </button>
          </div>
        )}

        <div aria-live="polite">
          {busy && (
            <div className="odo-wrap" aria-hidden="true">
              <div className="row gap8" dir="ltr" ref={srcRef}>
                <Odometer value={busy.done} digits={String(busy.total || 1).length} />
                {busy.total > 0 && <span className="mut odo-total" dir="ltr">/ {busy.total}</span>}
                {fin && <span className="odo-ok" ref={okRef}><Icon name="check" size={30} /></span>}
              </div>
              <div className="odo-bar"><span style={{ width: busy.total ? `${(busy.done / busy.total) * 100}%` : '0%' }} /></div>
              {busy.total > 0 && <p className="mut sm">{fmt(t.working, { done: busy.done, total: busy.total })}</p>}
            </div>
          )}
          {warn && <p className="mut sm">{warn}</p>}
          {err && <p className="err" role="alert">{err}</p>}
        </div>

        {res && report && (
          <>
            <div className="result">
              <b className="res-name" ref={nameRef}>
                <span className="res-ok" aria-hidden="true"><Icon name="check" size={14} /></span>
                {file?.name}
              </b>
              <span className="mut sm">
                <span className="res-count" ref={countRef}>{fmt(t.resFiles, { n: selected.length })}</span> · {fmt(t.resSize, { size: sizeStr(report.bytes) })} · {fmt(t.resTokens, { n: report.tokens.toLocaleString('en-US') })}
                {report.redacted > 0 && ` · ${fmt(t.resRedacted, { n: report.redacted })}`}
              </span>
              {res.stats.skipped + res.stats.binary + res.stats.large > 0 && (
                <span className="mut sm">{fmt(t.resSkipped, { n: res.stats.skipped + res.stats.binary + res.stats.large })}</span>
              )}
            </div>

            <button type="button" className="btn" onClick={() => setDlg(true)}>
              {t.pick} · {fmt(t.pickCount, { a: selected.length, b: res.files.length })}
            </button>
            <SelectDialog
              open={dlg} files={res.files} off={off} t={t} onClose={() => setDlg(false)}
              hide={{ hideImages: opts.hideImages, hideLocks: opts.hideLocks, project: opts.project, hideTests: opts.hideTests }}
              onApply={(o, h) => { setOff(o); setOpts((x) => ({ ...x, ...h })); }}
            />

            <div className="stack8">
              {report.parts.map((p, i) => (
                <div className="row gap8" key={i}>
                  <button type="button" className="btn pri grow" onClick={() => save(p, nameFor(i, report.parts.length))}>
                    {report.parts.length === 1 ? t.download : fmt(t.downloadPart, { n: i + 1 })}
                  </button>
                  <button type="button" className="btn grow" disabled={copying !== -1} aria-busy={copying === i} onClick={() => void copy(p, i)}>
                    {copying === i && <span className="spin" aria-hidden="true" />}
                    {copied === i && <span className="copy-ok" aria-hidden="true"><Icon name="check" size={18} /></span>}
                    {copied === i ? t.copied : report.parts.length === 1 ? t.copy : fmt(t.copyPart, { n: i + 1 })}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
