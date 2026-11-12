"use client";

import { useTranslations } from "next-intl";

const StepIndicator = () => {
  const t = useTranslations("StepIndicator");

  return (
    <div className="mx-auto w-full max-w-md px-6">
      <div className="relative flex justify-between">
        <div className="absolute inset-x-0 top-5 h-px bg-zinc-300 dark:bg-zinc-700" />
        <div className="relative flex flex-col items-center gap-2 bg-transparent text-center">
          <span className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">1</span>
          <span className="text-sm text-zinc-900 dark:text-zinc-100">{t("adDetails")}</span>
        </div>
        <div className="relative flex flex-col items-center gap-2 bg-transparent text-center">
          <span className="z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">2</span>
          <span className="text-sm text-zinc-900 dark:text-zinc-100">{t("reviewAd")}</span>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;
