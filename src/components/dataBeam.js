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

// current runs both ways round the target's outline from the point the beam lands,
// meets at the far side, then a light sweep passes across the inside
function energize(svg, target, color) {
  const r = target.getBoundingClientRect();
  const below = r.top > source().y;
  const rad = Math.min(parseFloat(getComputedStyle(target).borderTopLeftRadius) || 4, r.height / 2);
  const L = r.left + .5, R = r.right - .5, T = r.top + .5, B = r.bottom - .5, cx = (L + R) / 2;
  const [y0, y1] = below ? [T, B] : [B, T];
  const s0 = below ? 1 : -1;
  const half = (dir) => `M${cx} ${y0}H${dir < 0 ? L + rad : R - rad}Q${dir < 0 ? L : R} ${y0} ${dir < 0 ? L : R} ${y0 + s0 * rad}V${y1 - s0 * rad}Q${dir < 0 ? L : R} ${y1} ${dir < 0 ? L + rad : R - rad} ${y1}H${cx}`;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'edge-run');
  g.innerHTML = [-1, 1].map(dir => `<path d="${half(dir)}" class="edge-glow" stroke="${color}" pathLength="1"/><path d="${half(dir)}" class="edge-core" pathLength="1"/>`).join('') + `<circle cx="${cx}" cy="${y0}" r="5" class="edge-spark" fill="#fff"/>`;
  svg.appendChild(g);
  target.classList.remove('data-scan'); void target.offsetWidth; target.classList.add('data-scan');
  target.style.setProperty('--scan-color', color);
  setTimeout(() => g.classList.add('beam-fade'), 650);
  setTimeout(() => g.remove(), 1300);
  setTimeout(() => target.classList.remove('data-scan'), 1100);
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function fireBeam(target, action, { delay = 980 } = {}) {
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
  setTimeout(() => energize(svg, target, color), travel - 20);
  setTimeout(() => { g.classList.add('beam-fade'); }, travel + 220);
  setTimeout(() => { g.remove(); }, travel + 900);
  setTimeout(() => { busy = false; action?.(); }, delay);
}
