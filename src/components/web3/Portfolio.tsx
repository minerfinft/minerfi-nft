"use client";

import { useState } from "react";
import { TIERS } from "@/lib/data";
import { goldRewardsAbi } from "@/lib/web3/contracts";
import { formatDuration, formatGold, formatGoldCompact } from "@/lib/web3/format";
import {
  useContracts,
  useElapsedSeconds,
  useLiveGold,
  usePortfolio,
  type Business,
} from "@/lib/web3/hooks";
import { useTransaction } from "@/lib/web3/useTransaction";
import { ActionButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Reveal } from "../ui/Reveal";
import { TxStatus } from "./TxStatus";

/**
 * Every deed the wallet holds, each with its own live meter.
 *
 * Claiming per business rather than only in bulk exists because the two are not
 * the same trade: a holder selling one shop wants that token's GOLD banked
 * before it transfers, without resetting the clock on the other nine.
 */
export function Portfolio() {
  const { businesses, syncedAt, isLoading } = usePortfolio();
  const contracts = useContracts();
  const { send, state, error, hash, isBusy } = useTransaction();

  /* Which token the in-flight claim belongs to, so only that card shows a
     spinner. One shared hook also means two claims can never race. */
  const [busyId, setBusyId] = useState<bigint | null>(null);

  const claim = (tokenId: bigint) => {
    if (!contracts) return;
    setBusyId(tokenId);
    void send({
      address: contracts.rewards,
      abi: goldRewardsAbi,
      functionName: "claimTokens",
      args: [[tokenId]],
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card-hard h-52 animate-pulse bg-card-2" />
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="card-hard flex flex-col items-center gap-3 p-14 text-center">
        <Icon name="store" className="size-8 text-ink-faint" />
        <p className="font-display text-[1.2rem] tracking-wide text-ink uppercase">
          No businesses yet
        </p>
        <p className="max-w-sm text-[0.85rem] text-ink-soft">
          Mint your first deed below. It starts producing GOLD in the same block
          it lands in your wallet — there is nothing to stake and nothing to lock.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {businesses.map((business, i) => (
          <Reveal key={business.tokenId.toString()} delay={(i % 3) * 0.06} className="h-full">
            <BusinessCard
              business={business}
              syncedAt={syncedAt}
              isBusy={isBusy && busyId === business.tokenId}
              disabled={isBusy}
              onClaim={() => claim(business.tokenId)}
            />
          </Reveal>
        ))}
      </div>

      {/* One status line for the whole grid: a per-card TxStatus would push the
          claimed card's neighbours around as it appears and disappears. */}
      <TxStatus
        state={state}
        hash={hash}
        error={error}
        pendingLabel={`Claiming from business #${busyId?.toString() ?? ""}…`}
        successLabel="Claimed — that business's clock has restarted."
      />
    </div>
  );
}

function BusinessCard({
  business,
  syncedAt,
  isBusy,
  disabled,
  onClaim,
}: {
  business: Business;
  syncedAt: number | undefined;
  isBusy: boolean;
  disabled: boolean;
  onClaim: () => void;
}) {
  const pending = useLiveGold(business.pending, business.goldPerDay, syncedAt);
  const elapsed = useElapsedSeconds(business.producingSince);

  const copy = TIERS.find((t) => t.tier === business.tier);

  return (
    <article className="card-hard flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border-[1.5px] border-line bg-card-2 text-ink">
            <Icon name={copy?.icon ?? "store"} className="size-5" />
          </span>
          <span>
            <span className="block font-display text-[1.1rem] leading-tight tracking-wide text-ink uppercase">
              {copy?.name ?? `Tier ${business.tier}`}
            </span>
            <span className="font-mono text-[0.7rem] text-ink-faint">
              #{business.tokenId.toString()}
            </span>
          </span>
        </span>

        <span className="shrink-0 rounded-md border-[1.5px] border-line bg-card-2 px-2 py-1 font-mono text-[0.58rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
          T{business.tier}
        </span>
      </div>

      <div className="mt-5 rounded-lg border-[1.5px] border-line bg-card-2 px-3.5 py-3">
        <p className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
          Pending
        </p>
        <p className="mt-1 font-mono text-[1.35rem] leading-none font-bold text-ink tabular-nums">
          {formatGold(pending ?? 0n)}
        </p>
      </div>

      <dl className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-[0.78rem]">
          <dt className="text-ink-faint">Rate</dt>
          <dd className="font-mono font-semibold text-up">
            {formatGoldCompact(business.goldPerDay)}
            <span className="text-[0.7rem] text-ink-faint">/day</span>
          </dd>
        </div>
        <div className="flex items-center justify-between text-[0.78rem]">
          <dt className="text-ink-faint">Producing for</dt>
          <dd className="font-mono font-semibold text-ink">
            {formatDuration(elapsed)}
          </dd>
        </div>
      </dl>

      <ActionButton
        variant="outline"
        size="sm"
        className="mt-5 w-full"
        disabled={disabled || (pending ?? 0n) === 0n}
        onClick={onClaim}
      >
        <Icon name="coins" className="size-3.5" />
        {isBusy ? "Claiming…" : "Claim this one"}
      </ActionButton>
    </article>
  );
}
