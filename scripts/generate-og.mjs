/**
 * Regenerates src/app/opengraph-image.png (and the twitter twin).
 *
 *   node scripts/generate-og.mjs
 *
 * Rendered with Playwright rather than next/og so the card can use the real
 * brand faces — ImageResponse cannot see the fonts next/font self-hosts, and
 * fetching them at build time would put a network call on every build. This
 * script runs by hand, the PNG is committed, and the build stays offline.
 *
 * Needs network access once, to pull Unica One + Montserrat from Google Fonts.
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src", "app");

const W = 1200;
const H = 630;

/* Light-theme literals. An OG card is a flat PNG — it never sees the runtime
   theme variables, so the palette is inlined here and must be kept in step
   with :root in app/globals.css. */
const C = {
  paper: "#fbf8f1",
  card: "#ffffff",
  ink: "#101a13",
  inkSoft: "#4b5a51",
  inkFaint: "#84918a",
  green: "#00c805",
  greenDeep: "#00a004",
  greenShade: "#056b26",
  mint: "#7ed9a4",
  amber: "#f5a524",
  onBright: "#0a120c",
};

const STATS = [
  ["7", "Utility NFT types"],
  ["42K+", "Businesses running"],
  ["18K+", "Active tycoons"],
];

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Unica+One&family=Montserrat:wght@400;500;600;700&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${W}px; height: ${H}px;
    background: ${C.paper};
    font-family: Montserrat, system-ui, sans-serif;
    color: ${C.ink};
    position: relative; overflow: hidden;
  }
  .dots {
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(16,26,19,.16) 1.4px, transparent 1.4px);
    background-size: 28px 28px;
  }
  .ring { position: absolute; border-radius: 999px; border: 2px solid; }
  .frame {
    position: absolute; inset: 26px;
    border: 2.5px solid ${C.ink}; border-radius: 26px;
    background: transparent;
  }
  .pad { position: absolute; inset: 26px; padding: 46px 54px; display: flex; }
  .left { width: 660px; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .word { font-family: 'Unica One', sans-serif; font-size: 34px; letter-spacing: .1em; line-height: 1; }
  .word i { font-style: normal; color: ${C.greenShade}; }
  h1 {
    font-family: 'Unica One', sans-serif; font-weight: 400;
    font-size: 64px; line-height: 1.04; letter-spacing: .01em;
    text-transform: uppercase; margin-top: 34px;
  }
  .mark {
    background-image: linear-gradient(to right, rgba(0,200,5,.5), rgba(126,217,164,.7));
    background-repeat: no-repeat; background-position: 0 91%; background-size: 100% .3em;
  }
  p.sub { margin-top: 24px; font-size: 19px; line-height: 1.55; color: ${C.inkSoft}; max-width: 560px; }
  .stats { margin-top: auto; padding-top: 26px; display: flex; gap: 14px; }
  .stat {
    border: 2.5px solid ${C.ink}; border-radius: 12px; background: ${C.card};
    box-shadow: 4px 4px 0 0 ${C.ink};
    padding: 12px 18px; min-width: 150px;
  }
  .stat b { display: block; font-family: 'Unica One', sans-serif; font-weight: 400; font-size: 32px; line-height: 1; }
  .stat span { display: block; margin-top: 7px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: ${C.inkFaint}; }
  .right { flex: 1; position: relative; }
  .pill {
    position: absolute; top: 2px; right: 0;
    border: 2.5px solid ${C.ink}; border-radius: 10px;
    background: ${C.green}; color: ${C.onBright};
    box-shadow: 4px 4px 0 0 ${C.ink};
    padding: 9px 15px; font-size: 13px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  }
  .gem { position: absolute; top: 176px; right: 128px; width: 190px; }
  .chip {
    position: absolute; display: flex; align-items: center; gap: 8px;
    border: 2.5px solid ${C.ink}; border-radius: 11px; background: ${C.card};
    box-shadow: 4px 4px 0 0 ${C.ink};
    padding: 9px 13px; font-size: 13px; font-weight: 600;
  }
  .dot { width: 11px; height: 11px; border-radius: 999px; border: 2px solid ${C.ink}; }
</style>
</head>
<body>
  <div class="dots"></div>

  <div class="ring" style="width:300px;height:300px;left:-96px;top:-104px;border-color:rgba(0,200,5,.35)"></div>
  <div class="ring" style="width:236px;height:236px;right:36px;bottom:-96px;border-color:rgba(255,111,145,.5)"></div>
  <div class="ring" style="width:120px;height:120px;right:330px;top:66px;border-color:rgba(126,217,164,.75)"></div>

  <div class="frame"></div>

  <div class="pad">
    <div class="left">
      <div class="brand">
        <svg width="52" height="52" viewBox="0 0 48 48">
          <rect x="8.5" y="12.5" width="32" height="32" rx="9.5" fill="${C.ink}"/>
          <rect x="4.5" y="8.5" width="32" height="32" rx="9.5" fill="${C.green}" stroke="${C.ink}" stroke-width="2.6"/>
          <path d="M13.2 32.2V19.4l7.3 7.4 7.3-7.4v12.8" fill="none" stroke="${C.onBright}"
                stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="38.5" cy="10" r="5.6" fill="${C.amber}" stroke="${C.ink}" stroke-width="2.2"/>
        </svg>
        <span class="word">MINER<i>FI</i></span>
      </div>

      <h1>Build an empire<br>from <span class="mark">one coffee shop</span></h1>

      <p class="sub">A Web3 tycoon game where every NFT does a job. Hire workers,
      upgrade equipment, claim land — and own the business, not just the picture.</p>

      <div class="stats">
        ${STATS.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}
      </div>
    </div>

    <div class="right">
      <div class="pill">minerfi.xyz</div>

      <svg class="gem" viewBox="0 0 74 74">
        <circle cx="39" cy="39" r="30" fill="${C.ink}"/>
        <circle cx="35" cy="35" r="30" fill="${C.green}" stroke="${C.ink}" stroke-width="3"/>
        <g fill="none" stroke="${C.onBright}" stroke-width="4.4"
           stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 45 30 36 39 42 52 25"/>
          <path d="M44 25h8v8"/>
        </g>
      </svg>

      <div class="chip" style="top:96px;right:2px;transform:rotate(3deg)">
        <span class="dot" style="background:${C.green}"></span> NFT = Utility
      </div>
      <div class="chip" style="top:434px;right:158px;transform:rotate(-2.5deg)">
        <span class="dot" style="background:${C.amber}"></span> +310 $MINE / day
      </div>
      <div class="chip" style="top:286px;right:-8px;transform:rotate(2deg)">
        <span class="dot" style="background:${C.mint}"></span> 5 business tiers
      </div>
    </div>
  </div>
</body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});

await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);

for (const name of ["opengraph-image.png", "twitter-image.png"]) {
  await page.screenshot({ path: join(OUT, name) });
  console.log("wrote", join("src/app", name));
}

await browser.close();
