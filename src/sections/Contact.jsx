import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { profile } from '../data/profile';
import { Icon } from '../components/Icon';
import { Reveal } from '../components/Reveal';

export function Contact() {
  const { t } = usePortfolio();
  const [status,setStatus] = useState('');
  const timer = useRef();
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  async function copy() {
    clearTimeout(timer.current);
    try { await navigator.clipboard.writeText(profile.email); setStatus('copied'); }
    catch { setStatus('copyFailed'); }
    timer.current = setTimeout(()=>setStatus(''),5000);
  }
  return <><section id="contact" className="contact-section section-shell" aria-labelledby="contact-title"><Reveal><div className="contact-inner cta-panel"><svg className="cta-traces" viewBox="0 0 600 260" aria-hidden="true" preserveAspectRatio="xMaxYMax slice"><g fill="none" strokeWidth="1.4">{[[0, '#b28bff'], [22, '#4fe3ff'], [44, '#e15bff'], [66, '#b28bff'], [88, '#4fe3ff']].map(([o, c], i) => <g key={i}><path d={`M600 ${40 + o}H${430 - o}L${330 - o} ${140 + o}H${140 - o * 1.4}`} stroke={c} opacity=".35"/><path d={`M600 ${40 + o}H${430 - o}L${330 - o} ${140 + o}H${140 - o * 1.4}`} stroke={c} className="cta-pulse" pathLength="100" style={{ animationDelay: `${-i * .7}s` }}/><circle cx={140 - o * 1.4} cy={140 + o} r="3" stroke={c} opacity=".7"/></g>)}</g></svg><div className="contact-overline"><span className="status-dot"/><span>{t.contactLabel}</span><span className="contact-index">06 / CONTACT</span></div><h2 id="contact-title">{t.contactTitle}<br/><span>{t.contactAccent}</span></h2><div className="contact-grid"><div><p className="contact-description">{t.contactDescription}</p><div className="contact-email-row"><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<Icon name="diagonal" size={26}/></a><button className="icon-button copy-button" onClick={copy} aria-label={t.copy} title={t.copy}><Icon name={status==='copied'?'tick':'copy'} size={20}/></button></div><p className="copy-status" role="status">{status?t[status]:'\u00a0'}</p></div><aside className="contact-card"><p className="eyebrow">{t.contactCardTitle}</p><dl><div><dt>{t.lookingFor}</dt><dd>{t.lookingValue}</dd></div><div><dt>{t.basedIn}</dt><dd>{t.basedValue}</dd></div></dl><div className="contact-card-links"><a href={`${import.meta.env.BASE_URL}${profile.cv}`} download><Icon name="download" size={18}/>{t.downloadCv}</a><a href={profile.github} target="_blank" rel="noopener noreferrer"><Icon name="github" size={18}/>github.com/tdviet2011<Icon name="diagonal" size={14}/></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={18}/>LinkedIn<Icon name="diagonal" size={14}/></a></div></aside></div><div className="contact-bottom cta-row"><a className="button button-primary" href={`mailto:${profile.email}`}><Icon name="mail" size={18}/>{t.emailMe}<Icon name="diagonal" size={16}/></a><span className="cta-sep" aria-hidden="true"/><a className="cta-link" href={profile.github} target="_blank" rel="noopener noreferrer"><Icon name="github" size={20}/>GitHub<Icon name="diagonal" size={14}/></a><a className="cta-link" href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={20}/>LinkedIn<Icon name="diagonal" size={14}/></a></div></div></Reveal></section><footer className="site-footer section-shell"><a href="#home" className="footer-wordmark">TV<span>/</span>RTL</a><p>© {new Date().getFullYear()} Thân Đức Việt.<span>{t.footer}</span></p><a href="#home" className="back-top" aria-label={t.backToTop}><Icon name="arrow" size={18}/></a></footer></>;
}
