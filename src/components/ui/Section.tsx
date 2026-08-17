import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { Reveal } from "./Reveal";

/** The reference's taped-on section tag: hard outline, hard offset, tiny type. */
export function Eyebrow({
  children,
  icon = "pickaxe",
}: {
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <span className="shadow-hard-sm inline-flex items-center gap-2 rounded-lg border-[1.5px] border-line bg-card px-3.5 py-1.5 font-mono text-[0.65rem] font-semibold tracking-[0.18em] text-ink uppercase">
      <Icon name={icon} className="size-3.5 text-accent" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  eyebrowIcon,
  title,
  accent,
  description,
  align = "left",
  aside,
}: {
  eyebrow: string;
  eyebrowIcon?: IconName;
  title: string;
  /** Trailing words picked out with the reference's marker underline. */
  accent?: string;
  description?: string;
  align?: "left" | "center";
  aside?: ReactNode;
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-col gap-6 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <Reveal className={centered ? "flex flex-col items-center" : "max-w-2xl"}>
        <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>
        <h2 className="mt-5 font-display text-[2.1rem] leading-[1.06] tracking-[0.01em] text-balance sm:text-[2.7rem] lg:text-[3.2rem]">
          {title}
          {accent ? (
            <>
              {" "}
              <span className="marker-underline">{accent}</span>
            </>
          ) : null}
        </h2>
        {description ? (
          <p className="mt-5 max-w-xl text-[0.92rem] leading-relaxed text-ink-soft">
            {description}
          </p>
        ) : null}
      </Reveal>

      {aside ? <Reveal delay={0.1}>{aside}</Reveal> : null}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-20 lg:py-28 ${className}`}>
      <div className="container-mf relative">{children}</div>
    </section>
  );
}
