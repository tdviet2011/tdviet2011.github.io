import { useEffect, useRef, useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { Icon } from './Icon';
import { fireBeam } from './dataBeam';

const anchors = ['about', 'skills', 'projects', 'research', 'education', 'contact'];
export function Header() {
  const { lang, setLang, theme, setTheme, t } = usePortfolio();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const menuButton = useRef(null);
  const header = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id === 'home' ? '' : entry.target.id); });
    }, { rootMargin: '-15% 0px -65% 0px' });
    ['home', ...anchors].forEach(id => { const element = document.getElementById(id); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const keydown = e => { if (e.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    const outside = e => { if (!header.current?.contains(e.target)) setMenuOpen(false); };
    const resize = () => { if (innerWidth > 1000) setMenuOpen(false); };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => { document.removeEventListener('keydown', keydown); document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize); };
  }, [menuOpen]);
  return <header className="site-header" ref={header}>
    <div className="header-inner section-shell">
      <a href="#home" className="brand" aria-label="Thân Đức Việt — home" onClick={() => setMenuOpen(false)}><span className="brand-icon"><Icon name="chip" size={23}/></span><span>TV<span className="brand-divider">/</span><span className="brand-rtl">RTL</span><span className="brand-dot">.</span></span></a>
      <nav id="main-nav" aria-label={lang === 'vi' ? 'Điều hướng chính' : 'Main navigation'} className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
        {anchors.map((id, i) => <a key={id} href={`#${id}`} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={e => { e.preventDefault(); setMenuOpen(false); const link = e.currentTarget; fireBeam(link, () => { const section = document.getElementById(id); if (!section) return; history.replaceState(null, '', `#${id}`); section.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); setTimeout(() => fireBeam(section.querySelector('.section-heading, h2') || section, null, { delay: 0 }), 750); }, { delay: 380 }); }}>{t.nav[i]}</a>)}
      </nav>
      <div className="header-controls">
        <div className="language-toggle" role="group" aria-label={t.language}>{['en', 'vi'].map(code => <button key={code} aria-pressed={lang === code} onClick={() => setLang(code)} className={lang === code ? 'selected' : ''}>{code.toUpperCase()}</button>)}</div>
        <span className="control-divider"/>
        <button className="icon-button theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? t.theme : t.darkTheme} title={theme === 'dark' ? t.theme : t.darkTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18}/></button>
        <button className="icon-button menu-toggle" aria-label={menuOpen ? t.closeMenu : t.menu} aria-expanded={menuOpen} aria-controls="main-nav" ref={menuButton} onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'}/></button>
      </div>
    </div>
  </header>;
}
