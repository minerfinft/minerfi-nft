import type { ReactNode } from "react";
import { Icon, type IconName } from "./ui/Icon";

/**
 * The reference hero is a cluster of floating windows wired together over flat
 * circles, with a faceted gem as the focal point. Same composition here, but
 * each window shows a live piece of the tycoon loop — a shop producing, a
 * worker assigned, land owned, yield accruing.
 *
 * Everything is sized in container-query units, so the whole scene scales as a
 * single object from 320px to 640px without a second layout.
 */

function Win({
  title,
  className,
  children,
  delay = "0s",
  tilt = 0,
}: {
  title: string;
  className: string;
  children: ReactNode;
  delay?: string;
  tilt?: number;
}) {
  return (
    <div
      className={`shadow-hard absolute animate-float rounded-[1.4cqw] border-[1.5px] border-line bg-card ${className}`}
      style={{ animationDelay: delay, rotate: `${tilt}deg` }}
    >
      <div className="flex items-center justify-between gap-2 border-b-[1.5px] border-line px-[2.2cqw] py-[1.4cqw]">
        <span className="font-mono text-[1.5cqw] font-semibold tracking-[0.16em] text-ink uppercase">
          {title}
        </span>
        {/* window chrome, drawn rather than iconised so it scales with cqw */}
        <span className="flex items-center gap-[0.7cqw] text-ink-faint">
          <span className="block h-px w-[1.4cqw] bg-current" />
          <span className="block size-[1.2cqw] border border-current" />
          <span className="block size-[1.2cqw] rotate-45 border-r border-b border-current" />
        </span>
      </div>
      <div className="p-[2.2cqw]">{children}</div>
    </div>
  );
}

function Orb({
  icon,
  className,
  fill,
  delay = "0s",
}: {
  icon: IconName;
  className: string;
  fill: string;
  delay?: string;
}) {
  return (
    <span
      className={`shadow-hard-sm absolute inline-flex animate-float items-center justify-center rounded-full border-[1.5px] border-line ${fill} ${className}`}
      style={{ animationDelay: delay }}
    >
      <Icon name={icon} className="size-[50%]" />
    </span>
  );
}

/* 3×3 grid projected to isometric: half-width 15, half-height 8, centred in a
   100×60 viewBox so no tile clips against the panel edge. */
const PLOTS = [0, 1, 2].flatMap((row) =>
  [0, 1, 2].map((col) => ({
    x: 50 + (col - row) * 15,
    y: 14 + (col + row) * 8,
    owned: [0, 2, 4, 7].includes(row * 3 + col),
  })),
);

export function HeroArt() {
  return (
    <div className="@container relative mx-auto aspect-[10/9.4] w-full max-w-[38rem]">
      {/* flat colour discs — the reference's pink and cyan fields, no blur */}
      <span
        aria-hidden
        className="absolute top-[4%] left-[14%] size-[30%] rounded-full bg-coral/45"
      />
      <span
        aria-hidden
        className="absolute right-[8%] bottom-[6%] size-[34%] rounded-full bg-mint/30"
      />
      <span
        aria-hidden
        className="absolute top-[44%] left-[2%] size-[18%] rounded-full bg-green/20"
      />

      {/* thin outlined circles, peeking out from behind the panels */}
      <span
        aria-hidden
        className="absolute top-[1%] right-[32%] size-[22%] rounded-full border-[1.5px] border-ring-a"
      />
      <span
        aria-hidden
        className="absolute bottom-[0%] left-[44%] size-[15%] rounded-full border-[1.5px] border-ring-c"
      />
      <span
        aria-hidden
        className="absolute top-[56%] left-[6%] size-[9%] rounded-full border-[1.5px] border-ring-b"
      />

      {/* dashed wiring between the panels */}
      <svg
        viewBox="0 0 100 94"
        className="absolute inset-0 size-full text-line-soft"
        fill="none"
        aria-hidden
      >
        <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
          <path d="M44 30 H52 V19 H59" />
          <path d="M42 76 H48 V66 H53" />
        </g>
        <g
          stroke="var(--green)"
          strokeWidth="1"
          strokeDasharray="2 4"
          strokeLinecap="round"
          className="animate-dash"
        >
          <path d="M44 30 H52 V19 H59" />
          <path d="M42 76 H48 V66 H53" />
        </g>
        {[
          [44, 30],
          [59, 19],
          [42, 76],
          [53, 66],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="1.4"
            fill="var(--card)"
            stroke="var(--line)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* ---------------------------------------------------- shop panel ---- */}
      <Win
        title="Shop · Tier 1"
        className="top-[15%] left-0 w-[43%]"
        delay="0s"
        tilt={-1.5}
      >
        <div className="flex items-center gap-[2cqw]">
          <span className="grid size-[7cqw] place-items-center rounded-[1cqw] border-[1.5px] border-line bg-amber/35 text-ink">
            <Icon name="coffee" className="size-[58%]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[2.4cqw] tracking-wide text-ink">
              Downtown Espresso
            </span>
            <span className="block font-mono text-[1.55cqw] text-ink-soft">
              2/2 workers · 1/1 gear
            </span>
          </span>
        </div>

        <div className="mt-[2.4cqw] flex items-center justify-between font-mono text-[1.55cqw]">
          <span className="text-ink-faint">Producing</span>
          <span className="font-semibold text-ink">68%</span>
        </div>
        <span className="mt-[1cqw] block h-[1.6cqw] overflow-hidden rounded-full border-[1.5px] border-line bg-card-2">
          <span className="block h-full w-[68%] rounded-full bg-green" />
        </span>
        <span className="mt-[1.6cqw] block font-mono text-[1.7cqw] font-semibold text-up">
          +310 $MINE / day
        </span>
      </Win>

      {/* -------------------------------------------------- worker panel ---- */}
      <Win
        title="Worker"
        className="bottom-[2%] left-[3%] w-[40%]"
        delay="1.4s"
        tilt={1.5}
      >
        <div className="flex items-center gap-[2cqw]">
          <span className="grid size-[7cqw] shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-epic/40 text-ink">
            <Icon name="users" className="size-[52%]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[2.3cqw] tracking-wide text-ink">
              Mira Sato
            </span>
            <span className="block font-mono text-[1.5cqw] text-ink-soft">
              Head Chef · Epic
            </span>
          </span>
        </div>
        <div className="mt-[2.2cqw] grid grid-cols-3 gap-[1.4cqw]">
          {[
            ["SPD", "82"],
            ["QLT", "94"],
            ["STA", "71"],
          ].map(([k, v]) => (
            <span
              key={k}
              className="rounded-[0.8cqw] border-[1.5px] border-line bg-card-2 px-[1cqw] py-[1.1cqw] text-center"
            >
              <span className="block font-mono text-[1.25cqw] text-ink-faint">
                {k}
              </span>
              <span className="block font-mono text-[1.9cqw] font-semibold text-ink">
                {v}
              </span>
            </span>
          ))}
        </div>
      </Win>

      {/* ---------------------------------------------------- land panel ---- */}
      <Win
        title="Land · Harbor"
        className="top-0 right-0 w-[39%]"
        delay="0.7s"
        tilt={2}
      >
        <svg viewBox="0 0 100 60" className="w-full" aria-hidden>
          {/* 3×3 isometric plot grid — owned tiles fill, locked tiles stay bare */}
          {PLOTS.map(({ x, y, owned }, i) => (
            <polygon
              key={i}
              points={`${x},${y - 8} ${x + 15},${y} ${x},${y + 8} ${x - 15},${y}`}
              fill={owned ? "var(--mint)" : "transparent"}
              /* flat fills need more alpha on navy than on paper to stay vivid */
              style={{ fillOpacity: owned ? "var(--art-alpha)" : 0 }}
              stroke="var(--line)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        <div className="mt-[1.4cqw] flex items-center justify-between font-mono text-[1.5cqw]">
          <span className="text-ink-faint">4 / 8 plots</span>
          <span className="font-semibold text-ink">3.1× traffic</span>
        </div>
      </Win>

      {/* -------------------------------------------------- output panel ---- */}
      <Win
        title="Empire yield"
        className="right-0 bottom-[13%] w-[47%]"
        delay="2.1s"
        tilt={-1.2}
      >
        <div className="flex items-end justify-between">
          <span>
            <span className="block font-mono text-[3.1cqw] font-bold text-ink">
              12,480
            </span>
            <span className="block font-mono text-[1.45cqw] text-ink-faint">
              $MINE claimable
            </span>
          </span>
          <span className="inline-flex items-center gap-[0.6cqw] rounded-md border-[1.5px] border-line bg-card px-[1.4cqw] py-[0.7cqw] font-mono text-[1.4cqw] font-semibold text-up">
            <Icon name="up" className="size-[1.8cqw]" />
            18.4%
          </span>
        </div>
        <div className="mt-[2cqw] flex h-[9cqw] items-end gap-[1.1cqw]">
          {[38, 52, 44, 66, 58, 82, 71, 96].map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-t-[0.4cqw] border-[1.5px] border-b-0 border-line bg-green/70"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </Win>

      {/* --------------------------------------------- centre medallion ----- */}
      {/* Anchors the cluster the way the reference uses a faceted gem, but
          drawn as the up-and-to-the-right trend line rather than a crystal:
          it says "this is a business you grow" instead of "this is a token",
          and it carries the same hard offset as every other floating object. */}
      <svg
        viewBox="0 0 74 74"
        className="absolute top-[37%] left-[43%] w-[18.5%] animate-float"
        style={{ animationDelay: "0.9s" }}
        aria-hidden
      >
        {/* hard offset */}
        <circle cx="39" cy="39" r="30" fill="var(--line)" />
        <circle
          cx="35"
          cy="35"
          r="30"
          fill="var(--green)"
          stroke="var(--line)"
          strokeWidth="3"
        />
        <g
          fill="none"
          stroke="var(--on-bright)"
          strokeWidth="4.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 45 30 36 39 42 52 25" />
          <path d="M44 25h8v8" />
        </g>
      </svg>

      {/* Floating utility orbs, each parked in a gap between panels. */}
      <Orb
        icon="coins"
        className="top-[2%] left-[29%] size-[9%] text-ink"
        fill="bg-amber/60"
        delay="0.4s"
      />
      <Orb
        icon="wrench"
        className="top-[7%] left-[47%] size-[8%] text-ink"
        fill="bg-card"
        delay="1.8s"
      />
      <Orb
        icon="truck"
        className="right-[13%] bottom-[1%] size-[8.5%] text-ink"
        fill="bg-mint/60"
        delay="1.1s"
      />
      <Orb
        icon="gift"
        className="top-[44%] right-[2%] size-[8%] text-ink"
        fill="bg-coral/60"
        delay="2.4s"
      />

      {/* slow cog, mirroring the reference's gear motif */}
      <svg
        viewBox="0 0 40 40"
        className="absolute top-[46%] right-[26%] size-[10%] animate-spin-slow text-line-soft"
        fill="none"
        stroke="currentColor"
        aria-hidden
      >
        <circle cx="20" cy="20" r="11" strokeWidth="4" />
        <circle cx="20" cy="20" r="4.5" strokeWidth="2.5" />
        {Array.from({ length: 8 }).map((_, i) => (
          <line
            key={i}
            x1="20"
            y1="6"
            x2="20"
            y2="11"
            transform={`rotate(${i * 45} 20 20)`}
            strokeWidth="4"
          />
        ))}
      </svg>
    </div>
  );
}
