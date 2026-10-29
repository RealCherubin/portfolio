// node aloe/record.mjs [--line] [--preview] → aloe/aloe-towel-line.mp4 (1920×1080, 30 fps, H.264)
// Steps film.html frame by frame in headless Chromium and pipes PNGs into ffmpeg.
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
const LINE = process.argv.includes("--line");
const { TOTAL, FPS } = await import(LINE ? "./line.mjs" : "./film.mjs");

const HERE = dirname(fileURLToPath(import.meta.url));
// Playwright from the project if installed, else the global install
const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve("playwright", { paths: [HERE, execSync("npm root -g").toString().trim()] }));
const preview = process.argv.includes("--preview");
const browser = await chromium.launch({ executablePath: process.env.CHROME_BIN || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(HERE, LINE ? "line-film.html" : "film.html")).href);
await page.waitForFunction(() => window.__aloe && window.__aloe.length >= 4);
if (preview) {
  for (const s of LINE ? [2, 6, 13, 24, 35, 44, 49, 56] : [1.5, 8, 16, 24, 30, 36, 42]) {
    await page.evaluate((t) => window.filmAt(t), s);
    await page.screenshot({ path: join(HERE, "shots", `film-${s}.png`) });
  }
  await browser.close();
  process.exit(0);
}
const out = join(HERE, LINE ? "aloe-towel-line-joined.mp4" : "aloe-towel-line.mp4");
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const frames = Math.round(TOTAL * FPS);
for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.filmAt(t), f / FPS);
  const png = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 150 === 0) console.log(`frame ${f} / ${frames}`);
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log("wrote", out);
