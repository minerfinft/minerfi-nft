import { ROADMAP } from "@/lib/data";
import { Icon, type IconName } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

/* Status reads off the fill, not the text colour — the label stays ink so
   "Planned" is as legible as "Shipped" in both themes. */
const STATUS: Record<
  (typeof ROADMAP)[number]["status"],
  { label: string; icon: IconName; className: string; node: string }
> = {
  done: {
    label: "Shipped",
    icon: "check",
    className: "bg-green text-on-bright",
    node: "bg-green",
  },
  live: {
    label: "In progress",
    icon: "flame",
    className: "bg-amber text-on-bright",
    node: "bg-amber",
  },
  next: {
    label: "Planned",
    icon: "lock",
    className: "bg-card-2 text-ink-soft",
    node: "bg-card",
  },
};

export function Roadmap() {
  return (
    <Section id="roadmap">
      <SectionHeading
        eyebrow="Roadmap"
        eyebrowIcon="map"
        title="Shipping in"
        accent="four phases"
        description="Systems land in the order that keeps the economy stable — production first, then trading, then expansion, then governance."
      />

      <div className="relative mt-14">
        {/* timeline spine */}
        <span
          aria-hidden
          className="pointer-events-none absolute top-[1.45rem] right-0 left-0 hidden border-t-[1.5px] border-dashed border-line-soft lg:block"
        />

        <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ROADMAP.map((phase, i) => {
            const s = STATUS[phase.status];
            return (
              <li key={phase.phase}>
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="flex h-full flex-col">
                    {/* node on the spine */}
                    <span
                      aria-hidden
                      className={`relative z-10 mb-6 hidden size-5 rounded-full border-[1.5px] border-line lg:block ${s.node}`}
                    />

                    <article className="card-hard lift flex h-full flex-col p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-[0.68rem] tracking-[0.16em] text-ink-faint uppercase">
                          {phase.phase}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border-[1.5px] border-line px-2 py-1 font-mono text-[0.58rem] font-bold tracking-[0.08em] uppercase ${s.className}`}
                        >
                          <Icon name={s.icon} className="size-3" />
                          {s.label}
                        </span>
                      </div>

                      <h3 className="mt-3 font-display text-[1.45rem] tracking-wide text-ink uppercase">
                        {phase.title}
                      </h3>

                      <ul className="mt-4 space-y-2.5">
                        {phase.items.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-[0.82rem] leading-snug text-ink-soft"
                          >
                            <span
                              aria-hidden
                              className="mt-[0.4rem] size-1.5 shrink-0 rotate-45 bg-green"
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
