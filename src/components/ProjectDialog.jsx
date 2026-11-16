import { useEffect, useRef } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { diagrams } from '../data/diagrams';
import { BlockDiagram } from './BlockDiagram';
import { Icon } from './Icon';

const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

function Section({ n, title, children }) {
  return <section className="case-section"><span className="case-section-number">{String(n).padStart(2, '0')}</span><div className="case-body"><h3>{title}</h3>{children}</div></section>;
}

export function ProjectDialog({ project, onClose }) {
  const { t, text, lang } = usePortfolio();
  const dialog = useRef(null);
  const closeButton = useRef(null);
  useEffect(() => {
    if (!project) return;
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const element = dialog.current;
    element.showModal();
    element.scrollTop = 0;
    closeButton.current?.focus();
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = oldOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [project?.id]);
  if (!project) return null;
  const spec = project.diagram && diagrams[project.diagram];
  let n = 0;
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-dialog-title" aria-describedby="project-dialog-intro" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose(); } }}>
    <div className="dialog-toolbar"><span>{project.number} / {t.dialogHint}</span><button ref={closeButton} className="icon-button" aria-label={t.closeProject} onClick={onClose}><Icon name="close"/></button></div>
    <div className="dialog-content">
      <p className="eyebrow">{project.category}</p>
      <h2 id="project-dialog-title">{text(project.title)}</h2>
      <p id="project-dialog-intro" className="dialog-intro">{text(project.description)}</p>
      <div className="tag-list">{project.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
      {project.role && <p className="case-role"><span className="eyebrow">{t.role}</span>{text(project.role)}</p>}

      {spec && <figure className="architecture-figure">
        <div className="figure-scroll"><BlockDiagram spec={spec} lang={lang}/></div>
        <figcaption><span>{t.diagramLabel}</span><span className="scroll-hint">{t.scrollHint}</span></figcaption>
      </figure>}

      <div className="dialog-sections">
        <Section n={++n} title={t.overview}><p>{text(project.problem)}</p></Section>
        <Section n={++n} title={t.architecture}><p>{text(project.architecture)}</p></Section>
        {project.decisions?.length > 0 && <Section n={++n} title={t.decisions}><ul className="decision-list">{project.decisions.map((d, i) => <li key={i}>{text(d)}</li>)}</ul></Section>}
        <Section n={++n} title={t.verification}><p>{text(project.verification)}</p>
          {project.table && <div className="case-table-wrap"><table className="case-table"><caption>{text(project.table.caption)}</caption><thead><tr>{project.table.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{project.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
        </Section>
      </div>

      {project.extension && (() => { const x = project.extension; const xs = diagrams[x.diagram]; return <section className="case-extension">
        <p className="eyebrow">{t.extensionLabel}</p>
        <h3 className="extension-title">{text(x.title)}</h3>
        <p>{text(x.problem)}</p>
        {xs && <figure className="architecture-figure"><div className="figure-scroll"><BlockDiagram spec={xs} lang={lang}/></div><figcaption><span>{t.diagramLabel}</span><span className="scroll-hint">{t.scrollHint}</span></figcaption></figure>}
        <h4>{t.architecture}</h4><p>{text(x.architecture)}</p>
        {x.decisions?.length > 0 && <><h4>{t.decisions}</h4><ul className="decision-list">{x.decisions.map((d, i) => <li key={i}>{text(d)}</li>)}</ul></>}
        <h4>{t.verification}</h4><p>{text(x.verification)}</p>
        {x.table && <div className="case-table-wrap"><table className="case-table"><caption>{text(x.table.caption)}</caption><thead><tr>{x.table.head.map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{x.table.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>}
        <div className="result-grid extension-results">{x.results.map(r => <div key={r.value}><strong>{r.value}</strong><span>{text(r.label)}</span></div>)}</div>
        {x.limits && <p className="extension-note"><strong>{t.limits}: </strong>{text(x.limits)}</p>}
        {x.evidence && <p className="evidence-note">{text(x.evidence)}</p>}
      </section>; })()}

      {project.figures?.length > 0 && <section className="case-figures"><h3>{t.figures}</h3>
        {project.figures.map(f => <figure key={f.src} className={`case-figure case-figure-${f.kind}`}>
          <div className={f.kind === 'wave' ? 'figure-scroll wave-scroll' : 'chart-frame'}><img src={asset(f.src)} alt={text(f.caption)} loading="lazy" decoding="async"/></div>
          <figcaption>{text(f.caption)}</figcaption>
        </figure>)}
      </section>}

      <section className="case-results"><h3>{t.results}</h3><div className="result-grid">{project.results.map(result => <div key={result.value}><strong>{result.value}</strong><span>{text(result.label)}</span></div>)}</div>{project.evidence && <p className="evidence-note">{text(project.evidence)}</p>}</section>
      {project.limits && <section className="case-limit"><h3>{t.limits}</h3><p>{text(project.limits)}</p></section>}
      {project.credit && <section className="case-credit"><h3>{t.credit}</h3><p>{text(project.credit)}</p></section>}
      <div className="dialog-links"><span className="eyebrow">{t.links}</span><div className="dialog-link-row">{project.links.map(link => <a className="button button-secondary" key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"><Icon name={link.kind === 'github' ? 'github' : 'diagonal'} size={18}/>{text(link.label)}<Icon name="diagonal" size={16}/></a>)}</div></div>
    </div>
  </dialog>;
}
