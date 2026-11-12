"use client";

import { usePathname } from "@/i18n/navigation";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import React from "react";
import { useTabStore } from "@/store/tabs.store";
import { useTranslations } from "next-intl";

export type ActiveTabType =
  | "Account"
  | "General"
  | "Safety & Privacy"
  | "Notifications"
  | "Favorites"
  | "Activity Log";

interface SettingsMenuProps {
  onSelect?: () => void;
}

const menuItems: { href: string; label: ActiveTabType }[] = [
  { href: "/settings/general", label: "General" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/safety-privacy", label: "Safety & Privacy" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/favorites", label: "Favorites" },
  { href: "/settings/activity-log", label: "Activity Log" },
];

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onSelect }) => {
  const { activeTab, setActiveTab } = useTabStore();
  const pathname = usePathname();
  const t = useTranslations("SettingsMenu");

  React.useEffect(() => {
    const matchedItem = menuItems.find((item) => pathname.includes(item.href));
    if (matchedItem) {
      setActiveTab(matchedItem.label);
    }
  }, [pathname, setActiveTab]);

  return (
    <nav className="flex flex-col gap-5 w-full">
      {menuItems.map((item) => {
        const isActive = activeTab === item.label;

        return (
          <BaseLink
            key={item.label}
            href={item.href}
            onClick={() => {
              setActiveTab(item.label);
              onSelect?.();
            }}
            className={`w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-start active:scale-[0.98] ${
              isActive
                ? "bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            {t(item.label)}
          </BaseLink>
        );
      })}
    </nav>
  );
};

export default SettingsMenu;
