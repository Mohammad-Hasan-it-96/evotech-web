import {
  Truck,
  Receipt,
  BookOpen,
  UtensilsCrossed,
  Pill,
  Globe,
  Smartphone,
  Boxes,
  Palette,
  Cloud,
  LifeBuoy,
  ShieldCheck,
  Gauge,
  Sparkles,
  Headset,
  type LucideProps,
} from "lucide-react";

/** Maps content icon names (strings) to Lucide components — keeps content data UI-agnostic. */
const registry = {
  truck: Truck,
  receipt: Receipt,
  book: BookOpen,
  utensils: UtensilsCrossed,
  pill: Pill,
  globe: Globe,
  smartphone: Smartphone,
  boxes: Boxes,
  palette: Palette,
  cloud: Cloud,
  lifebuoy: LifeBuoy,
  shield: ShieldCheck,
  gauge: Gauge,
  sparkles: Sparkles,
  headset: Headset,
} as const;

export type IconName = keyof typeof registry;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = registry[name as IconName] ?? Sparkles;
  return <Cmp {...props} />;
}
