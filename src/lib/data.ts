/**
 * Single source of truth for every piece of copy and game data on the landing page.
 * Kept plain/serializable on purpose — swap it for a CMS or an API later without
 * touching a single component.
 */

import type { IconName } from "@/components/ui/Icon";

/* ---------------------------------------------------------------- nav ---- */

/* Anything not starting with "#" is a real route and is rendered with <Link>. */
export const NAV_LINKS = [
  { label: "Gameplay", href: "#gameplay" },
  { label: "Utility NFT", href: "#utility" },
  { label: "Marketplace", href: "#marketplace" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Dashboard", href: "/app" },
] as const;

/* --------------------------------------------------------------- hero ---- */

export const HERO_STATS = [
  { value: "7", label: "Utility NFT types" },
  { value: "42K+", label: "Businesses running" },
  { value: "18K+", label: "Active tycoons" },
] as const;

export const MARQUEE_ITEMS = [
  "NFT = OWNERSHIP",
  "NFT = UTILITY",
  "NFT = YOUR BUSINESS",
  "BUILD · UPGRADE · EXPAND",
  "PLAY TO OWN",
] as const;

/* ------------------------------------------------- business progression --- */

export type Tier = {
  id: string;
  tier: number;
  name: string;
  icon: IconName;
  entry: string;
  yieldPerDay: string;
  blurb: string;
  slots: { label: string; value: string }[];
  unlocks: string;
};

export const TIERS: Tier[] = [
  {
    id: "coffee-shop",
    tier: 1,
    name: "Coffee Shop",
    icon: "coffee",
    entry: "0.05 ETH",
    yieldPerDay: "120",
    blurb:
      "Your first door. One counter, two hands, and a queue that never quite ends.",
    slots: [
      { label: "Worker slots", value: "2" },
      { label: "Equipment", value: "1" },
      { label: "Land", value: "—" },
    ],
    unlocks: "Unlocks: crafting bench, daily contracts",
  },
  {
    id: "restaurant",
    tier: 2,
    name: "Restaurant",
    icon: "utensils",
    entry: "0.18 ETH",
    yieldPerDay: "480",
    blurb:
      "Bigger kitchen, bigger margins. Shift scheduling starts to matter here.",
    slots: [
      { label: "Worker slots", value: "5" },
      { label: "Equipment", value: "3" },
      { label: "Vehicles", value: "1" },
    ],
    unlocks: "Unlocks: supply chain, worker specialisation",
  },
  {
    id: "hotel",
    tier: 3,
    name: "Hotel",
    icon: "hotel",
    entry: "0.60 ETH",
    yieldPerDay: "1,750",
    blurb:
      "Occupancy becomes the game. Location multipliers finally pay for themselves.",
    slots: [
      { label: "Worker slots", value: "12" },
      { label: "Equipment", value: "6" },
      { label: "Land plots", value: "1" },
    ],
    unlocks: "Unlocks: Land NFT staking, regional demand events",
  },
  {
    id: "corporation",
    tier: 4,
    name: "Corporation",
    icon: "building",
    entry: "2.10 ETH",
    yieldPerDay: "6,400",
    blurb:
      "You stop running shops and start running managers. Delegation is the upgrade.",
    slots: [
      { label: "Worker slots", value: "40" },
      { label: "Equipment", value: "18" },
      { label: "Land plots", value: "4" },
    ],
    unlocks: "Unlocks: subsidiaries, bulk crafting, treasury",
  },
  {
    id: "global-empire",
    tier: 5,
    name: "Global Empire",
    icon: "globe",
    entry: "7.50 ETH",
    yieldPerDay: "24,000",
    blurb:
      "Multi-region operations, seasonal wars, and a seat at the governance table.",
    slots: [
      { label: "Worker slots", value: "∞" },
      { label: "Equipment", value: "∞" },
      { label: "Regions", value: "6" },
    ],
    unlocks: "Unlocks: DAO voting, season rewards, empire alliances",
  },
];

/* -------------------------------------------------------- utility NFTs --- */

export type NftType = {
  id: string;
  name: string;
  tagline: string;
  icon: IconName;
  description: string;
  stats: { label: string; value: string }[];
  accent: "green" | "deep" | "mint" | "amber" | "coral";
};

export const NFT_TYPES: NftType[] = [
  {
    id: "shop",
    name: "Shop NFT",
    tagline: "Own and run your business",
    icon: "store",
    description:
      "The core asset. Every shop produces resources on a real timer, holds worker and equipment slots, and carries its upgrade history on-chain.",
    stats: [
      { label: "Base yield", value: "120–24K/day" },
      { label: "Tiers", value: "5" },
      { label: "Upgradeable", value: "Yes" },
    ],
    accent: "green",
  },
  {
    id: "worker",
    name: "Worker NFT",
    tagline: "Hire staff with different skills",
    icon: "users",
    description:
      "Barista, chef, manager, engineer — each has a skill class, a stamina pool, and a salary. Match the right worker to the right shop and output compounds.",
    stats: [
      { label: "Skill classes", value: "9" },
      { label: "Stamina", value: "Regenerates" },
      { label: "Salary", value: "Paid in $MINE" },
    ],
    accent: "mint",
  },
  {
    id: "equipment",
    name: "Equipment NFT",
    tagline: "Boost business performance",
    icon: "wrench",
    description:
      "Espresso machines, kitchen lines, server racks. Equipment applies a flat multiplier to output and wears down — repair it or craft a better one.",
    stats: [
      { label: "Output boost", value: "+8% – +145%" },
      { label: "Durability", value: "Repairable" },
      { label: "Craftable", value: "Yes" },
    ],
    accent: "amber",
  },
  {
    id: "land",
    name: "Land NFT",
    tagline: "Unlock new locations",
    icon: "map",
    description:
      "Land decides your foot traffic. High-demand districts cost more but multiply every shop built on them, and plots can be leased to other players.",
    stats: [
      { label: "Regions", value: "6" },
      { label: "Traffic mult.", value: "1.1× – 3.4×" },
      { label: "Leasable", value: "Yes" },
    ],
    accent: "deep",
  },
  {
    id: "vehicle",
    name: "Vehicle NFT",
    tagline: "Expand operational reach",
    icon: "truck",
    description:
      "Move goods between your locations, fulfil delivery contracts, and cut restock time. Fleet size is what turns several shops into one network.",
    stats: [
      { label: "Capacity", value: "40 – 900 units" },
      { label: "Range", value: "1 – 6 regions" },
      { label: "Fuel", value: "$MINE" },
    ],
    accent: "green",
  },
  {
    id: "mystery-box",
    name: "Mystery Box NFT",
    tagline: "Discover rare assets",
    icon: "gift",
    description:
      "A sealed, tradeable box with a published drop table. Open it for anything from a spare part to a Mythic corner-lot deed — odds are verifiable on-chain.",
    stats: [
      { label: "Drop table", value: "Public" },
      { label: "Randomness", value: "VRF-verified" },
      { label: "Mythic odds", value: "0.4%" },
    ],
    accent: "coral",
  },
  {
    id: "character",
    name: "Character NFT",
    tagline: "Build and upgrade your tycoon",
    icon: "userRound",
    description:
      "You, in-game. Levels up from every action, carries perk trees for negotiation, logistics and crafting, and gates the highest business tiers.",
    stats: [
      { label: "Max level", value: "60" },
      { label: "Perk trees", value: "3" },
      { label: "Soulbound", value: "Optional" },
    ],
    accent: "deep",
  },
];

/* ------------------------------------------------------- gameplay loop --- */

export type LoopStep = {
  step: string;
  title: string;
  icon: IconName;
  text: string;
};

export const LOOP_STEPS: LoopStep[] = [
  {
    step: "01",
    title: "Buy NFT",
    icon: "cart",
    text: "Mint or buy a Shop NFT on the marketplace. That deed is your entry point.",
  },
  {
    step: "02",
    title: "Build Business",
    icon: "hammer",
    text: "Slot in workers and equipment, set the shift, and open the doors.",
  },
  {
    step: "03",
    title: "Earn Resources",
    icon: "coins",
    text: "Production runs on a real clock. Claim $MINE and raw materials as they accrue.",
  },
  {
    step: "04",
    title: "Upgrade",
    icon: "arrowUp",
    text: "Spend resources to craft better equipment and push your shop to the next tier.",
  },
  {
    step: "05",
    title: "Expand",
    icon: "map",
    text: "Buy Land, open a second location, and add vehicles to link them together.",
  },
  {
    step: "06",
    title: "Trade",
    icon: "swap",
    text: "List any asset on the marketplace. Workers, parts and deeds all hold value.",
  },
  {
    step: "07",
    title: "Compete",
    icon: "trophy",
    text: "Climb the seasonal leaderboard for rewards, rare drops and DAO weight.",
  },
];

/* --------------------------------------------------------- marketplace --- */

export type Rarity = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export type Listing = {
  id: string;
  name: string;
  type: "Shop" | "Worker" | "Equipment" | "Land" | "Vehicle" | "Character";
  icon: IconName;
  rarity: Rarity;
  price: string;
  yieldLabel: string;
  seller: string;
  endsIn: string;
  featured?: boolean;
};

export const LISTINGS: Listing[] = [
  {
    id: "l1",
    name: "Downtown Espresso Bar",
    type: "Shop",
    icon: "store",
    rarity: "Rare",
    price: "0.42",
    yieldLabel: "310 $MINE / day",
    seller: "0xA4…9F2c",
    endsIn: "02h 35m 30s",
    featured: true,
  },
  {
    id: "l2",
    name: "Head Chef — Mira Sato",
    type: "Worker",
    icon: "users",
    rarity: "Epic",
    price: "0.86",
    yieldLabel: "+34% kitchen output",
    seller: "0x7B…14aE",
    endsIn: "05h 12m 04s",
  },
  {
    id: "l3",
    name: "Industrial Roaster Mk III",
    type: "Equipment",
    icon: "wrench",
    rarity: "Legendary",
    price: "1.24",
    yieldLabel: "+78% brew speed",
    seller: "0x1C…88bD",
    endsIn: "11h 47m 19s",
  },
  {
    id: "l4",
    name: "Harbor District — Plot 14",
    type: "Land",
    icon: "map",
    rarity: "Mythic",
    price: "3.90",
    yieldLabel: "3.1× traffic multiplier",
    seller: "0xF0…5d31",
    endsIn: "00h 58m 42s",
    featured: true,
  },
  {
    id: "l5",
    name: "Cargo Van — Series 7",
    type: "Vehicle",
    icon: "truck",
    rarity: "Common",
    price: "0.09",
    yieldLabel: "120 units capacity",
    seller: "0x33…c7A9",
    endsIn: "08h 21m 55s",
  },
  {
    id: "l6",
    name: "Tycoon Avatar — Lv. 38",
    type: "Character",
    icon: "userRound",
    rarity: "Epic",
    price: "1.67",
    yieldLabel: "Logistics perk tree II",
    seller: "0x9E…0b6F",
    endsIn: "03h 09m 27s",
  },
  {
    id: "l7",
    name: "Boutique Hotel — Riverside",
    type: "Shop",
    icon: "hotel",
    rarity: "Legendary",
    price: "2.35",
    yieldLabel: "1,910 $MINE / day",
    seller: "0x5D…af02",
    endsIn: "06h 44m 11s",
  },
  {
    id: "l8",
    name: "Night Shift Barista ×3",
    type: "Worker",
    icon: "users",
    rarity: "Common",
    price: "0.03",
    yieldLabel: "+9% off-peak output",
    seller: "0x2A…71Cc",
    endsIn: "01h 16m 38s",
  },
];

export const MARKET_FILTERS = [
  "All items",
  "Shop",
  "Worker",
  "Equipment",
  "Land",
  "Vehicle",
  "Character",
] as const;

export const SORT_OPTIONS = [
  "Recently added",
  "Highest price",
  "Lowest price",
  "Ending soonest",
] as const;

/* ---------------------------------------------------------- leaderboard -- */

export type Tycoon = {
  rank: number;
  name: string;
  wallet: string;
  empire: string;
  businesses: number;
  netWorth: string;
  change: string;
  up: boolean;
};

export const LEADERBOARD: Tycoon[] = [
  {
    rank: 1,
    name: "kaizen.eth",
    wallet: "0xA4…9F2c",
    empire: "Global Empire",
    businesses: 214,
    netWorth: "1.42M",
    change: "+12.4%",
    up: true,
  },
  {
    rank: 2,
    name: "NoctuaLabs",
    wallet: "0x7B…14aE",
    empire: "Global Empire",
    businesses: 187,
    netWorth: "1.18M",
    change: "+8.1%",
    up: true,
  },
  {
    rank: 3,
    name: "sora_builds",
    wallet: "0x1C…88bD",
    empire: "Corporation",
    businesses: 143,
    netWorth: "902K",
    change: "-2.3%",
    up: false,
  },
  {
    rank: 4,
    name: "Baristocracy",
    wallet: "0xF0…5d31",
    empire: "Corporation",
    businesses: 128,
    netWorth: "774K",
    change: "+19.6%",
    up: true,
  },
  {
    rank: 5,
    name: "hollow.mint",
    wallet: "0x33…c7A9",
    empire: "Hotel",
    businesses: 96,
    netWorth: "531K",
    change: "+4.0%",
    up: true,
  },
];

export const SEASON = {
  name: "Season 2 — Harbor Expansion",
  endsIn: "18d 04h",
  prizePool: "420,000 $MINE",
} as const;

/* ------------------------------------------------------------- economy --- */

export const RESOURCES = [
  {
    name: "$MINE",
    icon: "coins" as IconName,
    role: "Core currency",
    text: "Earned from production. Pays salaries, crafting fees and upgrades.",
  },
  {
    name: "Materials",
    icon: "package" as IconName,
    role: "Crafting input",
    text: "Steel, beans, textiles. Produced by shops, consumed by the crafting bench.",
  },
  {
    name: "Blueprints",
    icon: "scroll" as IconName,
    role: "Recipes",
    text: "Unlock higher-tier equipment. Dropped by contracts and Mystery Boxes.",
  },
  {
    name: "Reputation",
    icon: "shield" as IconName,
    role: "Soulbound score",
    text: "Non-transferable. Gates premium land auctions and seasonal brackets.",
  },
] as const;

/* ------------------------------------------------------------- roadmap --- */

export const ROADMAP = [
  {
    phase: "Phase 01",
    title: "Foundation",
    status: "done" as const,
    items: [
      "Genesis Shop NFT mint",
      "Worker & Equipment contracts audited",
      "Core production loop live on testnet",
    ],
  },
  {
    phase: "Phase 02",
    title: "Economy",
    status: "live" as const,
    items: [
      "$MINE token + in-game sinks",
      "Marketplace with royalties",
      "Crafting bench & blueprints",
    ],
  },
  {
    phase: "Phase 03",
    title: "Expansion",
    status: "next" as const,
    items: [
      "Land auctions across 6 regions",
      "Vehicle fleets & delivery contracts",
      "Seasonal leaderboard with prize pool",
    ],
  },
  {
    phase: "Phase 04",
    title: "Empire",
    status: "next" as const,
    items: [
      "Guild alliances & territory wars",
      "DAO governance over emissions",
      "Mobile client",
    ],
  },
];

/* ----------------------------------------------------------------- faq --- */

export const FAQ = [
  {
    q: "What actually makes these NFTs \"utility\" NFTs?",
    a: "Every asset does a job inside the simulation. A Shop produces on a timer, a Worker adds a skill multiplier, Equipment raises output, Land sets your traffic multiplier. Remove the NFT and the business stops producing — the token is the mechanic, not a picture attached to one.",
  },
  {
    q: "Do I need crypto experience to start?",
    a: "No. You can sign in with an email and we create a wallet for you in the background. Connecting an existing wallet is optional, and you can export your keys at any point.",
  },
  {
    q: "How much does it cost to begin?",
    a: "A Tier 1 Coffee Shop starts around 0.05 ETH on the marketplace. There is also a free trial shop that lets you run the full production loop for seven days before you buy anything.",
  },
  {
    q: "Can I sell a business I already upgraded?",
    a: "Yes. Upgrade history, installed equipment and assigned workers travel with the Shop NFT, which is why upgraded shops trade at a premium. You can also unbundle and sell the parts separately.",
  },
  {
    q: "What stops the economy from inflating?",
    a: "$MINE is burned by salaries, repairs, crafting and tier upgrades, and emissions taper each season. The DAO votes on the emission curve from Phase 04 onward.",
  },
  {
    q: "Which chain are you on?",
    a: "An Ethereum L2 for low fees and fast confirmations, with contracts audited before each major release. Bridging is handled in-app.",
  },
];

/* -------------------------------------------------------------- footer --- */

export const FOOTER_COLUMNS = [
  {
    title: "Game",
    links: ["Gameplay", "Utility NFT", "Business tiers", "Crafting", "Seasons"],
  },
  {
    title: "Marketplace",
    links: ["Browse all", "Shops", "Workers", "Land", "Mystery Box"],
  },
  {
    title: "Community",
    links: ["Discord", "X / Twitter", "Telegram", "Blog", "Creator program"],
  },
  {
    title: "Company",
    links: ["About", "Whitepaper", "Audits", "Careers", "Press kit"],
  },
] as const;

export const SOCIALS = [
  { label: "X", icon: "x" as IconName, href: "#" },
  { label: "Discord", icon: "discord" as IconName, href: "#" },
  { label: "Telegram", icon: "send" as IconName, href: "#" },
  { label: "GitHub", icon: "github" as IconName, href: "#" },
];
