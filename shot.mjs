import { chromium } from "playwright";

const OUT = process.argv[2] || ".";
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 1000);
const TAG = process.argv[5] || "desktop";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });

const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const overflow = async () =>
  page.evaluate(() => {
    const d = document.documentElement;
    const bad = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width) return false;
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === "hidden" || o === "auto" || o === "scroll") return false;
        }
        return r.right > d.clientWidth + 1 || r.left < -1;
      })
      .slice(0, 8)
      .map(
        (el) =>
          `${el.tagName}.${(el.className.baseVal ?? el.className).toString().slice(0, 55)}`,
      );
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, bad };
  });

const SECTIONS = [
  "top",
  "gameplay",
  "utility",
  "empire",
  "economy",
  "marketplace",
  "leaderboard",
  "roadmap",
  "faq",
];

// Viewport captures: scroll, let the reveals finish, then shoot what a user sees.
for (const id of SECTIONS) {
  const y = await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? window.scrollY + el.getBoundingClientRect().top - 76 : null;
  }, `#${id}`);
  if (y === null) continue;
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${TAG}-${id}.png` });
}

// tail of the page (CTA + footer)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/${TAG}-footer.png` });

const of = await overflow();
console.log(JSON.stringify({ overflow: of, errors }, null, 1));
await browser.close();
