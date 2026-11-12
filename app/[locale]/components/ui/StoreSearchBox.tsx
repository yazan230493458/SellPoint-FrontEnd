"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

type StoreSearchBoxProps = {
  searchTerm: string;
  onSearchChange: (term: string) => void;
};

const StoreSearchBox: React.FC<StoreSearchBoxProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const t = useTranslations("StorePage");

  return (
    <div className="relative w-full max-w-md mx-auto my-4">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400">
        <Search className="w-4 h-4" />
      </span>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t("productSearchPlaceholder")}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs outline-none shadow-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
      />
    </div>
  );
};

export default StoreSearchBox;
