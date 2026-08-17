import { FOOTER_COLUMNS, SOCIALS } from "@/lib/data";
import { NewsletterForm } from "./NewsletterForm";
import { Icon } from "./ui/Icon";
import { Logo } from "./ui/Logo";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t-[1.5px] border-line bg-card-2 dark:bg-card">
      <div className="container-mf py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          {/* brand + newsletter */}
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[0.86rem] leading-relaxed text-ink-soft">
              A Web3 tycoon game where every NFT has a real function. Own the
              business, not just the picture.
            </p>

            <NewsletterForm />

            <div className="mt-7 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-lg border-[1.5px] border-line bg-card text-ink transition-transform duration-200 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[3px_3px_0_0_var(--shade)]"
                >
                  <Icon name={s.icon} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-[0.66rem] font-semibold tracking-[0.16em] text-ink uppercase">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#top"
                        className="text-[0.84rem] text-ink-soft transition-colors hover:text-accent"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t-[1.5px] border-dashed border-line-soft pt-7 sm:flex-row">
          <p className="font-mono text-[0.74rem] text-ink-faint">
            © {new Date().getFullYear()} MinerFi. All rights reserved.
          </p>
          <ul className="flex items-center gap-6">
            {["Privacy policy", "Terms of service", "Audits"].map((l) => (
              <li key={l}>
                <a
                  href="#top"
                  className="font-mono text-[0.74rem] text-ink-faint transition-colors hover:text-accent"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
