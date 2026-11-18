import { useEffect, useMemo, useState } from 'react';

// Read-only view of a few key files, copied from the project's GitHub repository.
const base = import.meta.env.BASE_URL;
const KW = new Set('module endmodule input output inout wire reg logic always always_ff always_comb always_latch assign begin end if else case casez casex endcase default for generate endgenerate genvar parameter localparam integer initial posedge negedge function endfunction task endtask typedef enum struct packed import package endpackage int unsigned signed or and not forever repeat while return automatic interface endinterface modport'.split(' '));
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*")|(`\w+)|(\$\w+)|(\d*'[sS]?[bBoOdDhH][0-9a-fA-F_xXzZ?]+|\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_]\w*)/g;

function highlight(src) {
  const out = []; let last = 0, m, i = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index));
    const [tok, com, str, dir, sys, num, id] = m;
    const cls = com ? 'c' : str ? 's' : dir ? 'd' : sys ? 'y' : num ? 'n' : id && KW.has(id) ? 'k' : null;
    out.push(cls ? <span key={i++} className={`hl-${cls}`}>{tok}</span> : tok);
    last = m.index + tok.length;
  }
  out.push(src.slice(last));
  return out;
}

export function CodeViewer({ id, lang }) {
  const vi = lang === 'vi';
  const [index, setIndex] = useState(null);
  const [sel, setSel] = useState(0);
  const [src, setSrc] = useState('');
  useEffect(() => { let on = true; fetch(`${base}code/${id}/index.json`).then(r => r.json()).then(j => on && setIndex(j)).catch(() => {}); return () => { on = false; }; }, [id]);
  const file = index?.files[sel];
  useEffect(() => { if (!file) return; let on = true; setSrc(''); fetch(`${base}code/${id}/${file.name}.txt`).then(r => r.text()).then(t => on && setSrc(t.replace(/\r\n/g, '\n'))); return () => { on = false; }; }, [file, id]);
  const lines = useMemo(() => highlight(src.replace(/\n$/, '')), [src]);
  const count = src ? src.replace(/\n$/, '').split('\n').length : 0;
  if (!index) return <div className="code-viewer loading">{vi ? 'Đang tải mã nguồn…' : 'Loading source…'}</div>;
  return <div className="code-viewer">
    <div className="cv-files" role="tablist" aria-label={vi ? 'Tệp mã nguồn' : 'Source files'}>
      {index.files.map((f, i) => <button key={f.name} type="button" role="tab" aria-selected={i === sel} className={i === sel ? 'on' : ''} onClick={() => setSel(i)}>
        <b>{f.name}</b><span>{f.desc[lang] || f.desc.en}</span>
      </button>)}
    </div>
    <div className="cv-pane">
      <div className="cv-head"><span>{file.path} · {file.lines} {vi ? 'dòng' : 'lines'}</span><a href={file.url} target="_blank" rel="noopener noreferrer">{vi ? 'Mở trên GitHub ↗' : 'Open on GitHub ↗'}</a></div>
      <div className="cv-scroll" tabIndex={0} aria-label={file.name}>
        <pre><code><span className="cv-gutter" aria-hidden="true">{Array.from({ length: count }, (_, i) => i + 1).join('\n')}</span><span className="cv-src">{src ? lines : (vi ? 'Đang tải…' : 'Loading…')}</span></code></pre>
      </div>
    </div>
  </div>;
}
