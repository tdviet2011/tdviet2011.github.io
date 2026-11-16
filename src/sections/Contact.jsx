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
  return <><section id="contact" className="contact-section section-shell" aria-labelledby="contact-title"><Reveal><div className="contact-inner"><div className="contact-overline"><span className="status-dot"/><span>{t.contactLabel}</span><span className="contact-index">06 / CONTACT</span></div><h2 id="contact-title">{t.contactTitle}<br/><span>{t.contactAccent}</span></h2><p className="contact-description">{t.contactDescription}</p><div className="contact-email-row"><a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<Icon name="diagonal" size={26}/></a><button className="icon-button copy-button" onClick={copy} aria-label={t.copy} title={t.copy}><Icon name={status==='copied'?'tick':'copy'} size={20}/></button></div><p className="copy-status" role="status">{status?t[status]:'\u00a0'}</p><div className="contact-bottom"><a className="button button-primary" href={`mailto:${profile.email}`}><Icon name="mail" size={18}/>{t.emailMe}<Icon name="diagonal" size={16}/></a><div className="social-links"><a href={profile.github} target="_blank" rel="noopener noreferrer"><Icon name="github" size={18}/>GitHub<Icon name="diagonal" size={14}/></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Icon name="linkedin" size={18}/>LinkedIn<Icon name="diagonal" size={14}/></a></div></div></div></Reveal></section><footer className="site-footer section-shell"><a href="#home" className="footer-wordmark">TV<span>/</span>RTL</a><p>© {new Date().getFullYear()} Thân Đức Việt.<span>{t.footer}</span></p><a href="#home" className="back-top" aria-label={t.backToTop}><Icon name="arrow" size={18}/></a></footer></>;
}
