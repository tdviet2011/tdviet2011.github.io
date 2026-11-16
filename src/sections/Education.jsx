import { usePortfolio } from '../hooks/usePortfolio';
import { profile, timeline } from '../data/profile';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/Icon';

export function Education() {
  const { t, text } = usePortfolio();
  return <section id="education" className="section section-shell education-section" aria-label={t.nav[4]}><Reveal><SectionHeading number="05" label={t.educationLabel} title={t.educationTitle}/></Reveal><div className="education-grid"><Reveal><div className="education-card"><div className="university-symbol" aria-hidden="true"><Icon name="chip" size={36}/></div><span className="eyebrow">2024 — 2028</span><h3>{t.degree}</h3><p>{t.school}</p><div className="education-detail"><strong>{profile.gpa}<span>/ 4.00</span></strong><span>{t.gpaLabel}</span></div><p className="education-note">{t.gpaNote}</p><div className="course-note"><Icon name="check" size={19}/><span>{t.courseNote}</span></div></div></Reveal><ol className="timeline">{timeline.map((item,i)=><li key={i} className={item.current?'current':''}><Reveal><div className="timeline-dot"/><span className="timeline-date">{text(item.date)}</span><h3>{text(item.title)}</h3><p>{text(item.body)}</p></Reveal></li>)}</ol></div></section>;
}
