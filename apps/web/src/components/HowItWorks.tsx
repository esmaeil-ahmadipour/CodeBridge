import type { Dictionary } from '@/i18n/translations';
import type { Locale } from '@/i18n/config';

export function HowItWorks({ t, locale }: { t: Dictionary['how']; locale: Locale }) {
  return (
    <section id="how" className="ref-wrap ref-how">
      <h2>{t.title}</h2>
      <ol className="ref-steps">
        {t.steps.map((step, index) => (
          <li className="ref-step" key={step.t}>
            <span className="ref-step-number">{new Intl.NumberFormat(locale, { useGrouping: false }).format(index + 1)}</span>
            <h3>{step.t}</h3>
            <p>{step.s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
