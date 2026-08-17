"use client";

import { chainName, isTestnet } from "@/lib/web3/config";
import { formatEth, formatGold, formatGoldCompact } from "@/lib/web3/format";
import { useAppChainId, useTiers } from "@/lib/web3/hooks";
import { Icon, type IconName } from "../ui/Icon";
import { Reveal } from "../ui/Reveal";

/**
 * The explainer somebody reads before they have connected anything.
 *
 * Deliberately placed above the wallet gate rather than below it. A dApp that
 * opens on "Connect your wallet" and nothing else asks for a signature before
 * it has said what the thing does, and the people this most needs to reach —
 * anyone whose first token this is — are exactly the ones who will not connect
 * a wallet to find out.
 *
 * The numbers are read live rather than written into the copy, so the page can
 * never quote a price the contract has since moved.
 */
export function HowItWorks() {
  const { tiers } = useTiers();
  const chainId = useAppChainId();

  const entry = tiers?.[0];

  return (
    <div className="flex flex-col gap-8">
      {isTestnet(chainId) ? (
        <p className="flex items-start gap-3 rounded-lg border-[1.5px] border-line bg-amber/20 px-4 py-3.5 text-[0.84rem] leading-relaxed text-ink">
          <Icon name="shield" className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="font-semibold">This is {chainName(chainId)}.</strong>{" "}
            The ETH here is test money with no cash value, and so is everything
            you buy with it. Nothing on this page costs real funds.
          </span>
        </p>
      ) : null}

      <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Step
          n="01"
          icon="wallet"
          title="Get set up"
          body="MinerFi runs entirely in your browser wallet — MetaMask, Rabby, Brave, any of them. There is no account to create, no email, no password. The checklist at the top of this page walks through it, and your wallet offers to add the network itself if it does not have it."
        />
        <Step
          n="02"
          icon="cart"
          title="Buy a business"
          body="Pick one of five tiers and mint it. You pay once, in ETH, and the deed arrives in your wallet. Nothing is staked and nothing is locked — it is yours to move the moment you have it."
          figure={
            entry
              ? `A ${entry.name} costs ${formatEth(entry.price)} ETH right now.`
              : undefined
          }
        />
        <Step
          n="03"
          icon="clock"
          title="It produces GOLD every second"
          body="Production is plain arithmetic on time held: the tier's daily rate multiplied by the seconds you have owned it. There is no reward pool that can run dry, and no snapshot to game by borrowing an NFT before a payout."
          figure={
            entry
              ? `That ${entry.name} makes ${formatGoldCompact(entry.goldPerDay)} GOLD a day — ${formatGold(entry.goldPerDay / 24n, 2)} an hour.`
              : undefined
          }
        />
        <Step
          n="04"
          icon="coins"
          title="Claim whenever you like"
          body="Claiming mints GOLD into your wallet for exactly the seconds you held, and restarts that business's clock. There is no lock-up window and no penalty for claiming early or late — waiting longer earns the same total, just in one payment instead of several."
        />
        <Step
          n="05"
          icon="swap"
          title="Sell any time, keep what you earned"
          body="Transferring a business settles it first: your unclaimed GOLD is banked to you, and the buyer's clock starts at zero. Neither side inherits the other's earnings, which is the one place a design like this could quietly take from somebody."
        />
        <Step
          n="06"
          icon="search"
          title="Check any of this yourself"
          body="Every figure on this page is read straight from the contracts — there is no server in between and no database holding your balance. Each transaction links to the block explorer, and the contract addresses are printed at the bottom of this page."
        />
      </ol>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
  figure,
}: {
  n: string;
  icon: IconName;
  title: string;
  body: string;
  figure?: string;
}) {
  return (
    <li className="h-full">
      <Reveal className="h-full">
        <article className="card-hard lift group relative flex h-full flex-col overflow-hidden p-5">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 right-2 font-display text-[5rem] leading-none text-ink/[0.07] transition-colors duration-300 group-hover:text-ink/[0.13]"
          >
            {n}
          </span>

          <span className="relative grid size-11 place-items-center rounded-lg border-[1.5px] border-line bg-card-2 text-ink">
            <Icon name={icon} className="size-5" />
          </span>

          <h3 className="relative mt-4 font-display text-[1.25rem] tracking-wide text-ink uppercase">
            {title}
          </h3>
          <p className="relative mt-2 text-[0.84rem] leading-relaxed text-ink-soft">
            {body}
          </p>

          {figure ? (
            <p className="relative mt-auto flex items-start gap-2 border-t-[1.5px] border-dashed border-line-soft pt-4 font-mono text-[0.74rem] leading-snug text-accent">
              <Icon name="zap" className="mt-px size-3.5 shrink-0" />
              {figure}
            </p>
          ) : null}
        </article>
      </Reveal>
    </li>
  );
}
