import { TIERS } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

/* The ladder climbs through the palette, so the five tiers read as a ramp. */
const TIER_FILL = [
  "bg-mint/35",
  "bg-green-deep/25",
  "bg-green/30",
  "bg-coral/45",
  "bg-amber/40",
];

export function EmpirePath() {
  return (
    <Section id="empire">
      <SectionHeading
        eyebrow="The ladder"
        eyebrowIcon="layers"
        title="Coffee Shop to"
        accent="Global Empire"
        description="Five business tiers, each one a real upgrade path rather than a cosmetic rank. Every tier raises your output ceiling, opens new slots, and unlocks systems the tier below cannot touch."
        aside={
          <div className="shadow-hard-sm flex items-center gap-3 rounded-lg border-[1.5px] border-line bg-card px-4 py-3">
            <Icon name="flame" className="size-5 shrink-0 text-accent" />
            <p className="text-[0.8rem] leading-snug text-ink-soft">
              Upgrades are permanent and travel
              <br className="hidden sm:block" /> with the NFT when you sell it.
            </p>
          </div>
        }
      />

      {/* connector rail — visible once the tiers sit on one row */}
      <div className="relative mt-14">
        <span
          aria-hidden
          className="pointer-events-none absolute top-[3.4rem] right-0 left-0 hidden border-t-[1.5px] border-dashed border-line-soft xl:block"
        />

        <ul className="no-bar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pt-1 pb-4 xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0 xl:pb-0">
          {TIERS.map((tier, i) => (
            <li key={tier.id} className="w-[17rem] shrink-0 snap-start xl:w-auto">
              <Reveal delay={i * 0.07} className="h-full">
                <article className="card-hard lift relative flex h-full flex-col p-5">
                  {/* tier node sitting on the rail */}
                  <span className="relative z-10 inline-flex size-8 items-center justify-center rounded-full border-[1.5px] border-line bg-card font-mono text-[0.68rem] font-bold text-ink">
                    T{tier.tier}
                  </span>

                  <span
                    className={`mt-5 grid size-12 place-items-center rounded-lg border-[1.5px] border-line text-ink ${TIER_FILL[i]}`}
                  >
                    <Icon name={tier.icon} className="size-6" />
                  </span>

                  <h3 className="mt-4 font-display text-[1.35rem] tracking-wide text-ink uppercase">
                    {tier.name}
                  </h3>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
                    {tier.blurb}
                  </p>

                  {/* nowrap keeps "7.50 ETH" and "24,000/day" on one line each,
                      so every tier card's rows stay on the same baseline */}
                  <dl className="mt-5 flex items-end justify-between gap-2 rounded-lg border-[1.5px] border-line bg-card-2 px-3.5 py-3">
                    <div>
                      <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                        Entry
                      </dt>
                      <dd className="font-mono text-[0.85rem] font-semibold whitespace-nowrap text-ink">
                        {tier.entry}
                      </dd>
                    </div>
                    <div className="text-right">
                      <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                        Yield
                      </dt>
                      <dd className="font-mono text-[0.85rem] font-semibold whitespace-nowrap text-up">
                        {tier.yieldPerDay}
                        <span className="text-[0.7rem] text-ink-faint">/day</span>
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-4 mb-5 space-y-2">
                    {tier.slots.map((slot) => (
                      <li
                        key={slot.label}
                        className="flex items-center justify-between text-[0.78rem]"
                      >
                        <span className="text-ink-faint">{slot.label}</span>
                        <span className="font-mono font-semibold text-ink">
                          {slot.value}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-auto border-t-[1.5px] border-dashed border-line-soft pt-4 text-[0.72rem] leading-snug text-accent">
                    {tier.unlocks}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
