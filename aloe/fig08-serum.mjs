// Fig 08 · Serum finish. A stainless dosing cabinet on casters, with an angled
// control panel, a stack light and a boom that carries a dosing head over an
// indexing conveyor. Each folded towel stops under the head, takes one drop of
// blue serum on its face side, and leaves with a soft glow over it.
import { k, G, WIDTH, HEIGHT, helpers, bench, cardHtml } from "./lib.mjs";

const PLATE = { x: -160, y: -64, w: 320, d: 128, r: 8 };
const BASE_Z = 8; // cabinet floor, on casters
const TOP_Z = 54;
const CAB_Y = [-62, -32]; // cabinet depth
const LEFT = { x: -96, y: CAB_Y[0], w: 62, d: CAB_Y[1] - CAB_Y[0], r: 1.4 };
const RIGHT_X = [-34, 22]; // the block with the angled panel
const SLOPE = { y0: CAB_Y[1], z0: 36, y1: CAB_Y[1] - 12, z1: TOP_Z }; // angled face, bottom edge to top edge
const BELT_Z = 24;
const BELT = { x: -148, y: -20, w: 296, d: 40, r: 1 };
const DOSE_X = 8; // the head and the towel stopped under it
const PITCH = 40; // towel spacing; one index per cycle
const TOWEL = { w: 26, d: 34, h: 2.4 };
const HEAD_Z = 46; // head bottom at rest
const SLOTS = [-4, -3, -2, -1, 0, 1, 2, 3];

const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [-80, -60, 72], [DOSE_X, 0, 88]], WIDTH, HEIGHT, { pad: 26, azimuth: 50 });
const { at, S, L, D, byDepth } = helpers(P);
const KS = P.scale * 1; // screen px per world unit (UNIT is 1 in the kit)
const alongY = (x, y, z) => G.frameAlong([x, y, z], [0, 1, 0]);
const alongX = (x, y, z) => G.frameAlong([x, y, z], [1, 0, 0]);
const slab = (plan, z, h, tone = "mid", bevel = 0.5, steps = 3) => S(k.slabOf(plan, z, h, P, steps, bevel), { tone });
// a point on the angled face: x along the cabinet, s from the bottom edge (0) to the top edge (1)
const onSlope = (x, s) => [x, SLOPE.y0 + (SLOPE.y1 - SLOPE.y0) * s, SLOPE.z0 + (SLOPE.z1 - SLOPE.z0) * s];
const SLOPE_N = G.unit3([0, SLOPE.z1 - SLOPE.z0, SLOPE.y0 - SLOPE.y1]);

function casters() {
  const out = [];
  const spots = byDepth([[-90, -56], [-90, -38], [16, -56], [16, -38]]);
  for (const [x, y] of spots) {
    out.push(slab({ x: x - 3, y: y - 3, w: 6, d: 6, r: 1 }, 6, 2, "mid", 0.3, 2));
    out.push(S(k.cylinder(x, y, 1, 4.6, 1.4, P, 12), { tone: "mid", crease: "none" }));
    const F = alongX(x - 1.4, y, 2.6);
    out.push(S(G.disc(0, 2.8, 2.6, F, P), { tone: "lo" }));
    out.push(S(G.disc(2.8, 3.2, 1, F, P), { tone: "mid" }));
  }
  // base frame rail the panels stand on
  out.push(slab({ x: LEFT.x, y: CAB_Y[0], w: RIGHT_X[1] - LEFT.x, d: CAB_Y[1] - CAB_Y[0], r: 1.4 }, 8, 2, "mid", 0.4, 4));
  return out.join("");
}

function cabinet() {
  const out = [];
  const z0 = BASE_Z + 2;
  // left block: two doors under a blue trim line, a plain upper panel
  out.push(S(k.slabOf(LEFT, z0, TOP_Z - z0, P, 3, 0.8), { tone: "mid", inner: `<path class="serum-trim" d="${k.sideSeam(LEFT, 34, P, 3)}"/>` + L(k.sideSeam(LEFT, z0 + 2, P, 3), { tone: "faint" }) }));
  const fy = CAB_Y[1];
  out.push(L(k.pathOf([at([-65, fy, z0]), at([-65, fy, 34])]), { tone: "lo" }));
  out.push(slab({ x: -63, y: fy, w: 1.4, d: 1.4, r: 0.4 }, 24, 5, "mid", 0, 2));
  out.push(D([[-94, 12], [-67, 12], [-63, 12], [-36, 12], [-94, 32], [-36, 32], [-94, 52], [-36, 52]].map(([x, z]) => at([x, fy, z])), { size: 0.45 }));
  // right block: angled control face over a lower panel
  const F = G.frameOf([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const profile = [[CAB_Y[0], z0], [CAB_Y[1], z0], [SLOPE.y0, SLOPE.z0], [SLOPE.y1, SLOPE.z1], [CAB_Y[0], TOP_Z]];
  out.push(S(G.prismOf(F, profile, RIGHT_X[0], RIGHT_X[1], P), { tone: "mid", crease: "lo" }));
  out.push(L(k.pathOf([at([RIGHT_X[0], SLOPE.y0, SLOPE.z0]), at([RIGHT_X[1], SLOPE.y0, SLOPE.z0])]), { tone: "lo" }));
  const lower = [[RIGHT_X[0] + 3, z0 + 3], [RIGHT_X[1] - 3, z0 + 3], [RIGHT_X[1] - 3, SLOPE.z0 - 3], [RIGHT_X[0] + 3, SLOPE.z0 - 3]];
  out.push(L(k.pathOf(lower.map(([x, z]) => at([x, fy, z])), true), { tone: "faint" }));
  out.push(D(lower.map(([x, z]) => at([x, fy, z])), { size: 0.45 }));
  // control panel on the angled face: bezel, screen, three buttons, stop button
  const quad = (x0, x1, s0, s1) => k.pathOf([onSlope(x0, s0), onSlope(x1, s0), onSlope(x1, s1), onSlope(x0, s1)].map(at), true);
  out.push(`<path class="iso-top" d="${quad(-24, 4, 0.16, 0.86)}"/>`, L(quad(-24, 4, 0.16, 0.86), { tone: "lo" }));
  out.push(`<path class="serum-screen" d="${quad(-20, -2, 0.26, 0.76)}"/>`);
  out.push(`<path data-part="screen-bar" class="serum-fill" d=""/>`);
  out.push(L(quad(-18, -4, 0.34, 0.42), { tone: "faint" }));
  for (const x of [0.5, 2.5]) out.push(S(G.disc(0, 0.8, 0.7, G.frameAlong(onSlope(x, 0.32 + (x - 0.5) * 0.12), SLOPE_N), P), { tone: "hi" }));
  const stop = G.frameAlong(onSlope(14, 0.42), SLOPE_N);
  out.push(S(G.disc(0, 1.2, 3.4, stop, P), { tone: "mid" }));
  out.push(S(G.disc(1.2, 2.8, 2.4, stop, P), { tone: "hi", crease: "lo" }));
  // side face: a sample tap
  const tap = alongX(RIGHT_X[1], -46, 20);
  out.push(S(G.disc(0, 2, 2.4, tap, P), { tone: "mid" }));
  out.push(S(G.disc(2, 6, 1, tap, P), { tone: "mid" }));
  out.push(S(k.cylinder(RIGHT_X[1] + 5.4, -46, 1, 15, 5, P, 12), { tone: "mid", crease: "none" }));
  out.push(D(k.corners({ x: RIGHT_X[1], y: CAB_Y[0], w: 0, d: CAB_Y[1] - CAB_Y[0] }, 3).slice(0, 2).map(([, y]) => at([RIGHT_X[1], y, 12])).concat([at([RIGHT_X[1], CAB_Y[0] + 3, 50]), at([RIGHT_X[1], CAB_Y[1] - 3, 33])]), { size: 0.45 }));
  // stack light on the left block
  const [lx, ly] = [-88, -54];
  out.push(S(k.cylinder(lx, ly, 2.4, TOP_Z, 1, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(lx, ly, 0.9, TOP_Z + 1, 8, P, 12), { tone: "mid", crease: "none" }));
  out.push(S(k.cylinder(lx, ly, 2, TOP_Z + 9, 3.4, P, 20), { tone: "mid" }));
  out.push(`<g class="serum-tier">${S(k.cylinder(lx, ly, 2, TOP_Z + 12.4, 3.4, P, 20), { tone: "mid" })}<g data-part="tier" style="opacity:0">${S(k.cylinder(lx, ly, 2, TOP_Z + 12.4, 3.4, P, 20), { tone: "hi", lit: true })}</g></g>`);
  out.push(S(k.cylinder(lx, ly, 2, TOP_Z + 15.8, 3.4, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(lx, ly, 2.2, TOP_Z + 19.2, 1, P, 20), { tone: "mid" }));
  // serum reservoir cap and the feed line's gland on top
  out.push(S(k.cylinder(-60, -48, 6, TOP_Z, 3, P, 32, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(-60, -48, 6, TOP_Z, TOP_Z + 3, 30, P), { tone: "faint" }));
  out.push(`<path class="serum-fill" d="${k.ring(-60, -48, 3, TOP_Z + 3, P, 24)}" style="opacity:.9"/>`);
  out.push(L(k.ring(-60, -48, 3, TOP_Z + 3, P, 24), { tone: "lo" }));
  return out.join("");
}

function conveyorBack() {
  const out = [];
  for (const x of [-136, -40, 56, 136]) out.push(slab({ x: x - 2, y: -24, w: 4, d: 4, r: 0.8 }, 0, 16, "mid", 0.3, 2));
  out.push(S(k.slabOf({ x: -150, y: -24, w: 300, d: 4, r: 1 }, 16, 10, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam({ x: -150, y: -24, w: 300, d: 4, r: 1 }, 21, P, 3), { tone: "faint" }) }));
  for (const x of [-146, 146]) out.push(S(G.disc(0, 40, 2.4, alongY(x, -20, BELT_Z - 2.4), P), { tone: "mid" }));
  out.push(S(k.slabOf(BELT, BELT_Z - 1.2, 1.2, P, 2), { tone: "lo", crease: "lo" }));
  out.push(`<path data-part="cleats" class="iso-line" data-tone="faint" d=""/>`);
  return out.join("");
}

function towelArt() {
  const plan = { x: -TOWEL.w / 2, y: -TOWEL.d / 2, w: TOWEL.w, d: TOWEL.d, r: 1.6 };
  const inner = L(k.sideSeam(plan, BELT_Z + TOWEL.h / 2, P, 3), { tone: "faint" });
  const top = BELT_Z + TOWEL.h;
  const stitch = k.lineOnTop([plan.x, plan.y + plan.d - 3], [plan.x + plan.w, plan.y + plan.d - 3], top, P);
  return `<path class="iso-halo" d="${k.haloOf(k.insetPlan(plan, 2), BELT_Z, 0.1, P)}" style="filter:blur(3px)"/><g class="cl-face">${S(k.slabOf(plan, BELT_Z, TOWEL.h, P, 3, 0.3), { tone: "hi", crease: "lo", inner })}<path class="aloe-stitch-under" d="${stitch}"/><path class="aloe-stitch" d="${stitch}"/></g><g class="cl-body">${S(k.slabOf({ x: plan.x + 3, y: plan.y + plan.d - 9, w: 9, d: 4, r: 0.5 }, top, 0.5, P, 2), { tone: "hi", crease: "lo" })}</g>`;
}

function slots() {
  const art = towelArt();
  const top = at([0, 0, BELT_Z + TOWEL.h]);
  const glow = glowArt();
  return SLOTS.map((n) => `<g data-slot="${n}"><g data-glow style="opacity:0">${glow}</g>${art}<ellipse data-spot class="serum-fill" cx="${top[0].toFixed(1)}" cy="${top[1].toFixed(1)}" rx="0" ry="0"/></g>`).join("");
}

// each towel's glow sits behind it: a halo round its whole outline and a soft
// column rising off its full width
function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
function glowArt() {
  const top = BELT_Z + TOWEL.h;
  const plan = { x: -TOWEL.w / 2, y: -TOWEL.d / 2, w: TOWEL.w, d: TOWEL.d, r: 1.6 };
  const ring = k.ringOf(k.insetPlan(plan, -2.2), 3);
  const halo = k.pathOf(hull([...ring.map(([x, y]) => at([x, y, BELT_Z])), ...ring.map(([x, y]) => at([x, y, top + 1.5]))]), true);
  const column = k.pathOf(hull([...k.ringOf(plan, 3).map(([x, y]) => at([x, y, top])), ...k.ringOf(plan, 3).map(([x, y]) => at([x, y, top + 22]))]), true);
  return `<path d="${column}" fill="url(#serum-column)" style="filter:blur(3px)"/><path d="${halo}" class="serum-wash" style="filter:blur(3.5px)"/>`;
}

function conveyorFront() {
  const out = [];
  for (const x of [-136, -40, 56, 136]) out.push(slab({ x: x - 2, y: 20, w: 4, d: 4, r: 0.8 }, 0, 16, "mid", 0.3, 2));
  const rail = { x: -150, y: 20, w: 300, d: 4, r: 1 };
  out.push(S(k.slabOf(rail, 16, 10, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(rail, 21, P, 3), { tone: "faint" }) }));
  out.push(D([-120, -60, 0, 60, 120].map((x) => at([x, 24, 23.5])), { size: 0.45 }));
  // gear motor on the drive roller
  const drive = alongY(146, 24, BELT_Z - 2.4);
  out.push(S(G.disc(0, 3, 4.4, drive, P), { tone: "mid" }));
  out.push(S(G.disc(3, 13, 3.6, drive, P), { tone: "mid", inner: L(G.arcOf(drive, 8, 3.6, P), { tone: "faint" }) }));
  out.push(S(G.disc(13, 14, 2.6, drive, P), { tone: "mid" }));
  return out.join("");
}

function boom() {
  const out = [];
  const col = { x: DOSE_X - 3, y: -50, w: 6, d: 6, r: 1 };
  out.push(S(k.slabOf(col, TOP_Z, 30, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(col, TOP_Z + 4, P, 3), { tone: "faint" }) }));
  const arm = { x: DOSE_X - 4, y: -51, w: 8, d: 56, r: 1.4 };
  out.push(S(k.slabOf(arm, TOP_Z + 30, 5, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(arm, TOP_Z + 32.5, P, 3), { tone: "faint" }) }));
  out.push(D([-46, -10, 0].map((y) => at([DOSE_X, y, TOP_Z + 35])), { size: 0.45 }));
  // guide sleeve under the arm end; the head slides in it
  out.push(slab({ x: DOSE_X - 3.4, y: -3.4, w: 6.8, d: 6.8, r: 1.2 }, TOP_Z + 24, 6, "mid", 0.4, 3));
  out.push(`<g data-part="head">`);
  out.push(S(k.slabOf({ x: DOSE_X - 2.6, y: -2.6, w: 5.2, d: 5.2, r: 1 }, HEAD_Z + 4, TOP_Z + 24 - HEAD_Z - 4, P, 3, 0.4), { tone: "hi", lit: true }));
  out.push(S(k.cylinder(DOSE_X, 0, 1.6, HEAD_Z + 1.4, 2.6, P, 16), { tone: "hi", lit: true }));
  out.push(S(k.cylinder(DOSE_X, 0, 0.7, HEAD_Z, 1.4, P, 12), { tone: "hi", lit: true, crease: "none" }));
  out.push(`</g>`);
  out.push(`<ellipse data-part="drop" class="serum-fill" cx="0" cy="0" rx="0" ry="0"/>`);
  return out.join("");
}

const defs = `<defs>
<radialGradient id="serum-halo"><stop offset="0" style="stop-color:var(--serum-glow);stop-opacity:.75"/><stop offset=".55" style="stop-color:var(--serum-glow);stop-opacity:.28"/><stop offset="1" style="stop-color:var(--serum-glow);stop-opacity:0"/></radialGradient>
<linearGradient id="serum-column" x1="0" y1="1" x2="0" y2="0"><stop offset="0" style="stop-color:var(--serum-glow);stop-opacity:.62"/><stop offset=".4" style="stop-color:var(--serum-glow);stop-opacity:.24"/><stop offset="1" style="stop-color:var(--serum-glow);stop-opacity:0"/></linearGradient>
</defs>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A stainless serum dosing cabinet on casters beside an indexing conveyor. Folded olive towels stop one at a time under a dosing head on a boom; the head lowers, places one drop of blue serum on the towel's face side and lifts, and the dosed towel moves on with a soft blue glow over it. A stack light on the cabinet shows blue while it doses.",
  body: [defs, bench(P, PLATE, { label: [-150, 48] }), casters(), cabinet(), conveyorBack(), `<g data-part="towels">${slots()}</g>`, conveyorFront(), boom()],
});

const live = `
const P = ${JSON.stringify(P)};
const DOSE_X = ${DOSE_X}, PITCH = ${PITCH}, BELT_Z = ${BELT_Z}, TOWEL_H = ${TOWEL.h}, HEAD_Z = ${HEAD_Z}, KS = ${KS};
const SLOPE = ${JSON.stringify(SLOPE)};
const CYCLE = 5.2, START = 0.3;
const PHASES = [{ at: 0, name: "indexing" }, { at: 0.36, name: "towel in place" }, { at: 0.5, name: "dosing" }, { at: 0.66, name: "serum set" }];
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const slots = [...svg.querySelectorAll("[data-slot]")].map((g) => ({ n: +g.dataset.slot, g, spot: g.querySelector("[data-spot]"), glow: g.querySelector("[data-glow]") }));

const head = part("head"), drop = part("drop"), tier = part("tier"), cleats = part("cleats"), bar = part("screen-bar");
const p2 = (x, y, z) => iso([x, y, z], P);
const TOP = BELT_Z + TOWEL_H;
const SIN_E = Math.sin(30 * Math.PI / 180);
const onSlope = (x, s) => [x, SLOPE.y0 + (SLOPE.y1 - SLOPE.y0) * s, SLOPE.z0 + (SLOPE.z1 - SLOPE.z0) * s];
// a burst: smooth attack, exponential decay, settling at a steady level
const bloom = (age, rise, fall, rest) => age <= 0 ? 0 : age < rise ? ease(age / rise) : rest + (1 - rest) * Math.exp(-(age - rise) / fall);
function draw(t, clock) {
  const m = ease(span(t, 0, 0.34));
  const land = 0.6;
  // head: a small lift before it lowers, dwell, then back up
  const down = t < 0.38 ? 0 : t < 0.41 ? -1.2 * ease((t - 0.38) / 0.03) : t < 0.49 ? -1.2 + 9.2 * ease((t - 0.41) / 0.08) : t < 0.68 ? 8 : 8 * (1 - ease((t - 0.68) / 0.12));
  head.setAttribute("transform", translateAlong(P, [0, 0, -down]));
  // the drop swells at the tip, falls under gravity, and squashes as it lands
  const tip = HEAD_Z - down;
  let dz = null, rx = 0, ry = 0;
  if (t >= 0.49 && t < 0.54) { const g = ease((t - 0.49) / 0.05); dz = tip - 1.4 * g; rx = ry = 1.4 * g; }
  else if (t >= 0.54 && t < land) { const f = (t - 0.54) / (land - 0.54); dz = tip - 1.4 - (tip - 1.4 - TOP - 1) * f * f; rx = 1.3; ry = 1.7; }
  else if (t >= land && t < land + 0.03) { const s = (t - land) / 0.03; dz = TOP + 0.4; rx = 1.4 + 2.4 * s; ry = 1.4 * (1 - 0.6 * s); }
  if (dz === null) { drop.setAttribute("rx", "0"); drop.setAttribute("ry", "0"); }
  else { const q = p2(DOSE_X, 0, dz); drop.setAttribute("cx", q[0].toFixed(1)); drop.setAttribute("cy", q[1].toFixed(1)); drop.setAttribute("rx", (rx * KS).toFixed(2)); drop.setAttribute("ry", (ry * KS).toFixed(2)); }
  // towels: slot n sits n pitches past the head once the index ends
  const age = (t - land) * CYCLE;
  slots.forEach((s, i) => {
    const x = DOSE_X + (s.n - 1 + m) * PITCH;
    s.g.setAttribute("transform", translateAlong(P, [x, 0, 0]));
    const edge = Math.min(1, (148 - Math.abs(x)) / 14);
    s.g.style.opacity = String(Math.max(0, edge));
    const dosed = s.n >= 1 ? 1 : s.n === 0 && t >= land ? 1 : 0;
    // the spot spreads into the face side and settles to a tint
    const spread = s.n >= 1 ? 1 : s.n === 0 ? ease(age / 0.5) : 0;
    const r = dosed ? 2.2 + 6.8 * spread : 0;
    s.spot.setAttribute("rx", (r * KS).toFixed(2));
    s.spot.setAttribute("ry", (r * KS * SIN_E).toFixed(2));
    s.spot.style.opacity = String(dosed ? 0.95 * (1 - spread) : 0);
    // the glow blooms on contact, then breathes gently as the towel travels on
    const level = s.n >= 1 ? 0.62 : s.n === 0 ? bloom(age, 0.18, 0.55, 0.62) : 0;
    const breathe = 1 + 0.08 * Math.sin(clock * 1.7 + s.n * 1.3);
    s.glow.style.opacity = String(Math.max(0, Math.min(1, level * breathe)));
  });
  // belt cleats travel with the towels; the stack light shows blue while dosing
  const travel = (m * PITCH) % 10;
  const lines = [];
  for (let x = -146 + travel; x < 146; x += 10) lines.push(lineOnTop([x, -20], [x, 20], BELT_Z, P));
  cleats.setAttribute("d", lines.join(""));
  tier.style.opacity = String(Math.max(0, Math.min(1, (t - 0.44) / 0.04)) * (1 - Math.max(0, Math.min(1, (t - 0.74) / 0.06))));
  const fill = t < 0.49 ? 0 : t < land ? (t - 0.49) / (land - 0.49) : t < 0.8 ? 1 : 1 - (t - 0.8) / 0.2;
  bar.setAttribute("d", fill > 0.01 ? pathOf([onSlope(-18, 0.52), onSlope(-18 + 14 * fill, 0.52), onSlope(-18 + 14 * fill, 0.66), onSlope(-18, 0.66)].map((q) => p2(...q)), true) : "");
  say(t < 0.34 ? "indexing · next towel in" : t < 0.49 ? "towel in place · head lowering" : t < land ? "dosing · one drop" : t < 0.8 ? "serum set · glow on" : "head up · ready");
}
${"__LOOP__"}
`;

export const fig08 = {
  card: cardHtml({
    fig: "Fig 08",
    title: "Serum finish",
    hint: "Hover to scrub one towel",
    readout: "indexing",
    keys: [
      { mark: "face", label: "Folded towel, face side up" },
      { mark: "serum", label: "Blue serum and its glow" },
      { mark: "lit", label: "Dosing head" },
    ],
    caption:
      "The conveyor indexes one towel at a time under the head. It lowers, places a single drop on the face side and lifts; the drop spreads into the weave, and the towel moves on with its glow while the next one comes in.",
    svg,
    label: "Serum finish: arrow keys step through index, lower, dose and lift; hovering scrubs one towel's cycle",
    max: 1,
  }),
  live,
};
