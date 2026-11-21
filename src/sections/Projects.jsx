import { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { projects } from '../data/projects';
import { ProjectCard } from '../components/ProjectCard';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/Icon';
import { fireBeam } from '../components/dataBeam';
import { plannedProjects } from '../data/planned';
import { PlannedProjects } from '../components/PlannedProjects';

export function Projects({ onOpen }) {
  const { t, text, lang } = usePortfolio();
  const [filter,setFilter] = useState('all');
  const filtered = projects.filter(p => filter === 'all' || p.filters.includes(filter));
  const featured = filtered.filter(p => p.featured);
  const supporting = filtered.filter(p => !p.featured);
  const filters = [['all',lang==='vi'?'Tất cả':'All projects'],['rtl','RTL & FPGA'],['verification','Verification'],['other',lang==='vi'?'Ngoài RTL':'Beyond RTL']];
  return <section id="projects" className="section section-shell projects-section" aria-label={t.nav[2]}>
    <Reveal><SectionHeading number="03" label={t.projectsLabel} title={t.projectsTitle} accent={t.projectsAccent} description={t.projectsDescription}><span className="section-count">{String(projects.filter(p=>p.featured).length).padStart(2,'0')}<span>{t.featuredCount}</span></span></SectionHeading></Reveal>
    <div className="project-filters" role="group" aria-label={t.filterLabel}>{filters.map(([key,label])=><button key={key} aria-pressed={filter===key} className={filter===key?'selected':''} onClick={()=>setFilter(key)}>{label}{filter===key && <span className="filter-dot"/>}</button>)}</div>
    <p className="sr-only" role="status">{filtered.length} {t.resultCount}</p>
    {featured.length>0 && <div className="featured-grid">{featured.map(p=>{ const wide = p.id==='aes-256' || p.id==='qc-ldpc'; return <Reveal key={p.id} className={wide?'wide-reveal':''}><ProjectCard project={p} onOpen={onOpen} wide={wide} flip={p.id==='qc-ldpc'}/></Reveal>; })}</div>}
    {supporting.length>0 && <div className="supporting-work"><div className="supporting-heading"><h3>{t.supporting}</h3><p>{t.supportingDesc}</p></div><div className="supporting-list">{supporting.map(p=><button className="supporting-row" key={p.id} onClick={e=>fireBeam(e.currentTarget,()=>onOpen(p.id))}><span className="supporting-number">{p.number}</span><span className="supporting-text"><strong>{text(p.title)}</strong><span>{text(p.description)}</span></span><span className="supporting-tags">{p.tags.slice(0,2).map(tag=><span className="tag" key={tag}>{tag}</span>)}</span><span className="supporting-arrow"><Icon name="diagonal" size={20}/></span></button>)}</div></div>}
    {filter==='all' && <PlannedProjects items={plannedProjects} onOpen={onOpen}/>}
  </section>;
}
