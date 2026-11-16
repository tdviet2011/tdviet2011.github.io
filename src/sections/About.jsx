import { usePortfolio } from '../hooks/usePortfolio';
import { profile } from '../data/profile';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Icon } from '../components/Icon';

export function About() {
  const { t, lang } = usePortfolio();
  return <section id="about" className="section section-shell about-section" aria-labelledby="about-title"><Reveal><div className="about-grid">
    <div className="identity-panel"><div className="identity-top"><Icon name="chip" size={18}/><span>THAN_DUC_VIET</span><span className="identity-mark">01</span></div><div className="avatar-frame"><img src={`${import.meta.env.BASE_URL}img/avatar.webp`} alt={t.portraitAlt} width="240" height="240"/><span className="monogram-corner top-left"/><span className="monogram-corner bottom-right"/></div><div className="identity-caption"><span>{t.portraitNote}</span><strong>{profile.school} / 2024—2028</strong></div><div className="identity-stats"><div><strong>{profile.gpa}<small>/4</small></strong><span>{t.gpaLabel}</span></div><div><strong>{profile.graduation}</strong><span>{t.graduationLabel}</span></div></div><p className="gpa-note">{t.gpaNote}</p></div>
    <div className="about-copy"><SectionHeading number="01" label={t.aboutLabel} title={t.aboutTitle} accent={t.aboutAccent}/><div id="about-title" className="sr-only">{t.nav[0]}</div><p className="about-lead">{t.aboutP1}</p><p>{t.aboutP2}</p><p>{t.aboutP3}</p><div className="about-signature"><span className="signature">Thân Đức Việt</span><span className="eyebrow">{lang === 'vi' ? 'THIẾT KẾ RTL / FPGA' : 'RTL DESIGN / FPGA'}</span></div></div>
  </div></Reveal></section>;
}
