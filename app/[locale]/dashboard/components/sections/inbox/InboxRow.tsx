"use client";

import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardConfirm, Row } from "../../types";

type InboxRowProps = {
  row: Row;
  ask: DashboardConfirm;
  onSelect: (row: Row) => void;
};

const InboxRow = ({ row, ask, onSelect }: InboxRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{String(row.subject)}</p>
            <Badge variant="outline">{String(row.status)}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {String(row.name)} · {String(row.email)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => onSelect(row)}>
            {t("viewDetails")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              ask(t("markRead"), () =>
                apiRequest(`/api/admin/contact/${String(row.id)}`, {
                  method: "PATCH",
                  body: { status: "READ" },
                }).then(() => undefined),
              )
            }
          >
            {t("markRead")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              ask(t("markResolved"), () =>
                apiRequest(`/api/admin/contact/${String(row.id)}`, {
                  method: "PATCH",
                  body: { status: "RESOLVED" },
                }).then(() => undefined),
              )
            }
          >
            {t("markResolved")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() =>
              ask(t("deleteMessage"), () =>
                apiRequest(`/api/admin/contact/${String(row.id)}`, {
                  method: "DELETE",
                  body: { confirm: true },
                }).then(() => undefined),
              )
            }
          >
            {t("deleteMessage")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InboxRow;
