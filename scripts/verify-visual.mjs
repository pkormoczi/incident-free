import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright";

/* minden statisztika (és a KILL LIST) csak a beállított Első/Utolsó nap közé eső        */
/* bejegyzéseket látja (ld. useMonitorStats.js) — az intro modal dátumait ezért a mai     */
/* naphoz KÉPEST kell megadni, nem fix naptári dátummal, különben a tap-to-log bejegyzés  */
/* egy nap egyszer csak kikerül a beállított ablakból, és a ".sm-kill-row" várakozás       */
/* timeoutol                                                                              */
const DAY = 86400000;
const isoDate = (ms) => new Date(ms).toISOString().slice(0, 10);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const shotsDir = path.join(repoRoot, "verify-shots");
mkdirSync(shotsDir, { recursive: true });

const server = await createServer({ root: repoRoot, server: { port: 4319, strictPort: true }, logLevel: "warn" });
await server.listen();
const url = `http://localhost:${server.config.server.port}`;

let exitCode = 0;
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 1400 } });

  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".sm-digit-big", { timeout: 15000 });

  // First-run intro modal requires start/end dates before "Indulhat" enables.
  if (await page.locator(".sm-modal-backdrop").count()) {
    const dateInputs = page.locator(".sm-modal input[type='date']");
    await dateInputs.nth(0).fill(isoDate(Date.now() - 7 * DAY));
    await dateInputs.nth(1).fill(isoDate(Date.now() + 34 * DAY));
    await page.locator(".sm-modal-confirm").click();
    await page.waitForSelector(".sm-modal-backdrop", { state: "detached", timeout: 5000 });
  }

  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(shotsDir, "01-full-page.png"), fullPage: true });

  for (const [name, selector] of [
    ["02-counter-board", ".sm-board-section"],
    ["03-heatmap", ".sm-heatmap-section"],
    ["04-stats", ".sm-stats-section"],
  ]) {
    const el = page.locator(selector);
    if (await el.count()) await el.screenshot({ path: path.join(shotsDir, `${name}.png`) });
  }

  // Tap-to-log smoke: click a type button, confirm the log modal opens and submits.
  await page.locator(".sm-type-btn").first().click();
  await page.waitForSelector(".sm-modal", { timeout: 5000 });
  await page.screenshot({ path: path.join(shotsDir, "05-log-modal.png") });

  await page.locator(".sm-modal-confirm").click();
  await page.waitForSelector(".sm-modal-backdrop", { state: "detached", timeout: 5000 });
  await page.waitForSelector(".sm-kill-row", { timeout: 5000 });
  await page.screenshot({ path: path.join(shotsDir, "06-after-log.png"), fullPage: true });

  // Light mode: toggle via the header button, re-shoot the same views.
  await page.locator("button", { hasText: /^(VILÁGOS|SÖTÉT)$/ }).click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === "light", { timeout: 3000 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(shotsDir, "07-light-full-page.png"), fullPage: true });

  for (const [name, selector] of [
    ["08-light-counter-board", ".sm-board-section"],
    ["09-light-heatmap", ".sm-heatmap-section"],
    ["10-light-stats", ".sm-stats-section"],
  ]) {
    const el = page.locator(selector);
    if (await el.count()) await el.screenshot({ path: path.join(shotsDir, `${name}.png`) });
  }

  await browser.close();

  if (consoleErrors.length) {
    console.error(`FAIL — ${consoleErrors.length} console error(s):`);
    for (const e of consoleErrors) console.error(" -", e);
    exitCode = 1;
  } else {
    console.log(`PASS — tap-to-log flow works, no console errors. Screenshots: ${shotsDir}`);
  }
} catch (err) {
  console.error("FAIL —", err.message);
  exitCode = 1;
} finally {
  await server.close();
}

process.exit(exitCode);
