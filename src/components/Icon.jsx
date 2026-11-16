const paths = {
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  diagonal: <><path d="M6 18 18 6M6 6h12v12" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></>,
  chip: <><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4M10 10h4v4h-4z"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
  moon: <path d="M20.5 14a8.7 8.7 0 0 1-10.5-10.5A8.8 8.8 0 1 0 20.5 14Z"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  check: <><path d="m7 12 3 3 7-7"/><path d="M12 3 3 7v6c0 4 9 8 9 8s9-4 9-8V7Z"/></>,
  signal: <path d="M2 12h4V5h6v14h6v-7h4"/>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/></>,
  tick: <path d="m5 12 4 4L19 6"/>,
  github: <><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.9c0-1.1-.4-1.8-.8-2.2 2.8-.3 5.8-1.4 5.8-6.3 0-1.4-.5-2.5-1.3-3.4.1-.3.6-1.6-.1-3.3 0 0-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 1.9 5.4 2.2 5.4 2.2c-.7 1.7-.2 3-.1 3.3C4.5 6.4 4 7.5 4 8.9c0 4.9 3 6 5.8 6.3-.4.4-.8 1.1-.8 2.2v3.9"/></>,
  linkedin: <><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 10v7m0-10v.1M11 17v-7m0 3c0-4 6-4 6 0v4"/></>,
  download: <><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></>,
  book: <><path d="M3 4h6c2 0 3 2 3 2s1-2 3-2h6v15h-6c-2 0-3 2-3 2s-1-2-3-2H3Z"/><path d="M12 6v15"/></>,
};
export function Icon({ name, size = 20, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.chip}</svg>;
}
