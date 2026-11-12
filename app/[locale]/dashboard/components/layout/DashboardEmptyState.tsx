"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

const DashboardEmptyState = () => {
  const t = useTranslations("Dashboard");

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-muted-foreground">{t("empty")}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardEmptyState;
