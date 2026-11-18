import { usePortfolio } from '../hooks/usePortfolio';
import { Icon } from './Icon';
import { fireBeam, chipFocus } from './dataBeam';
import { ProjectArtwork } from './Artwork';
import { BlockDiagram } from './BlockDiagram';
import { diagrams } from '../data/diagrams';

export function ProjectCard({ project, onOpen, wide = false, flip = false }) {
  const { t, text, lang } = usePortfolio();
  const spec = project.diagram && diagrams[project.diagram];
  return <article className={`project-card ${wide ? 'project-wide' : ''} ${flip ? 'project-flip' : ''}`} onMouseEnter={() => chipFocus(project.id)} onMouseLeave={() => chipFocus(null)} onClick={e => { if (e.target.closest('a')) return; fireBeam(e.currentTarget, () => onOpen(project.id), { from: project.id }); }}>
    <div className={`project-visual ${spec ? 'has-diagram' : ''}`}>{spec ? <div className="card-diagram"><BlockDiagram spec={spec} lang={lang}/></div> : <ProjectArtwork kind={project.art}/>}<span className="visual-index">{project.number} / {project.category}</span><span className="visual-caption">{spec ? t.diagramCaption : t.artworkCaption}</span></div>
    <div className="project-copy">
      <p className="eyebrow">{text(project.eyebrow)}</p>
      <h3>{text(project.title)}</h3>
      {wide && <p className="project-hook">{text(project.summary)}</p>}
      <p className="project-description">{text(project.description)}</p>
      <div className="tag-list">{project.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="project-card-bottom">
        <div className="project-metric"><strong>{project.metric.value}</strong><span>{text(project.metric.label)}</span><small>{text(project.metric.context)}</small></div>
        <button className="round-arrow" aria-label={`${t.caseStudy}: ${text(project.title)}`} onClick={e => { e.stopPropagation(); fireBeam(e.currentTarget.closest('.project-card'), () => onOpen(project.id), { from: project.id }); }}><Icon name="diagonal" size={22}/></button>
      </div>
    </div>
  </article>;
}
