// node aloe/line.mjs → aloe/line-film.html: Figs 05–08 joined end to end into one
// production line in one camera, with transfer conveyors between the benches,
// and a film camera that establishes the whole line, tracks it machine by
// machine and pulls back. aloe/record.mjs --line records it.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { k, G, pageHtml, PRE, LOOP } from "./lib.mjs";
import { fig05 } from "./fig05-spin.mjs";
import { fig06 } from "./fig06-weave.mjs";
import { fig07 } from "./fig07-finish.mjs";
import { fig08 } from "./fig08-serum.mjs";
import { fig09 } from "./fig09-pack.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const PITCH_X = 380; // bench to bench along the line (benches are 320 long)
const K = 1.25; // one scale for the whole line
const P = { origin: [0, 0], scale: K, azimuth: 50 };
const FIGS = [
  { fig: fig05, step: "05", title: "Blend & spin", cap: "Aloe powder is blended into the viscose, then spun into fibre and wound onto cones.", cycle: 12 },
  { fig: fig06, step: "06", title: "Three-layer weave", cap: "The cones feed the loom, which weaves the face, middle and body layers at once.", cycle: 15 },
  { fig: fig07, step: "07", title: "Cut, stitch & fold", cap: "The woven roll is cut into towels, hemmed and folded face side up.", cycle: 11 },
  { fig: fig08, step: "08", title: "Serum finish", cap: "Each folded towel rides on to take one drop of serum.", cycle: 5.5 },
  { fig: fig09, step: "09", title: "Pack", cap: "Each towel is set into its doctor towels box, the lid is closed and the box moves on.", cycle: 7 },
];

const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const projOf = (fig) => JSON.parse(fig.live.match(/const P = (\{[^\n]*\});/)[1]);

// each figure's own drawing, re-seated in the line's camera at its place on the line
const placed = FIGS.map((f, i) => {
  const Pi = projOf(f.fig);
  const card = f.fig.card;
  const a = card.indexOf('class="iso-svg'), from = card.lastIndexOf("<svg", a), to = card.indexOf("</svg>", a) + 6;
  const inner = card.slice(card.indexOf(">", a) + 1, to - 6);
  const shift = at([i * PITCH_X, 0, 0]);
  const s = K / Pi.scale;
  const tx = shift[0] - s * Pi.origin[0], ty = shift[1] - s * Pi.origin[1];
  const box = [[0, 0], [600, 0], [0, 370], [600, 370]].map(([x, y]) => [tx + s * x, ty + s * y]);
  const svg = `<g class="iso-plate"><text data-readout display="none"></text><g class="iso-stage" transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})"><svg width="600" height="370" viewBox="0 0 600 370" overflow="visible">${inner}</svg></g></g>`;
  const centre = at([i * PITCH_X, 0, 20]);
  return { ...f, svg, box, centre };
});

// ---------- transfer conveyors between the benches ----------
function conveyor(x0, x1, z, { width = 30, rollers = true } = {}) {
  const out = [];
  const h = width / 2;
  for (const y of [-h - 3, h]) for (const x of [x0 + 8, x1 - 8]) out.push(S(k.slabOf({ x: x - 2, y, w: 4, d: 3, r: 0.6 }, -17, z - 4 + 17, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: -h - 3, w: x1 - x0, d: 3, r: 0.8 }, z - 5, 6.5, P, 3, 0.4), { tone: "mid" }));
  if (rollers) for (let x = x0 + 4; x < x1 - 2; x += 7) out.push(S(G.disc(0, width, 1.6, G.frameAlong([x, -h, z - 1.6], [0, 1, 0]), P), { tone: "mid" }));
  else out.push(S(k.slabOf({ x: x0, y: -h, w: x1 - x0, d: width, r: 0.6 }, z - 1.2, 1.2, P, 2), { tone: "lo", crease: "lo" }));
  return out.join("");
}
function railFront(x0, x1, z, width = 30) {
  return S(k.slabOf({ x: x0, y: width / 2, w: x1 - x0, d: 3, r: 0.8 }, z - 5, 6.5, P, 3, 0.4), { tone: "mid" });
}

// 05 → 06: cones of aloe viscose yarn on a roller conveyor
const A = { x0: 150, x1: PITCH_X - 150, z: 4 };
const cone = `<g class="cl-face">${S(G.solidOf([[0, 6], [13, 3.4]], G.frameAlong([0, 0, A.z], [0, 0, 1]), P), { tone: "hi", crease: "lo" })}</g>${S(k.cylinder(0, 0, 1.1, A.z + 13, 2.4, P, 12), { tone: "mid", crease: "none" })}`;
// 06 → 07: woven rolls, body side out
const B = { x0: PITCH_X + 150, x1: 2 * PITCH_X - 150, z: 4 };
const roll = `<g class="cl-body">${S(G.disc(0, 26, 6.5, G.frameAlong([0, -13, B.z + 6.5], [0, 1, 0]), P), { tone: "hi", crease: "lo" })}${L(G.circleOf(G.frameAlong([0, -13, B.z + 6.5], [0, 1, 0]), 26, 4, P), { tone: "lo" })}</g>${S(G.disc(26, 28, 1.6, G.frameAlong([0, -13, B.z + 6.5], [0, 1, 0]), P), { tone: "mid" })}`;
// 07 → 08: the serum belt runs back to the finishing bench at its own height
const C = { x0: 2 * PITCH_X + 146, x1: 3 * PITCH_X - 148, z: 24 };

const items = (name, n) => Array.from({ length: n }, (_, i) => `<g data-item="${name}" style="opacity:0">${name === "cone" ? cone : roll}</g>`).join("");
const bridgeA = conveyor(A.x0, A.x1, A.z) + `<g data-part="cones">${items("cone", 4)}</g>` + railFront(A.x0, A.x1, A.z);
const bridgeB = conveyor(B.x0, B.x1, B.z, { width: 34 }) + `<g data-part="rolls">${items("roll", 3)}</g>` + railFront(B.x0, B.x1, B.z, 34);
const bridgeC = conveyor(C.x0, C.x1, C.z, { width: 40, rollers: false }) + `<path data-part="cleats" class="iso-line" data-tone="faint" d=""/>`;
const bridgeCFront = railFront(C.x0, C.x1, C.z, 40);
// 08 → 09: the serum belt carries on to the packer at the same height
const Dz = { x0: 3 * PITCH_X + 150, x1: 4 * PITCH_X - 158, z: 24 };
const towelItem = (() => {
  const tp = { x: -13, y: -17, w: 26, d: 34, r: 1.6 };
  return `<g class="cl-face">${S(k.slabOf(tp, Dz.z, 2.4, P, 3, 0.3), { tone: "hi", crease: "lo", inner: L(k.sideSeam(tp, Dz.z + 1.2, P, 3), { tone: "faint" }) })}</g><g class="cl-body">${S(k.slabOf({ x: -10, y: 8, w: 9, d: 4, r: 0.5 }, Dz.z + 2.4, 0.5, P, 2), { tone: "hi", crease: "lo" })}</g>`;
})();
const bridgeD = conveyor(Dz.x0, Dz.x1, Dz.z, { width: 40, rollers: false }) + `<g data-part="towels-d">${Array.from({ length: 2 }, () => `<g data-item style="opacity:0">${towelItem}</g>`).join("")}</g>` + railFront(Dz.x0, Dz.x1, Dz.z, 40);

// order: back of the line first; each bridge between the benches it joins
const body = [placed[0].svg, bridgeA, placed[1].svg, bridgeB, placed[2].svg, bridgeC, bridgeCFront, placed[3].svg, bridgeD, placed[4].svg].join("");
const xs = placed.flatMap((p) => p.box.map((b) => b[0])), ys = placed.flatMap((p) => p.box.map((b) => b[1]));
const WORLD = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };

// ---------- the cut ----------
// Establish the whole line, track machine to machine, pull back. Times in seconds.
const WIDE = 2520; // wide shot width in viewBox units, fits the whole line
const CLOSE = 820;
const shots = [];
let time = 0;
shots.push({ at: 0, c: [WORLD.x + WORLD.w / 2, WORLD.y + WORLD.h / 2], w: WIDE, focus: -1 });
time = 4.2;
shots.push({ at: time, c: [WORLD.x + WORLD.w / 2, WORLD.y + WORLD.h / 2], w: WIDE, focus: -1 });
placed.forEach((p, i) => {
  time += i === 0 ? 2.4 : 1.9; // travel
  shots.push({ at: time, c: p.centre, w: CLOSE, focus: i });
  time += i === 4 ? 8 : i === 3 ? 6.4 : 6.6; // hold on the machine
  shots.push({ at: time, c: p.centre, w: CLOSE, focus: i });
});
time += 2.6;
shots.push({ at: time, c: [WORLD.x + WORLD.w / 2, WORLD.y + WORLD.h / 2], w: WIDE, focus: -1 });
time += 3.4;
shots.push({ at: time, c: [WORLD.x + WORLD.w / 2, WORLD.y + WORLD.h / 2], w: WIDE, focus: -1 });
const TOTAL = time;

const FILM_CSS = `
html,body{width:1920px;height:1080px;overflow:hidden}
.iso-page{width:1920px!important;height:1080px;margin:0!important;position:relative;background:var(--anatomy-card);--anatomy-paper:var(--anatomy-card)}
#line{position:absolute;inset:0;width:1920px;height:1080px}
.line-scrim{position:absolute;left:0;right:0;pointer-events:none}
.line-scrim[data-card=top]{top:0;height:150px;background:linear-gradient(var(--anatomy-card) 45%,transparent)}
.line-scrim[data-card=bottom]{bottom:0;height:210px;background:linear-gradient(transparent,var(--anatomy-card) 55%)}
.line-head{position:absolute;left:96px;right:96px;top:60px;display:flex;align-items:baseline;gap:22px;font-family:var(--anatomy-mono);color:var(--anatomy-muted);letter-spacing:.14em;text-transform:uppercase;font-size:20px}
.line-step{color:var(--anatomy-strong);font-size:22px}
.line-rule{flex:1;height:1px;background:var(--anatomy-faint);align-self:center}
.line-foot{position:absolute;left:96px;right:96px;bottom:56px;display:flex;justify-content:space-between;align-items:baseline;gap:40px}
.line-cap{margin:0;max-width:62ch;color:var(--anatomy-strong);font-size:27px;line-height:1.35}
.line-read{font-family:var(--anatomy-mono);font-size:19px;color:var(--anatomy-muted);white-space:nowrap}
.line-card{position:absolute;left:96px;bottom:150px;display:grid;justify-items:start;gap:16px;text-align:left}
.line-card h1{margin:0;font-size:54px;font-weight:600;letter-spacing:-.02em;color:var(--anatomy-strong);white-space:nowrap}
.line-card p{margin:0;font-family:var(--anatomy-mono);font-size:19px;letter-spacing:.16em;text-transform:uppercase;color:var(--anatomy-muted)}
.line-steps{position:absolute;left:96px;bottom:84px;display:flex;gap:40px;font-family:var(--anatomy-mono);font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:var(--anatomy-muted)}
.line-steps b{color:var(--anatomy-strong);font-weight:500;margin-right:10px}
`;

const overlay = `
<div class="line-scrim" data-card="top"></div><div class="line-scrim" data-card="bottom"></div>
<div class="line-card" data-card="open"><p>Steps 05 to 09</p><h1>The making of an aloe vera towel</h1></div>
<div class="line-card" data-card="end"><p>One line, from fibre to the box</p><h1>From aloe to your door</h1></div>
<div class="line-steps" data-card="steps">${FIGS.map((f) => `<span><b>${f.step}</b>${f.title}</span>`).join("")}</div>
<div class="line-head" data-card="head"><span class="line-step" data-head-step></span><span data-head-title></span><span class="line-rule"></span><span>The aloe towel line</span></div>
<div class="line-foot" data-card="foot"><p class="line-cap" data-cap></p><span class="line-read" data-read></span></div>`;

const control = `<script>
window.ALOE_FILM = true; window.ALOE_LINE = true;
const LINE = ${JSON.stringify({ shots, total: TOTAL, figs: FIGS.map((f) => ({ step: f.step, title: f.title, cap: f.cap, cycle: f.cycle })), A, B, C, D: Dz, K, UNIT: k.iso([1, 0, 0], { origin: [0, 0], scale: 1, azimuth: 90 })[0] })};
const fade = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
function camera(time) {
  const s = LINE.shots;
  let i = 0;
  while (i < s.length - 2 && time >= s[i + 1].at) i++;
  const a = s[i], b = s[i + 1], u = ease((time - a.at) / (b.at - a.at || 1));
  // travel in log space for width, so zooming in and out feels even
  const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * u);
  return { c: [a.c[0] + (b.c[0] - a.c[0]) * u, a.c[1] + (b.c[1] - a.c[1]) * u], w, focus: u < 0.5 ? a.focus : b.focus, settle: a.focus === b.focus ? 1 : Math.abs(u - 0.5) * 2 };
}
const lineSvg = () => document.getElementById("line");
// the line's camera (azimuth 50, elevation 30), worked out here: the kit lives in the figures' module scope
const SA = Math.sin(50 * Math.PI / 180), CA = Math.cos(50 * Math.PI / 180), SE = 0.5, CE = Math.sqrt(3) / 2;
const isoAt = (x, y, z) => [(x * SA - y * CA) * LINE.K * LINE.UNIT, ((x * CA + y * SA) * SE - z * CE) * LINE.K * LINE.UNIT];
const segAt = (a, b) => { const p = isoAt(...a), q = isoAt(...b); return "M" + p[0].toFixed(1) + " " + p[1].toFixed(1) + "L" + q[0].toFixed(1) + " " + q[1].toFixed(1); };
function belt(group, sel, x0, x1, z, pitch, speed, time) {
  const nodes = group.querySelectorAll(sel), span = x1 - x0;
  nodes.forEach((n, i) => {
    const x = x0 + ((time * speed + i * pitch) % span);
    const edge = Math.min(1, (x - x0) / 10, (x1 - x) / 10);
    const q = isoAt(x, 0, 0), o = isoAt(0, 0, 0);
    n.setAttribute("transform", "translate(" + (q[0] - o[0]).toFixed(2) + " " + (q[1] - o[1]).toFixed(2) + ")");
    n.style.opacity = String(Math.max(0, edge));
  });
}
window.filmAt = (time) => {
  const cam = camera(time);
  const h = cam.w * 9 / 16;
  lineSvg().setAttribute("viewBox", [cam.c[0] - cam.w / 2, cam.c[1] - h / 2, cam.w, h].map((v) => v.toFixed(2)).join(" "));
  // every machine runs all the time, each on its own cycle
  window.__aloe.forEach((hook, i) => hook((time / LINE.figs[i].cycle + (i === 3 ? 0.3 : i === 4 ? 0.2 : 0.05)) % 1, time));
  belt(document.querySelector('[data-part="cones"]'), "[data-item]", LINE.A.x0 + 6, LINE.A.x1 - 6, LINE.A.z, (LINE.A.x1 - LINE.A.x0 - 12) / 4, 9, time);
  belt(document.querySelector('[data-part="rolls"]'), "[data-item]", LINE.B.x0 + 4, LINE.B.x1 - 4, LINE.B.z, (LINE.B.x1 - LINE.B.x0 - 8) / 3, 6, time);
  belt(document.querySelector('[data-part="towels-d"]'), "[data-item]", LINE.D.x0 + 4, LINE.D.x1 - 4, LINE.D.z, (LINE.D.x1 - LINE.D.x0 - 8) / 2, 6, time);
  // the serum belt's cleats index with its towels
  const t8 = (time / LINE.figs[3].cycle + 0.3) % 1, m = fade(Math.min(1, t8 / 0.34));
  const off = ((Math.floor(time / LINE.figs[3].cycle + 0.3) + m) * 40) % 10, lines = [];
  for (let x = LINE.C.x0 + off; x < LINE.C.x1; x += 10) lines.push(segAt([x, -20, LINE.C.z], [x, 20, LINE.C.z]));
  document.querySelector('[data-part="cleats"]').setAttribute("d", lines.join(""));
  // titles and captions
  const q = (s) => document.querySelector(s);
  q('[data-card="open"]').style.opacity = String(fade(time / 0.8) * (1 - fade((time - 4.4) / 0.9)));
  q('[data-card="steps"]').style.opacity = String(fade((time - 0.6) / 0.8) * (1 - fade((time - 4.4) / 0.9)) + fade((time - (LINE.total - 3.4)) / 0.9));
  q('[data-card="end"]').style.opacity = String(fade((time - (LINE.total - 3.2)) / 0.9));
  const show = cam.focus >= 0 ? fade((cam.settle - 0.35) / 0.65) : 0;
  q('[data-card="head"]').style.opacity = q('[data-card="foot"]').style.opacity = String(show);
  q('[data-card="top"]').style.opacity = String(show);
  q('[data-card="bottom"]').style.opacity = String(Math.max(show, fade(time / 0.8) * (1 - fade((time - 4.4) / 0.9)), fade((time - (LINE.total - 3.4)) / 0.9)));
  if (cam.focus >= 0) {
    const f = LINE.figs[cam.focus];
    q("[data-head-step]").textContent = f.step; q("[data-head-title]").textContent = f.title; q("[data-cap]").textContent = f.cap;
    q("[data-read]").textContent = document.querySelectorAll("[data-readout]")[cam.focus].textContent;
  }
};
</script>`;

const svg = `<svg id="line" class="iso-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${WORLD.x} ${WORLD.y} ${WORLD.w} ${WORLD.h}" role="img" aria-label="The aloe towel line, steps 05 to 09, joined end to end: blending and spinning, the three-layer loom, the finishing bench, the serum dosing station and the packing station, with conveyors carrying cones, woven rolls and folded towels between them.">${body}</svg>`;
const lives = FIGS.map((f) => PRE + f.fig.live.replace("__LOOP__", LOOP));
let html = pageHtml({ title: "Aloe towel line film", theme: "light", intro: control, cards: [svg, overlay], lives });
html = html.replace("</style>", FILM_CSS + "</style>");
writeFileSync(join(HERE, "line-film.html"), html);
console.log("wrote line-film.html", TOTAL.toFixed(1) + " s", Math.round(TOTAL * FPS) + " frames", "world", WORLD);
export { TOTAL, FPS };
