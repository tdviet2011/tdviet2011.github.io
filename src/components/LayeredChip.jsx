import { useEffect, useId, useRef, useState } from 'react';
import { usePortfolio, useReducedMotion } from '../hooks/usePortfolio';
import './LayeredChip.css';

const projectIds = ['aes-256', 'floating-point-alu', 'tiny-mnist', 'qc-ldpc'];
const macros = [
  { id: projectIds[0], name: 'AES-256', x: 23, y: 28, w: 76, h: 66 },
  { id: projectIds[1], name: 'FP32', x: 113, y: 28, w: 64, h: 66 },
  { id: projectIds[2], name: 'INT8 MAC', x: 23, y: 108, w: 76, h: 65 },
  { id: projectIds[3], name: 'QC-LDPC', x: 113, y: 108, w: 64, h: 65 },
];
const iso = (x, y) => [366 + 1.28 * x - 1.28 * y, 280 + .65 * x + .65 * y];
const outline = (points) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${iso(x, y).join(' ')}`).join(' ') + 'Z';
const top = outline([[0, 0], [200, 0], [200, 200], [0, 200]]);
const pinOffsets = Array.from({ length: 15 }, (_, i) => 10 + i * 13);
const wires = Array.from({ length: 24 }, (_, i) => {
  const y = 12 + i * 7.5;
  return `M9 ${y}H${28 + i % 5 * 22}V${18 + i % 8 * 21}H${174 - i % 3 * 12}V${y}H191`;
});
const tabs = { en: ['Package', 'Interconnect', 'Silicon'], vi: ['Vỏ', 'Liên kết', 'Silicon'] };
const dieFlows = [
  'M9 38H90V88H100',
  'M112 40H160V85H190',
  'M9 150H23V120H80V160H100',
  'M112 120H160V160H190',
  'M100 190V100H61V94M100 100H145V94',
];
// Staggered board lanes, cross-board routes and branches weave below the I/O pins.
const boardTraces = [0, 1].flatMap(side => pinOffsets.flatMap((p, i) => {
  const [x, y] = iso(side ? 217 : p, side ? p : 217);
  const direction = side ? 1 : -1;
  const bend = 24 + i % 5 * 8;
  const elbowX = x + direction * bend;
  const elbowY = y + 42 + bend * .51;
  const laneX = side ? 680 + i % 5 * 23 : 24 + i % 5 * 23;
  const endY = 454 + (i * 7 + side * 4) % 15 * 9;
  const crossing = i % 4 === 0;
  const ex = crossing ? (side ? 65 : 780) : (side ? 820 - i % 4 * 14 : 8 + i % 4 * 14);
  const main = {
    d: `M${x} ${y + 42}L${elbowX} ${elbowY}H${laneX}V${endY}H${ex}`,
    ex, endY, duration: [.8, 1.4, 2.5, 3.8][(i + side) % 4],
    delay: -(i * .43 + side * .7), reverse: (i + side) % 3 === 0,
    color: ['#8cebe9', '#b5a1ef', '#70c9df'][(i + side) % 3],
  };
  if (i % 3 !== 0) return [main];
  const branchY = 470 + (i * 11 + side * 5) % 14 * 8;
  const branchX = side ? 802 - i * 4 : 18 + i * 4;
  return [main, {
    ...main,
    d: `M${elbowX} ${elbowY}H${laneX - direction * 11}V${branchY}H${branchX}`,
    ex: branchX, endY: branchY,
    duration: [2.5, 3.8, .8, 1.4][(i + side) % 4],
    delay: main.delay - .35, reverse: !main.reverse,
  }];
}));

function Waveform() {
  const grid = useId();
  return <div className="lc-waveform" aria-hidden="true">
    <div className="lc-signal-names"><span>CLK</span><span>DATA</span><span>VALID</span></div>
    <svg viewBox="0 0 580 74" preserveAspectRatio="none">
      <defs><pattern id={grid} width="29" height="24" patternUnits="userSpaceOnUse"><path d="M29 0H0V24" fill="none" stroke="currentColor" strokeOpacity=".1"/></pattern></defs>
      <rect width="580" height="74" fill={`url(#${grid})`}/>
      <g className="lc-wave-scroll">{[0, 580].map(offset => <g key={offset} transform={`translate(${offset} 0)`}>
        <path d={Array.from({ length: 10 }, (_, i) => `M${i * 58} 17V5H${i * 58 + 29}V17H${i * 58 + 58}`).join('')}/>
        <path d="M0 42H58V29H116V42H174V29H261V42H319V29H435V42H493V29H551V42H580"/>
        <path d="M0 67H174V54H261V67H348V54H464V67H580"/>
      </g>)}</g>
    </svg>
  </div>;
}

export function HeroChip() {
  const { lang } = usePortfolio();
  const vi = lang === 'vi';
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const paint = name => `url(#${uid}-${name})`;
  const root = useRef(null);
  const [layer, setLayer] = useState(2);
  const [hoverFocus, setFocus] = useState(null);
  const [pinned, setPinned] = useState(null);
  const focus = hoverFocus || pinned;
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const handler = event => setFocus(projectIds.includes(event.detail) ? event.detail : null);
    window.addEventListener('chip-focus', handler);
    return () => window.removeEventListener('chip-focus', handler);
  }, []);
  useEffect(() => {
    let offscreen = false;
    const sync = () => setHidden(offscreen || document.hidden);
    const observer = new IntersectionObserver(([entry]) => { offscreen = !entry.isIntersecting; sync(); });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  useEffect(() => {
    if (reduced) { root.current?.style.setProperty('--lc-scroll', '0'); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = root.current?.getBoundingClientRect();
      if (box) root.current.style.setProperty('--lc-scroll', String(Math.min(1, Math.max(0, -box.top / box.height))));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', scroll, { passive: true });
    update();
    return () => { window.removeEventListener('scroll', scroll); cancelAnimationFrame(frame); };
  }, [reduced]);
  const halted = paused || reduced || hidden;
  const selected = macros.find(macro => macro.id === focus);
  const descriptions = vi
    ? ['Lớp vỏ bảo vệ · chân kết nối kim loại', 'Liên kết kim loại · nguồn, clock và tín hiệu', 'Các khối RTL · AES / FP32 / INT8 / LDPC']
    : ['Protective package · metallic I/O leads', 'Metal routing · power, clock and signal nets', 'RTL blocks · AES / FP32 / INT8 / LDPC'];
  function tilt(event) {
    if (halted || event.pointerType === 'touch') return;
    const box = event.currentTarget.getBoundingClientRect();
    root.current.style.setProperty('--lc-tilt-x', `${((event.clientY - box.top) / box.height - .5) * -3}deg`);
    root.current.style.setProperty('--lc-tilt-y', `${((event.clientX - box.left) / box.width - .5) * 4}deg`);
  }
  function resetTilt() {
    root.current.style.setProperty('--lc-tilt-x', '0deg');
    root.current.style.setProperty('--lc-tilt-y', '0deg');
  }
  return <div ref={root} className={`layered-chip ${halted ? 'lc-halted' : ''}`} data-layer={layer} data-focus={focus || undefined}>
    <div className="lc-stage" onPointerMove={tilt} onPointerLeave={resetTilt}>
      <svg className="chip-scene lc-scene" viewBox="0 40 900 560" role="img" aria-labelledby={`${uid}-title ${uid}-desc`}>
        <title id={`${uid}-title`}>{vi ? 'Vi mạch tách lớp tương tác' : 'Interactive exploded-view integrated circuit'}</title>
        <desc id={`${uid}-desc`}>{vi ? 'Ba lớp: vỏ kính, liên kết kim loại và silicon. Dùng các nút bên dưới để khám phá từng lớp.' : 'Three layers: glass package, metal interconnect and silicon. Use the controls below to explore each layer.'}</desc>
        <defs>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2=".7" y2="1"><stop stopColor="#444450"/><stop offset=".2" stopColor="#dedde7"/><stop offset=".43" stopColor="#6d697d"/><stop offset=".65" stopColor="#f3ecfa"/><stop offset="1" stopColor="#4c475b"/></linearGradient>
          <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d7c4ff" stopOpacity=".3"/><stop offset=".35" stopColor="#96abc9" stopOpacity=".06"/><stop offset=".8" stopColor="#b299ed" stopOpacity=".2"/><stop offset="1" stopColor="#e7d6ff" stopOpacity=".4"/></linearGradient>
          <linearGradient id={`${uid}-edge`}><stop stopColor="#292435"/><stop offset=".5" stopColor="#676071"/><stop offset="1" stopColor="#211e30"/></linearGradient>
          <linearGradient id={`${uid}-silicon`} x2="1" y2="1"><stop stopColor="#3a274e"/><stop offset=".5" stopColor="#101c2e"/><stop offset="1" stopColor="#4a3167"/></linearGradient>
          <linearGradient id={`${uid}-reflection`}><stop stopColor="#fff" stopOpacity="0"/><stop offset=".45" stopColor="#e1ebff" stopOpacity=".2"/><stop offset=".55" stopColor="#fff" stopOpacity=".02"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
          <radialGradient id={`${uid}-aura`}><stop stopColor="#ae89e9" stopOpacity=".16"/><stop offset="1" stopColor="#8970b8" stopOpacity="0"/></radialGradient>
          <pattern id={`${uid}-cells`} width="8" height="7" patternUnits="userSpaceOnUse"><path d="M0 1H6V5H1V2M2 0V7M5 0V7" fill="none" stroke="#c4a3ed" strokeWidth=".45"/><path d="M0 6H8" stroke="#72d8db" strokeWidth=".35"/></pattern>
          <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <ellipse cx="370" cy="465" rx="330" ry="170" fill={paint('aura')}/>
        <ellipse cx="370" cy="560" rx="245" ry="29" fill="#000" opacity=".22"/>
        <g className="lc-board" aria-hidden="true">
          {boardTraces.map((trace, i) => <g key={i} style={{ '--lc-rate': `${trace.duration}s`, '--lc-delay': `${trace.delay}s`, '--lc-direction': trace.reverse ? 'reverse' : 'normal', color: trace.color }}>
            <path d={trace.d} className="lc-board-track"/>
            <path d={trace.d} pathLength="100" className="lc-board-packet lc-board-bloom"/>
            <path d={trace.d} pathLength="100" className="lc-board-packet"/>
            <circle cx={trace.ex} cy={trace.endY} r="2.5" className="lc-board-via"/>
          </g>)}
        </g>
        <g className="lc-chip-object">
          <g className="lc-silicon">
            {[0, 1, 2, 3].map(side => <g key={side}>{pinOffsets.map((p, i) => {
              const [x, y] = iso(side === 0 ? -1 : side === 1 ? 201 : p, side === 2 ? -1 : side === 3 ? 201 : p);
              const [ex, ey] = iso(side === 0 ? -17 : side === 1 ? 217 : p, side === 2 ? -17 : side === 3 ? 217 : p);
              return <path key={i} d={`M${x} ${y + 8}q0 12 ${(ex - x) * .45} ${(ey - y) * .45 + 20}L${ex} ${ey + 35}l0 7`} fill="none" stroke={paint('metal')} strokeWidth="7.5" strokeLinecap="round"/>;
            })}</g>)}
            <path d="M110 410L366 540L622 410V439L366 569L110 439Z" fill={paint('edge')} stroke="#877894" strokeWidth="1"/>
            <path d={top} fill="#242334" stroke="#bca3dc" strokeWidth="2"/>
            <g transform="matrix(1.28 .65 -1.28 .65 366 280)">
              <rect x="8" y="8" width="184" height="184" rx="2" fill={paint('silicon')} stroke="#a88ccd"/>
              <rect x="11" y="11" width="178" height="178" fill={paint('cells')}/>
              {pinOffsets.map((p, i) => <g key={i}>{[[p, 9], [p, 185], [9, p], [185, p]].map(([x, y], j) => <rect key={j} x={x} y={y} width="4" height="4" fill="#d6b58a" stroke="#f0dcba" strokeWidth=".4"/>)}</g>)}
              <path className="core-aura" d="M100 18V182M17 100H183M105 65H175M105 140H175M65 100V173" fill="none" stroke="#87dfe1" strokeWidth="1.3"/>
              {macros.map(macro => <g key={macro.id} className={`lc-macro blk-${macro.id}`} data-block={macro.id}>
                <rect className="block" x={macro.x} y={macro.y} width={macro.w} height={macro.h} rx="1"/>
                <rect x={macro.x + 3} y={macro.y + 3} width={macro.w - 6} height={macro.h - 6} fill={paint('cells')} opacity=".9"/>
                {Array.from({ length: 5 }, (_, i) => <path key={i} className="lc-cell-activity" style={{ animationDelay: `${-(i + macro.x / 20) * .27}s` }} d={`M${macro.x + 6} ${macro.y + 8 + i * 11}h${macro.w - 12}`} stroke={i % 2 ? '#9b7ac4' : '#68c9d5'} strokeWidth=".6"/>)}
                <rect x={macro.x + 4} y={macro.y + macro.h / 2 - 9} width={macro.w - 8} height="18" fill="#161b2e" stroke="#b69cde" strokeWidth=".5"/>
                <text x={macro.x + macro.w / 2} y={macro.y + macro.h / 2 + 3} className="lc-macro-name" textAnchor="middle">{macro.name}</text>
              </g>)}
              <g className="lc-die-data" aria-hidden="true">{dieFlows.map((d, i) => <g key={d} style={{ '--lc-rate': `${[1.3, 2.1, 2.8, 1.7, 3.2][i]}s`, '--lc-delay': `${i * -.43}s` }}>
                <path d={d} className="lc-die-net"/>
                <path d={d} pathLength="100" className="lc-die-packet"/>
              </g>)}</g>
            </g>
          </g>
          <g className="lc-interconnect">
            <path d={top} fill="#111827" fillOpacity=".74" stroke="#d7b9e9" strokeWidth="1.5"/>
            <g transform="matrix(1.28 .65 -1.28 .65 366 280)">
              <rect x="5" y="5" width="190" height="190" fill="none" stroke="#dcba94" strokeWidth=".8"/>
              {wires.map((d, i) => <path key={i} d={d} fill="none" stroke={i % 3 ? '#b98e64' : '#f0cda4'} strokeWidth=".8" opacity={i % 3 ? '.65' : '.9'}/>)}
              {[40, 80, 120, 160].map((x, i) => <g key={x}><path className="lc-travel" d={`M${x} 12V${40 + i * 30}H${180 - i * 27}V188`} fill="none" stroke="#95f4ed" strokeWidth="1.6" pathLength="100" style={{ animationDelay: `${i * -.8}s` }}/><circle cx={x} cy={40 + i * 30} r="2.5" fill="#92e6e6"/></g>)}
            </g>
          </g>
          <g className="lc-guide-lines" stroke="#8dcae2" strokeWidth=".8" strokeDasharray="3 6" opacity=".5">
            {[[0, 0], [0, 200], [200, 200], [200, 0]].map(([x, y]) => { const [a, b] = iso(x, y); return <path key={`${x}-${y}`} d={`M${a} ${b}v-210`}/>; })}
          </g>
          <g className="lc-package">
            <path d={outline([[0, 200], [200, 200], [200, 0]]).slice(0, -1)} fill="none" stroke="#a99cc7" strokeWidth="6" strokeLinejoin="round" opacity=".7"/>
            <path d={top} fill={paint('glass')} stroke="#d3c8ed" strokeWidth="2" strokeLinejoin="round"/>
            <path d={outline([[5, 5], [195, 5], [195, 195], [5, 195]])} fill="none" stroke="#dce6ff" strokeWidth=".8" strokeOpacity=".5"/>
            <path d={outline([[12, 14], [54, 8], [192, 153], [192, 190]])} fill={paint('reflection')}/>
            <g transform="matrix(1.28 .65 -1.28 .65 366 280)" fill="#e1daf3" opacity=".8"><text x="24" y="42" fontSize="16" letterSpacing="5">TV–RTL</text><text x="25" y="56" fontSize="6" letterSpacing="3">DIGITAL IC</text><path d="M14 23V14H23" stroke="#e1daf3" fill="none"/></g>
          </g>
        </g>
        <g className="lc-callouts" fill="none" stroke="#97e1e6" strokeWidth="1">
          <path d="M613 193L664 94H694"/><circle cx="613" cy="193" r="4" fill="#b2f2ef"/>
          <path d="M613 296L663 251H694"/><circle cx="613" cy="296" r="4" fill="#b2f2ef"/>
          <path d="M613 408L663 412H694"/><circle cx="613" cy="408" r="4" fill="#b2f2ef"/>
        </g>
        <g className="lc-callout-text">
          <text x="706" y="90">{vi ? 'Vỏ bảo vệ' : 'Package'}<tspan x="706" dy="21">{vi ? 'Kính trong suốt' : 'Transparent lid'}</tspan><tspan x="706" dy="17">{vi ? 'Chân kim loại' : 'Metallic I/O leads'}</tspan></text>
          <text x="706" y="247">{vi ? 'Lớp liên kết' : 'Interconnect'}<tspan x="706" dy="21">{vi ? 'Liên kết kim loại' : 'Metal routing'}</tspan><tspan x="706" dy="17">Power / clock / signal</tspan></text>
          <text x="706" y="408">Silicon<tspan x="706" dy="21">{vi ? 'Các khối chức năng' : 'RTL architecture'}</tspan><tspan x="706" dy="17">AES / FP32 / INT8 / LDPC</tspan></text>
        </g>
        <g className="lc-output-lines" fill="none" stroke="#82e5e4" strokeWidth="1.5">
          {macros.map((macro, i) => { const [x, y] = iso(macro.x + macro.w / 2, macro.y + macro.h / 2); const end = [125, 305, 485, 665][i]; return <g key={macro.id} className={focus === macro.id ? 'is-selected' : ''}><path d={`M${x} ${y}V575Q${x} 589 ${end} 589V637`} className="lc-output-route"/><circle cx={x} cy={y} r="3" fill="#a5f3ed"/></g>; })}
        </g>
      </svg>
    </div>
    <div className="lc-console">
      <div className="lc-layer-controls" role="group" aria-label={vi ? 'Khám phá các lớp vi mạch' : 'Explore chip layers'}>
        {tabs[vi ? 'vi' : 'en'].map((tab, index) => <button key={index} type="button" aria-pressed={layer === index} onClick={() => setLayer(index)}>{tab}</button>)}
      </div>
      <p className="lc-layer-description" aria-live="polite">{descriptions[layer]}</p>
      <Waveform/>
      <div className="lc-console-footer"><span>{selected ? selected.name : vi ? 'Chọn một khối để theo dấu tín hiệu' : 'Select a block to trace its signal'}</span><button type="button" aria-pressed={paused} onClick={() => { setPaused(value => !value); resetTilt(); }} disabled={reduced}>{reduced ? (vi ? 'Giảm chuyển động' : 'Reduced motion') : paused ? (vi ? 'Tiếp tục' : 'Resume') : (vi ? 'Tạm dừng' : 'Pause')}</button></div>
    </div>
    <div className="lc-macro-controls" role="group" aria-label={vi ? 'Chọn khối RTL' : 'Select an RTL block'}>
      {macros.map(macro => <button key={macro.id} type="button" aria-pressed={pinned === macro.id} onClick={() => setPinned(value => value === macro.id ? null : macro.id)}>{macro.name}</button>)}
    </div>
    <p className="lc-caption">{vi ? 'Minh họa kiến trúc · chọn lớp để khám phá' : 'Architecture illustration · select a layer to explore'}</p>
  </div>;
}
