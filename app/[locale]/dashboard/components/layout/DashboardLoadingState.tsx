"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardLoadingState = () => {
  const t = useTranslations("Dashboard");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default DashboardLoadingState;
