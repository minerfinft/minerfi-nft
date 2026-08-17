import type { Listing, Rarity } from "@/lib/data";
import { Icon } from "./ui/Icon";

/**
 * Placeholder asset art, generated per listing so no two cards look alike.
 * Built from the reference's flat vocabulary — a coloured field, hard-outlined
 * shapes, one big glyph — rather than gradients and glows. Swap it for real
 * renders when the art pipeline is ready; the card around it need not change.
 */

/* Rarity differs by FIELD hue only — every shape on top uses the single
   --art-shape tone, which is what keeps eight cards reading as one set instead
   of eight unrelated pictures. Dark mode drops the wash hard: at the old alphas
   the Epic field became a slab of pure #00c805, which is exactly the glare this
   palette is built to avoid. */
const FIELD: Record<Rarity, string> = {
  Common: "bg-card-2",
  Rare: "bg-mint/40 dark:bg-mint/22",
  Epic: "bg-green/25 dark:bg-green/16",
  Legendary: "bg-amber/35 dark:bg-amber/26",
  Mythic: "bg-coral/40 dark:bg-coral/26",
};

/** Cheap deterministic hash so the same listing always renders the same pattern. */
function seed(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function AssetArt({ listing }: { listing: Listing }) {
  const field = FIELD[listing.rarity];
  const s = seed(listing.id);

  /* Isometric 3×3 tile field, centred so nothing clips against the frame.
     Which tiles fill comes from the hash, so density varies per asset. */
  const tiles = Array.from({ length: 9 }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return {
      x: 50 + (col - row) * 16,
      y: 30 + (col + row) * 8.5,
      on: ((s >> i) & 1) === 1,
    };
  });

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-lg border-[1.5px] border-line ${field}`}
    >
      {/* two loose circles behind the tiles, positioned off the same hash */}
      <span
        aria-hidden
        className="absolute size-24 rounded-full border-[1.5px] border-line/25"
        style={{ top: `${8 + (s % 20)}%`, left: `${-6 + (s % 14)}%` }}
      />
      <span
        aria-hidden
        className="absolute size-16 rounded-full bg-white/25 dark:bg-white/10"
        style={{ bottom: `${4 + ((s >> 4) % 18)}%`, right: `${2 + ((s >> 6) % 16)}%` }}
      />

      <svg viewBox="0 0 100 75" className="absolute inset-0 size-full" aria-hidden>
        {tiles.map((tile, i) => (
          <polygon
            key={i}
            points={`${tile.x},${tile.y - 8} ${tile.x + 15},${tile.y} ${tile.x},${tile.y + 8} ${tile.x - 15},${tile.y}`}
            fill={tile.on ? "var(--art-shape)" : "transparent"}
            style={{ fillOpacity: tile.on ? "var(--art-alpha)" : 0 }}
            stroke="var(--line)"
            strokeOpacity="0.45"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        ))}
      </svg>

      {/* centre glyph, on the same hard-outlined tile the whole page uses */}
      <span className="absolute inset-0 grid place-items-center">
        <span className="shadow-hard-sm grid size-16 place-items-center rounded-xl border-[1.5px] border-line bg-card text-ink">
          <Icon name={listing.icon} className="size-8" />
        </span>
      </span>
    </div>
  );
}
