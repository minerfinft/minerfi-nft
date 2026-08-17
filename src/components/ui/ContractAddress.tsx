"use client";

import { useEffect, useState } from "react";
import { TOKEN } from "@/lib/data";
import { Icon } from "./Icon";

/**
 * The MF contract address, copyable in one click.
 *
 * The full 42 characters are shown from `sm` up, because an address people are
 * expected to verify against an explorer is only useful in full. Below that the
 * middle is elided rather than wrapped — the copy button and the explorer link
 * are both still exact, so nothing is lost but the line stays one line.
 */
export function ContractAddress({ className = "" }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  /* Reset the confirmation on a timer, and clear it if the component goes away
     first so a pending timeout never fires into an unmounted tree. */
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(TOKEN.address);
      setCopied(true);
    } catch {
      /* Clipboard is blocked on insecure origins and by some privacy settings.
         The address is on screen and the explorer link still works, so there is
         nothing to recover from — just do not claim a copy that never happened. */
    }
  }

  return (
    <div
      className={`shadow-hard-sm inline-flex max-w-full items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-card py-1.5 pr-1.5 pl-3 ${className}`}
    >
      <span className="font-mono text-[0.62rem] font-semibold tracking-[0.16em] text-ink-faint uppercase">
        ${TOKEN.symbol} CA
      </span>

      <code className="min-w-0 font-mono text-[0.72rem] text-ink">
        <span className="sm:hidden">
          {TOKEN.address.slice(0, 8)}…{TOKEN.address.slice(-6)}
        </span>
        <span className="hidden sm:inline">{TOKEN.address}</span>
      </code>

      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Contract address copied" : "Copy contract address"}
          className="grid size-7 place-items-center rounded-md border-[1.5px] border-line bg-card-2 text-ink transition-colors hover:bg-green hover:text-on-bright"
        >
          <Icon name={copied ? "check" : "copy"} className="size-3.5" />
        </button>

        <a
          href={TOKEN.explorer}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`View ${TOKEN.symbol} on the ${TOKEN.chain} explorer`}
          className="grid size-7 place-items-center rounded-md border-[1.5px] border-line bg-card-2 text-ink transition-colors hover:bg-green hover:text-on-bright"
        >
          <Icon name="arrowUpRight" className="size-3.5" />
        </a>
      </span>
    </div>
  );
}
