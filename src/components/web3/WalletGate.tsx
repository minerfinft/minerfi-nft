"use client";

import type { ReactNode } from "react";
import { useAccount, useBalance } from "wagmi";
import { DEFAULT_CHAIN, chainName, isTestnet } from "@/lib/web3/config";
import { useContracts, useIsWrongNetwork } from "@/lib/web3/hooks";
import { Button } from "../ui/Button";
import { Icon } from "../ui/Icon";
import {
  ConnectWallet,
  WALLET_DOWNLOAD_URL,
  useHasWallet,
  useMounted,
} from "./ConnectWallet";

/**
 * Official docs rather than a bridge URL of our own choosing: Robinhood Chain
 * publishes no faucet, so testnet ETH is bridged, and the set of working routes
 * is theirs to change. Sending people to the page that is kept current beats
 * hardcoding a link that quietly rots.
 */
const BRIDGE_DOCS_URL = "https://docs.robinhood.com/chain/bridging";

/**
 * Stands between the visitor and anything that needs a wallet.
 *
 * Written as a checklist rather than a single "please connect" panel. The
 * blocked states — no wallet, not connected, wrong network — look identical
 * from inside a component ("no data") but need completely different things
 * from the person reading. Worse, they are sequential, and a screen that only
 * ever names the current obstacle makes setup feel like an unbounded series of
 * surprises. Showing all of it at once, with the finished steps ticked, means
 * somebody can see how far in they are and how much is left.
 */
export function WalletGate({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const hasWallet = useHasWallet();
  const { isConnected, chainId } = useAccount();
  const wrongNetwork = useIsWrongNetwork();
  const contracts = useContracts();

  const onRightNetwork = isConnected && !wrongNetwork;

  /* A supported network with nothing deployed on it. Nothing the visitor can
     do about this, so it says so rather than handing them a task. */
  if (mounted && onRightNetwork && !contracts) {
    return (
      <div className="card-hard flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-xl border-[1.5px] border-line bg-card-2 text-ink">
          <Icon name="lock" className="size-6" />
        </span>
        <h2 className="font-display text-[1.6rem] tracking-wide text-ink uppercase">
          Not live on {chainName(chainId)} yet
        </h2>
        <p className="max-w-md text-[0.88rem] leading-relaxed text-ink-soft">
          MinerFi&apos;s contracts have not been deployed to this network. Your
          wallet is connected correctly — there is simply nothing here to buy or
          claim from yet.
        </p>
        <p className="max-w-md font-mono text-[0.72rem] text-ink-faint">
          Running this yourself? <code className="text-ink-soft">npm run contracts:deploy</code>
        </p>
      </div>
    );
  }

  const ready = mounted && hasWallet && onRightNetwork && Boolean(contracts);
  if (ready) return <>{children}</>;

  return (
    <div className="card-hard p-6 sm:p-8">
      {/* The heading and blurb do not depend on any wallet, so they render on
          the server. Only the step list waits for mount — which is the part
          that would otherwise flash from a wrong guess to the truth. */}
      <h2 className="font-display text-[1.6rem] tracking-wide text-ink uppercase">
        Three steps to your dashboard
      </h2>
      <p className="mt-2 max-w-lg text-[0.88rem] leading-relaxed text-ink-soft">
        Nothing here asks for an email or a password, and no step costs anything
        on a test network. Your businesses and your GOLD live on-chain against
        your wallet address.
      </p>

      {!mounted ? (
        <div className="mt-8 flex flex-col gap-4" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[5.5rem] animate-pulse rounded-lg bg-card-2" />
          ))}
        </div>
      ) : (
      <ol className="mt-8 flex flex-col gap-4">
        <SetupStep
          n={1}
          done={hasWallet}
          current={!hasWallet}
          title="Install a browser wallet"
          body="MetaMask, Rabby, Brave — anything that puts a wallet in your browser works. This is what holds your businesses; MinerFi never sees it."
          action={
            hasWallet ? null : (
              <Button
                href={WALLET_DOWNLOAD_URL}
                target="_blank"
                rel="noreferrer noopener"
                variant="outline"
                size="sm"
              >
                <Icon name="wallet" className="size-4" />
                Get MetaMask
                <Icon name="arrowUpRight" className="size-3.5" />
              </Button>
            )
          }
        />

        <SetupStep
          n={2}
          done={isConnected}
          current={hasWallet && !isConnected}
          title="Connect it"
          body="Connecting only shares your address. It cannot move anything — every purchase and every claim is a separate transaction you approve yourself."
          action={hasWallet && !isConnected ? <ConnectWallet size="sm" /> : null}
        />

        {/* Named after the network the wallet actually reached once it is
            there — a ticked "Switch to Robinhood Chain" reads as an instruction
            that was ignored rather than a step that is finished. */}
        <SetupStep
          n={3}
          done={onRightNetwork}
          current={isConnected && wrongNetwork}
          title={
            onRightNetwork
              ? `Connected to ${chainName(chainId)}`
              : `Switch to ${DEFAULT_CHAIN.name}`
          }
          body={`MinerFi runs on ${DEFAULT_CHAIN.name} (chain ${DEFAULT_CHAIN.id}). One button — your wallet will offer to add the network itself if it does not have it yet.`}
          action={isConnected && wrongNetwork ? <ConnectWallet size="sm" /> : null}
        />
      </ol>
      )}

      {mounted ? <FundingNote /> : null}
    </div>
  );
}

function SetupStep({
  n,
  done,
  current,
  title,
  body,
  action,
}: {
  n: number;
  done: boolean;
  current: boolean;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <li
      className={`flex flex-col gap-4 rounded-lg border-[1.5px] p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        current ? "border-line bg-card-2" : "border-line-soft bg-transparent"
      }`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-line font-mono text-[0.72rem] font-bold ${
            done ? "bg-green text-on-bright" : "bg-card text-ink"
          }`}
        >
          {done ? <Icon name="check" className="size-4" /> : n}
        </span>

        <div className="min-w-0">
          <h3
            className={`text-[0.92rem] font-semibold ${done ? "text-ink-faint line-through" : "text-ink"}`}
          >
            {title}
          </h3>
          <p className="mt-1 max-w-lg text-[0.8rem] leading-relaxed text-ink-soft">
            {body}
          </p>
        </div>
      </div>

      {action ? <div className="shrink-0 sm:pl-4">{action}</div> : null}
    </li>
  );
}

/**
 * Shown only once the wallet is actually on the right network and empty.
 *
 * Raising it earlier would be noise — most people arriving here already have
 * gas — and raising it never would leave the one group that is genuinely stuck
 * to discover the problem by having a mint fail.
 */
function FundingNote() {
  const { address, chainId, isConnected } = useAccount();
  const wrongNetwork = useIsWrongNetwork();

  const { data: balance } = useBalance({
    address,
    query: { enabled: Boolean(address) && isConnected && !wrongNetwork },
  });

  if (!isConnected || wrongNetwork || !balance || balance.value > 0n) return null;

  return (
    <p className="mt-6 flex items-start gap-3 rounded-lg border-[1.5px] border-line bg-amber/20 px-4 py-3.5 text-[0.82rem] leading-relaxed text-ink">
      <Icon name="coins" className="mt-0.5 size-4 shrink-0" />
      <span>
        This wallet has no ETH on this network, so it cannot pay for a mint yet.
        {isTestnet(chainId)
          ? " Robinhood Chain publishes no faucet — testnet ETH is bridged over from Ethereum."
          : " Bridge ETH over from Ethereum to get started."}{" "}
        <a
          href={BRIDGE_DOCS_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2"
        >
          How to bridge
          <Icon name="arrowUpRight" className="size-3" />
        </a>
      </span>
    </p>
  );
}
