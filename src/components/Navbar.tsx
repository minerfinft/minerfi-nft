"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/data";
import { ConnectWallet } from "./web3/ConnectWallet";
import { Icon } from "./ui/Icon";
import { Logo } from "./ui/Logo";
import { ThemeToggle } from "./ui/ThemeToggle";

/** Hash links stay anchors so smooth-scroll still works; routes get prefetched. */
function NavLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock the page while the mobile sheet is open. */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b-[1.5px] border-line bg-paper/90 backdrop-blur-xl"
          : "border-b-[1.5px] border-transparent"
      }`}
    >
      <nav className="container-mf flex h-[4.75rem] items-center justify-between gap-6">
        <a href="#top" aria-label="MinerFi home" className="shrink-0">
          <Logo />
        </a>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                className="group relative text-[0.85rem] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {link.label}
                {/* the reference underlines the active tab with a short hard rule */}
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-green transition-all duration-300 group-hover:w-full" />
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search assets"
            className="shadow-hard-sm hidden size-10 items-center justify-center rounded-lg border-[1.5px] border-line bg-card text-ink transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none sm:inline-flex"
          >
            <Icon name="search" className="size-[1.05rem]" />
          </button>

          {/* Wrapped rather than given `hidden` directly: both components carry
              `inline-flex` in their own base classes, and an unprefixed `hidden`
              does not reliably win that cascade. */}
          <span className="hidden sm:inline-flex">
            <ThemeToggle />
          </span>

          <span className="hidden lg:inline-flex">
            <ConnectWallet />
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="shadow-hard-sm inline-flex size-10 items-center justify-center rounded-lg border-[1.5px] border-line bg-card text-ink transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="size-5" />
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`overflow-hidden border-t-[1.5px] border-line bg-paper transition-[max-height,opacity] duration-300 lg:hidden ${
          open ? "max-h-[34rem] opacity-100" : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <ul className="container-mf flex flex-col py-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b-[1.5px] border-line-soft py-3.5 font-display text-lg tracking-[0.06em] text-ink uppercase"
              >
                {link.label}
                <Icon name="chevronRight" className="size-4 text-accent" />
              </NavLink>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 pt-5">
            <ConnectWallet size="lg" />
            <span className="sm:hidden">
              <ThemeToggle />
            </span>
          </li>
        </ul>
      </div>
    </header>
  );
}
