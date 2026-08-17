"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BaseError,
  type Abi,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type Hash,
} from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import type { WriteContractVariables } from "wagmi/query";
import type { wagmiConfig } from "./config";
import { useRefreshChainData } from "./hooks";

type AppConfig = typeof wagmiConfig;

/**
 * The argument shape of a write, with wagmi's inference left intact.
 *
 * Writing this as `Parameters<typeof writeContractAsync>[0]` is the obvious
 * shortcut and it quietly breaks every payable call: the generics collapse to
 * their constraints, `mint` stops being seen as payable, and `value` narrows to
 * `undefined`. Re-declaring the type parameters is what keeps a typo in
 * `functionName` a compile error rather than a failed transaction.
 */
type WriteRequest<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
  args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
> = WriteContractVariables<
  abi,
  functionName,
  args,
  AppConfig,
  AppConfig["chains"][number]["id"]
>;

export type TxState = "idle" | "signing" | "pending" | "success" | "error";

/**
 * One state machine for every write in the app — mint, claim, transfer.
 *
 * A raw useWriteContract only reports that the wallet accepted the request; the
 * transaction is still unmined at that point. Treating that as success is the
 * classic mistake, and it shows the user "Done" while their balance is
 * unchanged. Here `success` means the receipt came back, and the read caches
 * are dropped at that exact moment so the numbers on screen move with it.
 */
export function useTransaction() {
  const { writeContractAsync, data: hash, reset: resetWrite } = useWriteContract();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const receipt = useWaitForTransactionReceipt({ hash });
  const refresh = useRefreshChainData();

  useEffect(() => {
    if (receipt.isSuccess) refresh();
  }, [receipt.isSuccess, refresh]);

  const send = useCallback(
    async <
      const abi extends Abi | readonly unknown[],
      functionName extends ContractFunctionName<abi, "nonpayable" | "payable">,
      args extends ContractFunctionArgs<abi, "nonpayable" | "payable", functionName>,
    >(
      request: WriteRequest<abi, functionName, args>,
    ): Promise<Hash | undefined> => {
      setError(null);
      setIsSigning(true);
      try {
        // The one cast in this file, and it is at the least dangerous point:
        // `request` was already checked against the same types on the way in,
        // but TypeScript cannot prove a still-unresolved generic satisfies
        // writeContractAsync's own generic union. Callers keep full inference.
        return await writeContractAsync(
          request as Parameters<typeof writeContractAsync>[0],
        );
      } catch (cause) {
        setError(describeError(cause));
        return undefined;
      } finally {
        setIsSigning(false);
      }
    },
    [writeContractAsync],
  );

  const reset = useCallback(() => {
    setError(null);
    resetWrite();
  }, [resetWrite]);

  const state: TxState = error
    ? "error"
    : receipt.isSuccess
      ? "success"
      : hash
        ? "pending"
        : isSigning
          ? "signing"
          : "idle";

  return {
    send,
    reset,
    state,
    error,
    hash: hash as Hash | undefined,
    isBusy: state === "signing" || state === "pending",
  };
}

/**
 * Wallet and node errors arrive as multi-paragraph dumps with stack traces and
 * ABI payloads. Showing that to somebody who just declined a signature is not
 * an error message, it is an accusation, so the common cases get named
 * explicitly and everything else falls back to viem's one-line summary.
 */
export function describeError(cause: unknown): string {
  if (cause instanceof BaseError) {
    const text = `${cause.shortMessage} ${cause.details ?? ""}`.toLowerCase();

    if (text.includes("user rejected") || text.includes("user denied")) {
      return "You cancelled the transaction in your wallet.";
    }
    if (text.includes("insufficient funds")) {
      return "Not enough ETH in this wallet to cover the price plus gas.";
    }
    if (text.includes("wrongprice")) {
      return "The price changed while you were signing. Refresh and try again.";
    }
    if (text.includes("soldout")) {
      return "That tier just sold out.";
    }
    if (text.includes("nothingtoclaim")) {
      return "There is no GOLD to claim yet — give your businesses time to produce.";
    }
    if (text.includes("notholder")) {
      return "You no longer hold one of those businesses.";
    }

    return cause.shortMessage;
  }

  return cause instanceof Error ? cause.message : "Something went wrong.";
}
