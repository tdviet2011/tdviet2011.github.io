// Fires a neon "data line" from the hero chip to the element the visitor picked,
// lights that element up, then runs the action (open a project, scroll, ...).
const NS = 'http://www.w3.org/2000/svg';
const COLORS = ['#4fe3ff', '#b28bff', '#e15bff'];
let layer;
let busy = false;

function getLayer() {
  if (layer?.isConnected) return layer;
  layer = document.createElementNS(NS, 'svg');
  layer.setAttribute('class', 'beam-layer');
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = '<defs><filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  document.body.appendChild(layer);
  return layer;
}

function source() {
  const die = document.querySelector('.chip-scene .core-aura') || document.querySelector('.chip-scene');
  const vw = innerWidth;
  if (!die) return { x: vw / 2, y: -8 };
  const r = die.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (r.bottom < 0) return { x: Math.min(Math.max(x, 40), vw - 40), y: -8 };
  return { x, y };
}

function route(s, r) {
  // Manhattan route like a PCB trace: vertical, horizontal, vertical into the target edge
  const tx = r.left + r.width / 2;
  const below = r.top > s.y;
  const ty = below ? r.top : r.bottom;
  const mid = below ? Math.max(s.y + 24, ty - 36) : Math.min(s.y - 24, ty + 36);
  const bend = 10 * Math.sign(tx - s.x || 1);
  return `M${s.x} ${s.y}V${mid - (below ? 10 : -10)}L${s.x + bend} ${mid}H${tx - bend}L${tx} ${mid + (below ? 10 : -10)}V${ty}`;
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function fireBeam(target, action, { delay = 520 } = {}) {
  if (!target || reduced() || busy) { action?.(); return; }
  busy = true;
  const svg = getLayer();
  const r = target.getBoundingClientRect();
  const s = source();
  const d = route(s, r);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const g = document.createElementNS(NS, 'g');
  g.innerHTML = `<path d="${d}" class="beam-glow" stroke="${color}" pathLength="1"/><path d="${d}" class="beam-core" pathLength="1"/><circle r="4" class="beam-packet" fill="#fff"/><circle cx="${s.x}" cy="${s.y}" r="6" class="beam-origin" stroke="${color}"/>`;
  svg.appendChild(g);
  const path = g.querySelector('.beam-core');
  const packet = g.querySelector('.beam-packet');
  const len = path.getTotalLength();
  const start = performance.now();
  const travel = 420;
  function step(now) {
    const k = Math.min(1, (now - start) / travel);
    const e = 1 - Math.pow(1 - k, 3);
    const p = path.getPointAtLength(e * len);
    packet.setAttribute('cx', p.x); packet.setAttribute('cy', p.y);
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  target.classList.remove('data-lit');
  setTimeout(() => { void target.offsetWidth; target.classList.add('data-lit'); }, travel - 40);
  setTimeout(() => { g.classList.add('beam-fade'); }, travel + 220);
  setTimeout(() => { g.remove(); }, travel + 900);
  setTimeout(() => target.classList.remove('data-lit'), travel + 1500);
  setTimeout(() => { busy = false; action?.(); }, delay);
}
