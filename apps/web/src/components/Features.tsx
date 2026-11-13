import type { Dictionary } from '@/i18n/translations';

export function Features({ t }: { t: Dictionary['features'] }) {
  return (
    <section id="features" className="ref-wrap ref-comparison">
      <h2>{t.title}</h2>
      <div className="ref-comparison-grid">
        <article className="ref-comparison-card ref-comparison-before">
          <h3>{t.beforeTitle}</h3>
          <ul>{t.beforeItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="ref-comparison-card ref-comparison-after">
          <h3>{t.afterTitle}</h3>
          <ul>{t.afterItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}
