"use client";

import type { ReactNode } from "react";
import { useWatchAsset } from "wagmi";
import { goldRewardsAbi } from "@/lib/web3/contracts";
import { formatGold, formatGoldCompact } from "@/lib/web3/format";
import { useContracts, useHolderStats, useLiveGold } from "@/lib/web3/hooks";
import { useTransaction } from "@/lib/web3/useTransaction";
import { ActionButton } from "../ui/Button";
import { Icon, type IconName } from "../ui/Icon";
import { TxStatus } from "./TxStatus";

/**
 * The top of the dashboard: what you own, what it earns, and the one button
 * that turns accrual into tokens.
 *
 * The claimable figure ticks between chain reads rather than sitting still for
 * twelve seconds at a time. A yield product whose counter only moves on refresh
 * reads as broken, and the interpolation is exact — the contract computes the
 * same linear function of elapsed time.
 */
export function HolderSummary() {
  const { stats, dataUpdatedAt, isLoading } = useHolderStats();
  const contracts = useContracts();
  const { send, state, error, hash, isBusy } = useTransaction();

  const claimable = useLiveGold(stats?.claimable, stats?.goldPerDay, dataUpdatedAt);

  const claim = () => {
    if (!contracts) return;
    void send({
      address: contracts.rewards,
      abi: goldRewardsAbi,
      functionName: "claim",
    });
  };

  if (isLoading || !stats) {
    return <div className="card-hard h-56 animate-pulse bg-card-2" />;
  }

  const hasBusinesses = stats.nftCount > 0n;
  // Below a wei of accrual the claim would revert with NothingToClaim, so the
  // button is disabled rather than letting the user pay gas to find out.
  const canClaim = (claimable ?? 0n) > 0n;

  return (
    <div className="flex flex-col gap-6">
      <div className="card-hard flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.18em] text-ink-faint uppercase">
            <Icon name="coins" className="size-3.5 text-accent" />
            Claimable GOLD
          </p>
          <p className="mt-3 font-mono text-[2.4rem] leading-none font-bold text-ink tabular-nums sm:text-[3.2rem]">
            {formatGold(claimable ?? 0n)}
          </p>
          <p className="mt-3 text-[0.82rem] text-ink-soft">
            {hasBusinesses ? (
              <>
                {stats.nftCount.toString()}{" "}
                {stats.nftCount === 1n ? "business" : "businesses"} producing{" "}
                <span className="font-mono font-semibold text-up">
                  {formatGoldCompact(stats.goldPerDay)}
                </span>{" "}
                GOLD per day.
              </>
            ) : (
              "Nothing producing yet — mint a business below to start the clock."
            )}
          </p>
        </div>

        <div className="shrink-0">
          <ActionButton size="lg" disabled={isBusy || !canClaim} onClick={claim}>
            <Icon name="coins" className="size-4" />
            {isBusy ? "Claiming…" : "Claim GOLD"}
          </ActionButton>
          <TxStatus
            state={state}
            hash={hash}
            error={error}
            pendingLabel="Minting your GOLD…"
            successLabel="GOLD claimed and in your wallet."
          />
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon="store"
          label="Businesses"
          value={stats.nftCount.toLocaleString("en-US")}
        />
        <StatTile
          icon="zap"
          label="GOLD / day"
          value={formatGoldCompact(stats.goldPerDay)}
          tone="up"
        />
        <StatTile
          icon="wallet"
          label="GOLD balance"
          value={formatGoldCompact(stats.goldBalance)}
          action={<WatchGoldButton />}
        />
        <StatTile
          icon="badge"
          label="Claimed to date"
          value={formatGoldCompact(stats.claimedToDate)}
        />
      </dl>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  tone,
  action,
}: {
  icon: IconName;
  label: string;
  value: string;
  tone?: "up";
  action?: ReactNode;
}) {
  return (
    <div className="card-hard flex items-center gap-4 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg border-[1.5px] border-line bg-card-2 text-ink">
        <Icon name={icon} className="size-[1.1rem]" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">
          {label}
        </dt>
        <dd
          className={`mt-1 truncate font-mono text-[1.15rem] font-bold tabular-nums ${
            tone === "up" ? "text-up" : "text-ink"
          }`}
        >
          {value}
        </dd>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/**
 * Registers GOLD with the wallet.
 *
 * A freshly claimed ERC-20 is invisible in MetaMask until the token is added by
 * hand, and "I claimed and nothing arrived" is indistinguishable from a failed
 * transaction to anybody who has not hit this before. One click here is the
 * difference between a working claim and a support message.
 */
function WatchGoldButton() {
  const contracts = useContracts();
  const { watchAsset, isPending, isSuccess } = useWatchAsset();

  if (!contracts) return null;

  return (
    <button
      type="button"
      title="Show GOLD in your wallet"
      disabled={isPending || isSuccess}
      onClick={() =>
        watchAsset({
          type: "ERC20",
          options: { address: contracts.gold, symbol: "GOLD", decimals: 18 },
        })
      }
      className="grid size-8 place-items-center rounded-md border-[1.5px] border-line bg-card text-ink transition-transform hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-45"
    >
      <Icon name={isSuccess ? "check" : "arrowUp"} className="size-4" />
      <span className="sr-only">Add GOLD to your wallet</span>
    </button>
  );
}
