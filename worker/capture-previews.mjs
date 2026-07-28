// Captures preview screenshots of a running YouTwo instance.
//
//   node worker/capture-previews.mjs [baseUrl]      (writes into previews/)
//
// Signs in so the Studio and admin screens can be captured too. Credentials
// come from PREVIEW_EMAIL / PREVIEW_PASSWORD in the environment.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "previews");
const BASE = process.argv[2] || process.env.PREVIEW_BASE || "http://localhost:3000";
const EMAIL = process.env.PREVIEW_EMAIL;
const PASSWORD = process.env.PREVIEW_PASSWORD;

const DESKTOP = { width: 1440, height: 900 };
const PHONE = { width: 390, height: 844 };

fs.mkdirSync(here, { recursive: true });

const browser = await chromium.launch();

async function shot(page, name, { full = false, wait = 1800 } = {}) {
  await page.waitForTimeout(wait);
  const file = path.join(here, `${name}.png`);
  await page.screenshot({ path: file, fullPage: full });
  const kb = (fs.statSync(file).size / 1024).toFixed(0);
  console.log(`  ${name}.png  (${kb} KB)`);
}

async function go(page, url) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
}

// ---------- public pages, desktop ----------
{
  const ctx = await browser.newContext({ viewport: DESKTOP, colorScheme: "dark" });
  const page = await ctx.newPage();
  console.log("desktop (public):");

  await go(page, "/");
  await shot(page, "01-home");

  // first ready video on the home grid
  const href = await page.locator('a[href^="/watch/"]').first().getAttribute("href").catch(() => null);
  if (href) {
    await go(page, href);
    // let the player paint a frame rather than a black box
    await page.waitForTimeout(3500);
    await shot(page, "02-watch", { wait: 500 });
  }

  await go(page, "/channel/@youtwo");
  await shot(page, "03-channel");

  await go(page, "/results?search_query=youtwo");
  await shot(page, "04-search");

  await go(page, "/login");
  await shot(page, "05-login");

  await ctx.close();
}

// ---------- signed-in: studio + admin ----------
if (EMAIL && PASSWORD) {
  const ctx = await browser.newContext({ viewport: DESKTOP, colorScheme: "dark" });
  const page = await ctx.newPage();
  console.log("desktop (signed in):");

  await go(page, "/login");
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForTimeout(2500);

  // Without this, a failed sign-in silently redirects every Studio URL back to
  // /login and we ship a folder of identical login screenshots.
  await go(page, "/studio");
  if (page.url().includes("/login")) {
    const msg = await page.locator("p.text-red-400").first().textContent().catch(() => null);
    throw new Error(`sign-in failed, /studio redirected to /login${msg ? ` — "${msg.trim()}"` : ""}`);
  }
  console.log(`  (signed in as ${EMAIL})`);

  for (const [url, name] of [
    ["/studio", "06-studio-dashboard"],
    ["/studio/content", "07-studio-content"],
    ["/studio/upload", "08-studio-upload"],
    ["/studio/analytics", "09-studio-analytics"],
    ["/studio/stream", "10-studio-stream"],
    ["/studio/customization", "11-studio-customization"],
    ["/admin", "12-admin"],
  ]) {
    await go(page, url);
    await shot(page, name);
  }
  await ctx.close();
} else {
  console.log("(skipping Studio shots — set PREVIEW_EMAIL and PREVIEW_PASSWORD)");
}

// ---------- phone ----------
{
  const ctx = await browser.newContext({
    viewport: PHONE,
    colorScheme: "dark",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  console.log("phone:");

  await go(page, "/");
  await shot(page, "13-mobile-home");

  const href = await page.locator('a[href^="/watch/"]').first().getAttribute("href").catch(() => null);
  if (href) {
    await go(page, href);
    await page.waitForTimeout(3500);
    await shot(page, "14-mobile-watch", { wait: 500 });
  }

  await go(page, "/channel/@youtwo");
  await shot(page, "15-mobile-channel");

  await ctx.close();
}

await browser.close();
console.log(`\ndone -> ${here}`);
