import { lazy, Suspense, useState } from 'react';

// Interactive tab strip inside a case study: a live demo, the real simulation waveform, and the code.
const Fp32Lab = lazy(() => import('./Fp32Lab').then(m => ({ default: m.Fp32Lab })));
const AesLab = lazy(() => import('./AesLab').then(m => ({ default: m.AesLab })));
const WaveViewer = lazy(() => import('./WaveViewer').then(m => ({ default: m.WaveViewer })));
const CodeViewer = lazy(() => import('./CodeViewer').then(m => ({ default: m.CodeViewer })));

const LABS = {
  'floating-point-alu': ['demo', 'wave', 'code'],
  'aes-256': ['demo', 'wave', 'code'],
  'tiny-mnist': ['wave', 'code'],
};
export const hasLab = (id) => !!LABS[id];

export function ProjectLab({ id, lang }) {
  const vi = lang === 'vi';
  const tabs = LABS[id];
  const [tab, setTab] = useState(tabs?.[0]);
  if (!tabs) return null;
  const names = {
    demo: id === 'aes-256' ? (vi ? 'Thử mã hóa & tiêm lỗi' : 'Encrypt & inject faults') : (vi ? 'Máy tính FP32' : 'FP32 calculator'),
    wave: vi ? 'Waveform tương tác' : 'Interactive waveform',
    code: vi ? 'Mã nguồn Verilog' : 'Verilog source',
  };
  return <section className="project-lab" aria-label={vi ? 'Thử trực tiếp' : 'Hands-on'}>
    <div className="lab-head">
      <span className="eyebrow">{vi ? 'THỬ TRỰC TIẾP' : 'HANDS-ON'}</span>
      <div className="lab-tabs" role="tablist">{tabs.map(t => <button key={t} type="button" role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}><i className={`lab-ico lab-ico-${t}`} aria-hidden="true"/>{names[t]}</button>)}</div>
    </div>
    <div className="lab-body" role="tabpanel">
      <Suspense fallback={<div className="lab-loading">{vi ? 'Đang tải…' : 'Loading…'}</div>}>
        {tab === 'demo' && id === 'floating-point-alu' && <Fp32Lab lang={lang}/>}
        {tab === 'demo' && id === 'aes-256' && <AesLab lang={lang}/>}
        {tab === 'wave' && <WaveViewer id={id} lang={lang}/>}
        {tab === 'code' && <CodeViewer id={id} lang={lang}/>}
      </Suspense>
    </div>
  </section>;
}
