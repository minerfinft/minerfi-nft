import type { Metadata, Viewport } from "next";
import { Unica_One, Montserrat, JetBrains_Mono } from "next/font/google";
import { Web3Provider } from "@/components/web3/Web3Provider";
import "./globals.css";

/* Display face lifted straight from the reference: condensed, quirky, all-caps. */
const unica = Unica_One({
  variable: "--font-unica",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

/* Reserved for on-chain data: balances, yields, wallet addresses, timers. */
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const SITE = "https://minerfinft.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "MinerFi — NFT Business Tycoon",
    template: "%s · MinerFi",
  },
  description:
    "A Web3 tycoon game where every NFT does a job. Buy a coffee shop, hire workers, upgrade equipment, claim land, and grow it into a global empire. NFT = Ownership. NFT = Utility. NFT = Your Business.",
  keywords: [
    "NFT game",
    "Web3 tycoon",
    "utility NFT",
    "play to own",
    "business simulation",
    "MinerFi",
    "NFT marketplace",
  ],
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "MinerFi",
    title: "MinerFi — NFT Business Tycoon",
    description:
      "Every NFT has a real function. Build from a coffee shop to a global empire.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MinerFi — NFT Business Tycoon",
    description:
      "Every NFT has a real function. Build from a coffee shop to a global empire.",
  },
  /* No `icons` or `images` entries on purpose — app/icon.png,
     opengraph-image.png and twitter-image.png are picked up by the file
     conventions, so the tab mark and the share card are all cut from the one
     brand logo. Explicit metadata here would override them.
     Regenerate: `node scripts/make-logo-asset.mjs` for the mark itself, then
     `node scripts/generate-og.mjs` for the cards. */
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e0b" },
  ],
};

/**
 * Runs before first paint so the saved theme is applied without a flash.
 * Kept in sync with the storage key + class used by <ThemeToggle />.
 */
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("minerfi-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${unica.variable} ${montserrat.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:border-[1.5px] focus:border-line focus:bg-green focus:px-4 focus:py-2 focus:font-semibold focus:text-on-bright"
        >
          Skip to content
        </a>
        {/* Wraps everything so the wallet session survives the move from the
            marketing pages into /app. */}
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
