import { usePortfolio } from '../hooks/usePortfolio';
import { profile, timeline } from '../data/profile';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/Icon';
import { Roadmap } from '../components/Roadmap';

export function Education({ onOpen }) {
  const { t, text } = usePortfolio();
  return <section id="education" className="section section-shell education-section" aria-label={t.nav[4]}><Reveal><SectionHeading number="05" label={t.educationLabel} title={t.educationTitle}/></Reveal><Reveal><Roadmap onOpen={onOpen}/></Reveal><div className="education-grid v2"><Reveal><div className="education-card edu-glow"><div className="university-symbol" aria-hidden="true"><Icon name="cap" size={38}/></div><span className="eyebrow">2024 — 2028</span><h3>{t.degree}</h3><p>{t.school}</p><div className="education-detail"><strong>{profile.gpa}<span>/ 4.00</span></strong><span>{t.gpaLabel}</span></div><p className="education-note">{t.gpaNote}</p><div className="course-grades"><span className="eyebrow">{t.coursesLabel}</span><ul>{t.courses.map(([name,grade])=><li key={name}><Icon name="check" size={16}/><span>{name}</span><strong>{grade}<small>/10</small></strong></li>)}</ul></div></div></Reveal></div></section>;
}
