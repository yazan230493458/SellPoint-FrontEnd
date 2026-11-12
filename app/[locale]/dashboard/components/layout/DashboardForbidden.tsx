"use client";

import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../../../components/main/Header";

const DashboardForbidden = () => {
  const t = useTranslations("Dashboard");

  return (
    <main className="min-h-dvh bg-background px-4 pt-28">
      <Header className="fixed inset-x-3 top-5 z-50 h-20 rounded-xl border border-border bg-card/90 p-2 backdrop-blur-xl" />
      <Card className="mx-auto mt-12 max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle className="text-xl">{t("forbiddenTitle")}</CardTitle>
          <CardDescription>{t("forbiddenDescription")}</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </main>
  );
};

export default DashboardForbidden;
