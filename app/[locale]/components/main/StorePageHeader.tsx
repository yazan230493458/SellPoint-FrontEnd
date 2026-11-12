"use client";

import React from "react";
import { Layout, Eye, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";

type StorePageHeaderProps = {
  isPreview: boolean;
  onTogglePreview: () => void;
  onSave: () => void;
};

export const StorePageHeader: React.FC<StorePageHeaderProps> = ({
  isPreview,
  onTogglePreview,
  onSave,
}) => {
  const t = useTranslations("StoreEditor");

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <Layout className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
          <span>{t("customizeTitle")}</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          {t("customizeSubtitle")}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={onTogglePreview}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 font-semibold text-sm transition-colors duration-200 border border-zinc-200 dark:border-zinc-700 cursor-pointer shadow-lg"
        >
          <Eye className="w-4 h-4" />
          <span>{isPreview ? t("editMode") : t("livePreview")}</span>
        </Button>

        <Button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm transition-colors duration-200 shadow-lg cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-3" />
          <span>{t("saveLayout")}</span>
        </Button>
      </div>
    </div>
  );
};
