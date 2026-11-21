import { useEffect, useId, useRef, useState } from 'react';
import { usePortfolio, useReducedMotion } from '../hooks/usePortfolio';
import { skills } from '../data/profile';
import { projects } from '../data/projects';
import { SectionHeading } from '../components/SectionHeading';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';
import './Skills.css';

// Skills drawn as a die floorplan: each skill group is a hard macro inside a pad ring.
const INST = ['U_RTL_DESIGN', 'U_VERIFY', 'U_EMBED_ANALOG', 'U_EDA_TOOLS'];
const LABELS = ['RTL DESIGN', 'VERIFICATION', 'EMBEDDED + ANALOG', 'EDA TOOLS'];
const PROOFS = [
  ['aes-256', 'floating-point-alu'],
  ['aes-256', 'tiny-mnist'],
  ['pcb-studies', 'embedded-control'],
  ['floating-point-alu', 'pcb-studies'],
];
const netPaths = ['M104 105H210V210', 'M316 105H230V210H210', 'M104 315H190V230H210V210', 'M316 315H230V230H210V210'];
const backplane = Array.from({ length: 66 }, (_, i) => {
  const y = 26 + i * 5.6;
  const x = 33 + i % 13 * 27;
  return `M24 ${y}H${x}V${29 + i % 17 * 21}H${390 - i % 7 * 13}V${y}H396`;
});

function MacroLayout({ index }) {
  const cells = useId();
  return <svg className={`ss-artwork ss-artwork-${index}`} viewBox="0 0 150 160" preserveAspectRatio="none" aria-hidden="true">
    <defs><pattern id={cells} width="10" height="9" patternUnits="userSpaceOnUse">
      <rect x="1" y="1" width="7.5" height="6.5" className="ss-standard-cell"/>
      <path d="M3 2V6H7M0 8H10M9 0V9" className="ss-cell-metal"/>
      <path d="M2 4H5V1" className="ss-cell-gate"/>
    </pattern></defs>
    {index === 0 && <g className="ss-rtl-layout">
      <rect width="150" height="160" fill={`url(#${cells})`}/>
      {[0, 1, 2, 3].map(bank => <rect key={bank} x={4 + bank % 2 * 73} y={4 + Math.floor(bank / 2) * 78} width="68" height="73" className="ss-cell-bank"/>)}
      {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${3 + i % 3 * 2} ${7 + i * 6.8}H${18 + i * 17 % 112}V${8 + i * 13 % 143}H147`} className={`ss-local-metal ss-local-metal-${i % 3}`}/>)}
      {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${10 + i * 16} 2V158`} className="ss-local-rail"/>)}
      <path d="M8 27H44V46H102V19H142M9 129H48V111H96V145H141" className="ss-micro-pulse" pathLength="100"/>
    </g>}
    {index === 1 && <g className="ss-verification-layout">
      <rect width="150" height="160" fill={`url(#${cells})`} opacity=".45"/>
      <rect x="5" y="5" width="140" height="57" rx="2" className="ss-instrument-screen"/>
      <g className="ss-logic-waves">
        <path d="M11 20H33V10H49V20H70V10H87V20H109V10H126V20H140"/>
        <path d="M11 38H24V28H43V38H61V28H77V38H97V28H117V38H140"/>
        <path d="M11 55H39V45H51V55H73V45H87V55H111V45H123V55H140"/>
      </g>
      <path d="M18 67V150M27 67V150M36 67V150" className="ss-local-rail"/>
      {Array.from({ length: 42 }, (_, i) => <rect key={i} x={47 + i % 7 * 13} y={105 + Math.floor(i / 7) * 8} width="9" height="5" className={i % 8 === 0 ? 'ss-assertion-pass' : 'ss-assertion-cell'}/>)}
      <path d="M8 145H39V99H139V66" className="ss-micro-pulse" pathLength="100"/>
    </g>}
    {index === 2 && <g className="ss-analog-layout">
      <rect width="150" height="65" fill={`url(#${cells})`} opacity=".8"/>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${6 + i * 12} 3V${20 + i % 3 * 12}H${13 + i * 11}V64`} className={`ss-local-metal ss-local-metal-${i % 3}`}/>)}
      <rect x="4" y="99" width="142" height="57" className="ss-analog-field"/>
      <g className="ss-analog-symbols">
        <path d="M21 105L21 141L55 123ZM6 114H21M6 133H21M55 123H69M68 114V132M74 114V132M74 123H88"/>
        <path d="M27 143H33L36 138L41 148L46 138L51 148L56 143H67"/>
        <path d="M25 114H33M29 110V118M25 133H33"/>
        <path className="ss-inductor" d="M95 151V104H143V151H95M101 145H137V110H101V145M107 139V116H131V139H107M113 133H125V122H113V133"/>
      </g>
      <path d="M9 149V94H84V123H90" className="ss-micro-pulse" pathLength="100"/>
    </g>}
    {index === 3 && <g className="ss-eda-layout">
      <rect width="150" height="160" fill={`url(#${cells})`} opacity=".28"/>
      <g className="ss-eda-routes">
        <path d="M8 15H39V42H69V13H108V29H142M9 35H28V56H88V44H134V13M12 151V101H35V119H68V97H91V153M7 137H45V101H73V133H91M26 154V142H59V114H80"/>
        <path d="M13 22H20M34 48V60M77 12V30M116 22H137M15 111H42M38 127H59M51 149H72"/>
      </g>
      {[[8, 7, 34, 12], [49, 14, 21, 14], [99, 42, 40, 15], [8, 103, 22, 15], [48, 116, 25, 17]].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} className="ss-tool-macro"/>)}
      <rect x="100" y="107" width="44" height="44" rx="1" className="ss-pin-matrix"/>
      {Array.from({ length: 25 }, (_, i) => <g key={i}><circle cx={105 + i % 5 * 8.5} cy={112 + Math.floor(i / 5) * 8.5} r="1.6" className="ss-tool-via"/><path d={`M${105 + i % 5 * 8.5} ${112 + Math.floor(i / 5) * 8.5}h4v3`} className="ss-cell-metal"/></g>)}
      <path d="M9 21H39V48H88V21H139M14 149V103H68V136H91" className="ss-micro-pulse" pathLength="100"/>
    </g>}
  </svg>;
}

function ProofArt({ id }) {
  const alu = id === 'floating-point-alu';
  return <svg className="ss-proof-art" viewBox="0 0 164 90" aria-hidden="true">
    {alu ? <><path d="M65 16L112 33V58L65 75V52L75 45L65 38Z" className="ss-art-box"/><path d="M12 29H65M12 61H65M112 45H153" className="ss-art-wire"/><text x="18" y="23">A</text><text x="18" y="76">B</text><text x="90" y="48" textAnchor="middle">FP32</text></>
      : id === 'aes-256' ? <>{['SB', 'SR', 'MC', 'AK'].map((label, i) => <g key={label}><rect x={8 + i * 39} y="31" width="31" height="27" rx="3" className="ss-art-box"/><text x={23.5 + i * 39} y="48" textAnchor="middle">{label}</text>{i < 3 && <path d={`M${39 + i * 39} 44h8`} className="ss-art-wire"/>}</g>)}<path d="M140 58V73H24V58" className="ss-art-wire"/></>
      : id === 'tiny-mnist' ? <>{[26, 82, 138].map((x, layer) => <g key={x}>{[24, 45, 66].map(y => <g key={y}>{layer < 2 && <path d={`M${x} ${y}L${x + 56} 24M${x} ${y}L${x + 56} 45M${x} ${y}L${x + 56} 66`} className="ss-art-wire"/>}<circle cx={x} cy={y} r="5" className="ss-art-box"/></g>)}</g>)}</>
      : <><rect x="52" y="23" width="59" height="44" rx="4" className="ss-art-box"/><path d="M13 20H30V34H52M13 71H36V55H52M111 34H138V20H153M111 56H129V72H153" className="ss-art-wire"/><text x="81" y="49" textAnchor="middle">{id === 'pcb-studies' ? 'PCB' : 'PWM'}</text></>}
  </svg>;
}

export function Skills({ onOpen }) {
  const { t, lang, text } = usePortfolio();
  const [sel, setSel] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduced = useReducedMotion();
  const root = useRef(null);
  const panelId = useId();
  const vi = lang === 'vi';
  const items = (s) => (lang === 'vi' ? s.vi : s.items);
  const cur = skills[sel];
  const evidence = PROOFS[sel].map(id => projects.find(project => project.id === id)).filter(Boolean);
  useEffect(() => {
    let offscreen = false;
    const sync = () => setHidden(offscreen || document.hidden);
    const observer = new IntersectionObserver(([entry]) => { offscreen = !entry.isIntersecting; sync(); });
    observer.observe(root.current);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);
  return <section ref={root} id="skills" className={`section skills-section skills-silicon ${paused || hidden || reduced ? 'ss-quiet' : ''}`} aria-label={t.nav[1]}><div className="section-shell">
    <Reveal><SectionHeading number="02" label={t.skillsLabel} title={vi ? <>Kỹ năng trên <span className="text-accent">bản đồ silicon.</span></> : <>Skills, <span className="text-accent">mapped to silicon.</span></>} description={vi ? 'Chọn một khối. Khám phá kỹ năng và các dự án đã áp dụng.' : 'Explore a block. See the projects behind it.'}/></Reveal>
    <Reveal><div className="ss-layout">
      <div className="ss-map">
        <div className="ss-map-label"><span>TDV / SKILL MAP</span><span>4 MACROS</span></div>
        <div className="ss-chip" role="group" aria-label={vi ? 'Chọn nhóm kỹ năng' : 'Select a skill group'}>
          <svg className="ss-chip-routing" viewBox="0 0 420 420" aria-hidden="true">
            <rect x="7" y="7" width="406" height="406" rx="12" className="ss-die-outline"/>
            <g className="ss-backplane">{backplane.map((d, i) => <path key={i} d={d} className={`ss-metal-layer-${i % 3}`}/>)}</g>
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={23 + i * 2.4} y={23 + i * 2.4} width={374 - i * 4.8} height={374 - i * 4.8} rx={12 - i} className="ss-edge-bus"/>)}
            {[0, 1, 2, 3].map(side => <g key={side}>{Array.from({ length: 18 }, (_, i) => <rect key={i} x={side < 2 ? 24 + i * 21 : side === 2 ? 9 : 399} y={side >= 2 ? 24 + i * 21 : side === 0 ? 9 : 399} width={side < 2 ? 14 : 12} height={side < 2 ? 12 : 14} className="ss-pad"/>)}</g>)}
            <path d="M210 23V397M23 210H397M200 23V200H23M220 397V220H397" className="ss-route-base"/>
            {netPaths.map((d, i) => <g key={d} className={sel === i ? 'ss-net-active' : 'ss-net'}>{Array.from({ length: sel === i ? 5 : 2 }, (_, line) => <path key={line} d={d} transform={`translate(${(line - 2) * 2.5} ${(line - 2) * 2.5})`} className="ss-route"/>)}<path d={d} className="ss-route-packet" pathLength="100"/></g>)}
            <rect x="198" y="198" width="24" height="24" rx="3" className="ss-hub"/>
            <rect x="204" y="204" width="12" height="12" className="ss-hub-core"/>
          </svg>
          <div className="ss-macros">{skills.map((skill, i) => <button key={skill.number} type="button" className={`ss-macro ${sel === i ? 'ss-selected' : ''}`} aria-pressed={sel === i} aria-controls={panelId} aria-label={skill.title} onPointerEnter={event => { if (event.pointerType !== 'touch') setSel(i); }} onFocus={() => setSel(i)} onClick={() => setSel(i)}>
            <span className="ss-cells" aria-hidden="true"><MacroLayout index={i}/></span>
            <span className="ss-macro-label">{LABELS[i]}</span>
          </button>)}</div>
        </div>
        <div className="ss-map-footer"><span>{vi ? 'Chạm hoặc rê vào một khối' : 'Hover or tap a macro'}</span><button type="button" aria-pressed={paused} disabled={reduced} onClick={() => setPaused(value => !value)}>{reduced ? (vi ? 'Giảm chuyển động' : 'Reduced motion') : paused ? (vi ? 'Tiếp tục' : 'Resume') : (vi ? 'Tạm dừng' : 'Pause')}</button></div>
      </div>
      <div className="ss-inspector" id={panelId}>
        <div className="ss-inspector-heading"><span className="ss-heading-icon"><Icon name={cur.icon} size={34}/></span><div><span className="ss-instance">{INST[sel]}</span><h3>{cur.title}</h3></div></div>
        <p className="sr-only" role="status">{vi ? 'Đang chọn' : 'Selected'}: {cur.title}</p>
        <ul className="ss-skill-list">{items(cur).map(item => <li key={item}>{item}</li>)}</ul>
        <div className="ss-evidence"><h4>{vi ? 'Đã áp dụng trong các dự án' : 'Used in these projects'}</h4>
          <div className="ss-proof-grid">{evidence.map(project => <a className="ss-proof" key={project.id} href={`#project/${project.id}`} onClick={event => { if (!onOpen || event.ctrlKey || event.metaKey || event.shiftKey || event.button) return; event.preventDefault(); onOpen(project.id); }} aria-label={`${t.caseStudy}: ${text(project.title)}`}>
            <ProofArt id={project.id}/><span className="ss-proof-copy"><span className="ss-proof-category">{project.category}</span><strong>{text(project.title)}</strong><span className="ss-proof-action">{vi ? 'Xem dự án' : 'View project'}</span></span>
          </a>)}</div>
        </div>
      </div>
    </div></Reveal>
    <div className="ss-learning"><span>{t.learning}</span><ul>{['UVM', 'Coverage-driven verification', 'CDC', 'Timing closure'].map(topic => <li key={topic}>{topic}</li>)}</ul></div>
  </div></section>;
}
