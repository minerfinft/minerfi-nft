import { LOOP_STEPS } from "@/lib/data";
import { RingField } from "./ui/Decor";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

/* Step tiles cycle through the reference's four fills so the row reads as a
   sequence rather than seven copies of the same card. */
const FILLS = [
  "bg-green/25",
  "bg-mint/35",
  "bg-coral/40",
  "bg-amber/35",
  "bg-green-deep/25",
  "bg-mint/35",
  "bg-coral/40",
];

export function GameplayLoop() {
  return (
    <Section id="gameplay" className="overflow-hidden">
      <div aria-hidden className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_55%_at_50%_50%,black,transparent)]" />
      <RingField variant={1} />

      <div className="relative">
        <SectionHeading
          align="center"
          eyebrow="Gameplay"
          eyebrowIcon="zap"
          title="A loop that"
          accent="compounds"
          description="Seven steps, and step seven feeds straight back into step one. Nothing here is idle-tap filler — every action spends something and produces something."
        />

        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP_STEPS.map((step, i) => (
            <li key={step.step} className={i === 6 ? "lg:col-span-1" : ""}>
              <Reveal delay={i * 0.06} className="h-full">
                <article className="card-hard lift group relative h-full overflow-hidden p-5">
                  {/* oversized ghost numeral */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-4 right-2 font-display text-[5rem] leading-none text-ink/[0.07] transition-colors duration-300 group-hover:text-ink/[0.13]"
                  >
                    {step.step}
                  </span>

                  <span
                    className={`relative grid size-11 place-items-center rounded-lg border-[1.5px] border-line text-ink ${FILLS[i]}`}
                  >
                    <Icon name={step.icon} className="size-5" />
                  </span>

                  <h3 className="relative mt-4 font-display text-[1.25rem] tracking-wide text-ink uppercase">
                    {step.title}
                  </h3>
                  <p className="relative mt-2 text-[0.84rem] leading-relaxed text-ink-soft">
                    {step.text}
                  </p>
                </article>
              </Reveal>
            </li>
          ))}

          {/* the loop closing on itself, occupying the 8th cell */}
          <li>
            <Reveal delay={0.42} className="h-full">
              <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[0.9rem] border-[1.5px] border-dashed border-line bg-card-2 p-5 text-center">
                <span className="grid size-11 place-items-center rounded-full border-[1.5px] border-line bg-card text-ink">
                  <Icon name="swap" className="size-5" />
                </span>
                <p className="font-display text-[1.05rem] tracking-wide text-ink uppercase">
                  …back to 01
                </p>
                <p className="text-[0.78rem] leading-snug text-ink-soft">
                  Bigger shop, better workers, higher yield. Every pass through
                  the loop raises the floor.
                </p>
              </div>
            </Reveal>
          </li>
        </ol>
      </div>
    </Section>
  );
}
