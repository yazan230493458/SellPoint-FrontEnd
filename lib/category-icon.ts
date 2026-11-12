import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Briefcase,
  Camera,
  Car,
  Gamepad2,
  Home,
  Laptop,
  LayoutGrid,
  Music,
  PawPrint,
  Plane,
  Shirt,
  Store,
  Tag,
  Trophy,
  UtensilsCrossed,
  Watch,
  Wrench,
} from "lucide-react";

const rules: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /(car|auto|vehicle|motor)/i, icon: Car },
  { match: /(real.?estate|propert|home|house|villa|apart)/i, icon: Home },
  { match: /(electronic|laptop|computer|gadget|phone|tablet)/i, icon: Laptop },
  { match: /(fashion|cloth|shirt|wear|apparel)/i, icon: Shirt },
  { match: /(job|career|work|employ)/i, icon: Briefcase },
  { match: /(service|repair|professional)/i, icon: Wrench },
  { match: /(sport|fitness|gym)/i, icon: Trophy },
  { match: /(pet|animal)/i, icon: PawPrint },
  { match: /(game|gaming|console)/i, icon: Gamepad2 },
  { match: /(book|educat|school)/i, icon: BookOpen },
  { match: /(business|shop|store|retail)/i, icon: Store },
  { match: /(health|beauty|care|wellness)/i, icon: Activity },
  { match: /(travel|tourism|trip)/i, icon: Plane },
  { match: /(camera|photo|media)/i, icon: Camera },
  { match: /(music|audio|sound)/i, icon: Music },
  { match: /(watch|jewel|luxury)/i, icon: Watch },
  { match: /(food|dining|restaurant|kitchen)/i, icon: UtensilsCrossed },
];

export const iconForCategory = (slug: string, name: string): LucideIcon => {
  const haystack = `${slug} ${name}`;
  for (const rule of rules) {
    if (rule.match.test(haystack)) return rule.icon;
  }
  return Tag;
};

export const AllCategoriesIcon = LayoutGrid;
