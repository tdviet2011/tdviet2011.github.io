import { useEffect, useRef, useState, useCallback } from 'react';

// Small GTKWave-style viewer for windows exported from the real simulation VCDs.
// Drag to pan, Ctrl/⌘ + wheel or the buttons to zoom, click to drop the cursor.
const LABEL_W = 150, ROW = 34, TOP = 30, AXIS = 22;
const base = import.meta.env.BASE_URL;

function fmtTime(ps, span) {
  if (span >= 5e6) return `${(ps / 1e6).toFixed(ps % 1e6 ? 2 : 0)} µs`;
  return `${(ps / 1e3).toFixed(ps % 1e3 ? 1 : 0)} ns`;
}
const at = (ch, t) => { let lo = 0, hi = ch.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (ch[m][0] <= t) lo = m; else hi = m - 1; } return lo; };

export function WaveViewer({ id, lang }) {
  const vi = lang === 'vi';
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);
  const [vIdx, setVIdx] = useState(0);
  const [win, setWin] = useState(null);       // [t0, t1] in ps
  const [cursor, setCursor] = useState(null);
  const wrap = useRef(null), canvas = useRef(null), drag = useRef(null);
  const [w, setW] = useState(800);

  useEffect(() => { let on = true; fetch(`${base}waves/${id}.json`).then(r => r.json()).then(j => on && setData(j)).catch(() => on && setErr(true)); return () => { on = false; }; }, [id]);
  const view = data?.views[vIdx];
  useEffect(() => { if (view) { setWin([0, view.span]); setCursor(view.marks[0]?.[0] ?? null); } }, [view]);
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(320, Math.floor(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, [data]);

  const labelW = w < 560 ? 104 : LABEL_W;
  const plotW = w - labelW - 12;
  const X = useCallback((t) => labelW + (t - win[0]) / (win[1] - win[0]) * plotW, [win, plotW, labelW]);
  const T = useCallback((x) => win[0] + (x - labelW) / plotW * (win[1] - win[0]), [win, plotW, labelW]);

  // draw
  useEffect(() => {
    const c = canvas.current; if (!c || !view || !win) return;
    const H = TOP + view.signals.length * ROW + AXIS;
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr; c.height = H * dpr; c.style.height = `${H}px`;
    const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = '#0b0f1c'; g.fillRect(0, 0, w, H);
    g.font = '11px "JetBrains Mono", ui-monospace, monospace'; g.textBaseline = 'middle';
    // grid + axis
    const span = win[1] - win[0];
    const raw = span / 8, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map(k => k * mag).find(s => s >= raw);
    g.strokeStyle = '#1b2135'; g.fillStyle = '#5d6585'; g.textAlign = 'center';
    for (let t = Math.ceil(win[0] / step) * step; t <= win[1]; t += step) {
      const x = X(t); g.beginPath(); g.moveTo(x + .5, TOP - 6); g.lineTo(x + .5, H - AXIS); g.stroke();
      if (x > labelW + 18) g.fillText(fmtTime(t, view.span), x, H - AXIS / 2);
    }
    // marks
    g.setLineDash([4, 4]); g.strokeStyle = '#f5b75988'; g.fillStyle = '#f5b759';
    view.marks.forEach(([t, l]) => { if (t < win[0] || t > win[1]) return; const x = X(t); g.beginPath(); g.moveTo(x + .5, TOP - 6); g.lineTo(x + .5, H - AXIS); g.stroke(); g.textAlign = x > w - 120 ? 'right' : 'left'; g.fillText(l, x + (x > w - 120 ? -4 : 4), 12); });
    g.setLineDash([]);
    // signals
    g.save(); g.beginPath(); g.rect(labelW, 0, plotW + 2, H); g.clip();
    view.signals.forEach((s, i) => {
      const y = TOP + i * ROW, hi = y + 8, lo = y + ROW - 8, mid = y + ROW / 2;
      const ch = s.ch; let k = at(ch, win[0]);
      g.strokeStyle = s.color; g.lineWidth = 1.4;
      if (s.kind === 'bit') {
        g.beginPath(); let started = false;
        for (; k < ch.length; k++) {
          const a = Math.max(ch[k][0], win[0]), b = Math.min(k + 1 < ch.length ? ch[k + 1][0] : view.span, win[1]);
          const v = ch[k][1], yy = v === '1' ? hi : v === '0' ? lo : mid;
          const xa = X(a), xb = X(b);
          if (!started) { g.moveTo(xa, yy); started = true; } else g.lineTo(xa, yy);
          g.lineTo(xb, yy);
          if (v === '1' && !s.clk) { g.save(); g.fillStyle = s.color + '1c'; g.fillRect(xa, hi, xb - xa, lo - hi); g.restore(); }
          if (ch[k + 1]?.[0] > win[1] || k + 1 >= ch.length) break;
        }
        g.stroke();
      } else {
        for (; k < ch.length; k++) {
          const a = Math.max(ch[k][0], win[0]), b = Math.min(k + 1 < ch.length ? ch[k + 1][0] : view.span, win[1]);
          const xa = X(a), xb = X(b), e = Math.min(4, (xb - xa) / 2);
          g.beginPath(); g.moveTo(xa, mid); g.lineTo(xa + e, hi); g.lineTo(xb - e, hi); g.lineTo(xb, mid); g.lineTo(xb - e, lo); g.lineTo(xa + e, lo); g.closePath();
          g.fillStyle = s.color + '1a'; g.fill(); g.stroke();
          let txt = ch[k][1]; const room = Math.floor((xb - xa - 10) / 6.7);
          if (room >= 1) { if (txt.length > room) txt = room > 2 ? txt.slice(0, room - 1) + '…' : ''; g.fillStyle = '#e7e9f5'; g.textAlign = 'center'; g.fillText(txt, (xa + xb) / 2, mid + .5); }
          if (k + 1 >= ch.length || ch[k + 1][0] > win[1]) break;
        }
      }
    });
    g.restore();
    // labels + values at cursor
    g.fillStyle = '#0b0f1c'; g.fillRect(0, 0, labelW, H);
    g.strokeStyle = '#232a40'; g.beginPath(); g.moveTo(labelW - 6.5, TOP - 6); g.lineTo(labelW - 6.5, H - AXIS); g.stroke();
    view.signals.forEach((s, i) => {
      const y = TOP + i * ROW;
      g.textAlign = 'left'; g.fillStyle = '#c9cfe6'; g.font = '11.5px "JetBrains Mono", ui-monospace, monospace';
      g.fillText(s.name.length * 6.9 > labelW - 16 ? s.name.slice(0, Math.floor((labelW - 16) / 6.9) - 1) + '…' : s.name, 10, y + 11);
      if (cursor != null) {
        let v = s.ch[at(s.ch, cursor)][1]; const room = Math.floor((labelW - 18) / 6.2);
        if (v.length > room) v = v.slice(0, room - 1) + '…';
        g.font = '10.5px "JetBrains Mono", ui-monospace, monospace'; g.fillStyle = s.color; g.fillText(v, 10, y + 25);
      }
    });
    g.font = '11px "JetBrains Mono", ui-monospace, monospace';
    // cursor
    if (cursor != null && cursor >= win[0] && cursor <= win[1]) {
      const x = X(cursor); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + .5, TOP - 6); g.lineTo(x + .5, H - AXIS); g.stroke();
      const lbl = `${fmtTime(cursor, view.span)} · ${vi ? 'chu kỳ' : 'cycle'} ${Math.floor(cursor / view.period)}`;
      const tw = g.measureText(lbl).width + 12, bx = Math.min(Math.max(x - tw / 2, labelW), w - tw - 2);
      g.fillStyle = '#ffd36b'; g.fillRect(bx, H - AXIS + 2, tw, AXIS - 4); g.fillStyle = '#1a1405'; g.textAlign = 'center'; g.fillText(lbl, bx + tw / 2, H - AXIS / 2 + .5);
    }
  }, [view, win, cursor, w, X, labelW, plotW, vi]);

  const zoom = (f, center) => setWin(([a, b]) => {
    const c = center ?? (cursor != null && cursor >= a && cursor <= b ? cursor : (a + b) / 2);
    const span = Math.min(view.span, Math.max(view.period * 2, (b - a) * f));
    let n0 = c - (c - a) / (b - a) * span; n0 = Math.max(0, Math.min(view.span - span, n0));
    return [n0, n0 + span];
  });
  const onWheel = useCallback((e) => {
    if (!view) return;
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); const r = canvas.current.getBoundingClientRect(); zoom(e.deltaY > 0 ? 1.25 : 0.8, T(e.clientX - r.left)); }
    else if (e.shiftKey) { e.preventDefault(); setWin(([a, b]) => { const d = (b - a) * Math.sign(e.deltaY || e.deltaX) * 0.1; const n0 = Math.max(0, Math.min(view.span - (b - a), a + d)); return [n0, n0 + (b - a)]; }); }
  }, [view, T]);
  useEffect(() => { const c = canvas.current; if (!c) return; c.addEventListener('wheel', onWheel, { passive: false }); return () => c.removeEventListener('wheel', onWheel); }, [onWheel]);

  const down = (e) => { const r = canvas.current.getBoundingClientRect(); drag.current = { x: e.clientX, win, moved: false, left: r.left }; canvas.current.setPointerCapture(e.pointerId); };
  const move = (e) => {
    const d = drag.current; if (!d) return;
    const dx = e.clientX - d.x; if (Math.abs(dx) > 3) d.moved = true;
    if (d.moved) { const span = d.win[1] - d.win[0]; let n0 = d.win[0] - dx / plotW * span; n0 = Math.max(0, Math.min(view.span - span, n0)); setWin([n0, n0 + span]); }
  };
  const up = (e) => { const d = drag.current; drag.current = null; if (d && !d.moved) { const x = e.clientX - d.left; if (x > labelW) setCursor(Math.round(T(x))); } };
  const key = (e) => {
    if (!view) return;
    const step = view.period;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setCursor(c => Math.max(0, Math.min(view.span, (c ?? win[0]) + (e.key === 'ArrowRight' ? step : -step)))); }
    if (e.key === '+' || e.key === '=') zoom(0.6); if (e.key === '-') zoom(1.6);
  };

  if (err) return <p className="lab-note">{vi ? 'Không tải được dữ liệu waveform.' : 'Could not load the waveform data.'}</p>;
  if (!data || !win) return <div className="wave-viewer loading" ref={wrap}><span>{vi ? 'Đang tải VCD…' : 'Loading VCD…'}</span></div>;
  return <div className="wave-viewer" ref={wrap}>
    <div className="wv-bar">
      {data.views.length > 1 && <div className="wv-views" role="tablist">{data.views.map((v, i) => <button key={i} type="button" role="tab" aria-selected={i === vIdx} className={i === vIdx ? 'on' : ''} onClick={() => setVIdx(i)}>{v.title[lang] || v.title.en}</button>)}</div>}
      <div className="wv-tools">
        <button type="button" onClick={() => zoom(0.6)} aria-label={vi ? 'Phóng to' : 'Zoom in'}>＋</button>
        <button type="button" onClick={() => zoom(1.6)} aria-label={vi ? 'Thu nhỏ' : 'Zoom out'}>－</button>
        <button type="button" onClick={() => setWin([0, view.span])}>{vi ? 'Vừa khung' : 'Fit'}</button>
      </div>
    </div>
    <canvas ref={canvas} tabIndex={0} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; }}
      aria-label={vi ? `Waveform mô phỏng: ${view.title.vi}. Mũi tên trái/phải để dời con trỏ một chu kỳ.` : `Simulation waveform: ${view.title.en}. Left/right arrows move the cursor by one clock cycle.`} style={{ width: '100%', display: 'block', touchAction: 'pan-y' }}/>
    <p className="wv-hint">{vi ? 'Bấm để đặt con trỏ · kéo để dời · Ctrl + cuộn hoặc ＋/－ để zoom · ←/→ đi từng chu kỳ' : 'Click to place the cursor · drag to pan · Ctrl + wheel or ＋/－ to zoom · ←/→ step one clock'}<span>{data.source}</span></p>
  </div>;
}
