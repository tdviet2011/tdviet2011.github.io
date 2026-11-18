import { useEffect, useRef } from 'react';

// Layout-tool feel: faint crosshair hairlines, a µm coordinate readout, and a measured
// bounding box around cards under the pointer. Desktop pointers only.
const UM = 0.5; // 1 css px = 0.5 µm on this "layout"
const TARGETS = '.project-card, .rm-card, .supporting-row, .skill-macro, .education-card, .research-grid article';

export function LayoutCursor() {
  const root = useRef(null);
  useEffect(() => {
    const fine = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;
    const el = root.current; el.hidden = false;
    const h = el.querySelector('.lc-h'), v = el.querySelector('.lc-v'), xy = el.querySelector('.lc-xy'), box = el.querySelector('.lc-box'), dw = el.querySelector('.lc-w'), dh = el.querySelector('.lc-hgt');
    let target = null, raf = 0, mx = 0, my = 0, settleUntil = 0;
    const place = () => {
      raf = 0;
      h.style.transform = `translateY(${my}px)`; v.style.transform = `translateX(${mx}px)`;
      xy.textContent = `X: ${((mx + scrollX) * UM).toFixed(2)} µm   Y: ${((my + scrollY) * UM).toFixed(2)} µm`;
      if (target && target.isConnected) {
        const r = target.getBoundingClientRect();
        box.style.cssText = `display:block;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
        dw.textContent = `${(r.width * UM).toFixed(2)} µm`; dh.textContent = `${(r.height * UM).toFixed(2)} µm`;
      } else box.style.display = 'none';
      if (target && performance.now() < settleUntil) raf = requestAnimationFrame(place);
    };
    const queue = () => { settleUntil = performance.now() + 700; if (!raf) raf = requestAnimationFrame(place); };
    const move = (e) => { mx = e.clientX; my = e.clientY; target = e.target.closest?.(TARGETS) || null; el.classList.toggle('lc-dialog', !!document.querySelector('dialog[open]')); queue(); };
    const leave = () => { target = null; el.classList.add('lc-out'); queue(); };
    const enter = () => el.classList.remove('lc-out');
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', queue, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('scroll', queue); document.removeEventListener('pointerleave', leave); document.removeEventListener('pointerenter', enter); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={root} className="layout-cursor" hidden aria-hidden="true">
    <div className="lc-h"/><div className="lc-v"/>
    <div className="lc-box"><i className="c1"/><i className="c2"/><i className="c3"/><i className="c4"/><span className="lc-w"/><span className="lc-hgt"/></div>
    <div className="lc-readout"><span className="lc-layer">LAYER M2 · GRID 0.005</span><span className="lc-xy"/></div>
  </div>;
}
