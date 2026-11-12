"use client";

import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import { MoveLeft, Home, Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "./components/ui/Button";

const NotFound = () => {
  const t = useTranslations("NotFound");

  return (
    <div className="relative flex items-center justify-center min-h-dvh w-full overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-2xl px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-indigo-400 backdrop-blur-md mb-8 shadow-inner">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>{t("badge")}</span>
        </div>

        <div className="relative select-none">
          <h1 className="text-[140px] sm:text-[180px] font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-sm">
            404
          </h1>
          <div className="absolute -inset-1 blur-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 -z-10 opacity-50" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
          {t("title")}
        </h2>

        <p className="text-base text-zinc-400 max-w-md mt-4 font-normal leading-relaxed">
          {t("description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-10">
          <BaseLink
            href="/"
            className="group relative flex items-center justify-center gap-2.5 h-12 px-8 w-full sm:w-auto rounded-xl font-medium text-sm text-zinc-950 bg-white hover:bg-zinc-100 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.15)] hover:shadow-[0_0_35px_rgba(255,255,255,0.25)] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>{t("returnHome")}</span>
          </BaseLink>

          <Button
            onClick={() => window.history.back()}
            type="button"
            className="flex items-center justify-center gap-2.5 h-12 px-8 w-full sm:w-auto rounded-xl font-medium text-sm text-zinc-300 bg-zinc-900/80 border border-zinc-800/80 hover:bg-zinc-800/80 hover:text-white transition-all duration-300 backdrop-blur-sm active:scale-[0.98]"
          >
            <MoveLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t("goBack")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
