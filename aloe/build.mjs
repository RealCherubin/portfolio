// node aloe/build.mjs → aloe/index.html (light, ships) and aloe/index-dark.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pageHtml, PRE, LOOP } from "./lib.mjs";
import { fig07 } from "./fig07-finish.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const figs = [fig07];
const intro = `<p class="aloe-intro">The making of an aloe vera towel<small>The last steps of the line, from woven cloth to a folded towel. Every figure runs on its own; hover to scrub, or use the arrow keys.</small></p>`;
for (const theme of ["light", "dark"]) {
  const html = pageHtml({
    title: "Aloe towel line",
    theme,
    intro,
    cards: figs.map((f) => f.card),
    lives: figs.map((f) => PRE + f.live.replace("__LOOP__", LOOP)),
  });
  const file = theme === "light" ? "index.html" : "index-dark.html";
  writeFileSync(join(HERE, file), html);
  console.log("wrote", file, (html.length / 1024).toFixed(0) + " KB");
}
