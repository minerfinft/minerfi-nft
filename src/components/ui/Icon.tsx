import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpCircle,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Coins,
  Copy,
  Flame,
  Gift,
  Globe,
  Hammer,
  Heart,
  Hotel,
  Layers,
  Lock,
  Map,
  Menu,
  Moon,
  Package,
  Pickaxe,
  Play,
  Scroll,
  Search,
  Shield,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Store,
  Sun,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

/* Lucide dropped its brand glyphs in v1, so X and GitHub are drawn here. */

const XLogo: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.66l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.01 4.13H5.05l12.03 15.64Z" />
  </svg>
);

const GithubLogo: Glyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .3.21.66.8.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

export const ICONS = {
  coffee: Coffee,
  utensils: UtensilsCrossed,
  hotel: Hotel,
  building: Building2,
  globe: Globe,
  store: Store,
  users: Users,
  wrench: Wrench,
  map: Map,
  truck: Truck,
  gift: Gift,
  userRound: UserRound,
  cart: ShoppingCart,
  hammer: Hammer,
  coins: Coins,
  arrowUp: ArrowUpCircle,
  swap: ArrowLeftRight,
  trophy: Trophy,
  package: Package,
  scroll: Scroll,
  shield: Shield,
  sparkles: Sparkles,
  zap: Zap,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  filter: SlidersHorizontal,
  heart: Heart,
  sun: Sun,
  moon: Moon,
  search: Search,
  wallet: Wallet,
  menu: Menu,
  close: X,
  check: Check,
  copy: Copy,
  badge: BadgeCheck,
  lock: Lock,
  flame: Flame,
  clock: Clock,
  up: TrendingUp,
  down: TrendingDown,
  play: Play,
  layers: Layers,
  pickaxe: Pickaxe,
  x: XLogo,
  github: GithubLogo,
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className = "size-5",
  ...rest
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  const Glyph = ICONS[name];
  return <Glyph className={className} aria-hidden {...rest} />;
}
