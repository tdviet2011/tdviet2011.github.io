import { usePortfolio } from '../hooks/usePortfolio';
import { Icon } from './Icon';
import { ProjectArtwork } from './Artwork';

export function ProjectCard({ project, onOpen, wide = false }) {
  const { t, text } = usePortfolio();
  return <article className={`project-card ${wide ? 'project-wide' : ''}`}>
    <div className="project-visual"><ProjectArtwork kind={project.art}/><span className="visual-index">{project.number} / {project.category}</span><span className="visual-caption">{t.artworkCaption}</span></div>
    <div className="project-copy">
      <p className="eyebrow">{text(project.eyebrow)}</p>
      <h3>{text(project.title)}</h3>
      {wide && <p className="project-hook">{text(project.summary)}</p>}
      <p className="project-description">{text(project.description)}</p>
      <div className="tag-list">{project.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
      <div className="project-card-bottom">
        <div className="project-metric"><strong>{project.metric.value}</strong><span>{text(project.metric.label)}</span><small>{text(project.metric.context)}</small></div>
        <button className="round-arrow" aria-label={`${t.caseStudy}: ${text(project.title)}`} onClick={() => onOpen(project.id)}><Icon name="diagonal" size={22}/></button>
      </div>
    </div>
  </article>;
}
