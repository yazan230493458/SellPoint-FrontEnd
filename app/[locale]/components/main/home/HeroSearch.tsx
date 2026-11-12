"use client";

import { useTranslations } from "next-intl";
import MainSearch from "../../ui/MainSearch";

const HeroSearch = () => {
  const t = useTranslations("HomePage");

  return (
    <section className="relative flex w-full max-w-4xl flex-col items-center gap-6 px-4 text-center sm:px-6">
      <div className="absolute -top-24 size-72 rounded-full bg-zinc-400/10 blur-3xl pointer-events-none dark:bg-zinc-100/5" />

      <div className="relative space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-100">
          {t("searchTitle")}
        </h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-zinc-500 sm:text-lg dark:text-zinc-400">
          {t("searchDes")}
        </p>
      </div>

      <div className="w-full max-w-2xl transition-all duration-200 hover:scale-[1.01]">
        <MainSearch />
      </div>
    </section>
  );
};

export default HeroSearch;