"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardConfirmDialogProps = {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const DashboardConfirmDialog = ({
  title,
  onCancel,
  onConfirm,
}: DashboardConfirmDialogProps) => {
  const t = useTranslations("Dashboard");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-confirm-title"
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle id="dashboard-confirm-title">{title}</CardTitle>
          <CardDescription>{t("confirm")}</CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="justify-end gap-3 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("cancel")}
          </Button>
          <Button type="button" onClick={onConfirm}>
            {t("confirm")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DashboardConfirmDialog;
