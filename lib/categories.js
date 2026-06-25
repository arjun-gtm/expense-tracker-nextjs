import {
  UtensilsCrossed,
  Car,
  Home,
  Clapperboard,
  Pill,
  ShoppingBag,
  FileText,
  Package,
} from "lucide-react";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Bills",
  "Other",
];

// Lucide icon + tailwind color accent per category for nicer visuals.
// `bar` is a raw hex used for chart fills (works in inline styles).
export const CATEGORY_META = {
  Food: { icon: UtensilsCrossed, color: "bg-orange-500/15 text-orange-500", bar: "#f97316" },
  Transport: { icon: Car, color: "bg-blue-500/15 text-blue-500", bar: "#3b82f6" },
  Housing: { icon: Home, color: "bg-purple-500/15 text-purple-500", bar: "#a855f7" },
  Entertainment: { icon: Clapperboard, color: "bg-pink-500/15 text-pink-500", bar: "#ec4899" },
  Health: { icon: Pill, color: "bg-emerald-500/15 text-emerald-500", bar: "#10b981" },
  Shopping: { icon: ShoppingBag, color: "bg-amber-500/15 text-amber-500", bar: "#f59e0b" },
  Bills: { icon: FileText, color: "bg-red-500/15 text-red-500", bar: "#ef4444" },
  Other: { icon: Package, color: "bg-zinc-500/15 text-zinc-400", bar: "#a1a1aa" },
};

export function getCategoryMeta(category) {
  return CATEGORY_META[category] ?? CATEGORY_META.Other;
}
