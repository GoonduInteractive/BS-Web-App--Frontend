/**
 * Screenshot helper for the design check in project-overview.md section 3.
 * Captures the same route at desktop and mobile so it can be compared against
 * the Figma reference. Mobile is the majority audience - always check 380.
 *
 * Requires Playwright, which is deliberately not a project dependency:
 *   npm i -D playwright && npx playwright install chromium
 *
 * Usage:
 *   node screenshot.mjs en                 both widths
 *   node screenshot.mjs en/the-game 1440   one width
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "temporary-screenshots";
// Accept "en" or "/en". Git Bash rewrites a leading slash into a Windows path,
// so the unslashed form is the safe one to type on this machine.
const raw = process.argv[2] ?? "en";
const route = raw.startsWith("/") ? raw : `/${raw}`;
const widths = process.argv[3] ? [Number(process.argv[3])] : [1440, 380];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: Number(process.env.SHOT_HEIGHT) || (width < 700 ? 844 : 900) } });
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  const name = `${route.replace(/\//g, "_") || "_root"}@${width}.png`;
  await page.screenshot({ path: `${OUT}/${name}`, fullPage: process.env.FULL === "1" });
  console.log(`${OUT}/${name}`);
  await page.close();
}
await browser.close();
