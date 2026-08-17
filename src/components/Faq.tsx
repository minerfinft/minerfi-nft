import { FAQ } from "@/lib/data";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";
import { Section, SectionHeading } from "./ui/Section";

/** Native <details> — keyboard accessible and works with JS disabled. */
export function Faq() {
  return (
    <Section id="faq">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            eyebrow="FAQ"
            eyebrowIcon="badge"
            title="Questions,"
            accent="answered straight"
            description="If something is still unclear, ask on X — @HoodMinerfi is where announcements land and where questions get answered."
          />
        </div>

        <ul className="flex flex-col gap-3">
          {FAQ.map((item, i) => (
            <li key={item.q}>
              <Reveal delay={i * 0.05}>
                <details className="card-hard group px-5 open:bg-card-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-[1.15rem] tracking-wide text-ink uppercase [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] border-line bg-card text-ink transition-transform duration-300 group-open:rotate-180 group-open:bg-green group-open:text-on-bright">
                      <Icon name="chevronDown" className="size-4" />
                    </span>
                  </summary>
                  <p className="border-t-[1.5px] border-dashed border-line-soft py-4 text-[0.87rem] leading-relaxed text-ink-soft">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
