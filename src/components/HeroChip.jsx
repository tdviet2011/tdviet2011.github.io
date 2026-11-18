import { useEffect, useRef, useState } from 'react';
import { usePortfolio, useReducedMotion } from '../hooks/usePortfolio';
import './HeroChip.css';

// Isometric chip with a small working "floorplan": I/O ring, SRAM macro,
// 4-stage pipeline, register file, FSM controller and a clock H-tree.
// Everything ticks on one clock period so the parts move together.
const T = 1.2; // clock period of the animation, seconds
const iso = (x, y) => [390 + 1.04 * x - 1.04 * y, 176 + 0.6 * x + 0.6 * y];
const P = (pts) => pts.map(([x, y], i) => { const [a, b] = iso(x, y); return `${i ? 'L' : 'M'}${a.toFixed(1)} ${b.toFixed(1)}`; }).join(' ');

// pins along the four package edges (die coords, package spans 0..200)
const pinPos = Array.from({ length: 14 }, (_, i) => 14 + i * 13);
const pins = [
  ...pinPos.map((p, i) => ({ k: `t${i}`, x: p - 2, y: -11, w: 4, h: 11, side: 0, i })),
  ...pinPos.map((p, i) => ({ k: `l${i}`, x: -11, y: p - 2, w: 11, h: 4, side: 1, i })),
  ...pinPos.map((p, i) => ({ k: `r${i}`, x: 200, y: p - 2, w: 11, h: 4, side: 2, i })),
  ...pinPos.map((p, i) => ({ k: `b${i}`, x: p - 2, y: 200, w: 4, h: 11, side: 3, i })),
];
// I/O pads on the die edge
const pads = [...pinPos.flatMap((p, i) => [[p - 3, 26, i], [26, p - 3, i + 14], [168, p - 3, i + 28], [p - 3, 168, i + 42]])].filter(([x, y]) => x > 20 && x < 172 && y > 20 && y < 172);
// SRAM macro 8x8 bit cells
const sram = Array.from({ length: 64 }, (_, i) => ({ x: 44 + (i % 8) * 7, y: 44 + Math.floor(i / 8) * 7, d: ((i * 37) % 23) / 23 * 4 * T }));
// neon trace bundles: leave the package along the isometric axis, then bend horizontal
const NEON = ['#83e5e4', '#b698f4', '#c4a6fa', '#7fa3d8'];
const edges = [
  { at: p => [p, 211], d: [0, 1], hx: -1 },
  { at: p => [-11, p], d: [-1, 0], hx: -1 },
  { at: p => [p, -11], d: [0, -1], hx: 1 },
  { at: p => [211, p], d: [1, 0], hx: 1 },
];
const traces = edges.flatMap((e, ei) => [1, 3, 5, 7, 9, 11, 13].map((idx, k) => {
  const [x0, y0] = e.at(pinPos[idx] - 0);
  const L = 20 + (ei === 0 || ei === 3 ? k : 6 - k) * 16;
  const [sx, sy] = iso(x0, y0); const [bx, by] = iso(x0 + e.d[0] * L, y0 + e.d[1] * L);
  const short = (k + ei) % 3 === 0;
  const ex = e.hx < 0 ? (short ? 60 + k * 9 : -10) : (short ? 720 - k * 9 : 790);
  const d = `M${sx.toFixed(1)} ${sy.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}H${ex}`;
  return { d, c: NEON[(k + ei) % 4], end: short ? [ex, by] : null, dur: 1.6 + ((k * 7 + ei * 5) % 9) * 0.35, delay: -((k * 13 + ei * 7) % 17) * 0.29 };
}));
const spark = 'M0 18L6 14L10 16L15 6L19 12L24 9L29 15L34 4L38 11L44 8L50 13L56 2L60 10';
// data packets inside the die: IN pad → SRAM → pipeline stages → regfile → OUT pad
const flows = [
  { d: 'M24 66H44', c: 'pk-in', dur: 2 * T, b: 0 },
  { d: 'M100 66H112V52H170V66H176', c: 'pk-data', dur: 4 * T, b: 0.3 },
  { d: 'M100 80H112V92H160V108H176', c: 'pk-data', dur: 4 * T, b: 2.2 },
  { d: 'M24 130H40', c: 'pk-ctl', dur: 2 * T, b: 1 },
  { d: 'M98 132H110V140H122', c: 'pk-ctl', dur: 2 * T, b: 1.6 },
  { d: 'M140 176V152', c: 'pk-in', dur: 2 * T, b: 0.6 },
];
const stages = ['SB', 'SR', 'MC', 'AK'];
const states = [['LOAD', 54, 118], ['VNP', 86, 118], ['CNP', 86, 150], ['OUT', 54, 150]];
const focusNames = { 'aes-256': 'AES-256 CORE · 353/353', 'floating-point-alu': 'FP32 ALU · 410,704 VECTORS', 'tiny-mnist': 'INT8 MLP · 200/200 BIT-EXACT', 'qc-ldpc': 'QC-LDPC · −18.8% CARRY4' };
const hex = ['3F2A', 'C0DE', '0A1B', 'BEEF', '7E10', '42C9', 'D00D', '19F3'];

function Wave() {
  // logic-analyzer strip: CLK, DATA bus and VALID, two identical halves so it can scroll seamlessly
  const W = 32; const n = 16;
  const clk = Array.from({ length: n * 2 }, (_, i) => `M${i * W} 14V4H${i * W + W / 2}V14H${i * W + W}`).join('');
  const valid = [0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0];
  const v = (k) => valid[k % n];
  let vp = ''; for (let i = 0; i < n * 2; i++) vp += `${i ? 'L' : 'M'}${i * W} ${v(i) ? 54 : 62}H${(i + 1) * W}${v(i + 1) !== v(i) ? `V${v(i + 1) ? 54 : 62}` : ''}`;
  return <svg className="la-wave" viewBox="0 0 1024 66" preserveAspectRatio="none" aria-hidden="true">
    <g className="la-scroll">
      <path d={clk} className="la-clk"/>
      {Array.from({ length: n * 2 }, (_, i) => v(i) ? <g key={i}><path d={`M${i * W + 2} 33L${i * W + 6} 28H${i * W + W - 2}L${i * W + W + 2} 33L${i * W + W - 2} 38H${i * W + 6}Z`} className="la-bus"/><text x={i * W + W / 2 + 2} y="35.5" textAnchor="middle">{hex[i % 8]}</text></g> : <path key={i} d={`M${i * W} 33H${i * W + W}`} className="la-idle"/>)}
      <path d={vp} className="la-valid"/>
    </g>
  </svg>;
}

export function HeroChip() {
  const { lang } = usePortfolio();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(reduced);
  const cycleEl = useRef(null);
  const lab = useRef(null);
  const svg = useRef(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    // stop every animation while the chip is off screen or the tab is in the background
    const el = lab.current; if (!el) return;
    let off = false;
    const sync = () => setHidden(off || document.hidden);
    const io = new IntersectionObserver(([e]) => { off = !e.isIntersecting; sync(); });
    io.observe(el); document.addEventListener('visibilitychange', sync);
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  const [focus, setFocus] = useState(null);
  useEffect(() => { const on = e => setFocus(e.detail || null); window.addEventListener('chip-focus', on); return () => window.removeEventListener('chip-focus', on); }, []);
  useEffect(() => { setPaused(reduced); }, [reduced]);
  const halted = paused || hidden;
  useEffect(() => {
    const s = svg.current; if (!s) return;
    if (halted) s.pauseAnimations?.(); else s.unpauseAnimations?.();
    if (halted) return;
    let c = Number(cycleEl.current?.dataset.c || 4096);
    const id = setInterval(() => { c += 1; if (cycleEl.current) { cycleEl.current.dataset.c = c; cycleEl.current.textContent = `CYCLE ${c.toString(16).toUpperCase().padStart(6, '0')}`; } }, T * 1000);
    return () => clearInterval(id);
  }, [halted]);
  const vi = lang === 'vi';
  const pinCls = (p) => p.side === 1 ? 'pin pin-in' : p.side === 2 ? 'pin pin-out' : p.i % 4 === 0 ? 'pin pin-pwr' : 'pin';
  return <div ref={lab} className={`chip-lab chip-premium ${paused ? 'paused' : ''} ${hidden ? 'offscreen' : ''} ${focus ? 'has-focus' : ''}`} data-focus={focus || undefined} style={{ '--T': `${T}s` }}>
    <div className="chip-lab-top"><span className="chip-dots"><i/><i/><i/></span><span>{vi ? 'SILICON / MÔ PHỎNG THỊ GIÁC' : 'SILICON / VISUAL SIMULATION'}</span><span className="chip-live"><i/>{paused ? 'HALT' : 'LIVE'}</span></div>
    <div className="chip-stage">
    <svg className="chip-bg" viewBox="0 0 780 600" aria-hidden="true">
      <defs>
        <radialGradient id="hc-aura"><stop stopColor="#8961dc" stopOpacity=".28"/><stop offset="1" stopColor="#8961dc" stopOpacity="0"/></radialGradient>
        <filter id="hc-neon" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <ellipse cx="390" cy="330" rx="300" ry="190" fill="url(#hc-aura)"/>
      <g className="iso-grid">{Array.from({ length: 26 }, (_, i) => <path key={i} d={`M${-420 + i * 48} 0l1040 600M${-420 + i * 48} 600l1040 -600`}/>)}</g>
      <g className="neon-glow">{traces.map((t, i) => <path key={i} d={t.d} stroke={t.c} className="neon-base"/>)}<path d="M390 40V150" stroke="#e15bff" className="neon-base"/><path d="M390 440V590" stroke="#4fe3ff" className="neon-base"/></g>
      <g className="neon">
        {traces.map((t, i) => <g key={i}><path d={t.d} stroke={t.c} className="neon-line"/>{t.end && <circle cx={t.end[0]} cy={t.end[1]} r="3.2" fill="none" stroke={t.c} className="neon-end"/>}</g>)}
        <path d="M390 40V150" stroke="#e15bff" className="neon-line"/><path d="M390 440V590" stroke="#4fe3ff" className="neon-line"/>
      </g>
      {/* Small board components establish scale without changing the chip's focus targets. */}
      <g className="hc-board-parts">{[[158,130],[604,155],[114,440],[637,446]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><path d="M-15 0L0 -9L21 3L6 12Z" fill="#25253a"/><path d="M-15 0V8L6 20L21 11V3L6 12Z" fill="#151623" stroke="#43405c" strokeWidth=".6"/><path d="M-12 2L5 12M1 -7L18 3" stroke="#8c829f" strokeWidth="2"/></g>)}</g>
      <ellipse cx="390" cy="452" rx="220" ry="46" fill="#07080e" opacity=".55"/>
    </svg>
    <svg ref={svg} className="chip-scene" viewBox="0 0 780 600" role="img" aria-label={vi ? 'Con chip RTL với xung clock, luồng dữ liệu qua bốn khối: AES-256, FP32 ALU, MAC int8 cho MNIST và bộ giải mã QC-LDPC' : 'An RTL chip with a clock tree, four blocks: AES-256, FP32 ALU, int8 MNIST MAC array and a QC-LDPC decoder'}>
      <defs>
        <filter id="hc-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <linearGradient id="hc-metal" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#e0dbef"/><stop offset=".3" stopColor="#77718e"/><stop offset=".6" stopColor="#c4bed8"/><stop offset="1" stopColor="#4a455b"/></linearGradient>
        <linearGradient id="hc-glass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d8bcff" stopOpacity=".35"/><stop offset=".4" stopColor="#9d6df0" stopOpacity=".08"/><stop offset="1" stopColor="#a88cec" stopOpacity=".25"/></linearGradient>
        <linearGradient id="hc-glass-side" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c6a0ff" stopOpacity=".65"/><stop offset="1" stopColor="#7245b7" stopOpacity=".2"/></linearGradient>
        <linearGradient id="hc-reflection"><stop stopColor="#ffffff" stopOpacity="0"/><stop offset=".5" stopColor="#f4e9ff" stopOpacity=".22"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/></linearGradient>
        <linearGradient id="hc-top" x2="1" y2="1"><stop stopColor="#2c2640"/><stop offset="1" stopColor="#171a28"/></linearGradient>
        <radialGradient id="hc-core"><stop stopColor="#8ef0ff" stopOpacity=".35"/><stop offset=".6" stopColor="#9b6bff" stopOpacity=".12"/><stop offset="1" stopColor="#9b6bff" stopOpacity="0"/></radialGradient>
        <linearGradient id="hc-l"><stop stopColor="#5d4290"/><stop offset="1" stopColor="#3a2d5c"/></linearGradient>
        <linearGradient id="hc-r"><stop stopColor="#3a2d5c"/><stop offset="1" stopColor="#2a2144"/></linearGradient>
      </defs>
      <g className="neon">
        {traces.map((t, i) => <path key={i} d={t.d} stroke={t.c} pathLength="100" className="neon-pulse" style={{ animationDuration: `${t.dur}s`, animationDelay: `${t.delay}s` }}/>)}
        <path d="M390 40V150" stroke="#e15bff" pathLength="100" className="neon-pulse rev" style={{ animationDuration: '1.8s' }}/><circle cx="390" cy="40" r="4" fill="#f4d8ff" className="neon-node"/>
        <path d="M390 440V590" stroke="#4fe3ff" pathLength="100" className="neon-pulse" style={{ animationDuration: '2.2s' }}/>
      </g>
      <g className="chip-float">
        {/* Bent metallic contacts sit under the substrate; original pin hooks remain intact. */}
        <g className="hc-metal-leads" aria-hidden="true">{pins.map(p=>{const x=p.x+p.w/2,y=p.y+p.h/2;const a=iso(x,y);const b=iso(x+(p.side===1?-9:p.side===2?9:0),y+(p.side===0?-9:p.side===3?9:0));return <path key={p.k} d={`M${a[0]} ${a[1]+8}L${a[0]} ${a[1]+24}L${b[0]} ${b[1]+31}`} fill="none" stroke="url(#hc-metal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>})}</g>
        {/* package sides */}
        <path d={`${P([[0, 200], [200, 200]])} l0 30 L${iso(0, 200)[0]} ${iso(0, 200)[1] + 30}Z`} fill="url(#hc-l)" stroke="#8d6fd0" strokeWidth=".8"/>
        <path d={`${P([[200, 200], [200, 0]])} l0 30 L${iso(200, 200)[0]} ${iso(200, 200)[1] + 30}Z`} fill="url(#hc-r)" stroke="#6f58a6" strokeWidth=".8"/>
        <g transform="matrix(1.04 .6 -1.04 .6 390 176)">
          {[0, 1, 2, 3].map(ph => <g key={ph} className="pin-ph" style={{ animationDelay: `${ph * T / 4}s` }}>{pins.filter(p => p.i % 4 === ph).map(p => <rect key={p.k} x={p.x} y={p.y} width={p.w} height={p.h} className={pinCls(p)}/>)}</g>)}
          <rect width="200" height="200" fill="url(#hc-top)" stroke="#c9b2ff" strokeWidth="1.4"/>
          <rect x="8" y="8" width="184" height="184" fill="none" stroke="#6b5a8e" strokeWidth=".6"/>
          {/* die */}
          <rect x="20" y="20" width="160" height="160" className="die" rx="2"/>
          <rect x="20" y="20" width="160" height="160" className="die-ring" fill="none" rx="2"/>
          {[0, 1, 2, 3, 4, 5].map(ph => <g key={ph} className="pad-ph" style={{ animationDelay: `${ph * T / 6}s` }}>{pads.filter(([, , i]) => i % 6 === ph).map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" className="pad"/>)}</g>)}
          {/* clock H-tree */}
          <path className="clk-tree" d="M140 100V140M120 120H160M120 112V128M160 112V128M112 112H128M112 128H128M152 112H168M152 128H168M140 140V170"/>
          <rect x="132" y="162" width="16" height="10" className="pll"/><text x="140" y="169" className="die-text" textAnchor="middle">PLL</text>
          {/* buses */}
          <path className="bus" d="M30 66H44M100 66H112V52H170V66M100 80H112V92H160V108H170M30 130H40M98 132H110V140H122"/>
          {/* MNIST: int8 MAC array + weight ROM */}
          <g className="blk blk-tiny-mnist" data-block="tiny-mnist">
            <rect x="40" y="40" width="62" height="62" className="block"/><rect x="38" y="38" width="66" height="66" className="blk-halo"/>
            {sram.map((c, i) => <rect key={i} x={c.x} y={c.y} width="5.4" height="5.4" className="bitcell"/>)}
            {Array.from({ length: 8 }, (_, ph) => <g key={ph} className="bit-ph" style={{ animationDelay: `${-ph * T / 2}s` }}>{sram.filter(c => Math.floor(c.d / (T / 2)) % 8 === ph).map((c, i) => <rect key={i} x={c.x} y={c.y} width="5.4" height="5.4"/>)}</g>)}
            <text x="71" y="36" className="die-text" textAnchor="middle">INT8 MAC · MNIST</text>
          </g>
          {/* AES-256 round pipeline */}
          <g className="blk blk-aes-256" data-block="aes-256">
            <rect x="112" y="40" width="58" height="22" className="block"/><rect x="110" y="38" width="62" height="26" className="blk-halo"/>
            {stages.map((s, i) => <g key={s}><rect x={114 + i * 14} y="44" width="12" height="14" className="stage" style={{ animationDelay: `${i * T}s` }}/><text x={120 + i * 14} y="53" className="die-text" textAnchor="middle">{s}</text></g>)}
            <text x="141" y="36" className="die-text" textAnchor="middle">AES-256 CORE</text>
          </g>
          {/* FP32 ALU */}
          <g className="blk blk-floating-point-alu" data-block="floating-point-alu">
            <rect x="112" y="70" width="58" height="26" className="block"/><rect x="110" y="68" width="62" height="30" className="blk-halo"/>
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={115 + (i % 4) * 13.5} y={73 + Math.floor(i / 4) * 11} width="11" height="9" className="reg" style={{ animationDelay: `${((i * 3) % 8) * T / 2}s` }}/>)}
            <text x="141" y="102" className="die-text" textAnchor="middle">FP32 ALU</text>
          </g>
          {/* QC-LDPC layered decoder */}
          <g className="blk blk-qc-ldpc" data-block="qc-ldpc">
            <rect x="40" y="108" width="62" height="56" className="block"/><rect x="38" y="106" width="66" height="60" className="blk-halo"/>
            <path className="fsm-edge" d="M60 118H80M86 124V144M80 150H60M54 144V124"/>
            {states.map(([n, x, y], i) => <g key={n}><circle cx={x} cy={y} r="6.5" className="fsm-state" style={{ animationDelay: `${i * T}s` }}/><text x={x} y={y + 1.6} className="die-text tiny" textAnchor="middle">{n}</text></g>)}
            <text x="71" y="171" className="die-text" textAnchor="middle">QC-LDPC DEC</text>
          </g>
          <rect x="30" y="30" width="140" height="140" fill="url(#hc-core)" className="core-aura"/>
          {/* packets */}
          {flows.map((f, i) => <rect key={i} x="-2.5" y="-2.5" width="5" height="5" className={`pk ${f.c}`}><animateMotion dur={`${f.dur}s`} repeatCount="indefinite" begin={`${-f.b}s`} path={f.d}/></rect>)}
          <text x="100" y="188" className="die-text mark" textAnchor="middle">TDV-RTL · 32-BIT · 2026</text>
        </g>
        <path className="chip-scan" d={P([[0, 200], [0, 0], [200, 0]])}/>
        <path className="edge-strip" d={P([[0, 200], [200, 200], [200, 0]])}/>
        {/* Translucent elevated lid: exposed logic remains visible below the glass. */}
        <g className="hc-glass-lid" aria-hidden="true">
          {[[[0,200],[200,200]],[[200,200],[200,0]]].map(([a,b],i)=>{const p=iso(...a),q=iso(...b);return <path key={i} d={`M${p[0]} ${p[1]}L${q[0]} ${q[1]}V${q[1]-30}L${p[0]} ${p[1]-30}Z`} fill="url(#hc-glass-side)" stroke="#b899ed" strokeWidth=".5"/>})}
          <g transform="translate(0 -30)">
            <path d={`${P([[0,0],[200,0],[200,200],[0,200]])}Z`} fill="url(#hc-glass)" stroke="#c7a7ff" strokeWidth="1.7"/>
            <path d={`${P([[7,7],[193,7],[193,193],[7,193]])}Z`} fill="none" stroke="#d7bfff" strokeOpacity=".45" strokeWidth=".8"/>
            <path d={`${P([[8,20],[80,8],[193,121],[193,158]])}Z`} fill="url(#hc-reflection)"/>
            <path className="hc-lid-edge" d={P([[0,200],[0,0],[200,0]])}/>
          </g>
          {[[0,0],[200,0],[0,200],[200,200]].map(([x,y])=>{const [a,b]=iso(x,y);return <path key={x+'-'+y} d={`M${a} ${b}V${b-30}`} stroke="#d2b6ff" strokeOpacity=".55" strokeWidth="1.2"/>})}
        </g>
      </g>
      <g className="hud">
        <path d="M20 58V40H38M742 40H760V58M20 548V566H38M742 566H760V548" className="hud-bracket"/>
        <text x="28" y="30">FIG. 01</text><text x="752" y="30" textAnchor="end">{vi ? 'RTL / KHÁM PHÁ THIẾT KẾ' : 'RTL / DESIGN EXPLORATION'}</text>
        <text x="40" y="150" className="hud-label">CLK</text><text x="740" y="150" textAnchor="end" className="hud-label">DATA_IN</text>
        <text x="40" y="560" className="hud-label">CONTROL</text><text x="740" y="560" textAnchor="end" className="hud-label">DATA_OUT</text>
        <text x="300" y="70" className="hud-label sm">BUS_WIDTH</text><text x="404" y="64" className="hud-label sm">SIGNAL_FLOW</text>
        <g transform="translate(32 66)" className="hud-read"><text y="0">F_CLK  100 MHZ</text><text y="12">LUT    5,505</text><text y="24">FF     2,891</text><text y="36">CYC/BLK 66</text></g>
        <g transform="translate(672 60)" className="hud-read"><text y="0">NIST   40/40</text><text y="12">MNIST  200/200</text><text y="24">FP32   410,704</text><text y="36">CARRY4 -18.8%</text></g>
        <g transform="translate(560 62)"><path d={spark} className="hud-spark"/></g>
        <g transform="translate(150 58)"><path d={spark} className="hud-spark alt"/></g>
        <text x="740" y="586" textAnchor="end" className="hud-status">STATUS: {paused ? 'HALT' : 'ACTIVE'}</text>
      </g>
    </svg>
    </div>
    <div className="chip-analyzer">
      <div className="la-names"><span>CLK</span><span>DATA[15:0]</span><span>VALID</span></div>
      <div className="la-window"><Wave/></div>
    </div>
    <div className="chip-lab-bottom">
      <strong ref={cycleEl} data-c="4096">CYCLE 001000</strong>
      <span className={focus ? 'focus-name' : ''}>{focus ? `▸ ${focusNames[focus]}` : 'IN → MAC → AES → ALU → OUT'}</span>
      <button type="button" onClick={() => setPaused(p => !p)} aria-pressed={paused} aria-label={paused ? (vi ? 'Tiếp tục hoạt ảnh chip' : 'Resume chip animation') : (vi ? 'Tạm dừng hoạt ảnh chip' : 'Pause chip animation')}>{paused ? (vi ? '▶ Tiếp tục' : '▶ Resume') : (vi ? 'Ⅱ Tạm dừng' : 'Ⅱ Pause')}</button>
    </div>
  </div>;
}
