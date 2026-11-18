import { usePortfolio } from '../hooks/usePortfolio';
import { fireBeam, chipFocus } from './dataBeam';

// Journey drawn as a signal bus: each milestone is a pipeline stage on one trace.
// Filled (neon) up to the current stage, dashed for what is still ahead.
const stages = [
  { tag: 'S0', date: '2024', state: 'done',
    title: { en: 'Power-on', vi: 'Khởi động' },
    body: { en: 'Started Integrated Circuit Design at HCM-UTE.', vi: 'Bắt đầu ngành Thiết kế vi mạch tại HCM-UTE.' },
    chips: ['Digital logic', 'C'] },
  { tag: 'S1', date: '2024 – 25', state: 'done',
    title: { en: 'Foundations', vi: 'Xây nền tảng' },
    body: { en: 'Verilog, circuits and simulation in class; real boards with ESP32 and PIC; a PCB in Altium; analog basics in Cadence.', vi: 'Verilog, mạch điện và mô phỏng trên lớp; làm mạch thật với ESP32, PIC; vẽ PCB bằng Altium; nền tảng analog với Cadence.' },
    chips: ['Verilog', 'ESP32 · PIC', 'Altium', 'Cadence'] },
  { tag: 'S2', date: '2026', state: 'now',
    title: { en: 'RTL in practice', vi: 'Làm RTL thực tế' },
    body: { en: 'Four RTL projects, each verified bit-exact against a reference model.', vi: 'Bốn dự án RTL, mỗi dự án đều kiểm chứng bit-exact với mô hình tham chiếu.' },
    projects: [['aes-256', 'AES-256'], ['floating-point-alu', 'FP32 ALU'], ['tiny-mnist', 'MNIST'], ['qc-ldpc', 'QC-LDPC']] },
  { tag: 'S3', date: { en: 'NEXT', vi: 'TIẾP THEO' }, state: 'next',
    title: { en: 'RTL / DV internship', vi: 'Thực tập RTL / DV' },
    body: { en: 'Work on real designs with a team, and get my code reviewed. Learning now:', vi: 'Làm thiết kế thật cùng một team và được review code. Đang học thêm:' },
    chips: ['SystemVerilog', 'UVM', 'CDC', 'Timing closure'] },
  { tag: 'S4', date: '2028', state: 'next',
    title: { en: 'Graduation', vi: 'Tốt nghiệp' },
    body: { en: 'B.Eng. in Integrated Circuit Design.', vi: 'Kỹ sư Thiết kế vi mạch.' } },
];

export function Roadmap({ onOpen }) {
  const { text, lang } = usePortfolio();
  const vi = lang === 'vi';
  const nowIndex = stages.findIndex(s => s.state === 'now');
  return <div className="roadmap" style={{ '--now': nowIndex, '--count': stages.length }}>
    <div className="roadmap-head" aria-hidden="true">
      <span>BUS / JOURNEY[{stages.length - 1}:0]</span>
      <span className="roadmap-legend"><i className="lg-done"/>{vi ? 'Đã qua' : 'Done'}<i className="lg-now"/>{vi ? 'Hiện tại' : 'Now'}<i className="lg-next"/>{vi ? 'Phía trước' : 'Ahead'}</span>
    </div>
    <div className="roadmap-track" aria-hidden="true">
      <svg className="roadmap-clk" viewBox="0 0 400 12" preserveAspectRatio="none"><path d={Array.from({ length: 40 }, (_, i) => `M${i * 10} 11V2H${i * 10 + 5}V11H${i * 10 + 10}`).join('')}/></svg>
      <div className="roadmap-wire"><div className="roadmap-fill"><span className="roadmap-packet"/><span className="roadmap-packet p2"/></div></div>
    </div>
    <ol className="roadmap-stages">
      {stages.map((s, i) => <li key={s.tag} className={`rm-stage rm-${s.state}`}>
        <div className="rm-node"><span>{s.tag}</span></div>
        <div className="rm-card">
          <span className="rm-date">{text(s.date)}{s.state === 'now' && <b>{vi ? '● ĐANG CHẠY' : '● RUNNING'}</b>}</span>
          <h3>{text(s.title)}</h3>
          <p>{text(s.body)}</p>
          {s.chips && <div className="rm-chips">{s.chips.map(c => <span key={c}>{c}</span>)}</div>}
          {s.projects && <div className="rm-projects">{s.projects.map(([id, label]) => <button key={id} type="button" onMouseEnter={() => chipFocus(id)} onMouseLeave={() => chipFocus(null)} onClick={e => fireBeam(e.currentTarget, () => onOpen?.(id), { from: id })}>{label}<span aria-hidden="true">↗</span></button>)}</div>}
        </div>
      </li>)}
    </ol>
  </div>;
}
