import type { ReactNode } from "react";
import type { Rarity } from "@/lib/data";
import { Icon } from "./Icon";

/* Rarity reads as a hue ladder: neutral → cyan → violet → amber → pink.
   The hue only ever lands on the dot; the word itself stays ink, which is what
   keeps Legendary and Mythic legible on paper as well as on navy. */
const RARITY_DOT: Record<Rarity, string> = {
  Common: "bg-common",
  Rare: "bg-rare",
  Epic: "bg-epic",
  Legendary: "bg-legend",
  Mythic: "bg-mythic",
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-line bg-card px-2 py-1 font-mono text-[0.6rem] font-semibold tracking-[0.12em] text-ink uppercase">
      <span
        className={`size-2 rounded-full border border-line ${RARITY_DOT[rarity]}`}
      />
      {rarity}
    </span>
  );
}

export function Chip({
  children,
  active = false,
  className = "",
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border-[1.5px] border-line px-3.5 py-2 text-[0.8rem] font-medium transition-all duration-150 ${
        active
          ? "shadow-hard-sm bg-green text-on-bright"
          : "bg-card text-ink-soft hover:shadow-hard-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:text-ink"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** Small key/value readout used on every asset card. */
export function Stat({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
        {label}
      </span>
      <span
        className={`text-[0.82rem] font-semibold text-ink ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/** The reference tags every listing with a countdown — same pill, same clock. */
export function Timer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-line bg-card px-2 py-1 font-mono text-[0.65rem] text-ink-soft ${className}`}
    >
      <Icon name="clock" className="size-3 text-ink-faint" />
      {children}
    </span>
  );
}
