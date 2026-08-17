"use client";

import { chainName, explorerAddressUrl } from "@/lib/web3/config";
import { formatGoldCompact } from "@/lib/web3/format";
import { useAppChainId, useContracts, useProtocolStats } from "@/lib/web3/hooks";
import { Icon, type IconName } from "../ui/Icon";

/**
 * Protocol-wide numbers, deliberately readable without a wallet.
 *
 * These are the figures the marketing page asserts, shown here straight off the
 * chain — including which contracts produced them, so anyone can check the
 * claim rather than take it.
 */
export function ProtocolStats() {
  const { stats } = useProtocolStats();
  const contracts = useContracts();
  const chainId = useAppChainId();

  return (
    <div className="card-hard flex flex-col gap-8 p-6 lg:p-8">
      <dl className="grid gap-6 sm:grid-cols-3">
        <Figure
          icon="coins"
          label="GOLD in circulation"
          value={stats ? formatGoldCompact(stats.goldSupply) : "—"}
        />
        <Figure
          icon="badge"
          label="Claimed to date"
          value={stats ? formatGoldCompact(stats.claimedToDate) : "—"}
        />
        <Figure
          icon="store"
          label="Businesses minted"
          value={stats ? stats.businessesMinted.toLocaleString("en-US") : "—"}
        />
      </dl>

      {/* Printed in full, not truncated, and linked where an explorer exists.
          "Verify this yourself" is only a real offer if the addresses are here
          to copy — a shortened hash is decoration. */}
      <div className="border-t-[1.5px] border-dashed border-line-soft pt-6">
        <p className="font-mono text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">
          Reading from {chainName(chainId)}
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <ContractRow label="Business deeds (ERC-721)" address={contracts?.nft} chainId={chainId} />
          <ContractRow label="GOLD token (ERC-20)" address={contracts?.gold} chainId={chainId} />
          <ContractRow label="Rewards" address={contracts?.rewards} chainId={chainId} />
        </dl>
      </div>
    </div>
  );
}

function ContractRow({
  label,
  address,
  chainId,
}: {
  label: string;
  address: string | undefined;
  chainId: number;
}) {
  const explorer = address ? explorerAddressUrl(chainId, address) : null;

  return (
    <div className="min-w-0">
      <dt className="text-[0.68rem] text-ink-faint">{label}</dt>
      <dd className="mt-1 font-mono text-[0.7rem] break-all text-ink-soft">
        {!address ? (
          "not deployed"
        ) : explorer ? (
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 hover:text-ink"
          >
            {address}
          </a>
        ) : (
          /* Local chains have no explorer, so the address is shown bare rather
             than as a link that would 404. */
          address
        )}
      </dd>
    </div>
  );
}

function Figure({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">
        <Icon name={icon} className="size-3.5 text-accent" />
        {label}
      </dt>
      <dd className="mt-2 font-mono text-[1.5rem] leading-none font-bold text-ink tabular-nums">
        {value}
      </dd>
    </div>
  );
}
