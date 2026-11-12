"use client";

import React, { useEffect } from "react";
import AccountBox from "../components/ui/AccountBox";
import SettingsMenu from "../components/ui/SettingsMenu";
import BaseLink from "../components/ui/BaseLink";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { useSessionGate } from "@/lib/use-hydrated";

type SettingsPageProps = {
  children?: React.ReactNode;
  className?: string;
};

const SettingsPage = ({ children, className }: SettingsPageProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("SettingsMenu");
  const isIndex = pathname === "/settings";
  const { pending, user, isAuthenticated } = useSessionGate();

  useEffect(() => {
    if (!isIndex) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const openGeneral = () => {
      if (media.matches) router.replace("/settings/general");
    };
    openGeneral();
    media.addEventListener("change", openGeneral);
    return () => media.removeEventListener("change", openGeneral);
  }, [isIndex, router]);

  if (pending) return null;
  if (!user || !isAuthenticated) {
    redirect("/log-in");
  }

  return (
    <div className="flex min-h-dvh w-full min-w-0 flex-col gap-4 transition-colors duration-200 sm:gap-5 p-5 lg:flex-row">
      <aside
        className={`${
          isIndex ? "flex" : "hidden"
        } w-full min-w-0 shrink-0 flex-col gap-5 lg:flex lg:w-80 xl:w-96`}
      >
        <AccountBox />
        <SettingsMenu />
      </aside>
      <main
        className={`${className ?? ""} ${
          isIndex ? "hidden" : "flex"
        } min-w-0 w-full flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-zinc-100 p-4 shadow-sm sm:p-5 lg:flex dark:border-zinc-700/30 dark:bg-zinc-800`}
      >
        <BaseLink
          href="/settings"
          className="inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200/80 lg:hidden dark:text-zinc-200 dark:hover:bg-zinc-700/60"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToMenu")}
        </BaseLink>
        {children}
      </main>
    </div>
  );
};

export default SettingsPage;
