import { HERO_STATS, SEASON } from "@/lib/data";
import { HeroArt } from "./HeroArt";
import { Button } from "./ui/Button";
import { ContractAddress } from "./ui/ContractAddress";
import { Icon } from "./ui/Icon";
import { Reveal } from "./ui/Reveal";

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden pt-[7.5rem] pb-16 lg:pt-[9.5rem] lg:pb-24"
    >
      {/* paper texture + one big outlined circle bleeding off the left edge */}
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(75%_60%_at_50%_25%,black,transparent)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-32 size-[26rem] rounded-full border-[1.5px] border-ring-c"
      />

      <div className="container-mf relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_1fr] lg:gap-10">
          {/* ------------------------------------------------------ copy --- */}
          <div>
            <Reveal>
              <span className="shadow-hard-sm inline-flex items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-card py-1.5 pr-4 pl-1.5 text-[0.76rem] font-medium text-ink">
                <span className="grid size-6 place-items-center rounded-md border-[1.5px] border-line bg-green">
                  <span className="size-1.5 rounded-full bg-on-bright" />
                </span>
                {SEASON.name} · live now
              </span>
            </Reveal>

            <Reveal delay={0.07}>
              <h1 className="mt-6 font-display text-[2.9rem] leading-[1.02] tracking-[0.01em] text-balance uppercase sm:text-[3.9rem] lg:text-[4.15rem]">
                Build an empire
                <br />
                from <span className="marker-underline">one coffee shop</span>
              </h1>
            </Reveal>

            <Reveal delay={0.14}>
              <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
                A Web3 tycoon game where every NFT does a job. Hire workers,
                upgrade equipment, claim land, run a fleet — and grow a business
                network you genuinely own, on-chain.
              </p>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button href="#gameplay" size="lg">
                  Start building
                  <Icon name="arrowRight" className="size-4" />
                </Button>
                <Button href="#gameplay" variant="outline" size="lg">
                  <Icon name="play" className="size-3.5 fill-current" />
                  How it works
                </Button>
              </div>
            </Reveal>

            <Reveal delay={0.23}>
              <ContractAddress className="mt-7" />
            </Reveal>

            {/* the reference's three hard-outlined stat boxes, slightly tilted */}
            <Reveal delay={0.26}>
              <dl className="mt-9 flex flex-wrap gap-4">
                {HERO_STATS.map((s, i) => (
                  <div
                    key={s.label}
                    style={{ rotate: `${[-2, 1.5, -1][i]}deg` }}
                    className="shadow-hard-sm min-w-[7.75rem] rounded-lg border-[1.5px] border-line bg-card px-4 py-3 transition-transform duration-300 hover:rotate-0"
                  >
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <span className="block font-display text-[1.75rem] leading-none text-ink">
                        {s.value}
                      </span>
                      <span className="mt-1.5 block text-[0.66rem] tracking-[0.12em] text-ink-faint uppercase">
                        {s.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* -------------------------------------------------------- art --- */}
          <Reveal delay={0.12} y={30}>
            <HeroArt />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
