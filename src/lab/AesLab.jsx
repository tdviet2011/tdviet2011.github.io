import { useMemo, useState } from 'react';
import { runCore, toHex, fromHex, fromText, expandKey } from './aes';

const FIPS_KEY = '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';

function State({ bytes, diff, label }) {
  // AES state is column-major: byte i sits at row i % 4, column i / 4
  return <div className="aes-state" aria-label={label}>
    {[0, 1, 2, 3].map(r => [0, 1, 2, 3].map(c => { const i = c * 4 + r; return <span key={i} className={diff?.[i] ? 'hot' : ''}>{bytes[i].toString(16).padStart(2, '0')}</span>; }))}
  </div>;
}

export function AesLab({ lang }) {
  const vi = lang === 'vi';
  const [mode, setMode] = useState('text');
  const [text, setText] = useState('Hello, RTL world');
  const [ptHex, setPtHex] = useState('00112233445566778899aabbccddeeff');
  const [keyHex, setKeyHex] = useState(FIPS_KEY);
  const [fault, setFault] = useState('none');
  const [round, setRound] = useState(1);
  const [bit, setBit] = useState(5);
  const [view, setView] = useState(14);

  const pt = mode === 'text' ? fromText(text) : fromHex(ptHex, 16);
  const key = fromHex(keyHex, 32);
  const f = fault === 'none' ? null : { kind: fault, round, bit };
  const res = useMemo(() => (pt && key ? runCore(pt, key, f) : null), [pt && toHex(pt), key && toHex(key), fault, round, bit]);
  const clean = useMemo(() => (pt && key && f ? runCore(pt, key, null) : null), [pt && toHex(pt), key && toHex(key), !!f]);
  const diff = res && clean ? res.trace[view].map((b, i) => b !== clean.trace[view][i]) : null;
  const checks = res && [
    { n: 'RUN1 · ENC', ok: true, t: vi ? '14 vòng mã hóa' : '14 encrypt rounds' },
    { n: 'RUN2 · DEC', ok: res.verifyOk, t: res.verifyOk ? (vi ? 'giải ngược ra đúng bản rõ' : 'decrypts back to the input') : (vi ? 'giải ngược KHÔNG ra bản rõ' : 'decrypt does NOT return the input') },
    { n: 'KEY_CHECK', ok: res.keyOk, t: res.keyOk ? (vi ? 'key schedule khớp khi tính lại' : 'key schedule matches when re-derived') : (vi ? 'round key bị sửa, tính lại không khớp' : 'a round key was altered, re-derivation differs') },
  ];
  const text16 = (b) => new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(b.filter(x => x))).replace(/[\x00-\x1f]/g, '·');

  return <div className="aes-lab">
    <div className="aes-inputs">
      <div className="aes-field">
        <div className="seg">{['text', 'hex'].map(m => <button key={m} type="button" className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'text' ? (vi ? 'Chữ' : 'Text') : 'Hex'}</button>)}</div>
        {mode === 'text'
          ? <label><span>{vi ? 'Bản rõ (16 byte)' : 'Plaintext (16 bytes)'}</span><input value={text} maxLength={16} onChange={e => setText(e.target.value)}/></label>
          : <label><span>{vi ? 'Bản rõ (hex, 16 byte)' : 'Plaintext (hex, 16 bytes)'}</span><input value={ptHex} onChange={e => setPtHex(e.target.value)} spellCheck={false} aria-invalid={!pt}/></label>}
      </div>
      <label className="aes-field"><span>{vi ? 'Khóa 256 bit (hex)' : '256-bit key (hex)'} <button type="button" className="link" onClick={() => setKeyHex(FIPS_KEY)}>FIPS-197</button></span><input value={keyHex} onChange={e => setKeyHex(e.target.value)} spellCheck={false} aria-invalid={!key}/></label>
    </div>

    <div className="aes-fault">
      <span className="lbl">{vi ? 'Tiêm lỗi' : 'Inject a fault'}</span>
      <div className="seg">{[['none', vi ? 'Không' : 'None'], ['flip', vi ? 'Lật 1 bit state' : 'Flip a state bit'], ['skip', vi ? 'Bỏ qua 1 vòng' : 'Skip a round'], ['key', vi ? 'Sửa round key' : 'Corrupt a round key']].map(([k, l]) => <button key={k} type="button" className={fault === k ? 'on' : ''} onClick={() => { setFault(k); if (k !== 'none') setView(Math.max(round, 1)); }}>{l}</button>)}</div>
      {fault !== 'none' && <div className="aes-fault-opts">
        <label>{vi ? 'Vòng' : 'Round'} <input type="number" min={fault === 'key' ? 0 : 1} max={14} value={round} onChange={e => { const v = Math.max(fault === 'key' ? 0 : 1, Math.min(14, +e.target.value || 1)); setRound(v); setView(Math.max(v, 1)); }}/></label>
        {fault !== 'skip' && <label>Bit <input type="number" min={0} max={127} value={bit} onChange={e => setBit(Math.max(0, Math.min(127, +e.target.value || 0)))}/></label>}
        <button type="button" className="link" onClick={() => { setRound(1 + Math.floor(Math.random() * 14)); setBit(Math.floor(Math.random() * 128)); }}>{vi ? 'Ngẫu nhiên' : 'Random'}</button>
      </div>}
    </div>

    {res ? <>
      <div className="aes-rounds">
        <div className="aes-round-bar" role="tablist" aria-label={vi ? 'Trạng thái sau mỗi vòng' : 'State after each round'}>
          {res.trace.map((_, r) => <button key={r} type="button" role="tab" aria-selected={view === r} className={`${view === r ? 'on' : ''} ${f && f.kind !== 'key' && r >= f.round ? 'bad' : ''}`} onClick={() => setView(r)}>{r}</button>)}
        </div>
        <div className="aes-round-body">
          <div><span className="cap">{vi ? `State sau vòng ${view}` : `State after round ${view}`}{view === 0 ? ' (AddRoundKey)' : view === 14 ? (vi ? ' (không MixColumns)' : ' (no MixColumns)') : ''}</span><State bytes={res.trace[view]} diff={diff} label="state"/></div>
          <div><span className="cap">{vi ? `Round key ${view}` : `Round key ${view}`}</span><State bytes={res.rk[view]} diff={f?.kind === 'key' ? expandKey(key)[view].map((b, i) => b !== res.rk[view][i]) : null} label="round key"/></div>
          {diff && diff.some(Boolean) && <p className="aes-diff-note">{vi ? `${diff.filter(Boolean).length}/16 byte khác bản chạy sạch` : `${diff.filter(Boolean).length}/16 bytes differ from a clean run`}</p>}
        </div>
      </div>

      <div className="aes-checks">{checks.map(c => <div key={c.n} className={c.ok ? 'ok' : 'bad'}><b>{c.n}</b><span>{c.t}</span><i>{c.ok ? 'PASS' : 'FAIL'}</i></div>)}</div>

      <div className={`aes-out ${res.fault ? 'faulted' : ''}`}>
        <div><span>data_out</span><code>{toHex(res.out)}</code></div>
        <div><span>fault</span><code>{res.fault ? 1 : 0}</code></div>
        <p>{res.fault
          ? (vi ? 'Lõi phát hiện lỗi: không xuất bản mã, data_out bị xóa về 0 và key schedule bị xóa (WIPE).' : 'The core caught the fault: no ciphertext leaves the chip, data_out is zeroed and the key schedule is wiped (WIPE).')
          : (vi ? <>Bản mã hợp lệ. Giải ngược ra: <code>{mode === 'text' ? `"${text16(res.back)}"` : toHex(res.back)}</code></> : <>Valid ciphertext. Decrypting it gives back: <code>{mode === 'text' ? `"${text16(res.back)}"` : toHex(res.back)}</code></>)}</p>
      </div>
      {fault === 'key' && res.verifyOk && <p className="lab-note">{vi ? 'Lưu ý: sửa round key thì phép giải ngược vẫn khớp vì cả hai chiều đọc cùng w[]. Đó là lý do tôi thêm trạng thái KEY_CHECK riêng.' : 'Note: with a corrupted round key the decrypt check still passes, because both directions read the same w[]. That is why I added a separate KEY_CHECK state.'}</p>}
    </> : <p className="lab-note">{vi ? 'Khóa cần đúng 64 ký tự hex, bản rõ hex cần 32 ký tự.' : 'The key needs exactly 64 hex digits, a hex plaintext 32.'}</p>}
    <p className="lab-foot">{vi
      ? 'Mô hình phần mềm của luồng xử lý trong lõi (ENC → DEC verify → KEY_CHECK → xuất hoặc WIPE), chạy trong trình duyệt. Vector mặc định là FIPS-197 C.3. Trên RTL thật, testbench tiêm lỗi đạt 353/353 kịch bản.'
      : 'A software model of the core’s flow (ENC → DEC verify → KEY_CHECK → release or WIPE), running in your browser. The default key is FIPS-197 C.3. On the real RTL the fault-injection testbench passes 353/353 scenarios.'}</p>
  </div>;
}
