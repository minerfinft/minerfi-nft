"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { DEFAULT_CHAIN, chainName } from "@/lib/web3/config";
import { shortAddress } from "@/lib/web3/format";
import { useIsWrongNetwork } from "@/lib/web3/hooks";
import { ActionButton, buttonClasses } from "../ui/Button";
import { Icon } from "../ui/Icon";

/* Neither of these facts ever changes after the page loads, so there is nothing
   to subscribe to — useSyncExternalStore is used purely for its server/client
   snapshot split, which is exactly the question being asked. */
const NEVER_CHANGES = () => () => {};

/**
 * Wallet state is only knowable in the browser, but this button renders inside
 * a server-rendered navbar. Gating on mount keeps the first client paint
 * identical to the server's, which is the difference between a clean hydration
 * and React throwing away and re-rendering the whole header.
 */
export function useMounted() {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => true,
    () => false,
  );
}

/**
 * Assumed present on the server: guessing "no wallet" would render an "Install
 * a wallet" link into the HTML of every visitor who already has one.
 */
export function useHasWallet() {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => "ethereum" in window,
    () => true,
  );
}

/** Where to send somebody who has no wallet at all. */
export const WALLET_DOWNLOAD_URL = "https://metamask.io/download/";

export function ConnectWallet({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const mounted = useMounted();
  const hasWallet = useHasWallet();

  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const wrongNetwork = useIsWrongNetwork();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /* Server render and first client paint: a stable placeholder. */
  if (!mounted) {
    return (
      <span className={buttonClasses("outline", size)} aria-hidden>
        <Icon name="wallet" className="size-4" />
        Connect wallet
      </span>
    );
  }

  if (!hasWallet) {
    return (
      <a
        href={WALLET_DOWNLOAD_URL}
        target="_blank"
        rel="noreferrer noopener"
        className={buttonClasses("outline", size)}
      >
        <Icon name="wallet" className="size-4" />
        Install a wallet
      </a>
    );
  }

  if (!isConnected) {
    const injected = connectors[0];
    return (
      <ActionButton
        variant="outline"
        size={size}
        disabled={isPending || !injected}
        onClick={() => injected && connect({ connector: injected })}
      >
        <Icon name="wallet" className="size-4" />
        {isPending ? "Connecting…" : "Connect wallet"}
      </ActionButton>
    );
  }

  if (wrongNetwork) {
    return (
      <ActionButton
        variant="primary"
        size={size}
        disabled={isSwitching}
        onClick={() => switchChain({ chainId: DEFAULT_CHAIN.id })}
      >
        <Icon name="swap" className="size-4" />
        {isSwitching ? "Switching…" : `Switch to ${DEFAULT_CHAIN.name}`}
      </ActionButton>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <ActionButton
        variant="outline"
        size={size}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="size-2 rounded-full border border-line bg-green" aria-hidden />
        <span className="font-mono normal-case">{shortAddress(address)}</span>
        <Icon name="chevronDown" className="size-3.5" />
      </ActionButton>

      {open ? (
        <div
          role="menu"
          className="shadow-hard absolute right-0 z-50 mt-3 w-64 rounded-lg border-[1.5px] border-line bg-card p-2"
        >
          <div className="border-b-[1.5px] border-dashed border-line-soft px-3 pt-2 pb-3">
            <p className="text-[0.6rem] tracking-[0.14em] text-ink-faint uppercase">
              Connected to
            </p>
            <p className="mt-1 text-[0.82rem] font-semibold text-ink">{chainName(chainId)}</p>
            <p className="mt-2 font-mono text-[0.72rem] break-all text-ink-soft">{address}</p>
          </div>

          <MenuItem
            icon="check"
            onClick={() => {
              if (address) navigator.clipboard?.writeText(address);
              setOpen(false);
            }}
          >
            Copy address
          </MenuItem>

          <MenuItem
            icon="close"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
          >
            Disconnect
          </MenuItem>
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  icon,
  onClick,
  children,
}: {
  icon: "check" | "close";
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-[0.82rem] font-medium text-ink-soft transition-colors hover:bg-card-2 hover:text-ink"
    >
      <Icon name={icon} className="size-4 text-ink-faint" />
      {children}
    </button>
  );
}
