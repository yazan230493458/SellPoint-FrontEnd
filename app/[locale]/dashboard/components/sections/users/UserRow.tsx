"use client";

import { Eye, ShieldCheck, Trash2, UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardConfirm, Row } from "../../types";

type UserRowProps = {
  row: Row;
  role: string | null | undefined;
  ask: DashboardConfirm;
  onViewDetails: (user: Row) => void;
};

const UserRow = ({ row, role, ask, onViewDetails }: UserRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{String(row.username)}</p>
            <Badge variant="secondary">{String(row.role)}</Badge>
            <Badge variant={row.isActive ? "outline" : "destructive"}>
              {row.isActive ? t("activeStatus") : t("bannedStatus")}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{String(row.email)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {role === "OWNER" && row.role === "USER" ? (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                ask(t("promote"), () =>
                  apiRequest("/api/admin/roles/promote", {
                    method: "POST",
                    body: { userId: row.id, confirm: true },
                  }).then(() => undefined),
                )
              }
            >
              <ShieldCheck />
              {t("promote")}
            </Button>
          ) : null}

          {role === "OWNER" && row.role === "ADMIN" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                ask(t("demote"), () =>
                  apiRequest("/api/admin/roles/demote", {
                    method: "POST",
                    body: { userId: row.id, confirm: true },
                  }).then(() => undefined),
                )
              }
            >
              {t("demote")}
            </Button>
          ) : null}

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void apiRequest<{ user: Row }>(
                `/api/admin/users/${String(row.id)}`,
              ).then((result) => onViewDetails(result.user));
            }}
          >
            <Eye />
            {t("viewDetails")}
          </Button>

          {row.role !== "OWNER" ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                ask(row.isActive ? t("ban") : t("unban"), () =>
                  apiRequest(`/api/admin/users/${String(row.id)}/status`, {
                    method: "PATCH",
                    body: { isActive: !row.isActive, confirm: true },
                  }).then(() => undefined),
                )
              }
            >
              {row.isActive ? <UserX /> : <UserCheck />}
              {row.isActive ? t("ban") : t("unban")}
            </Button>
          ) : null}

          {row.role !== "OWNER" &&
          !(row.role === "ADMIN" && role !== "OWNER") ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() =>
                ask(t("deleteAccount"), () =>
                  apiRequest(`/api/admin/users/${String(row.id)}`, {
                    method: "DELETE",
                    body: { confirm: true },
                  }).then(() => undefined),
                )
              }
            >
              <Trash2 />
              {t("deleteAccount")}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRow;
