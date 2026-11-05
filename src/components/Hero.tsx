import type { Dictionary } from '@/i18n/translations';
import { Icon } from './Icons';

function Preview({ label }: { label: string }) {
  return (
    <div className="prev" role="img" aria-label={label} dir="ltr">
      <div className="prev-h">
        <span className="dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="mono">project.zip → code_report.txt</span>
      </div>
      <pre aria-hidden="true">
        <span className="ac"># PROJECT: my-app{'\n'}# FILES: 128   ~TOKENS: 41,320{'\n'}# REDACTED: 3 secret(s) hidden{'\n'}</span>
        {'\n## TREE\n|-- src/\n|   |-- app.ts\n|   `-- utils.ts\n`-- package.json\n\n'}
        <span className="ac">{'/* FILE: src/app.ts */'}</span>
        {'\nexport function main() {\n  …\n}'}
      </pre>
    </div>
  );
}

export function Hero({ t, downloads }: { t: Dictionary['hero']; downloads: boolean }) {
  return (
    <section id="top" className="wrap hero">
      <div className="hero-copy">
        <span className="chip on hero-eb">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="mut lead">{t.sub}</p>
        <div className="cta">
          <a className="btn pri" href="#try">{t.ctaTry}</a>
          <a className="btn" href={downloads ? '#download' : '#privacy'}>{downloads ? t.ctaDownload : t.ctaPrivacy}</a>
        </div>
        <ul className="proof">
          {t.proof.map((p) => (
            <li key={p}><Icon name="check" size={16} style={{ color: 'var(--ac)', flex: 'none' }} />{p}</li>
          ))}
        </ul>
        {!downloads && (
          <p className="soon mut sm"><Icon name="desktop" size={16} style={{ flex: 'none' }} />{t.soon}</p>
        )}
      </div>
      <Preview label={t.previewLabel} />
    </section>
  );
}
