// node aloe/film.mjs → aloe/film.html, a 1920×1080 stage that plays the line as
// one film. Every figure is driven frame by frame through its film hook, so the
// recording (aloe/record.mjs) is exact and identical on every run.
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pageHtml, PRE, LOOP } from "./lib.mjs";
import { fig05 } from "./fig05-spin.mjs";
import { fig06 } from "./fig06-weave.mjs";
import { fig07 } from "./fig07-finish.mjs";
import { fig08 } from "./fig08-serum.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FPS = 30;

// The cut: a title, four stages, an end card. Times in seconds. Each stage plays
// a stretch of its own cycle (from → to) and dissolves into the next.
const DISSOLVE = 0.9;
const SCENES = [
  { fig: fig05, step: "05", title: "Blend & spin", cap: "Aloe powder is blended into the viscose, then spun into fibre.", start: 3.2, length: 10, from: 0, to: 1 },
  { fig: fig06, step: "06", title: "Three-layer weave", cap: "The cones feed the loom, which weaves the face, middle and body layers at once.", start: 0, length: 8, from: 0, to: 0.5 },
  { fig: fig07, step: "07", title: "Cut, stitch & fold", cap: "Each towel is cut from the roll, hemmed and folded face side up.", start: 0, length: 10.5, from: 0, to: 1 },
  { fig: fig08, step: "08", title: "Serum finish", cap: "One drop of serum on every towel before it leaves the line.", start: 0, length: 10, from: 0, to: 2 },
];
let clock = SCENES[0].start;
for (const scene of SCENES) {
  if (scene.start === 0) scene.start = clock - DISSOLVE;
  clock = scene.start + scene.length;
}
const END = { start: clock - 0.6, length: 3.4 };
const TOTAL = END.start + END.length;

const svgOf = (card) => {
  const at = card.indexOf('class="iso-svg');
  const from = card.lastIndexOf("<svg", at);
  return card.slice(from, card.indexOf("</svg>", at) + 6);
};

const FILM_CSS = `
html,body{width:1920px;height:1080px;overflow:hidden}
.iso-page{width:1920px!important;height:1080px;margin:0!important;position:relative;background:var(--anatomy-card)}
.film-scene.iso-plate{position:absolute;inset:0;padding:0;box-shadow:none;background:var(--anatomy-card);opacity:0;display:grid;grid-template-rows:auto 1fr auto;padding-block:64px 58px;padding-inline:96px}
.film-scene .iso-stage{display:grid;place-items:center;min-height:0;cursor:default;overflow:hidden}
.film-scene .iso-svg{height:100%;width:auto;max-width:100%}
.film-head{display:flex;align-items:baseline;gap:22px;font-family:var(--anatomy-mono);color:var(--anatomy-muted);letter-spacing:.14em;text-transform:uppercase;font-size:20px}
.film-step{color:var(--anatomy-strong);font-size:22px}
.film-rule{flex:1;height:1px;background:var(--anatomy-faint);align-self:center}
.film-foot{position:relative;z-index:2;padding-top:18px;display:flex;justify-content:space-between;align-items:baseline;gap:40px}
.film-cap{margin:0;max-width:62ch;color:var(--anatomy-strong);font-size:27px;line-height:1.35;letter-spacing:-.005em}
.film-read{font-family:var(--anatomy-mono);font-size:19px;color:var(--anatomy-muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.film-card{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:22px;text-align:center;background:var(--anatomy-card);opacity:0}
.film-card h1{margin:0;font-size:68px;font-weight:600;letter-spacing:-.02em;color:var(--anatomy-strong);text-wrap:balance}
.film-card p{margin:0;font-family:var(--anatomy-mono);font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:var(--anatomy-muted)}
.film-card .film-swatch{display:flex;gap:10px}
.film-card .film-swatch i{display:block;width:46px;height:10px}
`;

const scenesHtml = SCENES.map(
  (s, i) => `<section class="iso-plate film-scene" data-scene="${i}"><div class="film-head"><span class="film-step">${s.step}</span><span>${s.title}</span><span class="film-rule"></span><span>The aloe towel line</span></div><div class="iso-stage">${svgOf(s.fig.card)}</div><div class="film-foot"><p class="film-cap">${s.cap}</p><span class="film-read" data-readout></span></div></section>`,
);
const swatch = `<span class="film-swatch"><i style="background:var(--clf-paper)"></i><i style="background:#fff;box-shadow:inset 0 0 0 1px var(--anatomy-faint)"></i><i style="background:var(--clb-0)"></i><i style="background:var(--serum)"></i></span>`;
const cards = `<div class="film-card" data-card="title"><p>Steps 05 to 08</p><h1>The making of an aloe vera towel</h1>${swatch}</div><div class="film-card" data-card="end"><h1>From aloe to towel</h1><p>Blend · Weave · Finish · Serum</p>${swatch}</div>`;

const control = `<script>
window.ALOE_FILM = true;
const FILM = ${JSON.stringify({ scenes: SCENES.map(({ start, length, from, to }) => ({ start, length, from, to })), end: END, total: TOTAL, dissolve: DISSOLVE })};
const fade = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
window.filmAt = (time) => {
  const scenes = document.querySelectorAll("[data-scene]");
  FILM.scenes.forEach((s, i) => {
    const into = time - s.start, left = s.start + s.length - time;
    const on = into > -0.05 && left > -FILM.dissolve;
    const a = i === 0 ? fade(into / 0.8) : fade(into / FILM.dissolve);
    scenes[i].style.opacity = on ? String(Math.min(a, 1)) : "0";
    scenes[i].style.zIndex = String(i + 1);
    if (!on) return;
    const at = s.from + (s.to - s.from) * Math.min(1, Math.max(0, into / s.length));
    window.__aloe[i](at >= s.to ? 0.9999 : at % 1, time);
    // a slow push-in across the scene, eased at both ends
    const push = 1 + 0.045 * fade((time - s.start) / (s.length + FILM.dissolve));
    scenes[i].querySelector(".iso-svg").style.transform = "scale(" + push.toFixed(4) + ")";
  });
  const title = document.querySelector('[data-card="title"]'), end = document.querySelector('[data-card="end"]');
  title.style.opacity = String(fade(time / 0.7) * (1 - fade((time - FILM.scenes[0].start) / 0.8)));
  title.style.zIndex = "9";
  end.style.opacity = String(fade((time - FILM.end.start) / 0.9));
  end.style.zIndex = "9";
};
</script>`;

const lives = SCENES.map((s) => PRE + s.fig.live.replace("__LOOP__", LOOP));
let html = pageHtml({ title: "Aloe towel line film", theme: "light", intro: control + cards, cards: scenesHtml, lives });
html = html.replace("</style>", FILM_CSS + "</style>");
writeFileSync(join(HERE, "film.html"), html);
console.log("wrote film.html", TOTAL.toFixed(1) + " s", Math.round(TOTAL * FPS) + " frames");
export { TOTAL, FPS };
