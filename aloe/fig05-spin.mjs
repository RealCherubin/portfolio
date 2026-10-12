// Fig 05 · Blend & spin. Fine aloe powder drops through a rotary valve into a
// tank of viscose dope (wood pulp dissolved to a honey-thick solution) and an
// impeller blends it, seen through the tank's window. A metering pump pushes
// the dope to a spinneret under the spin bath; the filaments set as they leave
// its holes, run along the bath and out over two godets that draw them, and a
// traverse lays the tow onto a cone.
import { k, G, WIDTH, HEIGHT, helpers, bench, cardHtml } from "./lib.mjs";
import { tubePieces, tubeSvg } from "../.claude/skills/anatomy/kit/tube.mjs";

const PLATE = { x: -160, y: -64, w: 320, d: 128, r: 8 };
const TANK = { x: -146, y: -42, w: 46, d: 46, r: 4 };
const TANK_Z = [10, 64];
const FACE_Y = TANK.y + TANK.d; // window on the near face
const WIN = { x0: -140, x1: -106, z0: 16, z1: 58 };
const MID_Y = FACE_Y - 3; // plane the tank's insides are drawn in, just behind the glass
const SHAFT_X = -123;
const LEVEL = 44;
const HOPPER = [-134, -31];
const BATH = { x: -62, y: -36, w: 84, d: 34, r: 2 };
const BATH_TOP = 24, LIQUID = 21;
const JET = { x: -54, y: BATH.y + BATH.d / 2, z: 15.5, r: 4.6 };
const GUIDE = [14, JET.y, 19.6];
const GODETS = [{ x: 36, z: 33, r: 5 }, { x: 56, z: 41, r: 5 }];
const CONE = { x: 104, z: 24, y0: -32, y1: -6 };
const HOLES = Array.from({ length: 24 }, (_, i) => {
  const ring = i < 8 ? 1.4 : 3; // two rings of holes on the jet face
  const a = (i < 8 ? i / 8 : (i - 8) / 16) * Math.PI * 2;
  return [JET.y + ring * Math.cos(a), JET.z + ring * Math.sin(a)];
});

const P = k.fitProjection([...k.boxCorners(PLATE, -17, 0), [HOPPER[0], HOPPER[1], 94], [-123, -18, 82]], WIDTH, HEIGHT, { pad: 26, azimuth: 50 });
const { at, S, L, D, byDepth } = helpers(P);
const alongY = (x, y, z) => G.frameAlong([x, y, z], [0, 1, 0]);
const alongX = (x, y, z) => G.frameAlong([x, y, z], [1, 0, 0]);
const up = (x, y, z) => G.frameAlong([x, y, z], [0, 0, 1]);
const post = (x, y, w, d, h, z = 0) => S(k.slabOf({ x, y, w, d, r: 1 }, z, h, P, 3, 0.4), { tone: "mid" });
const pipe = (points, r = 1.6) => tubePieces(G.fillet(points, 4, 7, { P, tube: r }), r, P, { maxLength: 400 }).map((p) => tubeSvg(p, { tone: "mid" })).join("");
const facePoint = (x, z) => at([x, FACE_Y, z]);
const windowPoly = k.pathOf([facePoint(WIN.x0, WIN.z0), facePoint(WIN.x1, WIN.z0), facePoint(WIN.x1, WIN.z1), facePoint(WIN.x0, WIN.z1)], true);

function backParts() {
  const out = [];
  // godet stand and winder frame behind the line
  const stand = { x: 30, y: -48, w: 32, d: 10, r: 1.5 };
  out.push(S(k.slabOf(stand, 0, 50, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(stand, 12, P, 4), { tone: "faint" }) }));
  out.push(D([at([34, -38, 46]), at([58, -38, 46])], { size: 0.45 }));
  const frame = { x: 82, y: -48, w: 44, d: 10, r: 1.5 };
  out.push(S(k.slabOf(frame, 0, 44, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(frame, 10, P, 4), { tone: "faint" }) }));
  // traverse rail above the cone
  out.push(S(G.disc(0, 48, 1.1, alongY(CONE.x - 4, -38, 38), P), { tone: "mid" }));
  out.push(S(G.disc(0, 30, 1.6, alongY(CONE.x, -38, CONE.z), P), { tone: "mid" }));
  return out.join("");
}

function tank() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(TANK, 0, 10, P)}"/>`);
  for (const [x, y] of byDepth(k.corners(TANK, 6))) out.push(S(k.cylinder(x, y, 2.6, 0, TANK_Z[0], P, 18), { tone: "mid" }));
  out.push(S(k.slabOf(TANK, TANK_Z[0], TANK_Z[1] - TANK_Z[0], P, 6, 1), { tone: "mid", inner: L(k.sideSeam(TANK, 14, P, 6) + k.sideSeam(TANK, 60, P, 6), { tone: "faint" }) }));
  // the window: dope, aloe and the impeller, clipped to the glass
  out.push(`<clipPath id="aloe-tank-win"><path d="${windowPoly}"/></clipPath>`);
  out.push(`<path class="aloe-cavity" d="${windowPoly}"/>`);
  out.push(`<g clip-path="url(#aloe-tank-win)"><path data-part="dope" class="aloe-dope" d=""/><g data-part="specks" class="aloe-dust"></g><path data-part="impeller" class="iso-line" data-tone="hi" d="" style="stroke-width:1.3"/><g data-part="paddles" class="iso-dots" data-tone="hi"></g><g data-part="fall" class="aloe-dust"></g></g>`);
  out.push(`<path class="aloe-glass" d="${k.pathOf([facePoint(WIN.x0 + 3, WIN.z1 - 2), facePoint(WIN.x0 + 9, WIN.z1 - 2), facePoint(WIN.x0 + 4, WIN.z0 + 10), facePoint(WIN.x0 + 1.5, WIN.z0 + 10)], true)}"/>`);
  out.push(L(windowPoly, { tone: "hi" }));
  const frame = [[WIN.x0 - 2, WIN.z0 - 2], [WIN.x1 + 2, WIN.z0 - 2], [WIN.x1 + 2, WIN.z1 + 2], [WIN.x0 - 2, WIN.z1 + 2]];
  out.push(L(k.pathOf(frame.map(([x, z]) => facePoint(x, z)), true), { tone: "lo" }));
  out.push(D(frame.map(([x, z]) => facePoint(x, z)), { size: 0.5 }));
  // level scale beside the window
  out.push(L([20, 28, 36, 44, 52].map((z) => k.pathOf([facePoint(WIN.x1 + 2, z), facePoint(WIN.x1 + 4.4, z)])).join(""), { tone: "lo" }));
  // pressure gauge and rivet rows on the tank's side
  const sideX = TANK.x + TANK.w;
  const gauge = alongX(sideX, TANK.y + 30, 50);
  out.push(S(G.disc(0, 2.4, 6, gauge, P), { tone: "mid" }));
  out.push(L(G.circleOf(gauge, 2.4, 4.8, P), { tone: "lo" }));
  out.push(`<path data-part="gauge" class="iso-line" data-tone="lit" data-free="end" d=""/>`);
  out.push(S(G.disc(-0.1, 0.1, 1, alongX(sideX + 2.5, TANK.y + 30, 50), P), { tone: "mid" }));
  out.push(D([16, 24, 32, 40, 48, 56].flatMap((z) => [at([sideX, TANK.y + 6, z]), at([sideX, TANK.y + TANK.d - 6, z])]), { size: 0.45 }));
  const plate = [[TANK.y + 14, 22], [TANK.y + 34, 22], [TANK.y + 34, 32], [TANK.y + 14, 32]];
  out.push(L(k.pathOf(plate.map(([y, z]) => at([sideX, y, z])), true), { tone: "lo" }));
  out.push(L([[17, 29, 31], [17, 26, 28], [17, 24, 25]].map(([y0, y1, z]) => k.pathOf([at([sideX, TANK.y + y0, z]), at([sideX, TANK.y + y1 + 3, z])])).join(""), { tone: "lo", free: true }));
  // lid, motor and coupling, hopper on its rotary valve
  const lid = k.insetPlan(TANK, 3);
  out.push(S(k.slabOf(lid, TANK_Z[1], 2, P, 6, 0.6), { tone: "mid" }));
  out.push(D(k.corners(lid, 3).map(([x, y]) => at([x, y, TANK_Z[1] + 2])), { size: 0.5 }));
  out.push(S(k.cylinder(HOPPER[0], HOPPER[1], 5, 66, 6, P, 28, 0.4), { tone: "mid" }));
  out.push(`<path data-part="valve" class="iso-line" data-tone="lo" d=""/>`);
  const hop = up(HOPPER[0], HOPPER[1], 72);
  out.push(S(G.solidOf([[0, 2.8], [15, 11, 1], [19, 12], [21, 12]], hop, P), { tone: "mid", inner: L(G.arcOf(hop, 19, 12, P), { tone: "faint" }) }));
  out.push(`<path class="aloe-powder" d="${G.circleOf(hop, 21, 10.6, P)}"/>`);
  out.push(L(G.circleOf(hop, 21, 10.6, P), { tone: "lo" }));
  out.push(S(k.cylinder(SHAFT_X + 6, -18, 7, 66, 12, P, 32, 0.6), { tone: "mid" }));
  out.push(L(k.knurl(SHAFT_X + 6, -18, 7, 68, 76, 28, P, 0.6), { tone: "faint" }));
  out.push(L([68, 76].map((z) => k.sideArc(SHAFT_X + 6, -18, 7, z, P, 28)).join(""), { tone: "lo" }));
  out.push(S(k.cylinder(SHAFT_X + 6, -18, 3, 78, 3, P, 20), { tone: "mid" }));
  out.push(`<path data-part="coupling" class="iso-line" data-tone="hi" data-free="end" d=""/>`);
  return out.join("");
}

function plumbing() {
  const out = [];
  // tank outlet down to the metering pump, pump out to the jet in the bath end wall
  out.push(pipe([[-112, -20, TANK_Z[0]], [-112, -20, 4], [-86, -20, 4]]));
  const pump = { x: -88, y: -28, w: 14, d: 16, r: 2 };
  out.push(S(k.slabOf(pump, 0, 12, P, 4, 0.6), { tone: "mid", inner: L(k.sideSeam(pump, 6, P, 4), { tone: "faint" }) }));
  const gear = alongY(-81, pump.y + pump.d, 7);
  out.push(S(G.disc(0, 2, 4.6, gear, P), { tone: "mid" }));
  out.push(L(G.circleOf(gear, 2, 1.2, P) + G.circleOf(gear, 2, 3.4, P), { tone: "lo" }));
  out.push(`<path data-part="gear" class="iso-line" data-tone="lo" d=""/>`);
  out.push(D(G.dotsOf(gear, 2, 3.6, 6, P, { all: true }), { size: 0.4 }));
  out.push(S(k.cylinder(-81, -20, 4, 12, 9, P, 24, 0.4), { tone: "mid" }));
  out.push(L(k.knurl(-81, -20, 4, 12, 21, 18, P), { tone: "faint" }));
  out.push(pipe([[-74, -20, 6], [-66, -20, 6], [-66, JET.y, 6], [-66, JET.y, JET.z], [BATH.x, JET.y, JET.z]], 1.4));
  return out.join("");
}

function bath() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(BATH, 0, BATH_TOP, P)}"/>`);
  out.push(S(k.slabOf(BATH, 0, BATH_TOP, P, 3, 0.8), { tone: "mid", inner: L(k.sideSeam(BATH, 6, P, 3), { tone: "faint" }) }));
  const inner = k.insetPlan(BATH, 2.5);
  const opening = k.pathOf(k.ringOf(inner, 2).map(([x, y]) => at([x, y, BATH_TOP])), true);
  out.push(`<path class="aloe-cavity" d="${opening}"/>`);
  // far inner walls down to the liquid
  const far = [[inner.x, inner.y + inner.d], [inner.x, inner.y], [inner.x + inner.w, inner.y]];
  out.push(`<path class="iso-shade" data-shade="1" d="${k.pathOf([...far.map(([x, y]) => at([x, y, BATH_TOP])), ...far.reverse().map(([x, y]) => at([x, y, LIQUID]))], true)}"/>`);
  out.push(`<clipPath id="aloe-bath"><path d="${opening}"/></clipPath><g clip-path="url(#aloe-bath)">`);
  // the jet, under the bath, and the filaments setting as they leave it
  const jet = alongX(BATH.x + 2.5, JET.y, JET.z);
  out.push(S(G.disc(0, 5, JET.r, jet, P), { tone: "mid" }));
  out.push(S(G.disc(5, 6, JET.r - 0.8, jet, P), { tone: "hi", lit: true }));
  out.push(D(HOLES.map(([y, z]) => at([BATH.x + 8.5, y, z])), { size: 0.35, tone: "hi" }));
  out.push(`<path data-part="filaments" class="aloe-filament" d="${HOLES.map(([y, z]) => k.pathOf([at([BATH.x + 8.6, y, z]), at(GUIDE)])).join("")}"/>`);
  out.push(`</g>`);
  out.push(`<path class="aloe-liquid" d="${k.pathOf(k.ringOf(inner, 2).map(([x, y]) => at([x, y, LIQUID])), true)}"/>`);
  out.push(L(k.planOutline(inner, BATH_TOP, P, 2), { tone: "lo" }));
  // the guide roller at the far end of the bath, half under
  out.push(S(G.disc(-3, 3, 1.4, alongY(GUIDE[0], GUIDE[1], GUIDE[2]), P), { tone: "mid" }));
  out.push(S(k.slabOf({ x: GUIDE[0] - 1.5, y: BATH.y + 2.5, w: 3, d: 3, r: 0.6 }, LIQUID, BATH_TOP - LIQUID + 2, P, 2), { tone: "mid" }));
  return out.join("");
}

const TOW = [GUIDE, [GUIDE[0] + 6, GUIDE[1], 28], [GODETS[0].x - GODETS[0].r, GUIDE[1], GODETS[0].z], [GODETS[0].x, GUIDE[1], GODETS[0].z + GODETS[0].r], [GODETS[1].x - GODETS[1].r * 0.4, GUIDE[1], GODETS[1].z + GODETS[1].r]];

function godets() {
  const out = [];
  out.push(`<path data-part="tow" class="aloe-filament" d="${k.pathOf(TOW.map(at))}" style="stroke-width:1.6"/>`);
  GODETS.forEach((g, i) => {
    const F = alongY(g.x, -38, g.z);
    out.push(S(G.disc(0, 4, 3, F, P), { tone: "mid" }));
    out.push(`<g class="cl-face">${S(G.disc(4, 28, g.r, F, P), { tone: "hi", crease: "lo" })}</g>`);
    out.push(S(G.disc(28, 29.4, g.r + 0.8, F, P), { tone: "mid" }));
    out.push(`<path data-part="godet-${i}" class="iso-line" data-tone="hi" d=""/>`);
  });
  return out.join("");
}

function winder() {
  const out = [];
  const F = alongY(CONE.x, CONE.y0, CONE.z);
  out.push(`<path data-part="feed" class="aloe-filament" d="" style="stroke-width:1.4"/>`);
  out.push(`<g class="cl-face">${S(G.solidOf([[0, 7], [26, 11]], F, P), { tone: "hi", crease: "lo" })}</g>`);
  out.push(S(G.disc(26, 28, 3.4, F, P), { tone: "mid" }));
  out.push(L(G.circleOf(F, 28, 1.2, P), { tone: "lo" }));
  out.push(`<path data-part="wraps" class="iso-line" data-tone="hi" d=""/>`);
  out.push(`<g data-part="traverse">${S(k.slabOf({ x: CONE.x - 7, y: -2.2, w: 6, d: 4.4, r: 1 }, 35.4, 5, P, 2, 0.4), { tone: "hi", lit: true })}${S(k.slabOf({ x: CONE.x - 5.4, y: -0.8, w: 2.6, d: 1.6, r: 0.6 }, 30.6, 4.8, P, 2), { tone: "mid" })}</g>`);
  // finished cones waiting for the loom
  for (const [x, y] of byDepth([[144, -40], [144, -22], [144, -4], [126, -31]])) {
    out.push(S(k.cylinder(x, y, 8.6, 0, 1.6, P, 32), { tone: "mid" }));
    out.push(`<g class="cl-face">${S(G.solidOf([[0, 8], [18, 4.4]], up(x, y, 1.6), P), { tone: "hi", crease: "lo" })}</g>`);
    out.push(S(k.cylinder(x, y, 1.4, 19.6, 3, P, 14), { tone: "mid", crease: "none" }));
  }
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Blending and spinning aloe viscose. A rotary valve under a hopper drops fine aloe powder into a tank of viscose dope while an impeller blends it, seen through a window in the tank. A metering pump pushes the dope to a spinneret under the spin bath; the filaments set as they leave its holes, run to a guide at the far end, rise over two godets and are laid onto a cone by a traverse.",
  body: [bench(P, PLATE, { label: [-150, 48] }), backParts(), plumbing(), tank(), bath(), godets(), winder()],
});

const live = `
const P = ${JSON.stringify(P)};
const WIN = ${JSON.stringify(WIN)}, MID_Y = ${MID_Y}, SHAFT_X = ${SHAFT_X}, LEVEL = ${LEVEL}, HOPPER = ${JSON.stringify(HOPPER)};
const GODETS = ${JSON.stringify(GODETS)}, CONE = ${JSON.stringify(CONE)}, GUIDE = ${JSON.stringify(GUIDE)};
const CYCLE = 12, START = 0.05, SIDE_X = ${TANK.x + TANK.w}, GAUGE_Y = ${TANK.y + 30};
const PHASES = [{ at: 0, name: "dosing aloe powder" }, { at: 0.3, name: "blending" }, { at: 0.62, name: "spinning" }];
const p2 = (x, y, z) => iso([x, y, z], P);
const part = (name) => svg.querySelector('[data-part="' + name + '"]');
const paddles = part("paddles"), dope = part("dope"), specks = part("specks"), fall = part("fall"), impeller = part("impeller"), valve = part("valve");
const gaugeNeedle = part("gauge"), coupling = part("coupling"), gear = part("gear"), filaments = part("filaments"), tow = part("tow"), feed = part("feed");
const wraps = part("wraps"), traverse = part("traverse"), godet = [part("godet-0"), part("godet-1")];
// fixed pseudo-random home spots for 60 aloe specks in the dope
const SPECKS = Array.from({ length: 60 }, (_, i) => [((i * 37) % 60) / 60, ((i * 23) % 60) / 60, (i * 0.61) % 1]);
const dot = (q, r) => '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="' + r + '"/>';
const turns = (n) => n * 2 * Math.PI;
function draw(t, clock) {
  const dose = span(t, 0.02, 0.3);
  const mix = ease(span(t, 0.18, 0.62));
  const drain = span(t, 0.9, 1);
  // the impeller turns all the time; one turn of the valve's six pockets per dose
  const spin = turns(t * CYCLE * 0.9);
  const level = LEVEL - 1.2 * Math.sin(Math.PI * dose) + 0 * drain;
  const wave = (x) => level + 0.6 * Math.sin(x * 0.4 + spin);
  const top = [];
  for (let x = WIN.x0 - 2; x <= WIN.x1 + 2; x += 2) top.push(p2(x, MID_Y, wave(x)));
  dope.setAttribute("d", pathOf([...top, p2(WIN.x1 + 2, MID_Y, WIN.z0 - 12), p2(WIN.x0 - 2, MID_Y, WIN.z0 - 12)], true));
  // blades: two paddles seen edge-on as they turn
  const blade = (z, a) => pathOf([p2(SHAFT_X - 11 * Math.cos(a), MID_Y, z), p2(SHAFT_X + 11 * Math.cos(a), MID_Y, z)]);
  impeller.setAttribute("d", pathOf([p2(SHAFT_X, MID_Y, WIN.z1), p2(SHAFT_X, MID_Y, 20)]) + blade(22, spin) + blade(33, spin + Math.PI / 2));
  paddles.innerHTML = [[22, spin], [33, spin + Math.PI / 2]].flatMap(([z, a]) => [-1, 1].map((s) => dot(p2(SHAFT_X + s * 11 * Math.cos(a), MID_Y, z), 1.1))).join("") + dot(p2(SHAFT_X, MID_Y, 20), 1.2);
  // aloe specks: a clump under the valve, swirled out through the dope as it blends
  const shown = Math.round(60 * Math.min(1, dose * 1.15));
  specks.innerHTML = SPECKS.slice(0, shown).map(([fx, fz, ph], i) => {
    const homeX = WIN.x0 + 2 + fx * (WIN.x1 - WIN.x0 - 4), homeZ = WIN.z0 + 3 + fz * (level - WIN.z0 - 6);
    const clumpX = HOPPER[0] + 3 * Math.cos(i), clumpZ = level - 2 - 4 * fz;
    const swirl = (1 - mix) * 0 + Math.sin(spin * 0.5 + ph * 6.28) * 1.4 * mix;
    return dot(p2(clumpX + (homeX - clumpX) * mix + swirl, MID_Y, clumpZ + (homeZ - clumpZ) * mix), 0.7);
  }).join("");
  // powder falling from the valve while dosing
  const falling = [];
  if (dose > 0 && dose < 1) for (let i = 0; i < 7; i++) { const f = (clock * 1.6 + i / 7) % 1; falling.push(dot(p2(HOPPER[0] + Math.sin(i * 3) * 1.2, MID_Y, WIN.z1 + 4 - f * (WIN.z1 + 4 - level)), 0.6)); }
  fall.innerHTML = falling.join("");
  const vA = turns(dose);
  valve.setAttribute("d", [0, 1, 2].map((i) => lineOnTop([HOPPER[0] - 5 * Math.cos(vA + i * Math.PI / 3), HOPPER[1] - 5 * Math.sin(vA + i * Math.PI / 3)], [HOPPER[0] + 5 * Math.cos(vA + i * Math.PI / 3), HOPPER[1] + 5 * Math.sin(vA + i * Math.PI / 3)], 72, P)).join(""));
  coupling.setAttribute("d", lineOnTop([SHAFT_X + 6, -18], [SHAFT_X + 6 + 3 * Math.cos(spin), -18 + 3 * Math.sin(spin)], 81, P));
  // tank pressure rises a little while the dose goes in and settles as it blends
  const press = 0.35 + 0.25 * Math.sin(Math.PI * dose) * (1 - mix * 0.6);
  const ga = -2.4 + 4.8 * press;
  gaugeNeedle.setAttribute("d", pathOf([p2(SIDE_X + 2.5, GAUGE_Y, 50), p2(SIDE_X + 2.5, GAUGE_Y + 3.8 * Math.sin(ga), 50 + 3.8 * Math.cos(ga))]));
  // spinning: dope flows at a steady rate; everything downstream moves with it
  const flow = t * CYCLE * 14;
  gear.setAttribute("d", [0, 1, 2].map((i) => { const a = flow / 6 + (i * 2 * Math.PI) / 3; return pathOf([p2(-81 + 1.2 * Math.cos(a), -10, 7 + 1.2 * Math.sin(a)), p2(-81 + 3.4 * Math.cos(a), -10, 7 + 3.4 * Math.sin(a))]); }).join(""));
  filaments.style.strokeDashoffset = String(-flow * 0.7);
  tow.style.strokeDashoffset = String(-flow);
  GODETS.forEach((g, i) => { const a = flow / g.r * (i ? 1.3 : 1); godet[i].setAttribute("d", pathOf([p2(g.x + 1.4 * Math.cos(a), -9, g.z + 1.4 * Math.sin(a)), p2(g.x + (g.r - 0.6) * Math.cos(a), -9, g.z + (g.r - 0.6) * Math.sin(a))])); });
  // traverse: back and forth along the cone, the tow following it down onto the package
  const ty = CONE.y0 + 3 + (CONE.y1 - CONE.y0 - 6) * (0.5 - 0.5 * Math.cos(t * 2 * Math.PI * 6));
  traverse.setAttribute("transform", translateAlong(P, [0, ty, 0]));
  const rAt = (y) => 7 + 4 * (y - CONE.y0) / (CONE.y1 - CONE.y0);
  const last = GODETS[1];
  feed.setAttribute("d", pathOf([p2(last.x + last.r * 0.6, GUIDE[1], last.z + last.r * 0.8), p2(CONE.x - 4, ty, 38), p2(CONE.x - 4, ty, 35.4), p2(CONE.x - rAt(ty) * 0.5, ty, CONE.z + rAt(ty) * 0.87)]));
  feed.style.strokeDashoffset = String(-flow);
  const ca = flow / 9;
  wraps.setAttribute("d", pathOf([p2(CONE.x + 1.2 * Math.cos(ca), CONE.y0 + 28, CONE.z + 1.2 * Math.sin(ca)), p2(CONE.x + 3.3 * Math.cos(ca), CONE.y0 + 28, CONE.z + 3.3 * Math.sin(ca))]));
  say(t < 0.3 ? "dosing aloe powder · " + Math.round(dose * 100) + "%" : t < 0.62 ? "blending · " + Math.round(mix * 100) + "% even" : "spinning · 24 filaments to the cone");
}
${"__LOOP__"}
`;

export const fig05 = {
  card: cardHtml({
    fig: "Fig 05",
    title: "Blend & spin",
    hint: "Hover to scrub the batch",
    readout: "dosing aloe powder",
    keys: [
      { mark: "face", label: "Aloe: powder, filaments and yarn" },
      { mark: "flat", label: "Viscose dope from wood pulp" },
      { mark: "lit", label: "Spinneret face" },
    ],
    caption:
      "The aloe is blended into the fibre itself, not coated on afterwards: the powder is mixed through the viscose before it is spun, so every filament that leaves the spinneret carries it. A real spinneret has thousands of holes; 24 are drawn here.",
    svg,
    label: "Blend and spin: arrow keys step through dosing, blending and spinning; hovering scrubs the batch",
    max: 1,
  }),
  live,
};
