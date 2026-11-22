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
  windows: <path fill="currentColor" stroke="none" d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zm12.623 0H24V24H12.623z" />,
  macos: <path fill="currentColor" stroke="none" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />,
  linux: <path fill="currentColor" stroke="none" fillRule="evenodd" d="M12 2.2c-2.1 0-3.4 1.7-3.4 4 0 1.1.2 2 .6 2.9-1.3 1.4-2.7 3.6-3.2 5.7-.3 1.2-.2 2.3.2 3.3-.6.5-1.3.9-1.4 1.6-.1 1 1 1.4 2.2 1.7 1.1.3 1.9.7 2.6 1.4.5-.9 1.3-1.4 2.4-1.4 1.1 0 1.9.5 2.4 1.4.7-.7 1.5-1.1 2.6-1.4 1.2-.3 2.3-.7 2.2-1.7-.1-.7-.8-1.1-1.4-1.6.4-1 .5-2.1.2-3.3-.5-2.1-1.9-4.3-3.2-5.7.4-.9.6-1.8.6-2.9 0-2.3-1.3-4-3.4-4zM9 14.2C9 11.88 10.343 10 12 10C13.657 10 15 11.88 15 14.2C15 16.52 13.657 18.4 12 18.4C10.343 18.4 9 16.52 9 14.2ZM10.2 6.2C10.2 5.703 10.513 5.3 10.9 5.3C11.287 5.3 11.6 5.703 11.6 6.2C11.6 6.697 11.287 7.1 10.9 7.1C10.513 7.1 10.2 6.697 10.2 6.2ZM12.4 6.2C12.4 5.703 12.713 5.3 13.1 5.3C13.487 5.3 13.8 5.703 13.8 6.2C13.8 6.697 13.487 7.1 13.1 7.1C12.713 7.1 12.4 6.697 12.4 6.2ZM10.6 8.2l1.4 1.1 1.4-1.1-1.4-.6z" />,
  android: <><path d="M5 17a7 7 0 0 1 14 0z" /><path d="M8 6l1.5 2.5M16 6l-1.5 2.5" /><circle cx="9.5" cy="13" r=".6" fill="currentColor" /><circle cx="14.5" cy="13" r=".6" fill="currentColor" /></>,
  iphone: <><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M10 5.5h4M11 19h2" /></>,
} as const;

export function Icon({ name, size = 22, ...rest }: { name: keyof typeof paths; size?: number } & SVGProps<SVGSVGElement>) {
  return <svg {...base} width={size} height={size} {...rest}>{paths[name]}</svg>;
}

/** CodeBridge mark: arch bridge with one node, on an accent tile. Uses the site tokens, so it follows light/dark. Heavier S master at 24 px and below. */
export function Logo({ size = 28 }: { size?: number }) {
  const small = size <= 24;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx={small ? 7 : 8} fill="var(--ac)" />
      {small ? (
        <>
          <path d="M6.5 24.5v-7c0-6.2 4-9.5 9.5-9.5s9.5 3.3 9.5 9.5v7M4.5 24.5h23" stroke="var(--on)" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="16" r="3" fill="var(--on)" />
        </>
      ) : (
        <>
          <path d="M7 24v-7c0-6 4-9 9-9s9 3 9 9v7M5 24h22" stroke="var(--on)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="16" cy="15" r="2.2" fill="var(--on)" />
        </>
      )}
    </svg>
  );
}
