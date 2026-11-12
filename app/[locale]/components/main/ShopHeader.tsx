"use client";

import React from "react";
import { ShoppingCart, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";

type ShopHeaderProps = {
  storeName?: string;
  navAlignment?: "left" | "center" | "right";
  navButtons?: Array<{ id: string; label: string }>;
  rightNavButtons?: Array<{ id: string; label: string }>;
  totalCartCount?: number;
  setIsCartOpen?: (isOpen: boolean) => void;
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
};

export default function ShopHeader({
  storeName,
  navAlignment = "center",
  navButtons = [],
  rightNavButtons = [],
  totalCartCount = 0,
  setIsCartOpen = () => {},
  searchTerm = "",
  onSearchChange = () => {},
}: ShopHeaderProps) {
  const t = useTranslations("Storefront");
  const resolvedStoreName = storeName || t("storeWord");
  const alignmentClass =
    navAlignment === "left"
      ? "justify-start"
      : navAlignment === "right"
        ? "justify-end"
        : "justify-center";

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
      <div className="text-base font-black tracking-wider text-zinc-900 dark:text-zinc-100">
        {resolvedStoreName}
      </div>

      <nav
        className={`flex items-center gap-6 flex-1 ${alignmentClass} text-xs font-semibold text-zinc-600 dark:text-zinc-300`}
      >
        {navButtons.map((btn) => (
          <span
            key={btn.id}
            className="cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            {btn.label}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative w-36 sm:w-44">
          <span className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchProduct")}
            aria-label={t("searchProduct")}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-[11px] outline-none transition-all focus:border-zinc-400"
          />
        </div>

        {rightNavButtons.map((btn) => (
          <Button
            key={btn.id}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold cursor-pointer"
          >
            {btn.label}
          </Button>
        ))}

        <Button
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label={t("openCart")}
          className="relative p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalCartCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
}
