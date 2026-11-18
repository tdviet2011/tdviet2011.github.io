import { useEffect, useState } from 'react';

// One-time "power-on" boot log. Shown once per browser session, skippable, never for reduced motion.
const LINES = [
  ['[0.000 ms]', 'POWER-ON RESET', 'OK'],
  ['[0.120 ms]', 'PLL LOCK  100 MHz', 'LOCKED'],
  ['[0.310 ms]', 'LOAD IP   aes256 · fp32_alu · int8_mac · ldpc_dec', 'OK'],
  ['[0.540 ms]', 'SELF-TEST NIST 40/40 · MNIST 200/200', 'PASS'],
  ['[0.720 ms]', 'LOADING   tdviet.bit', 'DONE'],
];
const KEY = 'tdv-boot-seen';

function shouldShow() {
  try {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (location.hash.startsWith('#project/')) return false;
    return !sessionStorage.getItem(KEY);
  } catch { return false; }
}

export function BootIntro() {
  const [show, setShow] = useState(shouldShow);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem(KEY, '1'); } catch { /* private mode */ }
    document.documentElement.classList.add('booting');
    const timers = LINES.map((_, i) => setTimeout(() => setStep(i + 1), 160 + i * 230));
    timers.push(setTimeout(() => setLeaving(true), 160 + LINES.length * 230 + 260));
    timers.push(setTimeout(() => setShow(false), 160 + LINES.length * 230 + 760));
    const skip = (e) => { if (!e.key || ['Enter', 'Escape', ' '].includes(e.key)) { setLeaving(true); setTimeout(() => setShow(false), 420); } };
    window.addEventListener('keydown', skip);
    return () => { timers.forEach(clearTimeout); window.removeEventListener('keydown', skip); };
  }, [show]);
  useEffect(() => { if (!show) document.documentElement.classList.remove('booting'); }, [show]);
  if (!show) return null;
  const pct = Math.round((step / LINES.length) * 100);
  return <div className={`boot-intro ${leaving ? 'leaving' : ''}`} role="status" aria-label="Loading portfolio" onClick={() => { setLeaving(true); setTimeout(() => setShow(false), 420); }}>
    <div className="boot-log">
      <div className="boot-title"><span>tdviet_soc</span> rev A · portfolio boot</div>
      {LINES.slice(0, step).map(([t, msg, ok]) => <div key={t} className="boot-line"><span className="boot-t">{t}</span><span className="boot-msg">{msg}</span><span className="boot-dots"/><span className="boot-ok">{ok}</span></div>)}
      <div className="boot-bar"><i style={{ width: `${pct}%` }}/></div>
      <div className="boot-pct">{pct}%<span className="boot-cursor"/></div>
    </div>
    <button type="button" className="boot-skip">SKIP ⏎</button>
  </div>;
}
