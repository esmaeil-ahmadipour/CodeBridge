import type { SVGProps } from 'react';

const base: SVGProps<SVGSVGElement> = {
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
};
const paths = {
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></>,
  check: <path d="M5 12l5 5 9-10" strokeWidth={3} />,
  desktop: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></>,
  download: <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  zip: <><path d="M4 7l8-4 8 4v10l-8 4-8-4z" /><path d="M4 7l8 4 8-4M12 11v10" /></>,
  browser: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
  server: <><rect x="3" y="4" width="18" height="6" rx="1.5" /><rect x="3" y="14" width="18" height="6" rx="1.5" /><path d="M7 7h.01M7 17h.01" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  noupload: <path d="M12 15V4M7 9l5-5 5 5M4 20h16M3 3l18 18" />,
  offline: <path d="M2 8.8a15 15 0 0 1 4-2.4M22 8.8a15 15 0 0 0-9.5-3.7M5 12.9a10 10 0 0 1 3-1.9M19 12.9a10 10 0 0 0-4.3-2.5M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  code: <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  split: <><rect x="3" y="4" width="7" height="16" rx="1.5" /><rect x="14" y="4" width="7" height="16" rx="1.5" /></>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  windows: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></>,
  macos: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  linux: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 10l3 2-3 2M13 15h4" /></>,
  android: <><path d="M5 17a7 7 0 0 1 14 0z" /><path d="M8 6l1.5 2.5M16 6l-1.5 2.5" /><circle cx="9.5" cy="13" r=".6" fill="currentColor" /><circle cx="14.5" cy="13" r=".6" fill="currentColor" /></>,
  iphone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M10 5.5h4M11 19h2" /></>,
} as const;

export function Icon({ name, size = 22, ...rest }: { name: keyof typeof paths; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg {...base} width={size} height={size} {...rest}>{paths[name]}</svg>;
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="var(--ac)" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M3 21c4-12 18-12 22 0" /><path d="M3 21v3M25 21v3M14 11v13" />
    </svg>
  );
}
