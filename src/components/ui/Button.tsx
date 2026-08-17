import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

/* Every variant shares the reference's press behaviour: the button slides into
   its own hard shadow instead of dimming or scaling. */
const PRESS =
  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none";

const VARIANTS: Record<Variant, string> = {
  primary: `shadow-hard border-[1.5px] border-line bg-green text-on-bright hover:shadow-hard-lg hover:-translate-x-[2px] hover:-translate-y-[2px] ${PRESS}`,
  outline: `shadow-hard border-[1.5px] border-line bg-card text-ink hover:shadow-hard-lg hover:-translate-x-[2px] hover:-translate-y-[2px] ${PRESS}`,
  ghost:
    "border-[1.5px] border-transparent text-ink-soft hover:border-line hover:bg-card hover:text-ink",
};

const SIZES: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[0.78rem]",
  md: "px-5 py-2.5 text-[0.84rem]",
  lg: "px-7 py-3.5 text-[0.95rem]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-display tracking-[0.08em] whitespace-nowrap uppercase transition-all duration-150 ease-out";

/**
 * Shared so the anchor and the real button can never drift apart. Connect,
 * mint and claim are all genuine actions rather than navigation, and shipping
 * them as anchors would cost keyboard users the space-bar activation and
 * `disabled` semantics they get from a <button> for free.
 */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

type AnchorProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ComponentPropsWithoutRef<"a">;

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: AnchorProps) {
  return (
    <a className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </a>
  );
}

type ActionProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">;

/** Same skin as <Button>, but an actual <button> for things that do work. */
export function ActionButton({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}: ActionProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses(variant, size, className)} disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none`}
      {...rest}
    >
      {children}
    </button>
  );
}
