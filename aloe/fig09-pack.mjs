// Fig 09 · Pack. Serum-finished towels arrive on the high belt; doctor towels
// mailer boxes ride the low belt, each open with its lid up behind it. A gantry
// picks each towel with a suction head and lowers it into the box at the
// station; a closer arm swings the hinged lid shut over it, the box indexes on
// and the next empty box comes in.
import { k, G, WIDTH, HEIGHT, helpers, bench, cardHtml, skinShield, SERUM_DEFS } from "./lib.mjs";

const PLATE = { x: -160, y: -64, w: 320, d: 128, r: 8 };
const BOX = { w: 36, d: 44, h: 10 }; // the mailer, centred on its slot
const BELT_Z = 10; // box belt top
const RIM = BELT_Z + BOX.h;
const HINGE = { y: -BOX.d / 2, z: RIM }; // lid hinged along the back top edge
const OPEN = (105 * Math.PI) / 180;
const LIP = 7; // the front tuck flap
const PITCH = 64; // box spacing; one index per cycle
const TOWEL = { w: 26, d: 34, h: 2.4 };
const TOWEL_Z = 24; // high belt top, the serum belt's height
const PICK_X = -100;
const TOWEL_PITCH = 40;
const HEAD_UP = 52; // suction plate bottom at rest
const CUP = 1.6;
const BOX_SLOTS = [-1, 0, 1, 2, 3];
const TOWEL_SLOTS = [-2, -1, 0];

const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [-118, -34, 84], [22, 34, 84], [-50, 0, 112]], WIDTH, HEIGHT, { pad: 24, azimuth: 50 });
const { at, S, L, D } = helpers(P);
const V = G.viewOf(P);
const KS = P.scale;

// ---------- the hinged lid, drawn at any angle; shared by the build and the page ----------
// A point on the lid: x across, s from the hinge along the lid, h through its thickness.
// theta 0 is shut (lid along +y); OPEN stands it up behind the box.
function lidSvg(theta, x0, opts) {
  const { P, V, BOX, HINGE, LIP, iso, pathOf } = opts;
  const c = Math.cos(theta), s = Math.sin(theta);
  const pt = (x, a, h) => iso([x0 + x, HINGE.y + a * c - h * s, HINGE.z + a * s + h * c], P);
  const hw = BOX.w / 2;
  const hull = (points) => {
    const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  const facing = -s * V[1] + c * V[2]; // outer face normal (0, -sin, cos) toward the viewer
  const out = facing >= 0;
  const panel = hull([-hw, hw].flatMap((x) => [0, BOX.d].flatMap((a) => [0, 0.8].map((h) => pt(x, a, h)))));
  // the tuck lip hangs off the free edge, down the box front when shut
  const lp = (x, d) => iso([x0 + x, HINGE.y + BOX.d * c + d * s, HINGE.z + BOX.d * s - d * c], P);
  const lip = [lp(-hw, 0), lp(hw, 0), lp(hw, LIP), lp(-hw, LIP)];
  const lipFacing = c * V[1] + s * V[2]; // lip faces along the lid direction
  const fill = (cls, d, steep) => '<path class="' + cls + '"' + (steep ? " data-steep" : "") + ' d="' + d + '"/>';
  const steep = Math.abs(facing) < 0.3;
  let svg = "";
  const lipSvg = fill(lipFacing >= 0 ? "box-out" : "box-in", pathOf(lip, true), Math.abs(lipFacing) < 0.3) + '<path class="iso-line" data-tone="hi" d="' + pathOf(lip, true) + '"/>';
  const panelSvg = fill(out ? "box-out" : "box-in", pathOf(panel, true), steep) + '<path class="iso-line" data-tone="hi" d="' + pathOf(panel, true) + '"/>';
  // the lip is behind the panel while the lid stands open, in front of it once it tips over
  svg += lipFacing >= 0 ? panelSvg + lipSvg : lipSvg + panelSvg;
  if (out && !steep) {
    const m = (x, a) => { const o = pt(x, a, 0.8), u = pt(x + 1, a, 0.8), v = pt(x, a + 1, 0.8); return "matrix(" + [u[0] - o[0], u[1] - o[1], v[0] - o[0], v[1] - o[1], o[0], o[1]].map((n) => n.toFixed(3)).join(" ") + ")"; };
    svg += '<text class="box-ink" transform="' + m(1, 8) + '" font-size="2.7">doctor towels</text>';
    svg += '<text class="box-ink" transform="' + m(-hw + 5, 23.6) + '" font-size="2.4">Designed for</text>';
    svg += '<path class="box-rule" d="' + pathOf([pt(-hw + 21, 22.9, 0.8), pt(-hw + 31, 22.9, 0.8)]) + '"/>';
    svg += '<text class="box-ink box-bold" transform="' + m(-hw + 5, 30.4) + '" font-size="5.2">Sensitive</text>';
    svg += '<text class="box-ink box-bold" transform="' + m(-hw + 5, 36) + '" font-size="5.2">Skin</text>';
  }
  return svg;
}
const lidOpts = { P, V, BOX, HINGE, LIP, iso: k.iso, pathOf: k.pathOf };

// ---------- static art ----------
const plan = (x = 0) => ({ x: x - BOX.w / 2, y: -BOX.d / 2, w: BOX.w, d: BOX.d, r: 0.8 });
const inner = k.insetPlan(plan(), 1.1);
const opening = k.pathOf(k.ringOf(inner, 2).map(([x, y]) => at([x, y, RIM])), true);

function tray() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(plan(), 2), BELT_Z, 0.1, P)}" style="filter:blur(3px)"/>`];
  out.push(`<g class="box">${S(k.slabOf(plan(), BELT_Z, BOX.h, P, 2, 0.3), { tone: "hi", crease: "lo", inner: L(k.sideSeam(plan(), BELT_Z + 1.4, P, 2), { tone: "faint" }) })}</g>`);
  out.push(`<path class="box-cavity" d="${opening}"/>`);
  const far = [[inner.x, inner.y + inner.d], [inner.x, inner.y], [inner.x + inner.w, inner.y]];
  out.push(`<path class="box-wall" d="${k.pathOf([...far.map(([x, y]) => at([x, y, RIM])), ...[...far].reverse().map(([x, y]) => at([x, y, BELT_Z + 0.8]))], true)}"/>`);
  return out.join("");
}

function towelArt(z) {
  const tp = { x: -TOWEL.w / 2, y: -TOWEL.d / 2, w: TOWEL.w, d: TOWEL.d, r: 1.6 };
  const top = z + TOWEL.h;
  const stitch = k.lineOnTop([tp.x, tp.y + tp.d - 3], [tp.x + tp.w, tp.y + tp.d - 3], top, P);
  return `${skinShield(P, tp, z, TOWEL.h)}<g class="cl-face">${S(k.slabOf(tp, z, TOWEL.h, P, 3, 0.3), { tone: "hi", crease: "lo", inner: L(k.sideSeam(tp, z + TOWEL.h / 2, P, 3), { tone: "faint" }) })}<path class="aloe-stitch-under" d="${stitch}"/><path class="aloe-stitch" d="${stitch}"/></g><g class="cl-body">${S(k.slabOf({ x: tp.x + 3, y: tp.y + tp.d - 9, w: 9, d: 4, r: 0.5 }, top, 0.5, P, 2), { tone: "hi", crease: "lo" })}</g>`;
}

function boxSlot(n) {
  // a box: open and empty upstream, packed and shut downstream, live at the station
  const shut = `<g class="box">${lidSvg(0, 0, lidOpts)}</g>`;
  const open = `<g class="box">${lidSvg(OPEN, 0, lidOpts)}</g>`;
  const lid = n === 0 ? `<g data-part="lid-back"></g>` : "";
  const station = n === 0 ? `<g clip-path="url(#pack-open)"><g data-part="placed" style="display:none">${towelArt(BELT_Z + 0.8)}</g></g><g data-part="arm-back"></g><g data-part="lid" class="box"></g><g data-part="arm-front"></g>` : "";
  return `<g data-box="${n}">${n < 0 ? open : ""}${tray()}${station}${n > 0 ? shut : ""}</g>`;
}

function towelBelt() {
  const out = [];
  const x0 = -160, x1 = PICK_X + 22;
  for (const y of [-23, 20]) for (const x of [x0 + 8, x1 - 6]) out.push(S(k.slabOf({ x: x - 2, y, w: 4, d: 3, r: 0.6 }, 0, TOWEL_Z - 5, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: -23, w: x1 - x0, d: 3, r: 0.8 }, TOWEL_Z - 5, 6.5, P, 3, 0.4), { tone: "mid" }));
  out.push(S(G.disc(0, 40, 2.4, G.frameAlong([x1 - 2, -20, TOWEL_Z - 2.4], [0, 1, 0]), P), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: -20, w: x1 - x0, d: 40, r: 0.6 }, TOWEL_Z - 1.2, 1.2, P, 2), { tone: "lo", crease: "lo" }));
  out.push(`<path data-part="towel-cleats" class="iso-line" data-tone="faint" d=""/>`);
  out.push(TOWEL_SLOTS.map((n) => `<g data-towel="${n}">${towelArt(TOWEL_Z)}</g>`).join(""));
  out.push(S(k.slabOf({ x: x0, y: 20, w: x1 - x0, d: 3, r: 0.8 }, TOWEL_Z - 5, 6.5, P, 3, 0.4), { tone: "mid" }));
  return out.join("");
}

function boxBeltBack() {
  const out = [];
  const x0 = -78, x1 = 160;
  for (const x of [x0 + 8, 40, x1 - 8]) out.push(S(k.slabOf({ x: x - 2, y: -27, w: 4, d: 3, r: 0.6 }, 0, BELT_Z - 4, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: -27, w: x1 - x0, d: 3, r: 0.8 }, BELT_Z - 5, 6, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: -24, w: x1 - x0, d: 48, r: 0.6 }, BELT_Z - 1.2, 1.2, P, 2), { tone: "lo", crease: "lo" }));
  out.push(`<path data-part="box-cleats" class="iso-line" data-tone="faint" d=""/>`);
  return out.join("");
}
function boxBeltFront() {
  const out = [];
  const x0 = -78, x1 = 160;
  for (const x of [x0 + 8, 40, x1 - 8]) out.push(S(k.slabOf({ x: x - 2, y: 24, w: 4, d: 3, r: 0.6 }, 0, BELT_Z - 4, P, 2, 0.3), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x0, y: 24, w: x1 - x0, d: 3, r: 0.8 }, BELT_Z - 5, 6, P, 3, 0.4), { tone: "mid" }));
  out.push(D([-60, 0, 60, 120].map((x) => at([x, 27, 3])), { size: 0.45 }));
  return out.join("");
}

// the lid closer: a post behind the station with a hub; its arm is drawn live
function closerPost() {
  const out = [];
  out.push(S(k.slabOf({ x: -4, y: -38, w: 8, d: 7, r: 1.2 }, 0, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -2.4, y: -36, w: 4.8, d: 4, r: 1 }, 4, RIM + 1, P, 3, 0.4), { tone: "mid" }));
  const hub = G.frameAlong([2.4, -34, RIM + 1], [1, 0, 0]);
  out.push(S(G.disc(0, 2, 3, hub, P), { tone: "mid" }));
  out.push(L(G.circleOf(hub, 2, 1.2, P), { tone: "lo" }));
  return out.join("");
}

// gantry: two portal frames, a beam along the line, a carriage and a suction head
function portal(x, side) {
  const out = [];
  if (side === "back") out.push(S(k.slabOf({ x: x - 2.5, y: -38, w: 5, d: 5, r: 1 }, 0, 80, P, 3, 0.4), { tone: "mid" }));
  if (side === "front") {
    // a cantilever arm off the back post carries the beam; the front stays open
    out.push(S(k.slabOf({ x: x - 3, y: -38, w: 6, d: 40, r: 1.2 }, 80, 5, P, 3, 0.5), { tone: "mid" }));
    out.push(S(k.slabOf({ x: x - 2, y: -33, w: 4, d: 10, r: 0.6 }, 70, 10, P, 2, 0.3), { tone: "mid" }));
    out.push(D([at([x, -35.5, 85]), at([x, -0.5, 85])], { size: 0.45 }));
  }
  return out.join("");
}
function beam() {
  const b = { x: -121, y: -9, w: 146, d: 6, r: 1.2 };
  return S(k.slabOf(b, 85, 6, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(b, 88, P, 3), { tone: "faint" }) }) + D([-110, -60, -10, 14].map((x) => at([x, -3, 91])), { size: 0.45 });
}
function head() {
  const out = [];
  out.push(`<g data-part="carriage">`);
  out.push(S(k.slabOf({ x: -6, y: -3, w: 12, d: 7, r: 1.2 }, 80, 13, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([-4, 4, 90]), at([4, 4, 90])], { size: 0.45 }));
  out.push(`</g>`);
  out.push(`<g data-part="head-clip"><g data-part="head"><g data-part="head-low">`);
  out.push(`<g data-part="carried" style="display:none">${towelArt(-CUP - TOWEL.h)}</g>`);
  for (const [x, y] of [[-8, -10], [8, -10], [-8, 10], [8, 10]]) out.push(S(k.cylinder(x, y, 1.4, -CUP, CUP, P, 14), { tone: "mid", crease: "none" }));
  const pad = { x: -12, y: -15, w: 24, d: 30, r: 1.6 };
  out.push(S(k.slabOf(pad, 0, 1.6, P, 3, 0.4), { tone: "hi", lit: true }));
  out.push(`</g>`);
  out.push(S(k.cylinder(0, 0, 1.1, 1.6, 62, P, 14), { tone: "hi", lit: true, crease: "none" }));
  out.push(S(k.cylinder(0, 0, 2.2, 1.6, 2.2, P, 18), { tone: "mid" }));
  out.push(`</g></g>`);
  return out.join("");
}

const defs = SERUM_DEFS + `<defs><clipPath id="pack-open"><path d="${k.pathOf(
  (() => {
    const ring = k.ringOf(inner, 2);
    const pts = [...ring.map(([x, y]) => at([x, y, RIM])), ...ring.map(([x, y]) => at([x, y, RIM + 200]))];
    const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  })(),
  true,
)}"/></clipPath></defs>`;

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A packing station. Folded, serum-finished towels arrive on a high belt; doctor towels mailer boxes ride a low belt, each open with its lid standing up behind it. A gantry's suction head picks a towel and lowers it into the box at the station, a closer arm swings the hinged lid shut over it, and the box indexes on while the next empty box comes in.",
  body: [
    defs,
    bench(P, PLATE, { label: [-150, 48] }),
    portal(-118, "back"),
    portal(22, "back"),
    closerPost(),
    beam(),
    towelBelt(),
    boxBeltBack(),
    `<g data-part="boxes">${BOX_SLOTS.map(boxSlot).join("")}</g>`,
    boxBeltFront(),
    `<g data-part="gantry">${head()}</g>`,
    portal(-118, "front"),
    portal(22, "front"),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const V = ${JSON.stringify(V)}, BOX = ${JSON.stringify(BOX)}, HINGE = ${JSON.stringify(HINGE)}, LIP = ${LIP};
const OPEN = ${OPEN}, PITCH = ${PITCH}, TOWEL_PITCH = ${TOWEL_PITCH}, PICK_X = ${PICK_X}, BELT_Z = ${BELT_Z}, TOWEL_Z = ${TOWEL_Z}, RIM = ${RIM};
const TOWEL_H = ${TOWEL.h}, CUP = ${CUP}, HEAD_UP = ${HEAD_UP};
const CYCLE = 7, START = 0.3;
const PHASES = [{ at: 0, name: "indexing" }, { at: 0.24, name: "picking the towel" }, { at: 0.4, name: "into the box" }, { at: 0.72, name: "closing the lid" }, { at: 0.9, name: "packed" }];
const lidSvg = ${lidSvg.toString()};
const lidOpts = { P, V, BOX, HINGE, LIP, iso, pathOf };
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const boxes = [...svg.querySelectorAll("[data-box]")].map((g) => ({ n: +g.dataset.box, g }));
const towels = [...svg.querySelectorAll("[data-towel]")].map((g) => ({ n: +g.dataset.towel, g }));
const lid = part("lid"), placed = part("placed"), armBack = part("arm-back"), armFront = part("arm-front");
const carriage = part("carriage"), headEl = part("head"), headClip = part("head-clip"), carried = part("carried");
const boxCleats = part("box-cleats"), towelCleats = part("towel-cleats");
const p2 = (x, y, z) => iso([x, y, z], P);
// the closer arm: from its hub behind the box, riding the lid's outer face, a roller across the end
function armSvg(theta) {
  const c = Math.cos(theta), s = Math.sin(theta), a = 34, h = 2.2;
  const hub = [4.4, -34, RIM + 1];
  const tip = [4.4, HINGE.y + a * c - h * s, HINGE.z + a * s + h * c];
  // the bar leaves the hub at its pin ring, so it starts on a drawn edge
  const len = Math.hypot(tip[1] - hub[1], tip[2] - hub[2]);
  const from = [hub[0], hub[1] + 1.2 * (tip[1] - hub[1]) / len, hub[2] + 1.2 * (tip[2] - hub[2]) / len];
  const bar = pathOf([p2(...from), p2(...tip)]);
  const roller = pathOf([p2(-13, tip[1], tip[2]), p2(13, tip[1], tip[2])]);
  const caps = [-13, 13].map((x) => { const q = p2(x, tip[1], tip[2]); return '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="1.3"/>'; }).join("");
  return '<path class="iso-line" data-tone="lit" d="' + bar + '" style="stroke-width:1.3"/><path class="iso-line" data-tone="lit" d="' + roller + '" style="stroke-width:1.9"/><g class="iso-dots" data-tone="hi">' + caps + '</g>';
}
function draw(t) {
  const m = ease(span(t, 0, 0.22));
  // boxes index one pitch; the box at the station is n = 0
  boxes.forEach((b) => {
    const x = (b.n - 1 + m) * PITCH;
    b.g.setAttribute("transform", translateAlong(P, [x, 0, 0]));
    b.g.style.opacity = String(Math.max(0, Math.min(1, (x + 84) / 12, (160 - 18 - x) / 12)));
  });
  towels.forEach((tw) => {
    const x = PICK_X + (tw.n - 1 + m) * TOWEL_PITCH;
    tw.g.setAttribute("transform", translateAlong(P, [x, 0, 0]));
    const gone = tw.n === 0 && t >= 0.33;
    tw.g.style.opacity = gone ? "0" : String(Math.max(0, Math.min(1, (x + 160 - 13) / 12)));
  });
  const cl = (x0, x1, z, y0, y1, off) => { const out = []; for (let x = x0 + off; x < x1; x += 10) out.push(lineOnTop([x, y0], [x, y1], z, P)); return out.join(""); };
  boxCleats.setAttribute("d", cl(-78, 160, BELT_Z, -24, 24, (m * PITCH) % 10));
  towelCleats.setAttribute("d", cl(-160, PICK_X + 22, TOWEL_Z, -20, 20, (m * TOWEL_PITCH) % 10));

  // head: down to the towel, grip, up, across, down into the box, release, up, back
  const pickZ = TOWEL_Z + TOWEL_H + CUP, placeZ = BELT_Z + 0.8 + TOWEL_H + CUP;
  let hx = PICK_X, hz = HEAD_UP;
  if (t < 0.24) { hx = PICK_X; hz = HEAD_UP; }
  else if (t < 0.31) hz = HEAD_UP + (pickZ - HEAD_UP) * ease((t - 0.24) / 0.07);
  else if (t < 0.34) hz = pickZ;
  else if (t < 0.40) hz = pickZ + (HEAD_UP - pickZ) * ease((t - 0.34) / 0.06);
  else if (t < 0.50) { hx = PICK_X * (1 - ease((t - 0.40) / 0.10)); }
  else if (t < 0.57) { hx = 0; hz = HEAD_UP + (placeZ - HEAD_UP) * ease((t - 0.50) / 0.07); }
  else if (t < 0.59) { hx = 0; hz = placeZ; }
  else if (t < 0.64) { hx = 0; hz = placeZ + (HEAD_UP - placeZ) * ease((t - 0.59) / 0.05); }
  else { hx = PICK_X * ease((t - 0.64) / 0.12); }
  carriage.setAttribute("transform", translateAlong(P, [hx, 0, 0]));
  headEl.setAttribute("transform", translateAlong(P, [hx, 0, hz]));
  const holding = t >= 0.33 && t < 0.58;
  carried.style.display = holding ? "" : "none";
  placed.style.display = t >= 0.58 ? "" : "none";
  // below the rim the head is inside the box: show it through the opening only
  if (hx > -1 && hz < RIM + 4) headClip.setAttribute("clip-path", "url(#pack-open)"); else headClip.removeAttribute("clip-path");

  // lid: the arm swings it shut with a small overshoot and settle, then lifts away
  // lid: pushed over the top, it falls faster and faster, lands, bounces once and settles
  const close = span(t, 0.72, 0.86), fall = Math.min(1, close / 0.7);
  const bounce = close > 0.7 ? 0.07 * Math.sin(Math.PI * Math.min(1, (close - 0.7) / 0.18)) : 0;
  const theta = t < 0.72 ? OPEN : OPEN * (1 - fall * fall) + bounce;
  const armTheta = t < 0.72 ? OPEN + 0.18 - 0.14 * ease((t - 0.66) / 0.06) : t < 0.9 ? OPEN * (1 - fall * fall) + 0.04 : 0.04 + (OPEN + 0.14) * ease((t - 0.9) / 0.08);
  lid.innerHTML = lidSvg(theta, 0, lidOpts);
  const arm = armSvg(armTheta);
  const armFrontNow = armTheta < Math.PI / 2;
  armBack.innerHTML = armFrontNow ? "" : arm;
  armFront.innerHTML = armFrontNow ? arm : "";

  say(t < 0.22 ? "indexing · next box in" : t < 0.40 ? "picking the towel" : t < 0.64 ? "towel into the box" : t < 0.72 ? "head clear · closer arm down" : t < 0.9 ? "closing the lid" : "packed · ready to index");
}
${"__LOOP__"}
`;

export const fig09 = {
  card: cardHtml({
    fig: "Fig 09",
    title: "Pack",
    hint: "Hover to scrub one box",
    readout: "indexing",
    keys: [
      { mark: "serum", label: "Skin Shield glow on every finished towel" },
      { mark: "face", label: "Serum-finished towel" },
      { mark: "raised", label: "doctor towels mailer box" },
      { mark: "lit", label: "Suction head and lid closer" },
    ],
    caption:
      "One box per cycle. The suction head lifts the towel off the high belt and sets it flat in the open box; the closer arm swings the hinged lid over and tucks the front flap down, and the packed box moves on as the next empty one arrives.",
    svg,
    label: "Packing station: arrow keys step through index, pick, place and close; hovering scrubs one box's cycle",
    max: 1,
  }),
  live,
};
