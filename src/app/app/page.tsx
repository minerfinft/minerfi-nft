import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SectionHeading } from "@/components/ui/Section";
import { HolderSummary } from "@/components/web3/HolderSummary";
import { HowItWorks } from "@/components/web3/HowItWorks";
import { MintPanel } from "@/components/web3/MintPanel";
import { Portfolio } from "@/components/web3/Portfolio";
import { ProtocolStats } from "@/components/web3/ProtocolStats";
import { WalletGate } from "@/components/web3/WalletGate";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your MinerFi empire on-chain: live GOLD accrual, per-business production, and minting straight from the contract.",
  /* Nothing to index here — the page is empty without a wallet, and every
     number on it belongs to one address. */
  robots: { index: false, follow: true },
};

/**
 * The dApp half of the site.
 *
 * Kept a server component even though everything inside it is interactive: the
 * shell, headings and copy still ship as static HTML, and only the four panels
 * that actually talk to a chain hydrate.
 *
 * Note the order — portfolio, then the explainer, then the shop. A returning
 * holder's own numbers are what they came for, so those stay at the top; but a
 * first-timer meets the explanation before the thing that asks them to spend,
 * which is the order those two audiences can actually share.
 *
 * The blocks are stacked inside one container with a gap rather than wrapped in
 * <Section> each. Section carries its own vertical padding, which is right when
 * it is one band among many on the landing page and doubles up here.
 */
export default function DashboardPage() {
  return (
    <>
      <Navbar />

      {/* Top padding clears the fixed navbar, matching <Hero>. */}
      <main id="main" className="flex-1 pt-[7.5rem] pb-24 lg:pt-[9.5rem] lg:pb-32">
        <div className="container-mf flex flex-col gap-20 lg:gap-28">
          <section id="dashboard">
            <SectionHeading
              eyebrow="Dashboard"
              eyebrowIcon="pickaxe"
              title="Your"
              accent="empire"
              description="Every figure here is read straight from the contracts — no indexer, no backend. GOLD accrues by the second and is minted at claim time for exactly the seconds you held."
            />

            <div className="mt-12 flex flex-col gap-14">
              <WalletGate>
                <HolderSummary />
                <Portfolio />
              </WalletGate>
            </div>
          </section>

          <section id="how-it-works">
            <SectionHeading
              eyebrow="How it works"
              eyebrowIcon="scroll"
              title="The whole thing in"
              accent="six steps"
              description="No jargon and no prior crypto experience assumed. If anything below is unclear, that is a fault of this page rather than something you were supposed to already know."
            />

            <div className="mt-12">
              <HowItWorks />
            </div>
          </section>

          <section id="mint">
            <SectionHeading
              eyebrow="Mint"
              eyebrowIcon="hammer"
              title="Open a"
              accent="new business"
              description="Prices, yields and remaining supply come off the chain in a single call. A deed starts producing the block it is minted, stays in your wallet, and stays tradeable the whole time."
            />

            <div className="mt-12">
              <MintPanel />
            </div>
          </section>

          <ProtocolStats />
        </div>
      </main>

      <Footer />
    </>
  );
}
