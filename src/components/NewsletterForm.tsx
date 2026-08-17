"use client";

import { useState } from "react";
import { Icon } from "./ui/Icon";

/** Front-end only. Swap the handler for your provider's endpoint when ready. */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="shadow-hard-sm mt-7 flex max-w-sm items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-green px-3.5 py-2.5 text-[0.84rem] font-medium text-on-bright">
        <Icon name="check" className="size-4 shrink-0" />
        You&rsquo;re on the list — watch for the Season 3 drop.
      </p>
    );
  }

  return (
    <form
      className="mt-7 flex max-w-sm gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      <label htmlFor="newsletter" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="min-w-0 flex-1 rounded-lg border-[1.5px] border-line bg-card px-3.5 py-2.5 text-[0.85rem] text-ink placeholder:text-ink-faint focus:outline-none"
      />
      <button
        type="submit"
        className="shadow-hard-sm shrink-0 rounded-lg border-[1.5px] border-line bg-green px-4 py-2.5 font-display text-[0.85rem] tracking-[0.08em] text-on-bright uppercase transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        Notify me
      </button>
    </form>
  );
}
