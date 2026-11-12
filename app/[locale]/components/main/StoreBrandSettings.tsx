"use client";

import React from "react";
import { Type } from "lucide-react";
import { useTranslations } from "next-intl";

type StoreBrandSettingsProps = {
  storeName: string;
  setStoreName: (name: string) => void;
};

export const StoreBrandSettings: React.FC<StoreBrandSettingsProps> = ({
  storeName,
  setStoreName,
}) => {
  const t = useTranslations("StoreEditor");

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2 shadow-lg">
      <label className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
        <Type className="w-4 h-4" /> {t("brandName")}
      </label>
      <input
        type="text"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        placeholder={t("brandPlaceholder")}
        className="w-full px-4 py-2.5 text-sm font-bold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
      />
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
        {t("brandHelp")}
      </p>
    </div>
  );
};
