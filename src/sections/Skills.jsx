import { usePortfolio } from '../hooks/usePortfolio';
import { skills } from '../data/profile';
import { SectionHeading } from '../components/SectionHeading';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';

export function Skills() {
  const { t, lang } = usePortfolio();
  return <section id="skills" className="section skills-section" aria-label={t.nav[1]}><div className="section-shell"><Reveal><SectionHeading number="02" label={t.skillsLabel} title={t.skillsTitle} description={t.skillsDescription}/></Reveal><div className="skills-grid">{skills.map(skill => <Reveal key={skill.number}><article className="skill-card"><div className="skill-card-top"><span className="skill-icon"><Icon name={skill.icon} size={22}/></span><span className="eyebrow">{skill.number}</span></div><h3>{skill.title}</h3><ul>{(lang === 'vi' ? skill.vi : skill.items).map(item => <li key={item}>{item}</li>)}</ul></article></Reveal>)}</div><div className="learning-line"><span className="learning-label"><span className="status-dot"/>{t.learning}</span><span>UVM</span><span>Coverage-driven verification</span><span>CDC</span><span>Timing closure</span></div></div></section>;
}
