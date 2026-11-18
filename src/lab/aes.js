// AES-256 software model used by the demo. It follows the core's flow: expand the key once,
// encrypt, decrypt the result again as a check, re-derive the key schedule, then release or wipe.
const SBOX = new Uint8Array(256), INV = new Uint8Array(256);
(() => {
  let p = 1, q = 1;
  do {
    p = p ^ ((p << 1) & 0xff) ^ (p & 0x80 ? 0x1b : 0);
    q ^= q << 1; q ^= q << 2; q ^= q << 4; q &= 0xff; if (q & 0x80) q ^= 0x09;
    const x = q ^ ((q << 1 | q >> 7) & 0xff) ^ ((q << 2 | q >> 6) & 0xff) ^ ((q << 3 | q >> 5) & 0xff) ^ ((q << 4 | q >> 4) & 0xff);
    SBOX[p] = x ^ 0x63; INV[x ^ 0x63] = p;
  } while (p !== 1);
  SBOX[0] = 0x63; INV[0x63] = 0;
})();
const xt = (b) => ((b << 1) ^ (b & 0x80 ? 0x1b : 0)) & 0xff;
const mul = (a, b) => { let r = 0; while (b) { if (b & 1) r ^= a; a = xt(a); b >>= 1; } return r; };

export function expandKey(key) {           // key: 32 bytes → 60 words (15 round keys)
  const w = []; for (let i = 0; i < 8; i++) w.push([...key.slice(4 * i, 4 * i + 4)]);
  let rc = 1;
  for (let i = 8; i < 60; i++) {
    let t = [...w[i - 1]];
    if (i % 8 === 0) { t = [SBOX[t[1]] ^ rc, SBOX[t[2]], SBOX[t[3]], SBOX[t[0]]]; rc = xt(rc); }
    else if (i % 8 === 4) t = t.map(b => SBOX[b]);
    w.push(w[i - 8].map((b, j) => b ^ t[j]));
  }
  return Array.from({ length: 15 }, (_, r) => [].concat(w[4 * r], w[4 * r + 1], w[4 * r + 2], w[4 * r + 3]));
}
const ark = (s, k) => s.map((b, i) => b ^ k[i]);
const sub = (s) => s.map(b => SBOX[b]), isub = (s) => s.map(b => INV[b]);
const shift = (s) => s.map((_, i) => s[(i + 4 * (i % 4)) % 16]);
const ishift = (s) => s.map((_, i) => s[(i - 4 * (i % 4) + 16) % 16]);
const mix = (s, inv) => { const o = []; for (let c = 0; c < 4; c++) { const a = s.slice(4 * c, 4 * c + 4); const m = inv ? [14, 11, 13, 9] : [2, 3, 1, 1];
  for (let r = 0; r < 4; r++) o.push(mul(a[0], m[(4 - r) % 4]) ^ mul(a[1], m[(5 - r) % 4]) ^ mul(a[2], m[(6 - r) % 4]) ^ mul(a[3], m[(7 - r) % 4])); } return o; };

// fault: { kind: 'flip'|'skip'|'key', round, bit }
export function encrypt(pt, rk, fault) {
  const trace = []; let s = ark(pt, rk[0]); trace.push(s);
  for (let r = 1; r <= 14; r++) {
    if (fault?.kind === 'skip' && fault.round === r) { trace.push(s); continue; }
    s = shift(sub(s)); if (r < 14) s = mix(s); s = ark(s, rk[r]);
    if (fault?.kind === 'flip' && fault.round === r) { s = [...s]; s[fault.bit >> 3] ^= 0x80 >> (fault.bit & 7); }
    trace.push(s);
  }
  return { out: s, trace };
}
export function decrypt(ct, rk) {
  let s = ark(ct, rk[14]);
  for (let r = 13; r >= 0; r--) { s = isub(ishift(s)); s = ark(s, rk[r]); if (r > 0) s = mix(s, true); }
  return s;
}

export function runCore(pt, key, fault) {
  const good = expandKey(key);
  let rk = good;
  if (fault?.kind === 'key') { rk = good.map(k => [...k]); rk[fault.round][fault.bit >> 3] ^= 0x80 >> (fault.bit & 7); }
  const enc = encrypt(pt, rk, fault);
  const back = decrypt(enc.out, rk);
  const verifyOk = back.every((b, i) => b === pt[i]);
  // KEY_CHECK: re-derive every round key from the first two and compare with what the cores used
  const keyOk = expandKey(rk[0].concat(rk[1])).every((k, r) => k.every((b, i) => b === rk[r][i]));
  const fault_ = !verifyOk || !keyOk;
  return { rk, trace: enc.trace, res1: enc.out, back, verifyOk, keyOk, fault: fault_, out: fault_ ? new Array(16).fill(0) : enc.out };
}
export const toHex = (a) => a.map(b => b.toString(16).padStart(2, '0')).join('');
export const fromHex = (h, n) => { const s = h.replace(/[^0-9a-f]/gi, ''); if (s.length !== n * 2) return null; return Array.from({ length: n }, (_, i) => parseInt(s.substr(2 * i, 2), 16)); };
export const fromText = (t) => { const b = [...new TextEncoder().encode(t)].slice(0, 16); while (b.length < 16) b.push(0); return b; };
