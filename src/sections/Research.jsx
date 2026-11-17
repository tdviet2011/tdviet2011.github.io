import { usePortfolio } from '../hooks/usePortfolio';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/Icon';

export function Research({ onOpen }) {
  const { t } = usePortfolio();
  return <section id="research" className="section research-section" aria-label={t.nav[3]}><div className="section-shell"><Reveal><SectionHeading number="04" label={t.researchLabel} title={t.researchTitle} description={t.researchDescription}/></Reveal><div className="research-grid"><Reveal><article className="research-primary"><div className="research-top"><Icon name="book" size={22}/><span className="eyebrow">{t.technicalStudy}</span></div><h3>{t.research1Title}</h3><p>{t.research1Body}</p><div className="tag-list">{t.research1Tags.map(tag=><span key={tag} className="tag">{tag}</span>)}</div><div className="proof-row">{t.research1Proof.map(([v,l])=><div key={l}><strong>{v}</strong><span>{l}</span></div>)}</div></article></Reveal><Reveal><article className="research-secondary"><div className="tradeoff-art" aria-hidden="true"><span>AREA</span><div className="tradeoff-axis"><i/><i/><i/><i/><i/></div><span>LATENCY</span></div><span className="eyebrow">{t.designThinking}</span><h3>{t.research2Title}</h3><p>{t.research2Body}</p><span className="research-foot">{t.research2Foot}</span></article></Reveal></div></div></section>;
}
