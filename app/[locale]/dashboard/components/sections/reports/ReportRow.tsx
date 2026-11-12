"use client";

import { CheckCircle2, ExternalLink, Flag, XCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocaleIntl } from "@/i18n/locales";
import { Link } from "@/i18n/navigation";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import type { DashboardConfirm, Row } from "../../types";

type ReportRowProps = {
  row: Row;
  note: string;
  onNoteChange: (value: string) => void;
  ask: DashboardConfirm;
};

const statusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  const normalized = status.toUpperCase();
  if (normalized === "RESOLVED") return "default";
  if (normalized === "DISMISSED") return "outline";
  if (normalized === "REVIEWING") return "secondary";
  return "destructive";
};

const resolveAdvertisementId = (row: Row) => {
  if (String(row.targetType ?? "").toUpperCase() !== "AD") return null;
  const raw = row.targetId;
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return String(id);
};

const ReportRow = ({ row, note, onNoteChange, ask }: ReportRowProps) => {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const status = String(row.status ?? "");
  const advertisementId = resolveAdvertisementId(row);
  const createdAt = row.createdAt
    ? new Date(String(row.createdAt)).toLocaleString(getLocaleIntl(locale), {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-sm leading-6">
            <Flag className="size-4 text-destructive" />
            <span>
              {String(row.targetType)} ·{" "}
              {String(row.targetName ?? row.targetId)} · {String(row.reason)}
            </span>
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t("reporter")}:{" "}
            {String(
              (row.reporter as { username?: string } | undefined)?.username ??
                "",
            )}
            {createdAt ? ` · ${createdAt}` : ""}
          </p>
        </div>
        <Badge variant={statusVariant(status)}>
          {status
            ? t(`status_${status}` as "status_PENDING")
            : t("status_PENDING")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {String(row.description ?? "")}
        </p>
        <Textarea
          value={note}
          onChange={(event) => onNoteChange(event.target.value)}
          placeholder={t("note")}
        />
        <div className="flex flex-wrap gap-2">
          {advertisementId ? (
            <Link
              href={`/search/ad/${advertisementId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
              )}
            >
              <ExternalLink />
              {t("viewAdvertisement")}
            </Link>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={() =>
              ask(t("resolve"), () =>
                apiRequest(`/api/admin/reports/${String(row.id)}`, {
                  method: "PATCH",
                  body: {
                    status: "RESOLVED",
                    adminNote: note,
                    confirm: true,
                  },
                }).then(() => undefined),
              )
            }
          >
            <CheckCircle2 />
            {t("resolve")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              ask(t("dismiss"), () =>
                apiRequest(`/api/admin/reports/${String(row.id)}`, {
                  method: "PATCH",
                  body: {
                    status: "DISMISSED",
                    adminNote: note,
                    confirm: true,
                  },
                }).then(() => undefined),
              )
            }
          >
            <XCircle />
            {t("dismiss")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportRow;
