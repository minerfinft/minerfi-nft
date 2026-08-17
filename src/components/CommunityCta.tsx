import { SOCIALS } from "@/lib/data";
import { Button } from "./ui/Button";
import { Icon } from "./ui/Icon";
import { LogoMark } from "./ui/Logo";
import { Reveal } from "./ui/Reveal";

export function CommunityCta() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="container-mf">
        <Reveal>
          {/* stacked offset frames — the reference's layered-card motif, flattened */}
          <div className="relative">
            <span
              aria-hidden
              className="absolute inset-x-6 -bottom-3 h-full rounded-2xl border-[1.5px] border-line bg-mint/30"
            />
            <span
              aria-hidden
              className="absolute inset-x-3 -bottom-1.5 h-full rounded-2xl border-[1.5px] border-line bg-coral/40"
            />

            <div className="relative overflow-hidden rounded-2xl border-[1.5px] border-line bg-card px-6 py-14 text-center sm:px-12 lg:py-20">
              <div
                aria-hidden
                className="dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]"
              />
              {/* loose shapes drifting behind the copy */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-16 -left-12 size-56 rounded-full border-[1.5px] border-ring-c"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -bottom-16 size-48 rounded-full border-[1.5px] border-ring-a"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute top-12 right-16 hidden size-6 rotate-45 border-[1.5px] border-line bg-amber sm:block"
              />

              <div className="relative mx-auto flex max-w-2xl flex-col items-center">
                <LogoMark className="size-14" />

                <h2 className="mt-7 font-display text-[2.4rem] leading-[1.04] tracking-[0.01em] text-balance uppercase sm:text-[3.1rem]">
                  Your first shop is{" "}
                  <span className="marker-underline">waiting</span>
                </h2>

                <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
                  Run the full production loop free for seven days. Keep what you
                  earn, buy in when the numbers make sense — no wallet needed to
                  start.
                </p>

                <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                  <Button href="#marketplace" size="lg">
                    Claim free trial shop
                    <Icon name="arrowRight" className="size-4" />
                  </Button>
                  <Button href="#gameplay" variant="outline" size="lg">
                    Read the whitepaper
                  </Button>
                </div>

                <div className="mt-11 flex items-center gap-3">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      aria-label={s.label}
                      className="shadow-hard-sm grid size-11 place-items-center rounded-lg border-[1.5px] border-line bg-card text-ink transition-transform duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <Icon name={s.icon} className="size-[1.15rem]" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
