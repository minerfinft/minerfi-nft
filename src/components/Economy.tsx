import { RESOURCES } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

const FLOW = [
  { label: "Sources", items: ["Production", "Contracts", "Mystery Box", "Land leases"] },
  { label: "Sinks", items: ["Salaries", "Repairs", "Crafting", "Tier upgrades"] },
];

const RESOURCE_FILL = ["bg-amber/40", "bg-mint/40", "bg-green/30", "bg-coral/45"];

export function Economy() {
  return (
    <Section
      id="economy"
      className="border-y-[1.5px] border-line bg-card-2 dark:bg-card"
    >
      <SectionHeading
        eyebrow="Economy"
        eyebrowIcon="coins"
        title="Four resources,"
        accent="one closed loop"
        description="Everything produced is eventually consumed. That is what keeps a play-to-own economy from turning into a faucet."
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESOURCES.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.06} className="h-full">
            <article className="card-hard lift flex h-full flex-col p-5">
              <span
                className={`grid size-11 place-items-center rounded-lg border-[1.5px] border-line text-ink ${RESOURCE_FILL[i]}`}
              >
                <Icon name={r.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-[1.3rem] tracking-wide text-ink uppercase">
                {r.name}
              </h3>
              <span className="mt-1 font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
                {r.role}
              </span>
              <p className="mt-3 text-[0.84rem] leading-relaxed text-ink-soft">
                {r.text}
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      {/* sources / sinks ledger */}
      <Reveal delay={0.1} className="mt-6">
        <div className="card-hard grid gap-6 p-6 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8">
          {FLOW.map((col, i) => (
            <div key={col.label} className={i === 1 ? "md:order-3" : ""}>
              <p className="font-mono text-[0.65rem] tracking-[0.16em] text-ink-faint uppercase">
                {col.label}
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {col.items.map((item) => (
                  <li
                    key={item}
                    className={`rounded-lg border-[1.5px] border-line px-3 py-1.5 text-[0.76rem] font-medium text-ink ${
                      i === 0 ? "bg-mint/35" : "bg-coral/45"
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <span className="shadow-hard-sm hidden size-11 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-card text-ink md:order-2 md:grid">
            <Icon name="swap" className="size-5" />
          </span>
        </div>
      </Reveal>
    </Section>
  );
}
