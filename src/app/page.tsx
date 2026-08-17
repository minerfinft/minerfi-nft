import { CommunityCta } from "@/components/CommunityCta";
import { Economy } from "@/components/Economy";
import { EmpirePath } from "@/components/EmpirePath";
import { Faq } from "@/components/Faq";
import { Footer } from "@/components/Footer";
import { GameplayLoop } from "@/components/GameplayLoop";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";
import { Marketplace } from "@/components/Marketplace";
import { Marquee } from "@/components/Marquee";
import { Navbar } from "@/components/Navbar";
import { Roadmap } from "@/components/Roadmap";
import { UtilityNfts } from "@/components/UtilityNfts";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        <Hero />
        <Marquee />
        <GameplayLoop />
        <UtilityNfts />
        <EmpirePath />
        <Economy />
        <Marketplace />
        <Leaderboard />
        <Roadmap />
        <Faq />
        <CommunityCta />
      </main>
      <Footer />
    </>
  );
}
