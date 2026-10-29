// Shared pieces for the aloe towel figures: kit imports, cloth colour tokens,
// the common bench every machine stands on, and the page assembler.
import * as k from "../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../.claude/skills/anatomy/kit/lathe.mjs";
import { kitScript } from "../.claude/skills/anatomy/scripts/inline-kit.mjs";

export { k, G, kitScript };

// One scale for the whole set (craft rule: consistent scale across figures).
export const WIDTH = 600;
export const HEIGHT = 370;

// Cloth is the subject, so it is the only colour: the olive face side and the
// cream body side of the towel, taken from the product photos. Every colour is
// a token with a light value (ships) and a dark override.
export const ALOE_CSS = `
.iso[data-theme="light"],.iso[data-theme="light"] .iso-plate{
  --clf-paper:#a5b43a;--clf-top:#b4c34c;--clf-0:#8d9c2e;--clf-1:#95a535;--clf-2:#9dad3b;--clf-3:#a5b541;--clf-hi:#3f4a0e;--clf-lo:#6c7a1f;--clf-faint:#8b9a30;
  --clb-paper:#ece5d1;--clb-top:#f4eedd;--clb-0:#d0c7ad;--clb-1:#d9d1b9;--clb-2:#e2dbc5;--clb-3:#e8e1cd;--clb-hi:#6b6450;--clb-lo:#b7ad91;--clb-faint:#d3cab1;
  --aloe-stripe:#8d9f27;--aloe-thread:#f6f1e2;--aloe-thread-edge:#9a9078;--aloe-dust:#93a52c;
}
.iso[data-theme="light"],.iso[data-theme="light"] .iso-plate{--brand-ink:#3b2e27;--box-inner:#efece4;--box-wall:#dfdbd0;--serum:#2f86d6;--serum-glow:#4da6ff;--screen:#2b3440;--aloe-dope:#ead9a6;--aloe-cavity:#e4e3de;--aloe-liquid:#cfd8d6;--aloe-glass:#ffffff}
.iso{--brand-ink:#d9cdc2;--box-inner:#24221d;--box-wall:#1b1915;--serum:#4aa3f0;--serum-glow:#5bb4ff;--screen:#0a1018;--aloe-dope:#6b5a2a;--aloe-cavity:#0e0e0e;--aloe-liquid:#2a3433;--aloe-glass:#ffffff;
  --clf-paper:#5f6b1d;--clf-top:#6d7a23;--clf-0:#414b11;--clf-1:#495415;--clf-2:#525e19;--clf-3:#5a671c;--clf-hi:#d3e07e;--clf-lo:#8d9b3a;--clf-faint:#6c7a26;
  --clb-paper:#39362d;--clb-top:#423e34;--clb-0:#28261f;--clb-1:#2e2b24;--clb-2:#332f28;--clb-3:#37342c;--clb-hi:#dcd3b8;--clb-lo:#77705d;--clb-faint:#4e4a3e;
  --aloe-stripe:#9db23a;--aloe-thread:#e9e2cb;--aloe-thread-edge:#6f6956;--aloe-dust:#a9bd44;
}
.cl-face{--anatomy-paper:var(--clf-paper);--anatomy-face:var(--clf-paper);--anatomy-top:var(--clf-top);--anatomy-shade-0:var(--clf-0);--anatomy-shade-1:var(--clf-1);--anatomy-shade-2:var(--clf-2);--anatomy-shade-3:var(--clf-3);--anatomy-hi:var(--clf-hi);--anatomy-mid:var(--clf-lo);--anatomy-lo:var(--clf-lo);--anatomy-faint:var(--clf-faint);--anatomy-lit-top:var(--clf-top);--anatomy-lit-shade:var(--clf-2)}
.cl-body{--anatomy-paper:var(--clb-paper);--anatomy-face:var(--clb-paper);--anatomy-top:var(--clb-top);--anatomy-shade-0:var(--clb-0);--anatomy-shade-1:var(--clb-1);--anatomy-shade-2:var(--clb-2);--anatomy-shade-3:var(--clb-3);--anatomy-hi:var(--clb-hi);--anatomy-mid:var(--clb-lo);--anatomy-lo:var(--clb-lo);--anatomy-faint:var(--clb-faint);--anatomy-lit-top:var(--clb-top);--anatomy-lit-shade:var(--clb-2)}
.aloe-stripe{fill:none;stroke:var(--aloe-stripe);stroke-width:.9;stroke-linecap:butt}
.aloe-stitch{fill:none;stroke:var(--aloe-thread);stroke-width:1;stroke-dasharray:2.2 1.6;stroke-linecap:butt}
.aloe-stitch-under{fill:none;stroke:var(--anatomy-hi);stroke-width:2;stroke-dasharray:2.2 1.6;stroke-linecap:butt;opacity:.8}
.aloe-cream{fill:none;stroke:var(--clb-lo);stroke-width:.9;stroke-linecap:butt}
.aloe-thread{fill:none;stroke:var(--aloe-thread-edge);stroke-width:.5;stroke-linecap:round}
.aloe-fill-face{fill:var(--clf-top)}.aloe-fill-face[data-steep]{fill:var(--clf-2)}
.aloe-fill-body{fill:var(--clb-top)}.aloe-fill-body[data-steep]{fill:var(--clb-2)}
.box-out{fill:var(--anatomy-top);stroke:none}.box-out[data-steep]{fill:var(--anatomy-shade-2)}
.box-in{fill:var(--box-inner);stroke:none}.box-in[data-steep]{fill:var(--box-wall)}
.box-cavity{fill:var(--box-inner);stroke:none}.box-wall{fill:var(--box-wall);stroke:none}
/* box print: a deep neutral brown with no red in it (brand rule, Oct 2026) */
.box-ink{fill:var(--brand-ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Helvetica,Arial,sans-serif;letter-spacing:.01em}
.box-bold{font-weight:700;letter-spacing:-.03em}
.box-rule{fill:none;stroke:var(--brand-ink);stroke-width:.7}
.serum-trim{fill:none;stroke:var(--serum);stroke-width:1}
.serum-fill{fill:var(--serum);stroke:none}
.serum-wash{fill:var(--serum-glow);opacity:.8;stroke:none}
.serum-screen{fill:var(--screen);stroke:none}
.serum-tier [data-part="tier"] .iso-fill,.serum-tier [data-part="tier"] .iso-shade,.serum-tier [data-part="tier"] .iso-top{fill:var(--serum)}
.iso-swatch[data-mark="serum"] path{stroke:var(--serum);stroke-width:3}
.aloe-cavity{fill:var(--aloe-cavity);stroke:none}
.aloe-dope{fill:var(--aloe-dope);stroke:var(--clb-hi);stroke-width:.5;stroke-opacity:.5}
.aloe-glass{fill:var(--aloe-glass);opacity:.35;stroke:none}
.aloe-liquid{fill:var(--aloe-liquid);opacity:.62;stroke:none}
.aloe-powder{fill:var(--aloe-dust);stroke:none}
.aloe-filament{fill:none;stroke:var(--aloe-stripe);stroke-width:.7;stroke-dasharray:4 1.4;stroke-linecap:butt}
.aloe-dust circle{fill:var(--aloe-dust);stroke:none}
.iso-swatch[data-mark="face"] path{stroke:var(--clf-paper);stroke-width:3}
.iso-swatch[data-mark="body"] path{stroke:var(--clb-0);stroke-width:3}
.iso-stage{outline:none;touch-action:pan-y;cursor:ew-resize}
.iso-stage:focus-visible{outline:1px solid var(--anatomy-muted);outline-offset:6px}
.aloe-intro{margin:0 0 8px;color:var(--anatomy-strong);font-size:15px}
.aloe-intro small{display:block;color:var(--anatomy-muted);font-size:13px}
`;

// Skin Shield: every towel that has been through the serum carries a soft blue
// glow, a halo round its whole outline and a column rising off its full width,
// drawn behind the towel so the olive stays true. Needs SERUM_DEFS in the svg.
export const SERUM_DEFS = `<defs><linearGradient id="serum-column" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--serum-glow);stop-opacity:.62"/><stop offset=".4" style="stop-color:var(--serum-glow);stop-opacity:.24"/><stop offset="1" style="stop-color:var(--serum-glow);stop-opacity:0"/></linearGradient></defs>`;
function hull2(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
export function skinShield(P, plan, z, h, { level = 0.62, rise = 22 } = {}) {
  const at = (p) => k.iso(p, P);
  const top = z + h;
  const ring = k.ringOf(k.insetPlan(plan, -2.2), 3), own = k.ringOf(plan, 3);
  const halo = k.pathOf(hull2([...ring.map(([x, y]) => at([x, y, z])), ...ring.map(([x, y]) => at([x, y, top + 1.5]))]), true);
  const column = k.pathOf(hull2([...own.map(([x, y]) => at([x, y, top])), ...own.map(([x, y]) => at([x, y, top + rise]))]), true);
  return `<g class="skin-shield" style="opacity:${level}"><path d="${column}" fill="url(#serum-column)" style="filter:blur(3px)"/><path d="${halo}" class="serum-wash" style="filter:blur(3.5px)"/></g>`;
}

export function helpers(P) {
  const at = (point) => k.iso(point, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (points, style) => k.dotsSvg(points, style);
  const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
  const byDepth = (points) => [...points].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
  // A horizontal round part (roller, roll, pulley, hinge rod) along +y or +x.
  const roundAlong = (axis, [x, y, z], s0, s1, r, style, options = {}) => {
    const F = G.frameAlong([x, y, z], axis === "y" ? [0, 1, 0] : [1, 0, 0]);
    return S(G.disc(s0, s1, r, F, P, options), style);
  };
  return { at, S, L, D, depth, byDepth, roundAlong };
}

// The bench every machine in the set stands on: plate on feet, groove, corner
// screws, a ruler strip along the near edge and a label plate.
export function bench(P, PLATE, { label = [PLATE.x + 12, PLATE.y + PLATE.d - 14] } = {}) {
  const { at, S, L, D, byDepth } = helpers(P);
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -17, 12, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 7, -17, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -15.4, 3.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -12, 12, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const strip = { x: PLATE.x + 40, y: PLATE.y + PLATE.d - 13, w: PLATE.w - 80, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }));
  const plate = { x: label[0], y: label[1] - 4, w: 22, d: 9, r: 1 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 1.4), 0.8, P, 3), { tone: "faint" }));
  [14, 10, 12].forEach((w, i) => out.push(L(k.lineOnTop([plate.x + 3, plate.y + 2.6 + i * 1.9], [plate.x + 3 + w, plate.y + 2.6 + i * 1.9], 0.8, P), { tone: "lo", free: true })));
  return out.join("");
}

// One card per figure; each live script runs in its own block so their names never clash.
export function cardHtml({ fig, title, hint, readout, keys, caption, svg, label, max }) {
  return k.plateHtml({
    fig, title, hint, readout, keys, caption,
    body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="0">${svg}</div>`,
  });
}

export function pageHtml({ title, theme, intro, cards, lives }) {
  const script = kitScript() + `\nconst ALOE_STILL = matchMedia("(prefers-reduced-motion: reduce)");\nconst ALOE_STAGES = [...document.querySelectorAll(".iso-stage")];\n` + lives.map((live, i) => `{\nconst stage = ALOE_STAGES[${i}];\n${live}\n}`).join("\n");
  const page = k.pageHtml({ title, theme, width: 760, body: intro + cards.join(""), script });
  return page.replace("</style>", `${ALOE_CSS}</style>`);
}

// The shared live scaffolding: a cycle clock t in [0, 1) that the idle tour
// advances, the pointer scrubs and the arrow keys step through phase starts.
export const PRE = `
const svg = stage.querySelector("svg");
const readout = stage.closest(".iso-plate").querySelector("[data-readout]");
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease = (x) => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const span = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const say = (text) => { if (readout.textContent !== text) readout.textContent = text; };
`;
export const LOOP = `
let t = START, target = START, touring = !ALOE_STILL.matches, frame = 0, last = 0, visible = false, idle = 0;
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { t = (t + dt / CYCLE) % 1; target = t; }
  else {
    const before = t;
    t = ALOE_STILL.matches ? target : t + (target - t) * (1 - Math.exp(-dt / 0.22));
    if (Math.abs(target - t) < 1e-4) t = target;
    if (before === t && !touring) { frame = 0; draw(t, now / 1000); return; }
  }
  draw(t, now / 1000);
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (window.ALOE_FILM) return; if (!frame && visible) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => {
  touring = false; target = clamp(next, 0, 0.999);
  clearTimeout(idle);
  idle = setTimeout(() => { touring = !ALOE_STILL.matches; run(); }, 3600);
  run();
};
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect();
  steer(clamp(((event.clientX - box.left) / box.width - 0.08) / 0.84, 0, 0.999));
});
stage.addEventListener("keydown", (event) => {
  const here = PHASES.reduce((best, p, i) => (p.at <= target + 1e-6 ? i : best), 0);
  let to = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") to = (here + 1) % PHASES.length;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") to = (here - 1 + PHASES.length) % PHASES.length;
  if (event.key === "Home") to = 0;
  if (event.key === "End") to = PHASES.length - 1;
  if (to === null) return;
  event.preventDefault();
  steer(PHASES[to].at + 0.001);
  stage.setAttribute("aria-valuetext", PHASES[to].name);
});
draw(t, 0);
// film mode: a recorder sets the exact moment of every figure, frame by frame
(window.__aloe = window.__aloe || []).push((at, clock) => { touring = false; t = target = at; draw(at, clock); });
`;
