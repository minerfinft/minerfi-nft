"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./Icon";

/** Kept in sync with the pre-paint script in app/layout.tsx. */
const STORAGE_KEY = "minerfi-theme";

function apply(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

/* The <html> class is the single source of truth — the pre-paint script writes
   it before React exists, so the toggle reads it rather than keeping a second
   copy in state that could disagree. */

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  /* Keep following the OS until the user makes an explicit choice. The class
     flip below is what notifies React, via the observer above. */
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = (e: MediaQueryListEvent) => {
    if (!localStorage.getItem(STORAGE_KEY)) apply(e.matches);
  };
  mq.addEventListener("change", onSystemChange);

  return () => {
    observer.disconnect();
    mq.removeEventListener("change", onSystemChange);
  };
}

const isDark = () => document.documentElement.classList.contains("dark");

/* The server has no document, so it renders the light knob; React swaps to the
   real value right after hydration. `hydrated` suppresses the slide animation
   for exactly that one frame. */
const serverFalse = () => false;
const noopSubscribe = () => () => {};
const clientTrue = () => true;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, serverFalse);
  const hydrated = useSyncExternalStore(noopSubscribe, clientTrue, serverFalse);

  const toggle = () => {
    const next = !dark;
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      /* private mode — the choice just won't survive a reload */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label="Toggle dark mode"
      title={dark ? "Switch to light" : "Switch to dark"}
      className={`shadow-hard-sm relative inline-flex h-10 w-[4.4rem] shrink-0 items-center rounded-full border-[1.5px] border-line bg-card px-1 transition-[box-shadow,transform] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${className}`}
    >
      {/* the two rails — whichever the knob is not covering reads as the target */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-[0.62rem] text-ink-faint"
      >
        <Icon name="sun" className="size-[0.95rem]" />
        <Icon name="moon" className="size-[0.95rem]" />
      </span>

      <span
        aria-hidden
        className={`pointer-events-none relative grid size-7 place-items-center rounded-full border-[1.5px] border-line bg-green text-on-bright ${
          hydrated ? "transition-transform duration-300 ease-out-expo" : ""
        } ${dark ? "translate-x-[2.15rem]" : "translate-x-0"}`}
      >
        <Icon name={dark ? "moon" : "sun"} className="size-[0.95rem]" />
      </span>
    </button>
  );
}
