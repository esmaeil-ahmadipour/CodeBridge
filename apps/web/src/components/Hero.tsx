import type { Dictionary } from '@/i18n/translations';

function Preview({ label, lines, result, undo }: { label: string; lines: Dictionary['hero']['previewLines']; result: string; undo: string }) {
  return (
    <div className="ref-preview" role="img" aria-label={label}>
      <div className="ref-preview-title">{label}</div>
      <div className="ref-code" dir="ltr">
        {lines.map((line, index) => (
          <div className={`ref-diff-line ref-diff-${line.kind}`} key={`${line.text}-${index}`}>{line.text}</div>
        ))}
      </div>
      <div className="ref-preview-result">
        <span>{result}</span><span className="ref-undo">{undo}</span>
      </div>
    </div>
  );
}

export function Hero({ t, downloads }: { t: Dictionary['hero']; downloads: boolean }) {
  const previewLines = t.previewLines;
  const { previewResult, undo } = t;
  return (
    <section id="top" className="ref-hero">
      <div className="ref-hero-copy">
        <span className="ref-badge">{t.eyebrow}</span>
        <h1>{t.title}<br /><span>{t.titleAccent}</span></h1>
        <p>{t.sub}</p>
        <div className="ref-hero-actions">
          {downloads && <a className="ref-button ref-button-primary" href="#dl">{t.ctaDownload}</a>}
          <a className="ref-button ref-button-secondary" href="#web">{t.ctaMobile}</a>
        </div>
        <div className="ref-proof">{t.proof.map((item) => <span key={item}>{item}</span>)}</div>
      </div>
      <Preview label={t.previewTitle} lines={t.previewLines} result={t.previewResult} undo={t.undo} />
    </section>
  );
}
