import { MARQUEE_ITEMS } from "@/lib/data";

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10"
      aria-hidden={hidden || undefined}
    >
      {MARQUEE_ITEMS.map((item) => (
        <li key={item} className="flex shrink-0 items-center gap-10">
          <span className="font-display text-[1.05rem] tracking-[0.2em] text-white uppercase sm:text-[1.25rem]">
            {item}
          </span>
          {/* flat diamond separator, cut from the same shapes as the hero gem */}
          <span
            aria-hidden
            className="size-2.5 shrink-0 rotate-45 bg-green"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * The brief's closing lines, run as a ticker so they read as a brand statement.
 *
 * The band is a fixed near-black in both themes rather than a green field:
 * a full-bleed #00C805 strip is exactly the "glare" this palette is meant to
 * avoid, so the green stays as punctuation between the lines.
 */
export function Marquee() {
  return (
    <div className="relative border-y-[1.5px] border-line bg-on-bright py-5">
      <div className="mask-x overflow-hidden">
        {/* two identical tracks; the wrapper slides exactly one track width */}
        <div className="flex w-max animate-marquee">
          <Track />
          <Track hidden />
        </div>
      </div>
    </div>
  );
}
