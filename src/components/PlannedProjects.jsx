import { usePortfolio } from '../hooks/usePortfolio';
import { projects } from '../data/projects';
import { fireBeam } from './dataBeam';

const levels = {
  1: { en: 'Level 1 · Solid foundations', vi: 'Cấp 1 · Làm tròn nền tảng' },
  2: { en: 'Level 2 · RTL portfolio', vi: 'Cấp 2 · Portfolio cho RTL' },
  3: { en: 'Level 3 · DV portfolio', vi: 'Cấp 3 · Portfolio cho DV' },
  4: { en: 'Level 4 · Advanced', vi: 'Cấp 4 · Nâng cao' },
};
const status = {
  done: { en: 'Built', vi: 'Đã làm' },
  planned: { en: 'Planned', vi: 'Kế hoạch' },
};

// The study plan behind the portfolio. Built items open their case study; the rest are
// labelled as plans so nobody reads them as finished work.
export function PlannedProjects({ items, onOpen }) {
  const { text, lang } = usePortfolio();
  const vi = lang === 'vi';
  const title = (id) => { const p = projects.find(x => x.id === id); return p ? text(p.title) : ''; };
  return <div className="plan-work">
    <div className="supporting-heading">
      <h3>{vi ? 'Lộ trình dự án' : 'Project roadmap'}</h3>
      <p>{vi ? '20 dự án trong kế hoạch tự học RTL/DV của tôi. Chỉ dự án ghi “Đã làm” là đã hoàn thành; còn lại là kế hoạch.' : '20 projects from my RTL/DV study plan. Only items marked “Built” are finished; the rest are plans.'}</p>
    </div>
    {[1, 2, 3, 4].map(lv => <section className="plan-level" key={lv} aria-label={text(levels[lv])}>
      <h4>{text(levels[lv])}</h4>
      <ul className="plan-list">{items.filter(i => i.level === lv).map(i => <li className={`plan-item plan-${i.status}`} key={i.id}>
        <div className="plan-head"><strong>{text(i.title)}</strong><span className="plan-kind">{i.kind === 'Cả hai' ? (vi ? 'RTL + DV' : 'RTL + DV') : i.kind}</span><span className={`plan-status plan-status-${i.status}`}>{text(status[i.status])}</span></div>
        <p>{text(i.why)}</p>
        {i.project && <button className="plan-link" onClick={e => fireBeam(e.currentTarget, () => onOpen(i.project))}>{i.status === 'done' ? (vi ? 'Xem chi tiết' : 'View case study') : (vi ? 'Liên quan: ' : 'Related: ') + title(i.project)}</button>}
      </li>)}</ul>
    </section>)}
  </div>;
}
