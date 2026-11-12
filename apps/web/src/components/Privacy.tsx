import type { Dictionary } from '@/i18n/translations';

export function Privacy({ t }: { t: Dictionary['privacy'] }) {
  return (
    <section id="trust" className="ref-wrap ref-trust">
      <h2>{t.title}</h2>
      <div className="ref-trust-grid">
        {t.items.map((item) => (
          <article className="ref-trust-card" key={item.t}>
            <h3>{item.t}</h3>
            <p>{item.s}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
