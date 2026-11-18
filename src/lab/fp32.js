// Reference model of the FP32 ALU (ops ADD, SUB, MUL, DIV, F→INT), written to match the RTL
// bit for bit. Every finite float32 is an integer multiple of 2^-149, so each operation is done
// exactly with BigInt and then rounded once (round-to-nearest-even), the way fp_round_pack does.
const B = BigInt;
export const OPS = [
  { id: 0, key: 'ADD', sym: '+' }, { id: 3, key: 'SUB', sym: '−' }, { id: 1, key: 'MUL', sym: '×' },
  { id: 2, key: 'DIV', sym: '÷' }, { id: 9, key: 'F→INT', sym: 'int' },
];
const f32 = new Float32Array(1), u32 = new Uint32Array(f32.buffer);
export const bitsToFloat = (b) => { u32[0] = b >>> 0; return f32[0]; };
export const floatToBits = (x) => { f32[0] = x; return u32[0]; };
export const hex = (b) => (b >>> 0).toString(16).padStart(8, '0');

export function decode(bits) {
  const s = bits >>> 31, e = (bits >>> 23) & 0xff, m = bits & 0x7fffff;
  const cls = e === 255 ? (m ? 'nan' : 'inf') : e === 0 ? (m ? 'sub' : 'zero') : 'norm';
  const sig = e === 0 ? m : m | 0x800000;       // significand with the hidden bit
  const ee = e === 0 ? 1 : e;                    // effective biased exponent
  return { s, e, m, cls, sig, ee, value: bitsToFloat(bits) };
}

// exact |value| = N * 2^(k - 149); returns BigInt N (k = 0 for every finite float)
const mag = (d) => B(d.sig) << B(d.ee - 1);

// Round N * 2^(scale - 149) (N > 0) to float32 with RNE. Returns bits (without sign) and the details.
// Work in units of 2^-152 (3 bits below the smallest subnormal) so guard/round are never lost.
function roundPack(N, scale) {
  let sticky0 = false;
  const sh = scale + 3;
  if (sh < 0) { const k = B(-sh); sticky0 = (N & ((1n << k) - 1n)) !== 0n; N >>= k; }
  else if (sh > 0) N <<= B(sh);
  if (N === 0n) return { bits: 0, g: 0, r: 0, st: 1, up: false, inexact: true, tiny: true, kept: 0n, overflow: false };
  const p = N.toString(2).length - 1;            // index of the leading one
  const q = Math.max(p - 23, 3);                 // bits below the kept significand (3 → subnormal range)
  const kept0 = N >> B(q);
  const g = Number((N >> B(q - 1)) & 1n);
  const r = Number((N >> B(q - 2)) & 1n);
  const st = ((N & ((1n << B(q - 2)) - 1n)) !== 0n || sticky0) ? 1 : 0;
  const up = g === 1 && (r === 1 || st === 1 || (kept0 & 1n) === 1n);
  let kept = up ? kept0 + 1n : kept0, qq = q;
  if (kept >> 24n) { kept >>= 1n; qq += 1; }      // rounding carried into a new bit
  const inexact = g === 1 || r === 1 || st === 1;
  const tiny = kept < 0x800000n;                 // below the normal range after rounding
  let bits;
  if (tiny) bits = Number(kept);
  else { const E = qq - 2; bits = E >= 255 ? 0x7f800000 : ((E << 23) | Number(kept & 0x7fffffn)) >>> 0; }
  return { bits, g, r, st, up, inexact, tiny, kept, overflow: bits === 0x7f800000 };
}

const NAN = 0x7fc00000;

export function run(op, aBits, bBits) {
  const a = decode(aBits >>> 0), b = decode(bBits >>> 0);
  if (op === 9) return toInt(a);
  const sub = op === 3;
  const ex = op <= 3 ? (a.cls === 'nan' || a.cls === 'inf' || b.cls === 'nan' || b.cls === 'inf') : false;
  const out = (y, extra = {}) => ({ y: y >>> 0, ex, ov: false, un: false, steps: [], ...extra });
  const bs = sub ? b.s ^ 1 : b.s;
  // ----- specials -----
  // an input NaN is passed through quieted (mantissa MSB forced to 1); a wins when both are NaN
  if (a.cls === 'nan' || b.cls === 'nan') return out(((a.cls === 'nan' ? aBits : bBits) | 0x400000) >>> 0, { note: 'nan' });
  if (op === 0 || op === 3) {
    if (a.cls === 'inf' || b.cls === 'inf') {
      if (a.cls === 'inf' && b.cls === 'inf' && a.s !== bs) return out(NAN, { note: 'inf-inf' });
      return out(a.cls === 'inf' ? (a.s << 31 | 0x7f800000) : (bs << 31 | 0x7f800000), { note: 'inf' });
    }
    const A = mag(a), Bm = mag(b);
    const sa = a.s ? -A : A, sb = bs ? -Bm : Bm, S = sa + sb;
    if (S === 0n) {
      const zs = a.s & bs; // +0 unless both operands are -0
      return out(zs << 31, { steps: addSteps(a, b, bs, S, null) });
    }
    const rp = roundPack(S < 0n ? -S : S, 0);
    const y = ((S < 0n ? 1 : 0) << 31 | rp.bits) >>> 0;
    return out(y, { ov: rp.overflow, un: rp.tiny && rp.inexact, steps: addSteps(a, b, bs, S, rp) });
  }
  const s = a.s ^ b.s;
  if (op === 1) {
    if (a.cls === 'inf' || b.cls === 'inf') {
      if (a.cls === 'zero' || b.cls === 'zero') return out(NAN, { note: 'inf*0' });
      return out(s << 31 | 0x7f800000, { note: 'inf' });
    }
    const P = mag(a) * mag(b);
    if (P === 0n) return out(s << 31, { steps: mulSteps(a, b, P, null) });
    const rp = roundPack(P, -149);
    return out((s << 31 | rp.bits) >>> 0, { ov: rp.overflow, un: rp.tiny && rp.inexact, steps: mulSteps(a, b, P, rp) });
  }
  if (op === 2) {
    if (a.cls === 'inf' && b.cls === 'inf') return out(NAN, { note: 'inf/inf' });
    if (a.cls === 'inf') return out(s << 31 | 0x7f800000, { note: 'inf' });
    if (b.cls === 'inf') return out(s << 31, { note: 'x/inf' });
    if (b.cls === 'zero') return out(a.cls === 'zero' ? NAN : (s << 31 | 0x7f800000), { note: a.cls === 'zero' ? '0/0' : 'x/0' });
    if (a.cls === 'zero') return out(s << 31);
    const A = mag(a), Bm = mag(b);
    // long division: quotient with at least 26 significant bits, remainder folded into sticky
    let k = 0; while ((A << B(k)) / Bm < (1n << 26n)) k++;
    const Q = (A << B(k)) / Bm, R = (A << B(k)) % Bm;
    const Qs = (Q << 1n) | (R ? 1n : 0n);        // extra sticky bit
    const rp = roundPack(Qs, 149 - k - 1);
    return out((s << 31 | rp.bits) >>> 0, { ov: rp.overflow, un: rp.tiny && rp.inexact, steps: divSteps(a, b, Q, R, k, rp) });
  }
  return out(0);
}

function toInt(a) {
  let y, ov = false;
  if (a.cls === 'nan' || a.cls === 'inf') { ov = true; y = a.cls === 'nan' ? 0 : !a.s ? 0x7fffffff : 0x80000000; }
  else {
    const t = Math.trunc(a.value);
    if (t > 2147483647) { ov = true; y = 0x7fffffff; }
    else if (t < -2147483648) { ov = true; y = 0x80000000; }
    else y = t | 0;
  }
  return { y: y >>> 0, ex: false, ov, un: false, steps: [{ k: 'trunc', v: Math.trunc(a.value) }], int: true };
}

const bin = (n, w) => n.toString(2).padStart(w, '0');
function addSteps(a, b, bs, S, rp) {
  const big = mag(a) >= mag(b) ? a : b, small = big === a ? b : a;
  return [
    { k: 'align', d: big.ee - small.ee, bigE: big.ee, smallSig: bin(small.sig, 24), bigSig: bin(big.sig, 24) },
    { k: 'sum', op: (a.s ^ bs) ? 'sub' : 'add', S: S < 0n ? -S : S, neg: S < 0n },
    ...(rp ? [{ k: 'round', ...rp }] : []),
  ];
}
function mulSteps(a, b, P, rp) {
  return [{ k: 'mul', sa: bin(a.sig, 24), sb: bin(b.sig, 24), P, e: (a.ee - 127) + (b.ee - 127) }, ...(rp ? [{ k: 'round', ...rp }] : [])];
}
function divSteps(a, b, Q, R, k, rp) {
  return [{ k: 'div', sa: bin(a.sig, 24), sb: bin(b.sig, 24), Q, R: R !== 0n, n: Q.toString(2).length }, { k: 'round', ...rp }];
}

// parse "1.5", "-3e-8", "inf", "nan", "0x3fc00000"
export function parseInput(str) {
  const s = String(str).trim().toLowerCase().replace(/[−–]/g, '-').replace(/∞/g, 'inf');
  if (/^-?0x[0-9a-f]{1,8}$/.test(s)) { const neg = s[0] === '-'; const v = parseInt(s.replace('-', ''), 16) >>> 0; return neg ? (v ^ 0x80000000) >>> 0 : v; }
  if (s === 'nan') return NAN;
  if (/^[+-]?inf(inity)?$/.test(s)) return s[0] === '-' ? 0xff800000 : 0x7f800000;
  if (s === '' || isNaN(Number(s))) return null;
  return floatToBits(Number(s));
}
export function show(bits, isInt = false) {
  if (isInt) return String(bits | 0);
  const d = decode(bits);
  if (d.cls === 'nan') return 'NaN';
  if (d.cls === 'inf') return d.s ? '−∞' : '+∞';
  if (d.cls === 'zero') return d.s ? '−0' : '0';
  return String(Number(d.value.toPrecision(9))).replace('-', '−');
}
