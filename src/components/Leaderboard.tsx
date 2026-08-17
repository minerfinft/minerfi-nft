import { LEADERBOARD, SEASON } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

/* Podium fills for the top three; everyone else gets the neutral plate. */
const MEDAL = ["bg-amber", "bg-mint", "bg-coral"];
/* Washes, not solid fills — and lighter in dark mode, where a 60% amber
   over the dark card drops the cream initials to ~4.1:1. */
const AVATAR = [
  "bg-amber/55 dark:bg-amber/30",
  "bg-mint/45 dark:bg-mint/25",
  "bg-coral/50 dark:bg-coral/30",
  "bg-green/35 dark:bg-green/25",
  "bg-green-deep/30 dark:bg-green-deep/25",
];

export function Leaderboard() {
  return (
    <Section id="leaderboard">
      <SectionHeading
        eyebrow="Competition"
        eyebrowIcon="trophy"
        title="Season leaderboard,"
        accent="real stakes"
        description="Net worth is measured across every asset you hold and every business you operate. Seasons reset the bracket, not your empire."
        aside={
          <div className="card-hard flex items-center gap-5 px-5 py-4">
            <div>
              <p className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                Prize pool
              </p>
              <p className="font-mono text-[1.05rem] font-bold text-ink">
                {SEASON.prizePool}
              </p>
            </div>
            <span className="h-9 w-px bg-line-soft" />
            <div>
              <p className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                Season ends
              </p>
              <p className="font-mono text-[1.05rem] font-bold text-ink">
                {SEASON.endsIn}
              </p>
            </div>
          </div>
        }
      />

      <Reveal className="mt-12">
        <div className="card-hard overflow-hidden">
          {/* header row — hidden on narrow screens where the card layout takes over */}
          <div className="hidden grid-cols-[3.5rem_1.6fr_1fr_7rem_8rem_6rem] items-center gap-4 border-b-[1.5px] border-line bg-card-2 px-6 py-4 text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase md:grid">
            <span>Rank</span>
            <span>Tycoon</span>
            <span>Empire</span>
            <span className="text-right">Businesses</span>
            <span className="text-right">Net worth</span>
            <span className="text-right">24h</span>
          </div>

          <ul>
            {LEADERBOARD.map((t, i) => (
              <li
                key={t.rank}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b-[1.5px] border-dashed border-line-soft px-4 py-4 transition-colors last:border-0 hover:bg-card-2 md:grid-cols-[3.5rem_1.6fr_1fr_7rem_8rem_6rem] md:px-6"
              >
                {/* rank */}
                <span className="flex items-center gap-2">
                  {i < 3 ? (
                    <span
                      className={`grid size-5 shrink-0 place-items-center rounded-full border-[1.5px] border-line ${MEDAL[i]}`}
                    >
                      <Icon name="trophy" className="size-2.5 text-on-bright" />
                    </span>
                  ) : null}
                  <span
                    className={`font-mono text-[0.95rem] font-bold ${
                      i < 3 ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {String(t.rank).padStart(2, "0")}
                  </span>
                </span>

                {/* identity */}
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg border-[1.5px] border-line font-mono text-[0.65rem] font-bold text-ink ${AVATAR[i]}`}
                  >
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[1.05rem] tracking-wide text-ink">
                      {t.name}
                    </span>
                    <span className="block font-mono text-[0.7rem] text-ink-faint">
                      {t.wallet}
                    </span>
                  </span>
                </span>

                {/* empire tier */}
                <span className="hidden md:block">
                  <span className="inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-line bg-card-2 px-2.5 py-1 text-[0.7rem] text-ink">
                    <Icon name="badge" className="size-3.5 text-accent" />
                    {t.empire}
                  </span>
                </span>

                <span className="hidden text-right font-mono text-[0.85rem] text-ink md:block">
                  {t.businesses}
                </span>

                {/* net worth + change stack together on mobile */}
                <span className="text-right md:contents">
                  <span className="block font-mono text-[0.9rem] font-bold text-ink md:text-right">
                    {t.netWorth}
                    <span className="ml-1 text-[0.62rem] text-ink-faint">$MINE</span>
                  </span>
                  <span
                    className={`mt-0.5 inline-flex items-center justify-end gap-1 font-mono text-[0.75rem] font-semibold md:mt-0 ${
                      t.up ? "text-up" : "text-down"
                    }`}
                  >
                    <Icon name={t.up ? "up" : "down"} className="size-3.5" />
                    {t.change}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-line bg-card-2 px-6 py-4">
            <p className="text-[0.78rem] text-ink-soft">
              Ranked by total net worth · updated every 10 minutes
            </p>
            <a
              href="#leaderboard"
              className="inline-flex items-center gap-1.5 font-display text-[0.9rem] tracking-wide text-ink uppercase underline decoration-green decoration-2 underline-offset-4 hover:text-accent"
            >
              Full standings
              <Icon name="arrowRight" className="size-3.5" />
            </a>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
