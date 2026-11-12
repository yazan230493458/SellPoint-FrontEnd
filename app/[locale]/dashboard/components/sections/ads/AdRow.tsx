"use client";

import { Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiRequest, assetUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardConfirm, Row } from "../../types";

type AdRowProps = {
  row: Row;
  ask: DashboardConfirm;
};

const AdRow = ({ row, ask }: AdRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto]">
        <div
          role="img"
          aria-label={String(row.adName ?? "")}
          className="h-24 w-full rounded-xl bg-muted bg-cover bg-center"
          style={{
            backgroundImage: `url(${assetUrl(
              Array.isArray(row.images)
                ? String(row.images[Number(row.mainImageIndex) || 0] ?? "")
                : "",
            )})`,
          }}
        />
        <div>
          <p className="font-semibold">{String(row.adName)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {String(row.username)} · {String(row.category)}
          </p>
          {row.featuredPlacement ? (
            <Badge variant="outline" className="mt-2">
              <Star className="fill-amber-500 text-amber-500" />
              {t("featuredAd")}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              ask(t("deactivate"), () =>
                apiRequest(`/api/admin/ads/${String(row.id)}`, {
                  method: "PATCH",
                  body: { isActive: !row.isActive, confirm: true },
                }).then(() => undefined),
              )
            }
          >
            {row.isActive ? t("deactivate") : t("activate")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() =>
              ask(t("remove"), () =>
                apiRequest(`/api/admin/ads/${String(row.id)}`, {
                  method: "DELETE",
                  body: { confirm: true },
                }).then(() => undefined),
              )
            }
          >
            <Trash2 />
            {t("remove")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdRow;
