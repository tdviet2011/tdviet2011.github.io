import { useId } from 'react';

// Renders an architecture diagram described in src/data/diagrams.js.
// Nodes are blocks, edges are SVG paths. Colours come from CSS tokens so the
// diagram follows the light/dark theme.
const lineTone = (line) => line.startsWith('✗') ? 'bd-line-fix' : line.startsWith('★') ? 'bd-line-imp' : line.startsWith('◇') ? 'bd-line-prop' : '';

export function BlockDiagram({ spec, lang }) {
  const id = useId().replace(/:/g, '');
  const t = (v) => (v && typeof v === 'object' ? v[lang] : v);
  return <svg className="block-diagram" viewBox={`0 0 ${spec.w} ${spec.h}`} role="img" aria-label={t(spec.alt)}>
    <defs>
      {['data', 'ctrl', 'fault'].map(k => <marker key={k} id={`${id}-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" className={`bd-head bd-head-${k}`}/></marker>)}
    </defs>
    {(spec.groups || []).map((g, i) => <g key={`g${i}`} className="bd-group">
      <rect x={g.x} y={g.y} width={g.w} height={g.h} rx="10"/>
      <text x={g.x + 14} y={g.y + 20}>{t(g.label)}</text>
    </g>)}
    {(spec.edges || []).map((e, i) => <g key={`e${i}`} className={`bd-edge bd-edge-${e.tone || 'data'}`}>
      <path d={e.d} markerEnd={e.noArrow ? undefined : `url(#${id}-${e.tone || 'data'})`} markerStart={e.both ? `url(#${id}-${e.tone || 'data'})` : undefined}/>
      {e.label && <text x={e.lx} y={e.ly} textAnchor={e.anchor || 'middle'}>{t(e.label)}</text>}
    </g>)}
    {spec.nodes.map(n => <g key={n.id} className={`bd-node bd-${n.tone || 'core'}`}>
      <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="7"/>
      <rect className="bd-strip" x={n.x} y={n.y} width="4" height={n.h} rx="2"/>
      <text className="bd-title" x={n.x + 14} y={n.y + 22}>{t(n.title)}</text>
      {n.sub && <text className="bd-sub" x={n.x + 14} y={n.y + 37}>{t(n.sub)}</text>}
      {(Array.isArray(n.lines) ? n.lines.map(t) : (t(n.lines) || [])).map((line, j) => <text key={j} className={`bd-line ${lineTone(line)}`} x={n.x + 14} y={n.y + (n.sub ? 56 : 42) + j * 16}>{line}</text>)}
    </g>)}
    {(spec.notes || []).map((n, i) => <text key={`n${i}`} className={`bd-note ${n.tone ? `bd-note-${n.tone}` : ''}`} x={n.x} y={n.y} textAnchor={n.anchor || 'start'}>{t(n.text)}</text>)}
  </svg>;
}
