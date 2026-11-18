import { useEffect, useState } from 'react';
import { usePortfolio, useReducedMotion } from '../hooks/usePortfolio';
import { profile } from '../data/profile';
import { HeroChip } from '../components/HeroChip';
import { goToProject, chipFocus } from '../components/dataBeam';
import { Icon } from '../components/Icon';

const words = ['Verilog & SystemVerilog', 'RTL verification', 'FPGA integration'];
function TypeLine() {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(words[0]);
  useEffect(() => {
    if (reduced) { setValue(words[0]); return; }
    let word = 0, index = words[0].length, deleting = true, timer;
    function tick() {
      if (deleting) {
        index--;
        setValue(words[word].slice(0, index));
        if (index === 0) { deleting = false; word = (word+1)%words.length; timer = setTimeout(tick, 350); }
        else timer = setTimeout(tick, 35);
      } else {
        index++;
        setValue(words[word].slice(0,index));
        if (index === words[word].length) { deleting = true; timer = setTimeout(tick, 2300); }
        else timer = setTimeout(tick, 65);
      }
    }
    timer = setTimeout(tick, 2800);
    return () => clearTimeout(timer);
  }, [reduced]);
  return <div className="typing-line"><span className="typing-prompt" aria-hidden="true">&gt;_</span><span aria-hidden="true">{value}<span className="typing-cursor">_</span></span><span className="sr-only">{words.join(', ')}</span></div>;
}

export function Hero({ onOpen }) {
  const { t } = usePortfolio();
  return <section className="hero section-shell" id="home" aria-labelledby="hero-title">
    <div className="hero-topline"><span className="eyebrow">DIGITAL HARDWARE / PORTFOLIO ’26</span><span className="hero-location">HCMC, VIETNAM <span aria-hidden="true">↗</span></span></div>
    <div className="hero-grid">
      <div className="hero-copy">
        <div className="availability"><span className="status-dot"/>{t.availability}</div>
        <h1 id="hero-title">Thân Đức<br/><span>Việt<span className="name-dot">.</span></span></h1>
        <p className="hero-role">{t.heroLead}<br/><span>{t.heroAccent}</span></p>
        <p className="hero-description">{t.heroDescription}</p>
        <div className="hero-actions"><a className="button button-primary" href={`mailto:${profile.email}`}><Icon name="mail" size={18}/>{t.emailMe}<Icon name="diagonal" size={17}/></a><a className="button button-secondary" href={`${import.meta.env.BASE_URL}${profile.cv}`} download><Icon name="download" size={18}/>{t.downloadCv}</a><a className="button button-quiet" href="#projects">{t.explore}<Icon name="arrow" size={18}/></a></div>
        <TypeLine/>
      </div>
      <div className="hero-visual"><HeroChip/></div>
    </div>
    <div className="hero-project-strip">{[['aes-256','AES-256','01'],['floating-point-alu','FLOAT32','02'],['tiny-mnist','INT8 / MNIST','03'],['qc-ldpc','QC-LDPC','04']].map(([id,label,number],i) => <button key={id} onMouseEnter={() => chipFocus(id)} onMouseLeave={() => chipFocus(null)} onFocus={() => chipFocus(id)} onBlur={() => chipFocus(null)} onClick={() => goToProject(id, onOpen)}><span className="strip-number">{number}</span><span><strong>{label}</strong><small>{t.rail[i]}</small></span><Icon name="diagonal" size={18}/></button>)}</div>
    <div className="hero-bottomline"><span>{t.heroEyebrow}</span><a href="#about" aria-label={t.nav[0]}><span>{t.scrollExplore}</span><span aria-hidden="true">↓</span></a></div>
  </section>;
}
