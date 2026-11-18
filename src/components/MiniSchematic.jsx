// Small schematic thumbnails for the four RTL projects. Each one shows the real structure
// (layer sizes, ports, round steps), not a generic picture.
const Box = ({ x, y, w, h, t, s = 9 }) => <g><rect x={x} y={y} width={w} height={h} rx="3" className="ms-box"/>{String(t).split('|').map((l, i, a) => <text key={i} x={x + w / 2} y={y + h / 2 + (i - (a.length - 1) / 2) * (s + 2) + s / 3} fontSize={s} textAnchor="middle">{l}</text>)}</g>;
const Arrow = ({ d }) => <path d={d} className="ms-wire" markerEnd="url(#ms-arr)"/>;

function Mnist() {
  const L = [[34, [22, 40, 58, 82]], [100, [32, 52, 72]], [164, [32, 52, 72]]];
  const lines = [];
  for (let k = 0; k < 2; k++) L[k][1].forEach(a => L[k + 1][1].forEach(b => lines.push(<path key={`${k}${a}${b}`} d={`M${L[k][0]} ${a}L${L[k + 1][0]} ${b}`} className="ms-syn"/>)));
  return <>{lines}{L.map(([x, ys], k) => ys.map((y, i) => <circle key={`${k}-${i}`} cx={x} cy={y} r="6.5" className={`ms-node n${k}`}/>))}
    <text x="34" y="72" fontSize="10" textAnchor="middle" className="ms-dim">⋮</text>
    {[[34, '784'], [100, '32'], [164, '10']].map(([x, l]) => <text key={l} x={x} y="104" fontSize="10" textAnchor="middle" className="ms-lbl">{l}</text>)}</>;
}
function Alu() {
  return <>{[['A[31:0]', 26], ['B[31:0]', 52], ['op[3:0]', 78]].map(([l, y]) => <g key={l}><text x="4" y={y + 3} fontSize="8.5" className="ms-lbl">{l}</text><Arrow d={`M50 ${y}H78`}/></g>)}
    <path d="M82 14L132 34V70L82 90V60L92 52L82 44Z" className="ms-box ms-alu"/><text x="112" y="55" fontSize="11" textAnchor="middle" className="ms-strong">ALU</text>
    <Arrow d="M132 52H150"/><text x="153" y="50" fontSize="8.5" className="ms-lbl">R[31:0]</text><text x="153" y="62" fontSize="7.5" className="ms-dim">+ flags</text></>;
}
function Aes() {
  return <><Box x={4} y={30} w={58} h={30} t="SubBytes|ShiftRows" s={8}/><Arrow d="M62 45H70"/><Box x={73} y={30} w={52} h={30} t="MixCols" s={8.5}/><Arrow d="M125 45H133"/><Box x={136} y={30} w={56} h={30} t="AddRndKey" s={8.5}/>
    <path d="M164 60V78H33V64" className="ms-wire ms-loop" markerEnd="url(#ms-arr)"/><text x="98" y="92" fontSize="9" textAnchor="middle" className="ms-lbl">× 14 rounds · verify</text>
    <text x="98" y="20" fontSize="8" textAnchor="middle" className="ms-dim">256-bit key · 128-bit state</text></>;
}
function Ldpc() {
  return <><Box x={4} y={34} w={40} h={30} t="H|(QC)" s={8.5}/><Arrow d="M44 49H56"/><Box x={59} y={22} w={44} h={24} t="VNP" s={9}/><Box x={59} y={54} w={44} h={24} t="CNP" s={9}/>
    <path d="M103 34C118 34 118 66 103 66" className="ms-wire ms-loop" markerEnd="url(#ms-arr)"/><path d="M59 66C44 66 44 34 59 34" className="ms-wire ms-loop" markerEnd="url(#ms-arr)"/>
    <Arrow d="M118 50H136"/><Box x={139} y={36} w={54} h={28} t="decoded|bits" s={8.5}/><text x="81" y="94" fontSize="8.5" textAnchor="middle" className="ms-lbl">layered, iterative</text></>;
}
const MAP = { 'tiny-mnist': [Mnist, 'NN · 784 → 32 → 10'], 'floating-point-alu': [Alu, 'FP32 ALU'], 'aes-256': [Aes, 'AES-256 round'], 'qc-ldpc': [Ldpc, 'QC-LDPC decoder'] };

export function MiniSchematic({ id }) {
  const m = MAP[id]; if (!m) return null;
  const [Body, title] = m;
  return <figure className="mini-schematic" aria-hidden="true">
    <figcaption>SCHEMATIC · {title}</figcaption>
    <svg viewBox="0 0 196 108"><defs><marker id="ms-arr" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6Z" className="ms-head"/></marker></defs><Body/></svg>
  </figure>;
}
