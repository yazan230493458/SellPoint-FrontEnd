"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoadingHint = () => {
  const t = useTranslations("Dashboard");

  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
      <Skeleton className="size-4 rounded-full" />
      <p className="text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  );
};

export default DashboardLoadingHint;
