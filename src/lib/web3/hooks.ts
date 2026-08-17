"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { DEFAULT_CHAIN, isSupportedChainId, type SupportedChainId } from "./config";
import { getContracts, goldRewardsAbi, minerFiNftAbi } from "./contracts";

/* ----------------------------------------------------------------- chain -- */

/**
 * The chain the app reads from.
 *
 * A visitor with no wallet, and a visitor whose wallet sits on some unrelated
 * network, should both still see live prices and supply — so reads fall back to
 * whichever chain actually has contracts. Writes are a different matter and are
 * gated separately by <NetworkGuard>.
 */
export function useAppChainId(): SupportedChainId {
  const { chainId: walletChainId, isConnected } = useAccount();
  const configChainId = useChainId();
  const candidate = isConnected ? walletChainId : configChainId;

  // Both halves matter: the chain needs contracts to read from *and* a
  // transport to read over.
  return isSupportedChainId(candidate) && getContracts(candidate)
    ? candidate
    : DEFAULT_CHAIN.id;
}

export function useContracts() {
  return getContracts(useAppChainId());
}

/**
 * True when the wallet is on a network this app cannot talk to at all.
 *
 * Deliberately *not* "no contracts here". Those are different problems with
 * different answers: an unsupported chain is fixed by switching, whereas a
 * supported chain with nothing deployed is fixed by deploying, and there is
 * nothing the visitor can do about the second. Conflating them produces the
 * absurd case of telling somebody already sitting on Robinhood Chain to switch
 * to Robinhood Chain, which is exactly what happens in the window between
 * launching the frontend and deploying the contracts.
 */
export function useIsWrongNetwork() {
  const { chainId, isConnected } = useAccount();
  return isConnected && !isSupportedChainId(chainId);
}

/* -------------------------------------------------------------- reading --- */

/** Poll interval for on-chain reads. Fast enough to feel live, slow enough to
 *  not hammer a public RPC — the second-by-second motion is interpolated
 *  client-side by useLiveGold rather than fetched. */
const REFETCH_MS = 12_000;

export type Tier = {
  tier: number;
  name: string;
  price: bigint;
  goldPerDay: bigint;
  maxSupply: bigint;
  minted: bigint;
};

/** All five business tiers with live pricing and supply, in one call. */
export function useTiers() {
  const contracts = useContracts();
  const chainId = useAppChainId();

  const query = useReadContract({
    address: contracts?.nft,
    abi: minerFiNftAbi,
    functionName: "allTiers",
    chainId,
    query: { enabled: Boolean(contracts), refetchInterval: REFETCH_MS },
  });

  const tiers: Tier[] | undefined = query.data?.map((t, i) => ({
    tier: i + 1,
    name: t.name,
    price: t.price,
    goldPerDay: t.goldPerDay,
    maxSupply: t.maxSupply,
    minted: t.minted,
  }));

  return { ...query, tiers };
}

export type HolderStats = {
  nftCount: bigint;
  goldPerDay: bigint;
  claimable: bigint;
  claimedToDate: bigint;
  goldBalance: bigint;
};

/** Everything the header and dashboard need about the connected holder. */
export function useHolderStats() {
  const { address } = useAccount();
  const contracts = useContracts();
  const chainId = useAppChainId();

  const query = useReadContract({
    address: contracts?.rewards,
    abi: goldRewardsAbi,
    functionName: "holderStats",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: Boolean(contracts && address), refetchInterval: REFETCH_MS },
  });

  const stats: HolderStats | undefined = query.data && {
    nftCount: query.data[0],
    goldPerDay: query.data[1],
    claimable: query.data[2],
    claimedToDate: query.data[3],
    goldBalance: query.data[4],
  };

  return { ...query, stats };
}

export type Business = {
  tokenId: bigint;
  tier: number;
  goldPerDay: bigint;
  /** Accrued GOLD as of `syncedAt`; interpolate forward for display. */
  pending: bigint;
  /** Unix seconds since this business last had its clock reset. */
  producingSince: bigint;
};

/** The holder's businesses, each with its own live accrual. */
export function usePortfolio() {
  const { address } = useAccount();
  const contracts = useContracts();
  const chainId = useAppChainId();

  const query = useReadContract({
    address: contracts?.rewards,
    abi: goldRewardsAbi,
    functionName: "portfolioOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: Boolean(contracts && address), refetchInterval: REFETCH_MS },
  });

  const [ids, tiers, goldPerDay, pending, producingSince] = query.data ?? [];

  const businesses: Business[] =
    ids?.map((tokenId, i) => ({
      tokenId,
      tier: tiers?.[i] ?? 0,
      goldPerDay: goldPerDay?.[i] ?? 0n,
      pending: pending?.[i] ?? 0n,
      producingSince: producingSince?.[i] ?? 0n,
    })) ?? [];

  return { ...query, businesses, syncedAt: query.dataUpdatedAt };
}

export type ProtocolStats = {
  goldSupply: bigint;
  claimedToDate: bigint;
  businessesMinted: bigint;
};

/** Protocol-wide numbers. Readable without a wallet. */
export function useProtocolStats() {
  const contracts = useContracts();
  const chainId = useAppChainId();

  const query = useReadContract({
    address: contracts?.rewards,
    abi: goldRewardsAbi,
    functionName: "protocolStats",
    chainId,
    query: { enabled: Boolean(contracts), refetchInterval: REFETCH_MS },
  });

  const stats: ProtocolStats | undefined = query.data && {
    goldSupply: query.data[0],
    claimedToDate: query.data[1],
    businessesMinted: query.data[2],
  };

  return { ...query, stats };
}

/* ----------------------------------------------------------------- live --- */

/**
 * One wall clock per tick rate, shared by every component that reads it.
 *
 * Written as an external store rather than an effect that calls setState on an
 * interval, for two reasons. A ten-business portfolio has eleven ticking
 * numbers on screen, and this way they run on one timer between them instead of
 * eleven drifting ones — they also all advance on the same frame, so the
 * portfolio total never briefly disagrees with the sum of its cards. And it is
 * what `useSyncExternalStore` is for: the server snapshot is a stable `null`,
 * so the first client render matches the server's markup by construction
 * instead of being corrected right after hydration.
 */
function makeClock(intervalMs: number) {
  const listeners = new Set<() => void>();
  let now = 0;
  let timer: ReturnType<typeof setInterval> | undefined;

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);

      if (timer === undefined) {
        // React re-reads the snapshot immediately after subscribing, so seeding
        // here is what makes the first tick land now rather than in 120ms.
        now = Date.now();
        timer = setInterval(() => {
          now = Date.now();
          for (const notify of listeners) notify();
        }, intervalMs);
      }

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
    getSnapshot: () => now,
    /* Nothing ticks during SSR. */
    getServerSnapshot: (): number | null => null,
  };
}

type Clock = ReturnType<typeof makeClock>;

/** Fast enough that GOLD reads as flowing rather than stepping. */
const GOLD_CLOCK = makeClock(120);
/** Durations only ever change once a second. */
const SECOND_CLOCK = makeClock(1000);

/** Stands in when there is nothing to animate, so no timer runs at all. */
const STOPPED: Clock = {
  subscribe: () => () => {},
  getSnapshot: () => 0,
  getServerSnapshot: () => null,
};

/** Both `subscribe` identities are stable, so flipping `active` is the only
 *  thing that ever causes a resubscribe. */
function useClock(clock: Clock, active = true) {
  const source = active ? clock : STOPPED;
  return useSyncExternalStore(source.subscribe, source.getSnapshot, source.getServerSnapshot);
}

/**
 * Interpolates GOLD between chain reads.
 *
 * Accrual is a pure function of elapsed time, so the client can compute the
 * exact same number the contract would return — no need to poll an RPC ten
 * times a second to make the counter move. Every refetch resnaps it to the
 * chain's answer, so drift cannot accumulate.
 */
export function useLiveGold(
  base: bigint | undefined,
  goldPerDay: bigint | undefined,
  syncedAt: number | undefined,
) {
  // A wallet with nothing producing has nothing to interpolate, and idling a
  // 120ms timer on its behalf would be pure battery drain.
  const nowMs = useClock(GOLD_CLOCK, Boolean(goldPerDay && goldPerDay > 0n));

  if (base === undefined) return undefined;
  if (!goldPerDay || !syncedAt || !nowMs) return base;

  const elapsedMs = BigInt(Math.max(0, nowMs - syncedAt));
  return base + (elapsedMs * goldPerDay) / 86_400_000n;
}

/** Seconds a business has been producing since its clock last reset. */
export function useElapsedSeconds(since: bigint) {
  const nowMs = useClock(SECOND_CLOCK);

  if (!nowMs || since === 0n) return 0;
  return Math.max(0, Math.floor(nowMs / 1000) - Number(since));
}

/* -------------------------------------------------------------- writing --- */

/**
 * Drops every cached contract read.
 *
 * Called once a transaction confirms. Without it the UI keeps showing the
 * pre-transaction numbers for up to a full refetch interval, which reads as
 * "my mint didn't work" and is the single most alarming thing a wallet app can
 * do to somebody who just spent money.
 */
export function useRefreshChainData() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);
}
