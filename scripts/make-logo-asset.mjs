/**
 * public/logo.jpg → public/logo.png
 *
 * The brand logo is authored as green artwork on a solid black field, which is
 * why dropping it straight into the header never looked right: on the cream
 * paper you get a black box, and the mark stops being a mark.
 *
 * So we key the black out. The source is unusually cooperative about it — 88%
 * of its pixels sit at or below max-channel 7 (the field) and the emblem's own
 * edges are hard, so a straight luma key with a narrow ramp lifts the artwork
 * out without leaving a JPEG halo behind. Colour is passed through untouched:
 * the pickaxe's dark facets are shading, not transparency, so unpremultiplying
 * would flatten the whole mark to one flat green.
 *
 * Run: node scripts/make-logo-asset.mjs
 */
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "public", "logo.jpg");

/* Max-channel values: at or below FLOOR is field, at or above SOLID is artwork,
   between them is the anti-aliased edge. FLOOR clears the JPEG ringing that
   hugs the emblem (everything up to ~15); SOLID stays under the darkest real
   facet measured in the source (~64) so shading is never made translucent. */
const FLOOR = 18;
const SOLID = 52;

/** Tightest box around anything brighter than FLOOR, as a centred square. */
function artworkSquare(data, { width, height, channels }) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const m = Math.max(data[i], data[i + 1], data[i + 2]);
      if (m <= FLOOR) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  /* Square it off the longer axis so the emblem keeps its proportions, plus a
     hair of margin so the outer ring never touches the edge of the file. */
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const side = Math.round(Math.max(maxX - minX + 1, maxY - minY + 1) * 1.04);
  const half = side / 2;

  return {
    left: Math.max(0, Math.round(cx - half)),
    top: Math.max(0, Math.round(cy - half)),
    width: Math.min(side, width),
    height: Math.min(side, height),
  };
}

const src = sharp(SRC).ensureAlpha();
const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });
const box = artworkSquare(data, info);

/* Alpha from the field key, RGB straight through. */
const { channels } = info;
const keyed = Buffer.allocUnsafe(data.length);
for (let i = 0; i < data.length; i += channels) {
  const m = Math.max(data[i], data[i + 1], data[i + 2]);
  const a = Math.min(1, Math.max(0, (m - FLOOR) / (SOLID - FLOOR)));
  keyed[i] = data[i];
  keyed[i + 1] = data[i + 1];
  keyed[i + 2] = data[i + 2];
  keyed[i + 3] = Math.round(a * 255);
}

const mark = sharp(keyed, {
  raw: { width: info.width, height: info.height, channels: 4 },
}).extract(box);

const targets = [
  { path: join(ROOT, "public", "logo.png"), size: 512 },
  { path: join(ROOT, "src", "app", "icon.png"), size: 128 },
];

for (const { path, size } of targets) {
  await mark
    .clone()
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    /* Palette mode takes the 512 from 166KB to ~43KB. The mark is a handful of
       greens on nothing, so 256 entries is more headroom than its gradients
       actually use and the banding is not findable at any size we render at. */
    .png({ compressionLevel: 9, palette: true, quality: 92, effort: 10 })
    .toFile(path);
  console.log(`${path}  ${size}×${size}`);
}

console.log(`cropped from ${info.width}×${info.height} at`, box);
