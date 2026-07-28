// Renders the YouTwo channel art (avatar + banner) and the frames of the
// "Welcome to YouTwo" intro, using the chromium that ships with playwright.
// The mark here is kept in sync with the Brand component in @youtwo/ui-kit.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, "out");
const frames = path.join(out, "frames");
fs.rmSync(frames, { recursive: true, force: true });
fs.mkdirSync(frames, { recursive: true });

const FONT = `@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");`;

const GLYPH = `<svg viewBox="0 0 24 24" style="width:100%;height:100%;display:block">
  <path d="M6.5 9 A5.5 5.5 0 1 1 17.5 9 L6.5 19 H18" fill="none" stroke="#fff"
        stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

// w/h/r = badge box, g = glyph box, blur = glow strength
const MARK = (w, h, r, g, blur = 10) => `
<span style="position:relative;width:${w}px;height:${h}px;border-radius:${r}px;overflow:hidden;
      background:linear-gradient(145deg,#ff5470 0%,#ff0033 48%,#d10029 100%);
      box-shadow:0 ${Math.round(blur / 4)}px ${blur}px rgba(255,0,51,.42), inset 0 2px 0 rgba(255,255,255,.28);
      display:flex;align-items:center;justify-content:center;flex:none">
  <span style="position:absolute;inset:0 0 52% 0;background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,0))"></span>
  <span style="position:relative;width:${g}px;height:${g}px">${GLYPH}</span>
</span>`;

const WORD = (size) => `
<span style="font-size:${size}px;font-weight:700;letter-spacing:-0.05em;line-height:1;
      background:linear-gradient(100deg,#ffffff 0%,#ffffff 62%,#ffb3c1 100%);
      -webkit-background-clip:text;background-clip:text;color:transparent">YouTwo</span>`;

const browser = await chromium.launch();

// ---------- avatar ----------
{
  const page = await browser.newPage({ viewport: { width: 800, height: 800 } });
  await page.setContent(`<style>${FONT}
    html,body{margin:0;height:100%}
    body{display:flex;align-items:center;justify-content:center;background:#0f0f0f;
         font-family:Roboto,system-ui,sans-serif}
    .ring{position:relative;width:800px;height:800px;border-radius:50%;
          background:radial-gradient(circle at 50% 34%, #33121b 0%, #140a0d 58%, #0f0f0f 100%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px}
    .halo{position:absolute;width:520px;height:520px;border-radius:50%;top:120px;
          background:radial-gradient(circle,rgba(255,0,51,.30) 0%,transparent 66%);filter:blur(6px)}
  </style>
  <div class="ring">
    <div class="halo"></div>
    ${MARK(320, 218, 62, 140, 60)}
    <div style="position:relative">${WORD(82)}</div>
  </div>`);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(out, "avatar.png") });
  await page.close();
}

// ---------- banner ----------
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 480 } });
  await page.setContent(`<style>${FONT}
    html,body{margin:0;height:100%}
    body{font-family:Roboto,system-ui,sans-serif;position:relative;overflow:hidden;
         background:linear-gradient(110deg,#0f0f0f 0%,#170a0e 40%,#2b0e16 70%,#0f0f0f 100%);
         display:flex;align-items:center;justify-content:center}
    .glow{position:absolute;width:1100px;height:1100px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,0,51,.20) 0%,transparent 62%);right:-240px;top:-330px}
    .glow2{position:absolute;width:700px;height:700px;border-radius:50%;
          background:radial-gradient(circle,rgba(255,84,112,.13) 0%,transparent 64%);left:-180px;bottom:-330px}
    .wrap{position:relative;display:flex;align-items:center;gap:42px}
  </style>
  <div class="glow"></div><div class="glow2"></div>
  <div class="wrap">
    ${MARK(164, 112, 32, 72, 44)}
    <div>
      <div>${WORD(108)}</div>
      <div style="color:#aaaaaa;font-size:30px;margin-top:14px">Self-hosted video. No algorithm, no ads.</div>
    </div>
  </div>`);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(out, "banner.png") });
  await page.close();
}

// ---------- intro animation ----------
const FPS = 30;
const SECONDS = 6;
const TOTAL = FPS * SECONDS;

const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.setContent(`<style>${FONT}
  html,body{margin:0;height:100%;overflow:hidden}
  body{background:#0f0f0f;font-family:Roboto,system-ui,sans-serif;
       display:flex;align-items:center;justify-content:center}
  #glow{position:absolute;width:1600px;height:1600px;border-radius:50%;
        background:radial-gradient(circle,rgba(255,0,51,.22) 0%,transparent 58%);opacity:0}
  #stage{position:relative;display:flex;flex-direction:column;align-items:center;gap:50px}
  #markwrap{opacity:0}
  #word{font-size:132px;font-weight:700;letter-spacing:-0.05em;line-height:1;opacity:0;
        background:linear-gradient(100deg,#ffffff 0%,#ffffff 60%,#ffb3c1 100%);
        -webkit-background-clip:text;background-clip:text;color:transparent}
  #tag{color:#aaaaaa;font-size:42px;opacity:0}
  #bar{width:0px;height:6px;border-radius:3px;
       background:linear-gradient(90deg,#ff5470,#ff0033)}
</style>
<div id="glow"></div>
<div id="stage">
  <div id="markwrap">${MARK(300, 204, 58, 132, 70)}</div>
  <div id="word">Welcome to YouTwo</div>
  <div id="tag">Self-hosted video. No algorithm, no ads.</div>
  <div id="bar"></div>
</div>
<script>
  const clamp = (v, a=0, b=1) => Math.min(b, Math.max(a, v));
  const ease  = (t) => 1 - Math.pow(1 - clamp(t), 3);
  const back  = (t) => { const c = 1.70158, u = clamp(t) - 1; return 1 + (c+1)*u*u*u + c*u*u; };
  window.render = (t) => {
    const mark = document.getElementById('markwrap');
    const word = document.getElementById('word');
    const tag  = document.getElementById('tag');
    const bar  = document.getElementById('bar');
    const glow = document.getElementById('glow');
    const stage= document.getElementById('stage');

    const m = clamp((t - 0.15) / 0.85);
    mark.style.opacity = ease(m);
    mark.style.transform = 'scale(' + (0.6 + 0.4 * back(m)) + ') rotate(' + (-6 * (1 - ease(m))) + 'deg)';

    const w = ease((t - 0.9) / 1.0);
    word.style.opacity = w;
    word.style.transform = 'translateY(' + (30 * (1 - w)) + 'px)';

    const g = ease((t - 0.5) / 1.5);
    const pulse = 1 + 0.04 * Math.sin(t * 2.2);
    glow.style.opacity = g;
    glow.style.transform = 'scale(' + pulse + ')';

    const s = ease((t - 1.8) / 1.0);
    tag.style.opacity = s;
    tag.style.transform = 'translateY(' + (20 * (1 - s)) + 'px)';

    bar.style.width = (660 * ease((t - 2.3) / 2.3)) + 'px';

    const outT = clamp((t - 5.35) / 0.65);
    stage.style.opacity = 1 - outT;
    glow.style.opacity = g * (1 - outT);
  };
  window.render(0);
</script>`);
await page.waitForTimeout(1600);

for (let i = 0; i < TOTAL; i++) {
  await page.evaluate((tt) => window.render(tt), i / FPS);
  await page.screenshot({ path: path.join(frames, `f${String(i).padStart(4, "0")}.png`) });
  if (i % 60 === 0) console.log(`frame ${i}/${TOTAL}`);
}
await page.close();
await browser.close();
console.log(`rendered ${TOTAL} frames + avatar.png + banner.png -> ${out}`);
