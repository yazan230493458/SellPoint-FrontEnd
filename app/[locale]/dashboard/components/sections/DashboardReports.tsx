"use client";

import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardConfirm, Row } from "../types";
import ReportRow from "./reports/ReportRow";

type DashboardReportsProps = {
  rows: Row[];
  note: string;
  onNoteChange: (value: string) => void;
  ask: DashboardConfirm;
};

const DashboardReports = ({
  rows,
  note,
  onNoteChange,
  ask,
}: DashboardReportsProps) => {
  const t = useTranslations("Dashboard");

  return (
    <div className="space-y-3">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <Flag className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">{t("reportsPanelTitle")}</CardTitle>
            <CardDescription>{t("reportsPanelDescription")}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      {rows.map((row) => (
        <ReportRow
          key={String(row.id)}
          row={row}
          note={note}
          onNoteChange={onNoteChange}
          ask={ask}
        />
      ))}
    </div>
  );
};

export default DashboardReports;
