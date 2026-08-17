"use client";

import { useEffect, useMemo, useState } from "react";
import { LISTINGS, MARKET_FILTERS, SORT_OPTIONS, type Listing } from "@/lib/data";
import { AssetArt } from "./AssetArt";
import { Button } from "./ui/Button";
import { RarityBadge } from "./ui/Chip";
import { RingField } from "./ui/Decor";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

const PAGE = 6;

/* ------------------------------------------------------------- countdown -- */

function parseClock(v: string) {
  const [h = 0, m = 0, s = 0] = v.match(/\d+/g)?.map(Number) ?? [];
  return h * 3600 + m * 60 + s;
}

function formatClock(total: number) {
  const t = Math.max(0, total);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}h ${m}m ${s}s`;
}

/** Seeded from the listing so server and client agree on the first paint. */
function Countdown({ from }: { from: string }) {
  const [left, setLeft] = useState(() => parseClock(from));

  useEffect(() => {
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[0.7rem] text-ink-soft tabular-nums">
      <Icon name="clock" className="size-3.5 text-ink-faint" />
      {formatClock(left)}
    </span>
  );
}

/* ------------------------------------------------------------------ card -- */

/**
 * Built the way the reference tags its artwork: the frame is one object, and
 * the metadata rides underneath on its own outlined plate rather than sharing
 * the frame's box.
 */
function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="group flex h-full flex-col">
      {/* frame */}
      <div className="shadow-hard relative rounded-lg border-[1.5px] border-line bg-card p-3 transition-transform duration-300 group-hover:-translate-x-[3px] group-hover:-translate-y-[3px]">
        <AssetArt listing={listing} />

        <span className="absolute top-5 left-5">
          <RarityBadge rarity={listing.rarity} />
        </span>

        {listing.featured ? (
          <span className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-md border-[1.5px] border-line bg-amber px-2 py-1 font-mono text-[0.58rem] font-bold tracking-[0.1em] text-on-bright uppercase">
            <Icon name="flame" className="size-3" />
            Hot
          </span>
        ) : null}
      </div>

      {/* metadata plate, offset under the frame */}
      <div className="shadow-hard-sm relative z-10 -mt-3 ml-4 flex flex-1 flex-col rounded-lg border-[1.5px] border-line bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.15rem] leading-tight tracking-wide text-ink uppercase">
            {listing.name}
          </h3>
          <span className="mt-0.5 shrink-0 rounded-md border-[1.5px] border-line bg-card-2 px-2 py-0.5 font-mono text-[0.58rem] tracking-[0.1em] text-ink-soft uppercase">
            {listing.type}
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-[0.78rem] font-medium text-accent">
          <Icon name="zap" className="size-3.5" />
          {listing.yieldLabel}
        </p>

        <p className="mt-3 flex items-center gap-2 font-mono text-[0.72rem] text-ink-faint">
          <span className="grid size-5 place-items-center rounded-full border-[1.5px] border-line bg-mint text-[0.5rem] font-bold text-on-bright">
            {listing.seller.slice(2, 4)}
          </span>
          {listing.seller}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t-[1.5px] border-dashed border-line-soft pt-4">
          <span>
            <span className="block text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">
              Price
            </span>
            <span className="font-mono text-[1rem] font-bold text-ink">
              {listing.price}
              <span className="ml-1 text-[0.7rem] text-ink-faint">ETH</span>
            </span>
          </span>
          <Countdown from={listing.endsIn} />
        </div>

        <Button href="#marketplace" size="sm" className="mt-4 w-full">
          Place a bid
        </Button>
      </div>
    </article>
  );
}

/* --------------------------------------------------------------- section -- */

export function Marketplace() {
  const [filter, setFilter] = useState<string>("All items");
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0]);
  const [maxPrice, setMaxPrice] = useState(4);
  const [shown, setShown] = useState(PAGE);

  const results = useMemo(() => {
    const list = LISTINGS.filter(
      (l) =>
        (filter === "All items" || l.type === filter) &&
        Number(l.price) <= maxPrice,
    );

    const sorted = [...list];
    if (sort === "Highest price")
      sorted.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "Lowest price")
      sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "Ending soonest")
      sorted.sort((a, b) => parseClock(a.endsIn) - parseClock(b.endsIn));

    return sorted;
  }, [filter, sort, maxPrice]);

  const visible = results.slice(0, shown);

  return (
    <Section id="marketplace" className="overflow-hidden">
      <RingField variant={0} />

      <SectionHeading
        eyebrow="Marketplace"
        eyebrowIcon="cart"
        title="Every asset is"
        accent="tradeable"
        description="Shops, staff, machines, deeds and vehicles all carry their stats and upgrade history with them. Price discovery happens on utility, not on hype."
        aside={
          <Button href="#marketplace" variant="outline">
            View all listings
            <Icon name="arrowRight" className="size-4" />
          </Button>
        }
      />

      {/* ------------------------------------------------------- filters --- */}
      <Reveal className="mt-12">
        <div className="card-hard flex flex-col gap-5 p-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:p-5">
          {/* type chips */}
          <div className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 py-1 lg:py-0">
            {MARKET_FILTERS.map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFilter(f);
                    setShown(PAGE);
                  }}
                  aria-pressed={active}
                  className={`shrink-0 rounded-lg border-[1.5px] border-line px-3.5 py-2 text-[0.78rem] font-medium transition-all duration-150 ${
                    active
                      ? "shadow-hard-sm bg-green text-on-bright"
                      : "bg-card text-ink-soft hover:shadow-hard-sm hover:-translate-x-[2px] hover:-translate-y-[2px] hover:text-ink"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            {/* price range */}
            <label className="flex min-w-[13rem] flex-col gap-2">
              <span className="flex items-center justify-between font-mono text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
                Max price
                <span className="font-semibold text-ink">
                  {maxPrice.toFixed(2)} ETH
                </span>
              </span>
              <input
                type="range"
                min={0.01}
                max={4}
                step={0.01}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setShown(PAGE);
                }}
                aria-label="Maximum price in ETH"
                className="h-2 w-full cursor-pointer appearance-none rounded-full border-[1.5px] border-line bg-card-2 outline-none [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[1.5px] [&::-moz-range-thumb]:border-line [&::-moz-range-thumb]:bg-green [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[1.5px] [&::-webkit-slider-thumb]:border-line [&::-webkit-slider-thumb]:bg-green"
              />
            </label>

            {/* sort */}
            <label className="flex flex-col gap-2">
              <span className="font-mono text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
                Sort by
              </span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort listings"
                  className="w-full cursor-pointer appearance-none rounded-lg border-[1.5px] border-line bg-card py-2 pr-9 pl-3.5 text-[0.78rem] text-ink"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <Icon
                  name="chevronDown"
                  className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink"
                />
              </div>
            </label>
          </div>
        </div>
      </Reveal>

      {/* ---------------------------------------------------------- grid --- */}
      {visible.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((l, i) => (
            <Reveal key={l.id} delay={(i % 3) * 0.07}>
              <ListingCard listing={l} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="card-hard mt-10 flex flex-col items-center gap-3 p-14 text-center">
          <Icon name="search" className="size-8 text-ink-faint" />
          <p className="font-display text-[1.2rem] tracking-wide text-ink uppercase">
            Nothing in that range
          </p>
          <p className="max-w-sm text-[0.85rem] text-ink-soft">
            Try raising the price ceiling or switching back to all asset types.
          </p>
        </div>
      )}

      {shown < results.length ? (
        <div className="mt-10 flex justify-center">
          <Button
            href="#marketplace"
            variant="outline"
            size="lg"
            onClick={(e) => {
              e.preventDefault();
              setShown((v) => v + PAGE);
            }}
          >
            Load more
            <Icon name="chevronDown" className="size-4" />
          </Button>
        </div>
      ) : null}
    </Section>
  );
}
