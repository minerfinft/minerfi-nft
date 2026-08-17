"use client";

import { useAccount } from "wagmi";
import { explorerTxUrl } from "@/lib/web3/config";
import { shortHash } from "@/lib/web3/format";
import type { TxState } from "@/lib/web3/useTransaction";
import { Icon } from "../ui/Icon";

/**
 * The narration under an action button.
 *
 * Spending money on a chain has a dead stretch between signing and mining where
 * nothing visible happens, and an unexplained gap there is exactly when people
 * click again and pay twice. Every state gets a sentence, and the pending one
 * gets a link to the explorer so the user can verify us against the chain
 * rather than taking our word for it.
 */
export function TxStatus({
  state,
  hash,
  error,
  successLabel = "Confirmed on-chain.",
  pendingLabel = "Waiting for the network to confirm…",
}: {
  state: TxState;
  hash?: `0x${string}`;
  error?: string | null;
  successLabel?: string;
  pendingLabel?: string;
}) {
  const { chainId } = useAccount();

  if (state === "idle") return null;

  const explorer = hash ? explorerTxUrl(chainId, hash) : null;

  const tone =
    state === "error"
      ? "border-down/60 bg-down/10 text-down"
      : state === "success"
        ? "border-line bg-green/15 text-accent"
        : "border-line bg-card-2 text-ink-soft";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mt-4 flex flex-col gap-2 rounded-lg border-[1.5px] px-3.5 py-3 text-[0.78rem] ${tone}`}
    >
      <span className="flex items-center gap-2 font-medium">
        {state === "signing" ? (
          <>
            <Spinner />
            Confirm in your wallet…
          </>
        ) : null}
        {state === "pending" ? (
          <>
            <Spinner />
            {pendingLabel}
          </>
        ) : null}
        {state === "success" ? (
          <>
            <Icon name="badge" className="size-4 shrink-0" />
            {successLabel}
          </>
        ) : null}
        {state === "error" ? (
          <>
            <Icon name="close" className="size-4 shrink-0" />
            {error ?? "Something went wrong."}
          </>
        ) : null}
      </span>

      {hash ? (
        <span className="font-mono text-[0.68rem] text-ink-faint">
          {explorer ? (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-ink"
            >
              {shortHash(hash)}
              <Icon name="arrowUpRight" className="size-3" />
            </a>
          ) : (
            /* Local chains have no explorer, so the hash is shown bare rather
               than as a link that would 404. */
            shortHash(hash)
          )}
        </span>
      ) : null}
    </div>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-line-soft border-t-accent"
    />
  );
}
