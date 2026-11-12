"use client";

import { Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardConfirm, Row } from "../../types";

type ReviewRowProps = {
  row: Row;
  ask: DashboardConfirm;
};

const ReviewRow = ({ row, ask }: ReviewRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <Star className="fill-amber-500 text-amber-500" />
            {String(row.rating)} / 5
          </Badge>
          <p className="text-sm">{String(row.text)}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() =>
            ask(t("remove"), () =>
              apiRequest(`/api/admin/reviews/${String(row.id)}`, {
                method: "DELETE",
                body: { confirm: true },
              }).then(() => undefined),
            )
          }
        >
          <Trash2 />
          {t("remove")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReviewRow;
