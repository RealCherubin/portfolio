// Fig 06 · Three-layer weave. A rapier loom with three warp beams: olive face
// ends, white middle (bacterial-protection) ends and cream body ends with green
// pinstripe ends. Six heddle frames, an odd and an even per layer, open the
// shed: to weave a lower layer every layer above it is lifted out of the way,
// which is what keeps the three cloths separate and stacked. A rapier lays the
// weft, the reed beats it into the fell and the cloth is taken up.
import { k, G, WIDTH, HEIGHT, helpers, bench, cardHtml } from "./lib.mjs";

const PLATE = { x: -160, y: -64, w: 320, d: 128, r: 8 };
const LAYERS = [
  { key: "face", z: 36, beam: 44, cls: "cl-face" },
  { key: "middle", z: 32, beam: 30, cls: "" },
  { key: "body", z: 28, beam: 16, cls: "cl-body" },
];
const BEAM_X = -124, BEAM_R = 5;
const REST_X = -100; // back rests, one per layer
const FRAMES_X = [-70, -66, -62, -58, -54, -50]; // face odd, face even, middle odd, middle even, body odd, body even
const LIFT = 12;
const FELL = { x: 10, z: 31 };
const REED_X = -12, REED_BEAT = 7;
const RAPIER_X = -8;
const BREAST = { x: 52, z: 27, r: 3 };
const TAKEUP = { x: 36, z: 13, r: 8 };
// 24 warp ends interleaved across the width: layer = j % 3, odd/even by thread group
const ENDS = Array.from({ length: 24 }, (_, j) => {
  const layer = j % 3, parity = Math.floor(j / 3) % 2;
  const stripe = layer === 2 && (Math.floor(j / 3) === 1 || Math.floor(j / 3) === 5);
  return { y: -34.5 + 3 * j, layer, frame: layer * 2 + parity, stripe };
});
// which frames are up for each of the six picks (face, middle, body; then the other parity)
const PICKS = [
  { layer: 0, up: [0] }, { layer: 1, up: [0, 1, 2] }, { layer: 2, up: [0, 1, 2, 3, 4] },
  { layer: 0, up: [1] }, { layer: 1, up: [0, 1, 3] }, { layer: 2, up: [0, 1, 2, 3, 5] },
];

const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [-60, -56, 74], [-124, -50, 52], [-124, 50, 52]], WIDTH, HEIGHT, { pad: 26, azimuth: 50 });
const { at, S, L, D, byDepth } = helpers(P);
const alongY = (x, y, z) => G.frameAlong([x, y, z], [0, 1, 0]);
const alongX = (x, y, z) => G.frameAlong([x, y, z], [1, 0, 0]);

const post = (x, y, w, d, h, z = 0) => S(k.slabOf({ x, y, w, d, r: 1 }, z, h, P, 3, 0.4), { tone: "mid" });

function farSide() {
  const out = [];
  out.push(S(k.slabOf({ x: -128, y: -58, w: 186, d: 4, r: 1 }, 4, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(post(-127, -56, 6, 6, 56), post(-102, -54, 4, 6, 38), post(-63, -56, 6, 6, 64), post(49, -56, 6, 6, 30));
  out.push(S(k.slabOf({ x: -20, y: -54, w: 34, d: 4, r: 1 }, 0, 2, P, 3), { tone: "lo" }));
  out.push(S(k.slabOf({ x: -20, y: 50, w: 34, d: 4, r: 1 }, 0, 2, P, 3), { tone: "lo" }));
  out.push(D([-17, 11].flatMap((x) => [at([x, -52, 2]), at([x, 52, 2])]), { size: 0.45 }));
  return out.join("");
}

function beams() {
  const out = [];
  for (const layer of [...LAYERS].reverse()) {
    const F = alongY(BEAM_X, -46, layer.beam);
    const wrap = S(G.disc(1, 91, BEAM_R, F, P), { tone: "hi", crease: "lo" });
    out.push(S(G.disc(-10, 102, 1.4, F, P), { tone: "mid" }));
    out.push(S(G.disc(0, 1, 7, F, P), { tone: "mid" }));
    out.push(layer.cls ? `<g class="${layer.cls}">${wrap}</g>` : wrap);
    out.push(S(G.disc(91, 92, 7, F, P), { tone: "mid" }));
    out.push(D(G.dotsOf(F, 92, 5.2, 6, P, { all: true }), { size: 0.4 }));
  }
  for (const layer of LAYERS) out.push(S(G.disc(0, 96, 1.2, alongY(REST_X, -48, layer.z - 1.2), P), { tone: "mid" }));
  return out.join("");
}

// warp from each beam's top over its back rest: static
function warpBack() {
  const out = { 0: [], 1: [], 2: [], s: [] };
  for (const end of ENDS) {
    const z = LAYERS[end.layer];
    out[end.stripe ? "s" : end.layer].push(k.pathOf([at([BEAM_X, end.y, z.beam]), at([REST_X, end.y, z.z])]));
  }
  return warpSvg(out, "back");
}

function warpSvg(groups, tag) {
  return [
    `<path data-warp="${tag}-0" class="aloe-stripe" d="${groups[0].join("")}"/>`,
    `<path data-warp="${tag}-1" class="iso-line" data-tone="mid" d="${groups[1].join("")}"/>`,
    `<path data-warp="${tag}-2" class="aloe-cream" d="${groups[2].join("")}"/>`,
    `<path data-warp="${tag}-s" class="aloe-stripe" d="${groups.s.join("")}"/>`,
  ].join("");
}

function frame(index) {
  const x = FRAMES_X[index];
  const out = [];
  const bar = (z) => S(k.slabOf({ x: x - 0.8, y: -44, w: 1.6, d: 88, r: 0.4 }, z, 2, P, 2), { tone: "mid", crease: "none" });
  out.push(bar(10));
  out.push(S(k.slabOf({ x: x - 0.8, y: -44, w: 1.6, d: 2, r: 0.4 }, 12, 34, P, 2), { tone: "mid", crease: "none" }));
  const mine = ENDS.filter((end) => end.frame === index);
  out.push(L(mine.map((end) => k.pathOf([at([x, end.y, 12]), at([x, end.y, 46])])).join(""), { tone: "lo" }));
  out.push(D(mine.map((end) => at([x, end.y, LAYERS[end.layer].z])), { size: 0.55, tone: "hi" }));
  out.push(S(k.slabOf({ x: x - 0.8, y: 42, w: 1.6, d: 2, r: 0.4 }, 12, 34, P, 2), { tone: "mid", crease: "none" }));
  out.push(bar(46));
  return `<g data-frame="${index}">${out.join("")}</g>`;
}

function castle() {
  const out = [];
  const beam = { x: -74, y: -56, w: 28, d: 112, r: 1.5 };
  out.push(S(k.slabOf(beam, 64, 4, P, 4, 0.5), { tone: "mid", inner: L(k.sideSeam(beam, 66, P, 4), { tone: "faint" }) }));
  const box = { x: -73, y: -54, w: 26, d: 18, r: 2 };
  out.push(S(k.slabOf(box, 68, 9, P, 4, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(box, 3), 77, P, 4), { tone: "faint" }));
  out.push(D(k.corners(box, 1.8).map(([x, y]) => at([x, y, 77])), { size: 0.45 }));
  // one lever per frame along the box's near face
  out.push(L(FRAMES_X.map((x) => k.pathOf([at([x, -36, 68]), at([x, -36, 77])])).join(""), { tone: "lo" }));
  return out.join("");
}

// the batten: sley, reed and swords, built at the rest position and slid live
function batten() {
  const out = [];
  const x = REED_X;
  out.push(S(k.slabOf({ x: x - 2, y: -53, w: 4, d: 3, r: 0.8 }, 2, 12, P, 2), { tone: "mid" }));
  const sley = { x: x - 3, y: -50, w: 7, d: 100, r: 1 };
  out.push(S(k.slabOf(sley, 14, 4, P, 3, 0.5), { tone: "mid", inner: L(k.sideSeam(sley, 16, P, 3), { tone: "faint" }) }));
  out.push(S(k.slabOf({ x: x - 1.2, y: -46, w: 2.4, d: 2, r: 0.4 }, 18, 26, P, 2), { tone: "mid", crease: "none" }));
  out.push(L(k.lineOnTop([x, -50], [x, 50], 18, P), { tone: "lo" }));
  const dents = [];
  for (let y = -43; y <= 43; y += 2) dents.push(k.pathOf([at([x, y, 18]), at([x, y, 44])]));
  out.push(L(dents.join(""), { tone: "lo" }));
  out.push(S(k.slabOf({ x: x - 1.2, y: 44, w: 2.4, d: 2, r: 0.4 }, 18, 26, P, 2), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: x - 1.6, y: -48, w: 3.2, d: 96, r: 1 }, 44, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(S(k.slabOf({ x: x - 2, y: 50, w: 4, d: 3, r: 0.8 }, 2, 12, P, 2), { tone: "mid" }));
  return out.join("");
}

function front() {
  const out = [];
  // take-up roll on its brackets under the cloth, wound face side out
  out.push(post(TAKEUP.x - 3, -54, 6, 6, TAKEUP.z + 2));
  const roll = alongY(TAKEUP.x, -51, TAKEUP.z);
  out.push(S(G.disc(-1, 106, 1.6, roll, P), { tone: "mid" }));
  out.push(`<g class="cl-face">${S(G.disc(11, 91, TAKEUP.r, roll, P), { tone: "hi", crease: "lo" })}${L([6, 4].map((r) => G.circleOf(roll, 91, r, P)).join(""), { tone: "lo" })}`);
  out.push(S(k.slabOf({ x: BREAST.x - 2.6, y: -40, w: 2, d: 80, r: 0.4 }, TAKEUP.z + 2, BREAST.z - TAKEUP.z - 2, P, 2), { tone: "hi", crease: "lo" }) + "</g>");
  out.push(S(G.disc(-6, 98, BREAST.r, alongY(BREAST.x, -46, BREAST.z), P), { tone: "mid", crease: "lo" }));
  return out.join("");
}

function nearSide() {
  const out = [];
  out.push(post(-127, 50, 6, 6, 56), post(-102, 48, 4, 6, 38), post(-63, 50, 6, 6, 64), post(49, 50, 6, 6, 30));
  // take-up ratchet and pawl on the near post
  out.push(post(TAKEUP.x - 3, 48, 6, 6, TAKEUP.z + 2));
  const ratchet = alongY(TAKEUP.x, 54, TAKEUP.z);
  out.push(S(G.disc(0, 2, 6.4, ratchet, P), { tone: "mid" }));
  out.push(`<path data-part="teeth" class="iso-line" data-tone="lo" d=""/>`);
  out.push(S(G.disc(2, 3, 1.6, ratchet, P), { tone: "mid" }));
  out.push(S(k.slabOf({ x: TAKEUP.x - 1, y: 54, w: 2, d: 2, r: 0.5 }, TAKEUP.z + 6.2, 3, P, 2), { tone: "mid" }));
  // rapier wheel on its bracket
  out.push(post(-11, 55, 6, 4, 18));
  const wheel = alongX(-8 - 1, 57, 24);
  out.push(S(G.disc(0, 2, 7, wheel, P), { tone: "mid", inner: L(G.arcOf(wheel, 1, 7, P), { tone: "faint" }) }));
  out.push(`<path data-part="wheel" class="iso-line" data-tone="mid" d=""/>`);
  out.push(S(G.disc(2, 3, 1.8, wheel, P), { tone: "mid" }));
  return out.join("");
}

// finished cloth waiting for the finishing bench (Fig 07's roll)
function doffed() {
  const out = [];
  out.push(S(k.slabOf({ x: 104, y: -50, w: 20, d: 6, r: 1.2 }, 0, 18, P, 3, 0.5), { tone: "mid" }));
  const roll = alongY(114, -44, 17);
  out.push(S(G.disc(-6, 94, 1.6, roll, P), { tone: "mid" }));
  out.push(`<g class="cl-body">${S(G.disc(0, 88, 11, roll, P), { tone: "hi", crease: "lo" })}${L([8.4, 6, 3.6].map((r) => G.circleOf(roll, 88, r, P)).join(""), { tone: "lo" })}<path class="aloe-stripe" d="${[-12, 12, 36].map((s) => G.arcOf(roll, s + 44, 11, P)).join("")}"/></g>`);
  out.push(S(k.slabOf({ x: 104, y: 44, w: 20, d: 6, r: 1.2 }, 0, 18, P, 3, 0.5), { tone: "mid" }));
  out.push(D(G.dotsOf(alongY(114, 50, 17), 0, 3, 4, P, { all: true }), { size: 0.45 }));
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A three-layer rapier loom. Three warp beams feed olive face ends, white middle ends and cream body ends over their back rests into six heddle frames. For each pick the frames lift one layer's odd or even ends, and every layer above it, so a rapier can lay the weft into that layer alone; the reed beats it into the fell and the woven cloth is wound on the take-up roll.",
  body: [
    bench(P, PLATE, { label: [-150, 48] }),
    farSide(),
    warpBack(),
    beams(),
    `<g data-part="rear">${warpSvg({ 0: [], 1: [], 2: [], s: [] }, "rear")}</g>`,
    `<path data-part="straps" class="iso-line" data-tone="lo" d=""/>`,
    FRAMES_X.map((_, i) => frame(i)).join(""),
    castle(),
    `<g data-part="pre">${warpSvg({ 0: [], 1: [], 2: [], s: [] }, "pre")}</g>`,
    `<g data-part="batten">${batten()}</g>`,
    `<g data-part="low">${warpSvg({ 0: [], 1: [], 2: [], s: [] }, "low")}</g>`,
    `<path data-part="weft" class="aloe-stripe" d="" style="stroke-width:1.8"/>`,
    `<path data-part="tape" class="iso-line" data-tone="hi" d="" style="stroke-width:1"/>`,
    `<g data-part="rapier">${S(k.slabOf({ x: RAPIER_X - 2, y: -3, w: 4, d: 6, r: 1.2 }, -0.8, 1.6, P, 3), { tone: "hi", lit: true })}</g>`,
    `<g data-part="high">${warpSvg({ 0: [], 1: [], 2: [], s: [] }, "high")}</g>`,
    front(),
    `<g class="cl-face">${S(k.slabOf({ x: FELL.x, y: -40, w: BREAST.x - FELL.x, d: 80, r: 0.4 }, 30, 2, P, 2), { tone: "hi", crease: "lo" })}<path data-part="picks" class="iso-line" data-tone="lo" d=""/></g>`,
    nearSide(),
    doffed(),
  ],
});

const live = `
const P = ${JSON.stringify(P)};
const LAYERS = ${JSON.stringify(LAYERS)}, ENDS = ${JSON.stringify(ENDS)}, PICKS = ${JSON.stringify(PICKS)};
const FRAMES_X = ${JSON.stringify(FRAMES_X)}, LIFT = ${LIFT}, FELL = ${JSON.stringify(FELL)}, REST_X = ${REST_X};
const REED_X = ${REED_X}, REED_BEAT = ${REED_BEAT}, RAPIER_X = ${RAPIER_X}, TAKEUP = ${JSON.stringify(TAKEUP)}, BREAST = ${JSON.stringify(BREAST)};
const CYCLE = 15, START = 0.02;
const NAMES = ["face", "middle", "body"];
const PHASES = PICKS.map((p, i) => ({ at: i / 6, name: "pick " + (i + 1) + ", " + NAMES[p.layer] + " layer" }));
const p2 = (x, y, z) => iso([x, y, z], P);
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const frames = [...svg.querySelectorAll("[data-frame]")];
const warp = (tag) => ["0", "1", "2", "s"].map((g) => svg.querySelector('[data-warp="' + tag + "-" + g + '"]'));
const rear = warp("rear"), pre = warp("pre"), low = warp("low"), high = warp("high");
const batten = part("batten"), weft = part("weft"), tape = part("tape"), rapier = part("rapier"), straps = part("straps");
const picks = part("picks"), teeth = part("teeth"), wheel = part("wheel");
const group = (end) => (end.stripe ? 3 : end.layer);
const WEFT_CLS = ["aloe-stripe", "iso-line", "aloe-cream"];
function zAt(end, lift, x) {
  // rest bar -> heddle eye -> fell, straight between
  const fx = FRAMES_X[end.frame], eye = LAYERS[end.layer].z + LIFT * lift[end.frame];
  if (x <= fx) return LAYERS[end.layer].z + (eye - LAYERS[end.layer].z) * (x - REST_X) / (fx - REST_X);
  return eye + (FELL.z - eye) * (x - fx) / (FELL.x - fx);
}
function draw(t) {
  const pickT = t * 6, pick = Math.floor(pickT) % 6, u = pickT - Math.floor(pickT);
  const now = PICKS[pick], before = PICKS[(pick + 5) % 6];
  const shed = ease(u / 0.2);
  const lift = FRAMES_X.map((_, f) => (before.up.includes(f) ? 1 : 0) * (1 - shed) + (now.up.includes(f) ? 1 : 0) * shed);
  frames.forEach((g, f) => g.setAttribute("transform", translateAlong(P, [0, 0, LIFT * lift[f]])));
  straps.setAttribute("d", FRAMES_X.map((x, f) => [-40, 40].map((y) => pathOf([p2(x, y, 48 + LIFT * lift[f]), p2(x, y, 64)])).join("")).join(""));

  // batten: a small draw back, a quick beat into the fell, then home
  const reed = u < 0.64 ? REED_X : u < 0.68 ? REED_X - 1.6 * ease((u - 0.64) / 0.04)
    : u < 0.74 ? REED_X - 1.6 + (REED_BEAT - REED_X + 1.6) * Math.pow((u - 0.68) / 0.06, 2)
    : u < 0.77 ? REED_BEAT : REED_BEAT + (REED_X - REED_BEAT) * ease((u - 0.77) / 0.18);
  batten.setAttribute("transform", translateAlong(P, [reed - REED_X, 0, 0]));

  // warp: back to the heddles, heddles to the reed, reed to the fell (split around the weft)
  const g = (n) => Array.from({ length: n }, () => [[], [], [], []]);
  const [R, Q, LO, HI] = g(4);
  const layerUp = (end) => now.up.includes(end.frame) && shed > 0.5;
  for (const end of ENDS) {
    const fx = FRAMES_X[end.frame], eye = zAt(end, lift, fx), at = group(end);
    R[at].push(pathOf([p2(REST_X, end.y, LAYERS[end.layer].z), p2(fx, end.y, eye)]));
    Q[at].push(pathOf([p2(fx, end.y, eye), p2(reed, end.y, zAt(end, lift, reed))]));
    (layerUp(end) ? HI : LO)[at].push(pathOf([p2(reed, end.y, zAt(end, lift, reed)), p2(FELL.x, end.y, FELL.z)]));
  }
  const write = (paths, groups) => paths.forEach((el, i) => el.setAttribute("d", groups[i].join("")));
  write(rear, R); write(pre, Q); write(low, LO); write(high, HI);

  // rapier: in through the open shed carrying the weft, then out
  const mine = ENDS.filter((end) => end.layer === now.layer);
  const upZ = Math.min(...mine.filter((e) => now.up.includes(e.frame)).map((e) => zAt(e, lift, RAPIER_X)));
  const downZ = Math.max(...mine.filter((e) => !now.up.includes(e.frame)).map((e) => zAt(e, lift, RAPIER_X)));
  const shedZ = (upZ + downZ) / 2;
  const goIn = ease((u - 0.2) / 0.28), goOut = ease((u - 0.5) / 0.14);
  const ry = u < 0.2 ? 56 : u < 0.5 ? 56 - 100 * goIn : u < 0.64 ? -44 + 100 * goOut : 56;
  rapier.setAttribute("transform", translateAlong(P, [0, ry, shedZ]));
  tape.setAttribute("d", ry < 55.9 ? pathOf([p2(RAPIER_X, 52, 31), p2(RAPIER_X, ry + 3, shedZ + 0.4)]) : "");
  wheel.setAttribute("d", [0, 1, 2].map((i) => { const a = (56 - ry) / 7 + (i * 2 * Math.PI) / 3; return pathOf([p2(-7, 57 + 2 * Math.cos(a), 24 + 2 * Math.sin(a)), p2(-7, 57 + 6 * Math.cos(a), 24 + 6 * Math.sin(a))]); }).join(""));
  // the weft lies across from the near side to the rapier, then rides the reed into the fell
  const laid = u < 0.2 || u >= 0.74 ? null : u < 0.5 ? [44, Math.max(ry, -40)] : [44, -40];
  const beat = u < 0.68 ? 0 : Math.min(1, Math.pow((u - 0.68) / 0.06, 2));
  const wx = RAPIER_X + (FELL.x - RAPIER_X) * beat, wz = shedZ + (FELL.z - shedZ) * beat;
  weft.setAttribute("class", WEFT_CLS[now.layer]);
  if (now.layer === 1) weft.setAttribute("data-tone", "mid"); else weft.removeAttribute("data-tone");
  weft.setAttribute("d", laid ? pathOf([p2(wx, laid[0], wz), p2(wx, laid[1], wz)]) : "");

  // take-up: the cloth walks forward half a unit per pick; the ratchet steps one tooth per six picks
  const take = 0.5 * (pick + ease((u - 0.74) / 0.16));
  const lines = [];
  for (let x = FELL.x + 3 - (take % 3); x < BREAST.x - 0.5; x += 3) lines.push(lineOnTop([x, -40], [x, 40], 32, P));
  picks.setAttribute("d", lines.join(""));
  const turn = take / 3 * (Math.PI / 8);
  teeth.setAttribute("d", Array.from({ length: 16 }, (_, i) => { const a = turn + (i * Math.PI) / 8; return pathOf([p2(TAKEUP.x + 4 * Math.cos(a), 56, TAKEUP.z + 4 * Math.sin(a)), p2(TAKEUP.x + 6.2 * Math.cos(a + 0.2), 56, TAKEUP.z + 6.2 * Math.sin(a + 0.2))]); }).join(""));

  const phase = u < 0.2 ? "shed opening" : u < 0.5 ? "rapier in" : u < 0.64 ? "rapier out" : u < 0.77 ? "beat-up" : "take-up";
  say("pick " + (pick + 1) + " of 6 · " + NAMES[now.layer] + " layer · " + phase);
}
${"__LOOP__"}
`;

export const fig06 = {
  card: cardHtml({
    fig: "Fig 06",
    title: "Three-layer weave",
    hint: "Hover to scrub six picks",
    readout: "pick 1 of 6 · face layer",
    keys: [
      { mark: "face", label: "Face ends, olive" },
      { mark: "flat", label: "Middle ends, bacterial-protection layer" },
      { mark: "body", label: "Body ends, cream with green pinstripes" },
      { mark: "lit", label: "Rapier" },
    ],
    caption:
      "Six picks make one round: face, middle and body, then the same with the other half of each layer's ends. To weave a lower layer, every layer above it is lifted clear, so each weft only ever crosses its own layer's ends and the three cloths come off the loom as one stacked fabric.",
    svg,
    label: "Three-layer loom: arrow keys step pick by pick; hovering scrubs through six picks",
    max: 1,
  }),
  live,
};
