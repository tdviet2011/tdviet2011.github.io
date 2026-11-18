import { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { skills } from '../data/profile';
import { SectionHeading } from '../components/SectionHeading';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';

// Skills drawn as a die floorplan: each skill group is a hard macro inside a pad ring.
const INST = ['U_RTL_DESIGN', 'U_VERIFY', 'U_EMBED_ANALOG', 'U_EDA_TOOLS'];

export function Skills() {
  const { t, lang } = usePortfolio();
  const [sel, setSel] = useState(0);
  const items = (s) => (lang === 'vi' ? s.vi : s.items);
  const cur = skills[sel];
  return <section id="skills" className="section skills-section" aria-label={t.nav[1]}><div className="section-shell">
    <Reveal><SectionHeading number="02" label={t.skillsLabel} title={t.skillsTitle} description={t.skillsDescription}/></Reveal>
    <Reveal><div className="floorplan">
      <div className="die-wrap">
        <div className="die-label"><span>DIE · tdviet_skills</span><span>{skills.length} MACROS · {skills.reduce((n, s) => n + s.items.length, 0)} CELLS</span></div>
        <div className="die" role="group" aria-label={t.skillsTitle}>
          {skills.map((s, i) => <button key={s.number} type="button" className={`skill-macro m${i} ${sel === i ? 'on' : ''}`} aria-pressed={sel === i}
            onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)}>
            <span className="macro-inst">{INST[i]}</span>
            <span className="macro-title">{s.title}</span>
            <span className="macro-cells" aria-hidden="true">{items(s).map((it, j) => <i key={j} className={it.length < 18 ? 'w' : ''}>{it.length < 18 ? it : ''}</i>)}</span>
          </button>)}
          <span className="die-route" aria-hidden="true"/>
        </div>
      </div>
      <div className="macro-panel" aria-live="polite">
        <div className="macro-panel-top"><span className="skill-icon"><Icon name={cur.icon} size={22}/></span><span className="eyebrow">{lang === 'vi' ? 'ĐANG CHỌN' : 'SELECTED'} · {INST[sel]}</span></div>
        <h3>{cur.title}</h3>
        <ul>{items(cur).map(it => <li key={it}>{it}</li>)}</ul>
        <p className="macro-hint">{lang === 'vi' ? 'Rê chuột hoặc chạm vào từng khối trên die để xem.' : 'Hover or tap a block on the die.'}</p>
      </div>
    </div></Reveal>
    <div className="learning-line"><span className="learning-label"><span className="status-dot"/>{t.learning}</span><span>UVM</span><span>Coverage-driven verification</span><span>CDC</span><span>Timing closure</span></div>
  </div></section>;
}
