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
          <figure className="ref-phone">
            <div className="ref-phone-frame">
              <div className="ref-phone-screen">
                <div className="ref-phone-project">
                  <b>{mobile.project}</b>
                  {mobile.files.map((file) => (
                    <div className={`ref-phone-file ref-phone-${file.kind}`} key={file.path}>
                      <code dir="ltr">{file.path}</code><span>{file.status}</span>
                    </div>
                  ))}
                </div>
                <div className="ref-phone-ready">{mobile.ready}</div>
              </div>
            </div>
            <figcaption>{mobile.note}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
