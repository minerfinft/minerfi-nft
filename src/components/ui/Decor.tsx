/**
 * The reference's background furniture: thin outlined circles, dashed
 * connectors and taped-on labels. Purely decorative — every element here is
 * `aria-hidden` and `pointer-events-none` so it never intercepts a click or
 * shows up in the accessibility tree.
 */

import type { ReactNode } from "react";

type RingTone = "a" | "b" | "c";

const TONE: Record<RingTone, string> = {
  a: "border-ring-a",
  b: "border-ring-b",
  c: "border-ring-c",
};

/** A single outlined circle. Size and position come from the caller. */
export function Ring({
  className = "",
  tone = "a",
  weight = 1.5,
}: {
  className?: string;
  tone?: RingTone;
  weight?: number;
}) {
  return (
    <span
      aria-hidden
      style={{ borderWidth: `${weight}px` }}
      className={`pointer-events-none absolute rounded-full ${TONE[tone]} ${className}`}
    />
  );
}

/**
 * The loose scatter of circles that sits behind most sections in the
 * reference. Two presets keep the placements from repeating section to
 * section without every caller hand-positioning six spans.
 */
export function RingField({ variant = 0 }: { variant?: 0 | 1 }) {
  const rings =
    variant === 0
      ? [
          { c: "top-[6%] left-[-3rem] size-56", t: "a" as const, w: 1.5 },
          { c: "top-[40%] right-[-4rem] size-72", t: "b" as const, w: 1.5 },
          { c: "bottom-[8%] left-[22%] size-32", t: "c" as const, w: 1.5 },
          /* kept in the gutter beside the heading — a ring landing on a slider
             or a chip row reads as a rendering artefact, not as decoration */
          { c: "top-[5%] right-[13%] size-24", t: "a" as const, w: 1.5 },
        ]
      : [
          { c: "top-[-3rem] right-[12%] size-64", t: "c" as const, w: 1.5 },
          { c: "bottom-[-4rem] left-[-2rem] size-80", t: "a" as const, w: 1.5 },
          { c: "top-[52%] left-[45%] size-24", t: "b" as const, w: 1.5 },
        ];

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {rings.map((r) => (
        <Ring key={r.c} className={r.c} tone={r.t} weight={r.w} />
      ))}
    </span>
  );
}

/**
 * A label pinned to the edge of a card, the way the reference tags each
 * artwork with its artist and timer. Absolute positioning is the caller's job.
 */
export function StickerLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`sticker font-mono font-medium tracking-[0.06em] text-ink ${className}`}
    >
      {children}
    </span>
  );
}

/** Dashed rule used to wire elements together, as in the reference's diagrams. */
export function DashRule({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block border-t-[1.5px] border-dashed border-line-soft ${className}`}
    />
  );
}
