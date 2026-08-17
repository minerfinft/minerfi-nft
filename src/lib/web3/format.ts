import { formatUnits } from "viem";

/**
 * Display helpers for on-chain values.
 *
 * Everything here takes a bigint and returns a string — no floats in the middle.
 * A GOLD balance past ~9,007 tokens already exceeds Number.MAX_SAFE_INTEGER once
 * you count the 18 decimals, so converting early would round somebody's balance.
 */

const GOLD_DECIMALS = 18;

/**
 * Fixed-width by design. The rewards counter re-renders several times a second,
 * and a variable number of decimals makes it visibly jitter, so the digit count
 * stays put and CSS `tabular-nums` keeps the columns from dancing.
 */
export function formatGold(value: bigint, decimals = 4) {
  const whole = value / 10n ** BigInt(GOLD_DECIMALS);
  const formattedWhole = whole.toLocaleString("en-US");

  if (decimals === 0) return formattedWhole;

  const fraction = formatUnits(value, GOLD_DECIMALS).split(".")[1] ?? "";
  return `${formattedWhole}.${fraction.padEnd(decimals, "0").slice(0, decimals)}`;
}

/** Compact form for headline numbers: 1.2K, 3.4M. */
export function formatGoldCompact(value: bigint) {
  const whole = Number(value / 10n ** BigInt(GOLD_DECIMALS));

  if (whole >= 1_000_000) return `${(whole / 1_000_000).toFixed(2)}M`;
  if (whole >= 1_000) return `${(whole / 1_000).toFixed(1)}K`;

  // Integer division floors, so every balance under one GOLD would otherwise
  // render as a flat "0" — identical to holding none. That is worst exactly
  // where it matters most: somebody claims for the first time, watches the
  // transaction confirm, and reads their new balance as zero.
  if (whole === 0 && value > 0n) return formatGold(value, 2);

  return whole.toLocaleString("en-US");
}

/**
 * ETH prices here run from 0.00005 (scaled testnet tier 1) to 7.5, so a fixed
 * precision either shows 0.0000 or a wall of zeros. Trailing zeros are trimmed
 * instead, and anything smaller than the window falls back to significant digits.
 */
export function formatEth(value: bigint) {
  const asString = formatUnits(value, 18);
  const asNumber = Number(asString);

  if (asNumber === 0) return "0";

  if (asNumber < 0.0001) {
    const significant = asNumber.toPrecision(2);

    // toPrecision pads out to the digit count it was asked for, so the scaled
    // tier-1 price of 0.00005 comes back as "0.000050" — the exact trailing
    // zero this function exists to remove, on the most-read number on the page.
    // Below 1e-6 it switches to exponential, which has nothing to trim.
    return significant.includes("e")
      ? significant
      : significant.replace(/0+$/, "").replace(/\.$/, "");
  }

  return asString.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
}

/** Matches the wallet format already used across the marketing pages. */
export function shortAddress(address: string | undefined) {
  if (!address) return "";
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function shortHash(hash: string) {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

/** "2h 14m" — used for how long a business has been producing. */
export function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.max(0, Math.floor(seconds))}s`;

  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
