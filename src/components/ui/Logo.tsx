import Image from "next/image";
import logo from "../../../public/logo.png";

/**
 * The MinerFi mark — the real artwork, not a redraw of it.
 *
 * `public/logo.png` is derived from `public/logo.jpg` by
 * `scripts/make-logo-asset.mjs`, which keys the black field out to alpha. That
 * key is what makes the brand logo usable here at all: the source is authored
 * on solid black, and dropped in as-is it reads as a black box on the paper
 * canvas rather than as a mark. Keyed, the same artwork sits on paper and on
 * the dark canvas with nothing behind it.
 *
 * Statically imported rather than referenced as `/logo.png` so the intrinsic
 * size comes from the file (no layout shift) and the URL is content-hashed —
 * the mark can be re-cut without anyone holding a stale copy.
 *
 * The artwork carries its own colour, so unlike the rest of the UI it does not
 * flip with the theme. It does not need to: its lime clears 3:1 on both the
 * paper and the dark canvas.
 */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <Image
      src={logo}
      /* Decorative: the wordmark beside it carries the name, and the one
         standalone use sits inside a section that is already titled. */
      alt=""
      priority
      /* The file is 512px, but nothing renders it above 56 (`size-14`, in the
         community CTA). Left to infer from the import, next/image reads 512 as
         the layout width and fetches its 640 and 1080 cuts for a 40px slot;
         pinning 128 here caps the srcset at 128/256 — still 2× headroom on a
         3× screen. The class is what actually sizes the box. */
      width={128}
      height={128}
      className={className}
    />
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-ink ${className}`}>
      {/* A hair larger than the old drawn tile: this mark is fine-line rather
          than a solid shape, so it needs the extra px to hold the same weight
          next to the wordmark. */}
      <LogoMark className="size-10 shrink-0" />
      <span className="font-display text-[1.4rem] leading-none tracking-[0.1em]">
        MINER<span className="text-accent">FI</span>
      </span>
    </span>
  );
}
