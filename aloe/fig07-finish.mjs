// Fig 07 · Cut, stitch & fold. A finishing bench: the woven web comes off a roll
// under a nip roller, a rotary blade on a gantry cuts one towel off it, a
// lockstitch head sews the hem as the panel passes under the needle, and a
// hinged folding plate turns the body side over onto itself so the olive face
// side ends up on top, then a woven label lands on the corner.
import { k, G, WIDTH, HEIGHT, helpers, bench, cardHtml } from "./lib.mjs";

const PLATE = { x: -160, y: -64, w: 320, d: 128, r: 8 };
const CLOTH = 2; // three-layer cloth, 2 units thick
const HALF = 40; // panel is 80 deep (y -40..40)
const CUT_X = -27; // blade line, also the web's cut edge
const LEN = 60; // panel length along the feed
const SEW = [44, 36]; // needle position (x, y): the hem runs 4 in from the near edge
const SEWN = 72; // travel that sews the full hem (whole handwheel turns: 72 / 6)
const TRAVEL = 97; // travel to the folding station
const HINGE = CUT_X + LEN / 2 + TRAVEL; // fold line, x = 100
const ROLL = { x: -128, z: 14.73, r: 120 / (3 * Math.PI) }; // one feed = 3/4 turn: four-fold marks loop seamlessly
const NIP = { x: -78, r: 60 / (4 * Math.PI) }; // one feed = two whole turns
const NIP_Z = CLOTH + NIP.r;
const STRIPES = [-30, -20, -10, 0, 10, 20, 30];

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -17, 0), [-40, -56, 50], [44, -60, 66], [44, 40, 58], [ROLL.x, -52, 28]],
  WIDTH,
  HEIGHT,
  { pad: 26, azimuth: 50 },
);
const { at, S, L, D, byDepth, roundAlong } = helpers(P);
const V = G.viewOf(P);
const alongY = (x, y, z) => G.frameAlong([x, y, z], [0, 1, 0]);
const alongX = (x, y, z) => G.frameAlong([x, y, z], [1, 0, 0]);

// ---------- static art, back to front ----------

function station() {
  const out = [];
  // throat plate set into the bench under the needle, with feed-dog slots
  const throat = { x: SEW[0] - 9, y: SEW[1] - 7, w: 18, d: 14, r: 1.4 };
  out.push(S(k.slabOf(throat, 0, 0.4, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([-4.5, 0, 4.5].map((dx) => k.planOutline({ x: SEW[0] + dx - 0.9, y: SEW[1] - 5, w: 1.8, d: 10, r: 0.9 }, 0.4, P, 3)).join(""), { tone: "lo" }));
  out.push(D(k.corners(throat, 1.8).map(([x, y]) => at([x, y, 0.4])), { size: 0.4 }));
  // the folding plate's recess and its pocket for the plate
  out.push(L(k.planOutline({ x: HINGE - 31, y: -43, w: 31, d: 86, r: 1 }, 0, P, 3), { tone: "faint" }));
  // tray of woven labels at the far end
  const tray = { x: 132, y: 36, w: 20, d: 18, r: 1.2 };
  out.push(S(k.slabOf(tray, 0, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(tray, 1.6), 3, P, 3), { tone: "faint" }));
  [0, 1, 2].forEach((i) => out.push(`<g class="cl-body">${S(k.slabOf({ x: 136, y: 40.5, w: 12, d: 9, r: 0.6 }, 3 + i * 0.7, 0.6, P, 2), { tone: "hi", crease: "none" })}</g>`));
  return out.join("");
}

function backParts() {
  const out = [];
  // roll cradle, far cheek
  out.push(S(k.slabOf({ x: -140, y: -52, w: 24, d: 6, r: 1.4 }, 0, 26, P, 3, 0.5), { tone: "mid" }));
  // nip roller, far bracket
  out.push(S(k.slabOf({ x: NIP.x - 6, y: -52, w: 12, d: 6, r: 1.2 }, 0, 15, P, 3, 0.5), { tone: "mid" }));
  // gantry, far foot and post
  out.push(S(k.slabOf({ x: -45, y: -60, w: 18, d: 10, r: 1.4 }, 0, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([-42, -55, 4]), at([-30, -55, 4])], { size: 0.45 }));
  out.push(S(k.slabOf({ x: -40, y: -58, w: 8, d: 6, r: 1 }, 4, 38, P, 3, 0.4), { tone: "mid" }));
  // sewing head: pillar standing behind the cloth path
  const pillar = { x: 32, y: -62, w: 24, d: 14, r: 2.5 };
  out.push(S(k.slabOf({ x: 30, y: -64, w: 28, d: 18, r: 2 }, 0, 4, P, 4, 0.5), { tone: "mid" }));
  out.push(D(k.corners({ x: 30, y: -64, w: 28, d: 18 }, 2.4).map(([x, y]) => at([x, y, 4])), { size: 0.45 }));
  out.push(S(k.slabOf(pillar, 4, 48, P, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(pillar, 20, P, 6), { tone: "faint" }) }));
  // handwheel on the pillar's near side, its rim drawn here and spokes turned live
  const wheel = alongX(pillar.x + pillar.w, -55, 38);
  out.push(S(G.disc(0, 1.4, 4, wheel, P), { tone: "mid" }));
  out.push(S(G.disc(1.4, 4.4, 10, wheel, P), { tone: "mid", inner: L(G.arcOf(wheel, 2.9, 10, P), { tone: "faint" }) }));
  out.push(L(G.circleOf(wheel, 4.4, 7.6, P), { tone: "lo" }));
  out.push(`<path data-part="spokes" class="iso-line" data-tone="mid" d=""/>`);
  out.push(S(G.disc(4.4, 5.6, 2.2, wheel, P), { tone: "mid" }));
  return out.join("");
}

function frontParts() {
  const out = [];
  // the roll of woven cloth, body side out, in its cradle
  const roll = alongY(ROLL.x, -46, ROLL.z);
  out.push(`<g class="cl-body">${S(G.disc(0, 92, ROLL.r, roll, P), { tone: "hi", crease: "lo" })}`);
  out.push(L([10.5, 8, 5.6].map((r) => G.circleOf(roll, 92, r, P)).join(""), { tone: "lo" }));
  out.push(`<path data-part="roll-marks" class="aloe-stripe" d=""/></g>`);
  out.push(S(G.disc(92, 93, 3.6, roll, P), { tone: "mid" }));
  out.push(S(G.disc(-6, 98, 1.8, roll, P), { tone: "mid" }));
  out.push(S(k.slabOf({ x: -140, y: 46, w: 24, d: 6, r: 1.4 }, 0, 26, P, 3, 0.5), { tone: "mid" }));
  const cap = alongY(ROLL.x, 52, ROLL.z);
  out.push(S(G.disc(0, 1.6, 5, cap, P), { tone: "mid" }));
  out.push(D(G.dotsOf(cap, 1.6, 3.4, 4, P, { all: true, phase: 0.4 }), { size: 0.45 }));
  // nip roller resting on the web, its near bracket and drive pulley
  const nip = alongY(NIP.x, -48, NIP_Z);
  out.push(S(G.disc(0, 96, NIP.r, nip, P), { tone: "mid", crease: "lo" }));
  out.push(S(k.slabOf({ x: NIP.x - 6, y: 46, w: 12, d: 6, r: 1.2 }, 0, 15, P, 3, 0.5), { tone: "mid" }));
  const pulley = alongY(NIP.x, 52, NIP_Z);
  out.push(S(G.disc(0, 3, 7, pulley, P), { tone: "mid", inner: L(G.arcOf(pulley, 1.5, 7, P), { tone: "faint" }) }));
  out.push(`<path data-part="pulley-mark" class="iso-line" data-tone="hi" d=""/>`);
  out.push(S(G.disc(3, 4, 2, pulley, P), { tone: "mid" }));
  // gantry: near foot and post, crossbar with its rail
  out.push(S(k.slabOf({ x: -45, y: 48, w: 18, d: 10, r: 1.4 }, 0, 4, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([-42, 53, 4]), at([-30, 53, 4])], { size: 0.45 }));
  out.push(S(k.slabOf({ x: -40, y: 50, w: 8, d: 6, r: 1 }, 4, 38, P, 3, 0.4), { tone: "mid" }));
  const bar = { x: -41, y: -60, w: 10, d: 118, r: 1.5 };
  out.push(S(k.slabOf(bar, 42, 8, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(bar, 46, P, 4), { tone: "faint" }) }));
  out.push(D([-54, 52].map((y) => at([-36, y, 50])), { size: 0.5 }));
  return out.join("");
}

// The cutter carriage hangs on the crossbar's near face; built at y = 0 and moved live.
function cutter() {
  const out = [];
  const blade = alongX(CUT_X - 0.7, 0, 9);
  out.push(`<g data-part="blade">`);
  out.push(S(G.disc(0, 1.4, 8, blade, P), { tone: "hi", lit: true }));
  out.push(L(G.circleOf(blade, 1.4, 2.8, P), { tone: "mid" }));
  out.push(`</g>`);
  out.push(S(k.slabOf({ x: CUT_X - 3, y: -7, w: 5, d: 14, r: 1.2 }, 11, 31, P, 3, 0.4), { tone: "mid" }));
  out.push(S(G.disc(1.4, 3.4, 2.2, blade, P), { tone: "mid" }));
  const carriage = { x: -31, y: -8, w: 9, d: 16, r: 1.6 };
  out.push(S(k.slabOf(carriage, 34, 17, P, 3, 0.6), { tone: "mid", inner: L(k.sideSeam(carriage, 40, P, 3), { tone: "faint" }) }));
  out.push(D([at([-26.5, -5, 51]), at([-26.5, 5, 51])], { size: 0.45 }));
  const knob = alongX(-22, 0, 44);
  out.push(S(G.disc(0, 3, 3, knob, P), { tone: "mid" }));
  out.push(L(G.ribsOf(knob, 0, 3, 3, 20, P), { tone: "lo" }));
  return out.join("");
}

function sewingHead() {
  const out = [];
  const [nx, ny] = SEW;
  // presser bar and foot, resting on the cloth
  out.push(S(k.cylinder(nx + 4, ny, 1, CLOTH + 1.6, 26 - CLOTH - 1.6, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: nx - 3, y: ny - 3.5, w: 10, d: 7, r: 1.5 }, CLOTH + 0.2, 1.4, P, 3), { tone: "mid" }));
  // the needle bar, the one part to watch while sewing (moved live)
  out.push(`<g data-part="needle">${S(k.cylinder(nx, ny, 0.45, CLOTH, 5, P, 12), { tone: "hi", lit: true, crease: "none" })}${S(k.cylinder(nx, ny, 1.1, CLOTH + 5, 20, P, 16), { tone: "hi", lit: true, crease: "none" })}${S(k.cylinder(nx, ny, 1.7, CLOTH + 9, 2.4, P, 16), { tone: "mid" })}</g>`);
  // arm from the pillar to the head
  const arm = { x: 34, y: -52, w: 20, d: 80, r: 3 };
  out.push(S(k.slabOf(arm, 44, 12, P, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(arm, 50, P, 6), { tone: "faint" }) }));
  // stitch-length dial on the arm
  out.push(S(k.cylinder(44, -8, 4.4, 56, 3, P, 32, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(44, -8, 4.4, 56, 59, 30, P), { tone: "lo" }));
  out.push(L(k.lineOnTop([44, -8], [44 + 3.4, -8 + 1.6], 59, P), { tone: "hi" }));
  const dialTicks = k.radialTicks(44, -8, 4.2, 12, 3, 59, [0.6, 1], P, -1.2, 2.4);
  out.push(L(dialTicks.major, { tone: "lo" }));
  // head, its face plate and the thread take-up lever
  const head = { x: 33, y: 24, w: 22, d: 18, r: 3 };
  out.push(S(k.slabOf(head, 26, 32, P, 6, 0.8), { tone: "mid", inner: L(k.sideSeam(head, 52, P, 6), { tone: "faint" }) }));
  const face = { x: 36, y: head.y + head.d, w: 16 };
  out.push(L(k.pathOf([at([face.x, face.y, 30]), at([face.x + face.w, face.y, 30]), at([face.x + face.w, face.y, 48]), at([face.x, face.y, 48])], true), { tone: "faint" }));
  out.push(D([at([face.x + 2, face.y, 32]), at([face.x + face.w - 2, face.y, 32]), at([face.x + 2, face.y, 46]), at([face.x + face.w - 2, face.y, 46])], { size: 0.45 }));
  out.push(`<g data-part="lever">${S(k.slabOf({ x: head.x + head.w, y: 30, w: 2, d: 3, r: 0.6 }, 48, 3, P, 2), { tone: "hi", lit: true })}</g>`);
  out.push(S(k.slabOf({ x: head.x + head.w, y: 26.5, w: 1.6, d: 2.4, r: 0.6 }, 47, 3, P, 2), { tone: "mid" }));
  // spool on its pin and the thread guide
  out.push(S(k.slabOf({ x: 41, y: -14 - 1.5, w: 6, d: 3, r: 0.8 }, 56, 3, P, 2), { tone: "mid" }));
  out.push(S(k.cylinder(44, -34, 1.6, 56, 1.4, P, 16), { tone: "mid" }));
  out.push(`<g class="cl-body">${S(k.cylinder(44, -34, 4.2, 57.4, 8, P, 32, 0.4), { tone: "hi", crease: "lo" })}${L([59.4, 61.4, 63.4].map((z) => k.sideArc(44, -34, 4.2, z, P, 24)).join(""), { tone: "lo" })}</g>`);
  out.push(S(k.cylinder(44, -34, 0.8, 65.4, 2.4, P, 12), { tone: "mid", crease: "none" }));
  out.push(k.wireSvg(at([44 + 3, -34 + 2.4, 63]), at([44, -14, 59]), { tone: "lo", ends: "none", size: 0.7 }));
  out.push(k.wireSvg(at([44, -14, 59]), at([head.x + head.w + 1, 31.5, 51]), { tone: "lo", ends: "to", size: 0.7 }));
  return out.join("");
}

// ---------- the cloth, built once at home and moved live ----------

function panelHalf(x0, x1) {
  const plan = { x: x0, y: -HALF, w: x1 - x0, d: HALF * 2, r: 0.6 };
  const stripes = STRIPES.map((y) => k.lineOnTop([x0, y], [x1, y], CLOTH, P)).join("");
  return `<g class="cl-body">${S(k.slabOf(plan, 0, CLOTH, P, 2), { tone: "hi", crease: "lo", inner: L(k.sideSeam(plan, CLOTH / 2, P, 2), { tone: "faint" }) })}<path class="aloe-stripe" d="${stripes}"/></g>`;
}

const panelRight = panelHalf(CUT_X + LEN / 2, CUT_X + LEN);

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A finishing bench for aloe viscose towels. Woven three-layer cloth comes off a roll under a nip roller; a rotary blade on a gantry cuts one towel length off the web; the panel passes under a lockstitch head that sews its hem; a hinged plate folds it in half so the olive face side ends up on top, and a woven label lands on the corner.",
  body: [
    bench(P, PLATE, { label: [-150, 48] }),
    station(),
    backParts(),
    `<g data-part="web"></g>`,
    `<path data-part="cut" class="iso-line" data-tone="lit" d="" style="stroke-width:1.1"/>`,
    `<g data-part="plate-back"></g>`,
    `<g data-part="lot">`,
    `<g data-part="panel"><g data-part="whole">${panelHalf(CUT_X, CUT_X + LEN)}</g><g data-part="right" style="display:none">${panelRight}</g></g>`,
    `<g class="cl-body"><path data-part="stitch-under" class="aloe-stitch-under" d=""/><path data-part="stitch" class="aloe-stitch" d=""/></g>`,
    `<g data-part="flap"></g>`,
    `<g data-part="label" class="cl-body">${S(k.slabOf({ x: HINGE + 9, y: 24, w: 12, d: 6, r: 0.6 }, CLOTH * 2, 0.6, P, 2), { tone: "hi", crease: "lo" })}${k.faceTextSvg(k.topMatrix([HINGE + 10.2, 27.6], CLOTH * 2 + 0.6, P, "x"), "FACE side", { size: 1.9, tone: "hi" })}</g>`,
    `</g>`,
    `<g data-part="plate-front"></g>`,
    frontParts(),
    `<g data-part="cutter">${cutter()}</g>`,
    sewingHead(),
  ],
});

// ---------- live ----------

const live = `
const P = ${JSON.stringify(P)};
const V = ${JSON.stringify(V)};
const CLOTH = ${CLOTH}, HALF = ${HALF}, CUT_X = ${CUT_X}, LEN = ${LEN}, SEW = ${JSON.stringify(SEW)}, SEWN = ${SEWN}, TRAVEL = ${TRAVEL}, HINGE = ${HINGE};
const ROLL = ${JSON.stringify(ROLL)}, NIP = ${JSON.stringify(NIP)}, NIP_Z = ${NIP_Z}, STRIPES = ${JSON.stringify(STRIPES)};
const CYCLE = 13, START = 0.36;
const PHASES = [
  { at: 0, name: "feeding the web" }, { at: 0.19, name: "cutting one towel" }, { at: 0.34, name: "hemming" },
  { at: 0.72, name: "folding" }, { at: 0.84, name: "plate back, face side up" }, { at: 0.91, name: "label" },
];
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const web = part("web"), cut = part("cut"), lot = part("lot"), panel = part("panel"), whole = part("whole"), right = part("right");
const stitch = part("stitch"), stitchUnder = part("stitch-under"), flap = part("flap"), label = part("label"), plateBack = part("plate-back"), plateFront = part("plate-front");
const cutter = part("cutter"), blade = part("blade"), needle = part("needle"), lever = part("lever");
const spokes = part("spokes"), rollMarks = part("roll-marks"), pulleyMark = part("pulley-mark");
const p2 = (x, y, z) => iso([x, y, z], P);
const seg = (a, b) => pathOf([p2(...a), p2(...b)]);
// a point on a round part's end face: axis along +y (rolls) or +x (handwheel)
const onY = (cx, cy, cz, r, a) => [cx + r * Math.cos(a), cy, cz + r * Math.sin(a)];
const onX = (cx, cy, cz, r, a) => [cx, cy + r * Math.cos(a), cz + r * Math.sin(a)];
function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
// turn a point about the fold line (x = HINGE, z = CLOTH), lifting the -x side up and over
const turn = (x, y, z, th) => { const dx = x - HINGE, dz = z - CLOTH, c = Math.cos(th), s = Math.sin(th); return [HINGE + dx * c + dz * s, y, CLOTH - dx * s + dz * c]; };
const facing = (th) => Math.sin(th) * V[0] + Math.cos(th) * V[2];
// a thin box (x0..x1 on the -x side of the hinge, y -h..h, z z0..z1) turned by th, drawn as its visible face
function turnedBox(x0, x1, h, z0, z1, th, cls, extra) {
  const corners = [];
  for (const x of [x0, x1]) for (const y of [-h, h]) for (const z of [z0, z1]) corners.push(p2(...turn(x, y, z, th)));
  const f = facing(th);
  const steep = Math.abs(f) < 0.32 ? " data-steep" : "";
  return '<path class="' + cls(f >= 0) + '"' + steep + ' d="' + pathOf(hull(corners), true) + '"/>' + extra(f >= 0) + '<path class="iso-line" data-tone="' + (cls(true) === "iso-shade" ? "mid" : "hi") + '" d="' + pathOf(hull(corners), true) + '"/>';
}
function clothFlap(th) {
  const x0 = HINGE - LEN / 2;
  return '<g class="' + (facing(th) >= 0 ? "cl-body" : "cl-face") + '">' + turnedBox(x0, HINGE, HALF, 0, CLOTH, th, (up) => (up ? "aloe-fill-body" : "aloe-fill-face"), (up) => {
    const z = up ? CLOTH : 0;
    const lines = up ? '<path class="aloe-stripe" d="' + STRIPES.map((y) => seg(turn(x0, y, z, th), turn(HINGE, y, z, th))).join("") + '"/>' : "";
    const d = seg(turn(x0, SEW[1], z, th), turn(HINGE, SEW[1], z, th));
    return lines + '<path class="aloe-stitch-under" d="' + d + '"/><path class="aloe-stitch" d="' + d + '"/>';
  }) + "</g>";
}
function foldPlate(th) {
  const x0 = HINGE - 31, fill = (up) => "iso-shade";
  const holes = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 7; j++) { const q = p2(...turn(x0 + 7 + i * 8.5, -33 + j * 11, facing(th) >= 0 ? -0.0 : -0.9, th)); holes.push('<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r=".5"/>'); }
  return '<g>' + turnedBox(x0, HINGE, 43, -0.9, 0, th, fill, () => "").replace('class="iso-shade"', 'class="iso-shade" data-shade="2"') + '<g class="iso-dots" data-tone="mid">' + holes.join("") + "</g></g>";
}
function webSvg(edge) {
  const plan = { x: ROLL.x, y: -HALF, w: edge - ROLL.x, d: HALF * 2, r: 0.6 };
  const stripes = STRIPES.map((y) => lineOnTop([ROLL.x, y], [edge, y], CLOTH, P)).join("");
  return '<g class="cl-body">' + solidSvg(slabOf(plan, 0, CLOTH, P, 2), { tone: "hi", crease: "lo", inner: lineSvg(sideSeam(plan, CLOTH / 2, P, 2), { tone: "faint" }) }) + '<path class="aloe-stripe" d="' + stripes + '"/></g>';
}
let lastEdge = null;
function draw(t) {
  const feed = ease(span(t, 0, 0.15));
  const cutting = span(t, 0.19, 0.31);
  const cutDone = t >= 0.31;
  const back = ease(span(t, 0.37, 0.56));
  const lift = ease(span(t, 0.32, 0.36)) * (1 - ease(span(t, 0.56, 0.6)));
  const sewing = span(t, 0.34, 0.64);
  const ramp = (x, a = 0.1) => (x < a ? (x * x) / (2 * a) : x > 1 - a ? 1 - a / 2 - (1 - x) * (1 - x) / (2 * a) : x - a / 2) / (1 - a);
  const sewD = SEWN * ramp(sewing);
  const d = cutDone ? (t < 0.64 ? clamp(sewD, 0, SEWN) : SEWN + (TRAVEL - SEWN) * ease(span(t, 0.65, 0.71))) : 0;
  const fold = Math.PI * ease(span(t, 0.72, 0.82));
  const release = Math.PI * (1 - ease(span(t, 0.84, 0.91)));
  const plateAngle = t < 0.83 ? fold : release;
  const drop = span(t, 0.91, 0.945);
  const carry = ease(span(t, 0.965, 1));

  // feed: the web runs out to one towel length, roll and nip roller turning with it
  const edge = cutDone ? CUT_X : CUT_X + LEN * feed;
  const shown = Math.round(edge * 4) / 4;
  if (shown !== lastEdge) { web.innerHTML = webSvg(shown); lastEdge = shown; }
  const fed = LEN * feed;
  const rollA = fed / ROLL.r, nipA = fed / NIP.r;
  rollMarks.setAttribute("d", [0, 1, 2, 3].map((i) => seg(onY(ROLL.x, 46, ROLL.z, 3.6, -rollA + i * Math.PI / 2), onY(ROLL.x, 46, ROLL.z, ROLL.r - 0.6, -rollA + i * Math.PI / 2))).join(""));
  pulleyMark.setAttribute("d", seg(onY(NIP.x, 55, NIP_Z, 2.4, -nipA), onY(NIP.x, 55, NIP_Z, 6.2, -nipA)));

  // cut: the blade runs across, then rides back lifted
  const cy = t < 0.33 ? -48 + 96 * ease(cutting) : 48 - 96 * back;
  cutter.setAttribute("transform", translateAlong(P, [0, cy, 0]));
  blade.setAttribute("transform", translateAlong(P, [0, 0, 6 * lift]));
  cut.setAttribute("d", cutting > 0 && !cutDone ? seg([CUT_X, -HALF, CLOTH], [CUT_X, clamp(cy, -HALF, HALF), CLOTH]) : "");

  // hem: the panel walks under the needle; one stitch cycle every 6 units of feed
  panel.style.display = cutDone ? "" : "none";
  panel.setAttribute("transform", translateAlong(P, [d, 0, 0]));
  const sewn = Math.min(d, SEWN);
  const bob = 4 + 4 * Math.cos((2 * Math.PI * sewn) / 6);
  needle.setAttribute("transform", translateAlong(P, [0, 0, bob]));
  lever.setAttribute("transform", translateAlong(P, [0, 0, -bob * 0.5]));
  const wheelA = (2 * Math.PI * sewn) / 6;
  spokes.setAttribute("d", [0, 1, 2, 3, 4].map((i) => seg(onX(60.4, -55, 38, 2.4, wheelA + (i * 2 * Math.PI) / 5), onX(60.4, -55, 38, 7.4, wheelA + (i * 2 * Math.PI) / 5))).join(""));
  const folding = t >= 0.72;
  const from = Math.max(SEW[0], CUT_X + d), to = CUT_X + LEN + d;
  const hem = cutDone && to > SEW[0] ? seg([folding ? HINGE : from, SEW[1], CLOTH], [to, SEW[1], CLOTH]) : "";
  stitch.setAttribute("d", hem); stitchUnder.setAttribute("d", hem);

  // fold: the plate carries the near half over, then swings back alone
  whole.style.display = folding ? "none" : "";
  right.style.display = folding ? "" : "none";
  flap.innerHTML = folding ? clothFlap(fold) : "";
  const plateSvg = foldPlate(plateAngle);
  const plateInFront = plateAngle > Math.PI / 2;
  plateBack.innerHTML = plateInFront ? "" : plateSvg;
  plateFront.innerHTML = plateInFront ? plateSvg : "";

  // label: lands with a small settle, then the towel is carried off
  const settle = drop <= 0 ? 0 : 1 - Math.exp(-6 * drop) * Math.cos(9 * drop);
  label.style.display = drop > 0 ? "" : "none";
  label.setAttribute("transform", translateAlong(P, [0, 0, 12 * (1 - settle)]));
  label.style.opacity = String(Math.min(1, drop * 5));
  lot.setAttribute("transform", translateAlong(P, [0, 0, 16 * carry]));
  lot.style.opacity = String(1 - carry);

  // readout from the same instant of the same model
  const words =
    t < 0.17 ? "feeding · " + Math.round(feed * 100) + "% of a length"
    : t < 0.19 ? "web fed · one towel length"
    : !cutDone ? "cutting · " + Math.round(cutting * 100) + "%"
    : t < 0.34 ? "cut · towel free of the web"
    : d < SEWN - 0.01 ? "hemming · " + Math.round((Math.max(0, CUT_X + LEN + d - SEW[0]) / LEN) * 100) + "% of the hem"
    : t < 0.72 ? "hem sewn · to the fold"
    : t < 0.83 ? "folding · " + Math.round((fold * 180) / Math.PI) + "°"
    : t < 0.91 ? "plate back · face side up"
    : t < 0.965 ? "labelled · ready"
    : "next towel";
  say(words);
}
${"__LOOP__"}
`;

export const fig07 = {
  card: cardHtml({
    fig: "Fig 07",
    title: "Cut, stitch & fold",
    hint: "Hover to scrub the cycle",
    readout: "hemming",
    keys: [
      { mark: "body", label: "Body side, cream with aloe pinstripes" },
      { mark: "face", label: "Face side, olive" },
      { mark: "lit", label: "Blade and needle" },
    ],
    caption:
      "One towel per cycle. The web runs out one length, the rotary blade cuts it free, and the hem is sewn as the panel walks under the needle, one stitch for every turn of the handwheel. The folding plate turns the near half over, so the olive face side, woven on the other side of the same cloth, comes up on top.",
    svg,
    label: "Finishing bench: arrow keys step through feed, cut, hem, fold and label; hovering scrubs the cycle",
    max: 1,
  }),
  live,
};
