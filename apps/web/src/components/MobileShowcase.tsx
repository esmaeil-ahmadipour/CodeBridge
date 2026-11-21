import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n/translations';
import { Icon } from './Icons';

export function MobileShowcase({
  mobile,
}: {
  mobile: Dictionary['mobile'];
}) {
  return (
    <section id="mobile" className="ref-mobile">
      <div className="ref-wrap">
        <div className="ref-mobile-grid">
          <div className="ref-mobile-copy">
            <span className="ref-badge">{mobile.eyebrow}</span>
            <h2>{mobile.title}</h2>
            <p>{mobile.text}</p>
            <ul className="ref-benefits">
              {mobile.benefits.map((benefit) => <li key={benefit}><Icon name="check" size={18} />{benefit}</li>)}
            </ul>
            <div className="ref-mobile-actions">
              <a className="ref-button ref-button-primary" href="#web"><Icon name="android" size={18} />{mobile.android}</a>
              <a className="ref-button ref-button-primary" href="#web"><Icon name="iphone" size={18} />{mobile.iphone}</a>
            </div>
            <span className="ref-mobile-note">{mobile.note}</span>
          </div>
          <figure className="ref-win">
            <div className="ref-win-frame" role="img" aria-label={mobile.project}>
              <div className="ref-win-bar" dir="ltr" aria-hidden="true">
                <span className="ref-win-dots"><i /><i /><i /></span>
                <span className="ref-win-url"><Icon name="lock" size={12} />CodeBridge</span>
              </div>
              <div className="ref-win-body">
                <b className="ref-win-title">{mobile.project}</b>
                {mobile.files.map((file, index) => (
                  <div className={`ref-win-file ref-win-${file.kind}`} key={file.path} style={{ '--i': index } as CSSProperties}>
                    <code dir="ltr">{file.path}</code><span>{file.status}</span>
                  </div>
                ))}
                <div className="ref-win-ready"><Icon name="check" size={16} />{mobile.ready}</div>
              </div>
            </div>
            <figcaption>{mobile.note}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
