"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { TIERS } from "@/lib/data";
import { minerFiNftAbi } from "@/lib/web3/contracts";
import { formatEth, formatGoldCompact } from "@/lib/web3/format";
import { useContracts, useIsWrongNetwork, useTiers, type Tier } from "@/lib/web3/hooks";
import { useTransaction } from "@/lib/web3/useTransaction";
import { ActionButton } from "../ui/Button";
import { Icon } from "../ui/Icon";
import { Reveal } from "../ui/Reveal";
import { ConnectWallet } from "./ConnectWallet";
import { TxStatus } from "./TxStatus";

/** Matches MinerFiNFT.MAX_PER_TX — minting more reverts with InvalidQuantity. */
const MAX_PER_TX = 10;

/* The ladder colour ramp, kept identical to <EmpirePath> so a tier reads the
   same on the marketing page and on the mint card. */
const TIER_FILL = [
  "bg-mint/35",
  "bg-green-deep/25",
  "bg-green/30",
  "bg-coral/45",
  "bg-amber/40",
];

export function MintPanel() {
  const { tiers, isLoading } = useTiers();
  const contracts = useContracts();

  if (!contracts) {
    return (
      <p className="card-hard p-8 text-center text-[0.85rem] text-ink-soft">
        No MinerFi contracts are recorded for this network, so there is nothing to
        mint yet.
      </p>
    );
  }

  if (isLoading || !tiers) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card-hard h-[26rem] animate-pulse bg-card-2" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {tiers.map((tier, i) => (
        <Reveal key={tier.tier} delay={(i % 3) * 0.07} className="h-full">
          <MintCard tier={tier} />
        </Reveal>
      ))}
    </div>
  );
}

/**
 * One card owns one transaction.
 *
 * A single shared tx hook would put the spinner on all five tiers at once and
 * leave the user unsure which purchase they are actually confirming.
 */
function MintCard({ tier }: { tier: Tier }) {
  const [quantity, setQuantity] = useState(1);
  const contracts = useContracts();
  const { isConnected } = useAccount();
  const wrongNetwork = useIsWrongNetwork();
  const { send, state, error, hash, isBusy } = useTransaction();

  /* Copy and iconography live in data.ts; price, yield and supply come off the
     chain. The static half is looked up by tier number rather than by array
     position so a re-ordered TIERS list cannot silently mislabel a card. */
  const copy = TIERS.find((t) => t.tier === tier.tier);

  const remaining = tier.maxSupply - tier.minted;
  const soldOut = remaining <= 0n;
  const maxQuantity = Math.min(MAX_PER_TX, Number(remaining > 0n ? remaining : 0n));
  const total = tier.price * BigInt(quantity);

  const soldPercent =
    tier.maxSupply > 0n ? Number((tier.minted * 100n) / tier.maxSupply) : 0;

  const mint = () => {
    if (!contracts) return;
    void send({
      address: contracts.nft,
      abi: minerFiNftAbi,
      functionName: "mint",
      args: [tier.tier, BigInt(quantity)],
      value: total,
    });
  };

  return (
    <article className="card-hard flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid size-12 place-items-center rounded-lg border-[1.5px] border-line text-ink ${TIER_FILL[tier.tier - 1]}`}
        >
          <Icon name={copy?.icon ?? "store"} className="size-6" />
        </span>
        <span className="rounded-md border-[1.5px] border-line bg-card-2 px-2 py-1 font-mono text-[0.6rem] font-bold tracking-[0.1em] text-ink-soft uppercase">
          Tier {tier.tier}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[1.35rem] tracking-wide text-ink uppercase">
        {tier.name}
      </h3>
      {copy ? (
        <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-soft">
          {copy.blurb}
        </p>
      ) : null}

      <dl className="mt-5 flex items-end justify-between gap-2 rounded-lg border-[1.5px] border-line bg-card-2 px-3.5 py-3">
        <div>
          <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
            Price
          </dt>
          <dd className="font-mono text-[0.85rem] font-semibold whitespace-nowrap text-ink">
            {formatEth(tier.price)}
            <span className="ml-1 text-[0.7rem] text-ink-faint">ETH</span>
          </dd>
        </div>
        <div className="text-right">
          <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
            Yield
          </dt>
          <dd className="font-mono text-[0.85rem] font-semibold whitespace-nowrap text-up">
            {formatGoldCompact(tier.goldPerDay)}
            <span className="text-[0.7rem] text-ink-faint">/day</span>
          </dd>
        </div>
      </dl>

      {/* supply */}
      <div className="mt-4">
        <div className="flex items-center justify-between font-mono text-[0.68rem] text-ink-faint">
          <span className="tracking-[0.1em] uppercase">Minted</span>
          <span className="text-ink">
            {tier.minted.toLocaleString("en-US")} /{" "}
            {tier.maxSupply.toLocaleString("en-US")}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full border-[1.5px] border-line bg-card-2">
          <div
            className="h-full bg-green transition-[width] duration-500"
            style={{ width: `${Math.min(100, soldPercent)}%` }}
          />
        </div>
      </div>

      {/* ------------------------------------------------------- actions --- */}
      <div className="mt-auto pt-5">
        {soldOut ? (
          <p className="flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-line-soft bg-card-2 px-3 py-3.5 text-[0.8rem] font-medium text-ink-faint">
            <Icon name="lock" className="size-4" />
            Sold out
          </p>
        ) : !isConnected || wrongNetwork ? (
          /* The card still shows live price and supply to a visitor with no
             wallet — only the purchase itself needs one. */
          <ConnectWallet size="md" />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 rounded-lg border-[1.5px] border-line bg-card-2 px-3 py-2">
              <span className="text-[0.65rem] tracking-[0.1em] text-ink-faint uppercase">
                Quantity
              </span>
              <span className="flex items-center gap-1">
                <StepButton
                  label={`Fewer ${tier.name}`}
                  icon="chevronLeft"
                  disabled={isBusy || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                />
                <span className="w-8 text-center font-mono text-[0.9rem] font-bold text-ink tabular-nums">
                  {quantity}
                </span>
                <StepButton
                  label={`More ${tier.name}`}
                  icon="chevronRight"
                  disabled={isBusy || quantity >= maxQuantity}
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                />
              </span>
            </div>

            <ActionButton
              className="mt-3 w-full"
              disabled={isBusy}
              onClick={mint}
            >
              <Icon name="cart" className="size-4" />
              {isBusy ? "Minting…" : `Mint · ${formatEth(total)} ETH`}
            </ActionButton>
          </>
        )}

        <TxStatus
          state={state}
          hash={hash}
          error={error}
          pendingLabel="Minting your business…"
          successLabel={`${quantity === 1 ? "Business" : "Businesses"} minted — already producing GOLD.`}
        />
      </div>
    </article>
  );
}

function StepButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: "chevronLeft" | "chevronRight";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md border-[1.5px] border-line bg-card text-ink transition-transform active:translate-x-[1px] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon name={icon} className="size-3.5" />
    </button>
  );
}
