// Quick visual check of the mark at real sizes before committing to it.
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 320 } });

const glyph = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block">
  <path d="M6.5 9 A5.5 5.5 0 1 1 17.5 9 L6.5 19 H18" fill="none" stroke="#fff"
        stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const mark = (w, h, r, g) => `
<span style="position:relative;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;
      background:linear-gradient(145deg,#ff5470 0%,#ff0033 48%,#d10029 100%);
      box-shadow:0 2px 10px rgba(255,0,51,.35), inset 0 1px 0 rgba(255,255,255,.28);
      display:flex;align-items:center;justify-content:center;flex:none">
  <span style="position:absolute;inset:0 0 52% 0;background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,0))"></span>
  <span style="position:relative;width:${g}px;height:${g}px">${glyph}</span>
</span>`;

await page.setContent(`<style>
  @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
  html,body{margin:0;height:100%;background:#0f0f0f;font-family:Roboto,sans-serif}
  body{display:flex;align-items:center;justify-content:center;gap:56px}
  .row{display:flex;align-items:center;gap:10px;color:#f1f1f1}
</style>
<div class="row">${mark(38,26,9,17)}<span style="font-size:20px;font-weight:600;letter-spacing:-.05em">YouTwo</span></div>
<div class="row">${mark(76,52,18,34)}<span style="font-size:40px;font-weight:700;letter-spacing:-.05em">YouTwo</span></div>
<div class="row">${mark(150,100,30,66)}</div>`);
await page.waitForTimeout(1200);
await page.screenshot({ path: path.join(here, "out", "mark-preview.png") });
await browser.close();
console.log("wrote mark-preview.png");
