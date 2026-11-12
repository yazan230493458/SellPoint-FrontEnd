import {
  CreditCard,
  Flag,
  FolderTree,
  History,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Receipt,
  Mail,
  Settings,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Section =
  | "overview"
  | "users"
  | "administrators"
  | "advertisements"
  | "reports"
  | "categories"
  | "comments"
  | "reviews"
  | "subscriptions"
  | "payments"
  | "inbox"
  | "settings"
  | "audit";

export type Row = Record<string, unknown>;

export type CategoryDraft = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: string;
};

export type DashboardAction = (request: () => Promise<void>) => Promise<void>;

export type DashboardConfirm = (
  title: string,
  run: () => Promise<void>,
) => void;

export const sections: Section[] = [
  "overview",
  "reports",
  "users",
  "administrators",
  "advertisements",
  "comments",
  "reviews",
  "categories",
  "subscriptions",
  "payments",
  "inbox",
  "settings",
  "audit",
];

export const sectionIcons: Record<Section, LucideIcon> = {
  overview: LayoutDashboard,
  users: Users,
  administrators: ShieldCheck,
  advertisements: Megaphone,
  reports: Flag,
  categories: FolderTree,
  comments: MessageSquare,
  reviews: Star,
  subscriptions: CreditCard,
  payments: Receipt,
  inbox: Mail,
  settings: Settings,
  audit: History,
};
