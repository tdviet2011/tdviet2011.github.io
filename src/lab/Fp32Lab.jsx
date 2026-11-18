import { useMemo, useState } from 'react';
import { OPS, run, parseInput, decode, hex, show } from './fp32';

const PRESETS = [
  ['1.5', '2.25', 0], ['1', '3e-8', 3], ['3', '-0.5', 1], ['1', '3', 2],
  ['1e-20', '1e-20', 1], ['3e38', '10', 1], ['inf', 'inf', 3], ['-7.9', '0', 9],
];

function Bits({ bits, onFlip, label, isInt }) {
  const arr = Array.from({ length: 32 }, (_, i) => (bits >>> (31 - i)) & 1);
  return <div className="fp-bits" role="group" aria-label={label}>
    {arr.map((b, i) => {
      const cls = isInt ? 'int' : i === 0 ? 's' : i < 9 ? 'e' : 'm';
      return onFlip
        ? <button key={i} type="button" className={`bit ${cls} ${b ? 'one' : ''}`} onClick={() => onFlip(31 - i)} aria-label={`bit ${31 - i} = ${b}`}>{b}</button>
        : <span key={i} className={`bit ${cls} ${b ? 'one' : ''}`}>{b}</span>;
    })}
  </div>;
}

function Fields({ bits }) {
  const d = decode(bits);
  const kind = { norm: 'normal', sub: 'subnormal', zero: 'zero', inf: 'infinity', nan: 'NaN' }[d.cls];
  return <div className="fp-fields"><span>s={d.s}</span><span>e={d.e}{d.cls === 'norm' ? ` (2^${d.e - 127})` : ''}</span><span>m=0x{d.m.toString(16).padStart(6, '0')}</span><em>{kind}</em></div>;
}

const short = (bin, n = 28) => bin.length > n ? `${bin.slice(0, n)}…(${bin.length} bit)` : bin;

function Steps({ r, op, vi }) {
  if (r.int) return <ol className="fp-steps"><li>{vi ? 'Cắt phần lẻ về phía 0, bão hòa ở ±2³¹ (NaN cho 0 và bật Overflow).' : 'Truncate toward zero, saturate at ±2³¹ (NaN gives 0 and raises Overflow).'}</li></ol>;
  if (r.note) {
    const why = { nan: vi ? 'Có toán hạng NaN: trả về NaN đó (đã quiet), bật Exception.' : 'A NaN operand: it is passed through (quieted), Exception = 1.',
      'inf-inf': vi ? '∞ − ∞ không xác định: ra qNaN 0x7fc00000, bật Exception.' : '∞ − ∞ is undefined: result is qNaN 0x7fc00000, Exception = 1.',
      'inf*0': vi ? '∞ × 0 không xác định: ra qNaN.' : '∞ × 0 is undefined: result is qNaN.',
      'inf/inf': vi ? '∞ ÷ ∞ không xác định: ra qNaN.' : '∞ ÷ ∞ is undefined: result is qNaN.',
      '0/0': vi ? '0 ÷ 0 không xác định: ra qNaN.' : '0 ÷ 0 is undefined: result is qNaN.',
      'x/0': vi ? 'Chia số khác 0 cho 0: ra ±∞.' : 'Non-zero ÷ 0: result is ±∞.',
      'x/inf': vi ? 'Chia cho ∞: ra ±0.' : 'Divide by ∞: result is ±0.',
      inf: vi ? 'Có toán hạng ∞: kết quả là ∞ đúng dấu, bật Exception.' : 'An ∞ operand: the result is ∞ with the right sign, Exception = 1.' };
    return <ol className="fp-steps"><li>{why[r.note]}</li></ol>;
  }
  const s = r.steps; const items = [];
  for (const st of s) {
    if (st.k === 'align') items.push(vi ? <>Căn mũ: chênh lệch mũ <b>{st.d}</b>, dịch significand nhỏ hơn sang phải {st.d} bit (giữ guard/round/sticky).</> : <>Align: exponent difference <b>{st.d}</b>, shift the smaller significand right by {st.d} bits (keeping guard/round/sticky).</>);
    if (st.k === 'sum') items.push(vi ? <>{st.op === 'add' ? 'Cộng' : 'Trừ'} hai significand → tổng chính xác <code>{short(st.S.toString(2))}</code>{st.neg ? ', đổi dấu' : ''}.</> : <>{st.op === 'add' ? 'Add' : 'Subtract'} the significands → exact sum <code>{short(st.S.toString(2))}</code>{st.neg ? ', sign flips' : ''}.</>);
    if (st.k === 'mul') items.push(vi ? <>Nhân significand 24 × 24 bit → tích 48 bit <code>{short(st.P.toString(2), 32)}</code>, cộng mũ.</> : <>Multiply the 24 × 24-bit significands → 48-bit product <code>{short(st.P.toString(2), 32)}</code>, add the exponents.</>);
    if (st.k === 'div') items.push(vi ? <>Chia restoring từng bit → thương <code>{short(st.Q.toString(2), 32)}</code>, phần dư {st.R ? '≠ 0 (vào sticky)' : '= 0'}.</> : <>Restoring division, one bit per step → quotient <code>{short(st.Q.toString(2), 32)}</code>, remainder {st.R ? '≠ 0 (goes into sticky)' : '= 0'}.</>);
    if (st.k === 'round') {
      items.push(<>{vi ? 'Chuẩn hóa, giữ 24 bit' : 'Normalize, keep 24 bits'} <code>{st.kept.toString(2)}</code>{st.tiny ? (vi ? ' (vùng subnormal)' : ' (subnormal range)') : ''}; G R S = <b>{st.g} {st.r} {st.st}</b> → {st.up ? (vi ? 'làm tròn lên (RNE)' : 'round up (RNE)') : (vi ? 'giữ nguyên (RNE)' : 'keep (RNE)')}.</>);
      if (st.overflow) items.push(vi ? 'Mũ vượt 254 → ra ±∞, bật Overflow.' : 'Exponent passes 254 → ±∞, Overflow = 1.');
      else if (st.tiny && st.inexact) items.push(vi ? 'Kết quả subnormal và không chính xác → bật Underflow.' : 'Result is subnormal and inexact → Underflow = 1.');
    }
  }
  if (!s.some(x => x.k === 'round')) items.push(vi ? 'Kết quả đúng bằng 0.' : 'The result is exactly zero.');
  return <ol className="fp-steps">{items.map((x, i) => <li key={i}>{x}</li>)}</ol>;
}

export function Fp32Lab({ lang }) {
  const vi = lang === 'vi';
  const [aTxt, setATxt] = useState('1.5'), [bTxt, setBTxt] = useState('2.25'), [op, setOp] = useState(0);
  const a = parseInput(aTxt), b = parseInput(bTxt);
  const r = useMemo(() => (a == null || b == null ? null : run(op, a, b)), [a, b, op]);
  const flip = (which, bit) => { const cur = which === 'a' ? a : b; if (cur == null) return; const nb = (cur ^ (1 << bit)) >>> 0; (which === 'a' ? setATxt : setBTxt)(`0x${hex(nb)}`); };
  const unary = op === 9;
  return <div className="fp-lab">
    <div className="fp-presets"><span>{vi ? 'Thử nhanh' : 'Try'}</span>{PRESETS.map(([x, y, o], i) => <button key={i} type="button" onClick={() => { setATxt(x); setBTxt(y); setOp(o); }}>{o === 9 ? `int(${x})` : `${x} ${OPS.find(p => p.id === o).sym} ${y}`}</button>)}</div>
    <div className="fp-ops" role="radiogroup" aria-label={vi ? 'Phép toán' : 'Operation'}>{OPS.map(o => <button key={o.id} type="button" role="radio" aria-checked={op === o.id} className={op === o.id ? 'on' : ''} onClick={() => setOp(o.id)}><b>{o.key}</b><span>op={o.id}</span></button>)}</div>
    <div className="fp-row">
      <label className="fp-in"><span>a_operand</span><input value={aTxt} onChange={e => setATxt(e.target.value)} spellCheck={false} aria-invalid={a == null}/></label>
      {a != null && <><Bits bits={a} onFlip={bit => flip('a', bit)} label="a bits"/><Fields bits={a}/></>}
    </div>
    {!unary && <div className="fp-row">
      <label className="fp-in"><span>b_operand</span><input value={bTxt} onChange={e => setBTxt(e.target.value)} spellCheck={false} aria-invalid={b == null}/></label>
      {b != null && <><Bits bits={b} onFlip={bit => flip('b', bit)} label="b bits"/><Fields bits={b}/></>}
    </div>}
    {r ? <div className="fp-row fp-out">
      <div className="fp-result"><span>ALU_Output</span><strong>{show(r.y, r.int)}</strong><code>0x{hex(r.y)}</code></div>
      <Bits bits={r.y} label="result bits" isInt={r.int}/>
      <div className="fp-flags">{[['Exception', r.ex], ['Overflow', r.ov], ['Underflow', r.un]].map(([n, v]) => <span key={n} className={v ? 'on' : ''}>{n} = {v ? 1 : 0}</span>)}</div>
    </div> : <p className="lab-note">{vi ? 'Nhập số thập phân (1.5, -3e-8), inf, nan hoặc hex (0x3fc00000).' : 'Enter a decimal (1.5, -3e-8), inf, nan or hex (0x3fc00000).'}</p>}
    {r && <Steps r={r} op={op} vi={vi}/>}
    <p className="lab-foot">{vi
      ? 'Bấm vào từng bit của a, b để lật bit. Mô hình này chạy trong trình duyệt, theo đúng quy tắc của RTL; tôi đã đối chiếu nó với RTL trên GitHub bằng Icarus Verilog: 120.000 vector ngẫu nhiên và biên, 0 sai khác cả giá trị lẫn cờ.'
      : 'Click any bit of a or b to flip it. This model runs in your browser and follows the RTL’s rules; I checked it against the RTL on GitHub with Icarus Verilog: 120,000 random and edge-case vectors, 0 mismatches in value or flags.'}</p>
  </div>;
}
