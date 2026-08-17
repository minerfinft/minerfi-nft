/**
 * MinerFi mark, built on the reference's flat-shape grammar: a rounded token
 * tile with a hard un-blurred offset behind it, an "M" cut out of the face, and
 * one loose circle floating off the corner.
 *
 * Strokes and the offset use `currentColor`, so the mark inverts with the theme
 * — near-black on paper, cream on the dark canvas. The "M" is deliberately NOT
 * white: Robinhood Green sits at 2.3:1 against white, so the counter-shape has
 * to be near-black to stay readable at any size.
 */
export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      {/* the hard offset — same silhouette, shifted, in ink */}
      <rect
        x="8.5"
        y="12.5"
        width="32"
        height="32"
        rx="9.5"
        fill="currentColor"
      />

      {/* face */}
      <rect
        x="4.5"
        y="8.5"
        width="32"
        height="32"
        rx="9.5"
        fill="var(--green)"
        stroke="currentColor"
        strokeWidth="2.6"
      />

      {/* the M — one stroke, so it stays crisp down to 20px */}
      <path
        d="M13.2 32.2V19.4l7.3 7.4 7.3-7.4v12.8"
        fill="none"
        stroke="var(--on-bright)"
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* loose circle off the corner — the reference's floating-shape motif */}
      <circle
        cx="38.5"
        cy="10"
        r="5.6"
        fill="var(--amber)"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-ink ${className}`}>
      <LogoMark className="size-9 shrink-0" />
      <span className="font-display text-[1.4rem] leading-none tracking-[0.1em]">
        MINER<span className="text-accent">FI</span>
      </span>
    </span>
  );
}
