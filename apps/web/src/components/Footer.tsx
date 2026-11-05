import type { Dictionary } from '@/i18n/translations';
import { flags } from '@/lib/flags';
import { Logo } from './Icons';

export function Footer({ t, nav }: { t: Dictionary['footer']; nav: Dictionary['nav'] }) {
  return (
    <footer className="wrap foot">
      <div className="foot-top">
        <div className="stack8">
          <a className="brand" href="#top"><Logo size={24} /> CodeBridge</a>
          <p className="mut sm foot-tag">{t.tagline}</p>
        </div>
        <nav className="foot-links" aria-label="Footer">
          <a href="#try">{nav.tryIt}</a>
          <a href="#privacy">{nav.privacy}</a>
          {flags.downloads && <a href="#download">{nav.download}</a>}
        </nav>
      </div>
      <p className="mut sm foot-bot">{t.license}</p>
    </footer>
  );
}
