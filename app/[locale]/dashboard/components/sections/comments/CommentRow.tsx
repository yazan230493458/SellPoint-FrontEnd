"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardConfirm, Row } from "../../types";

type CommentRowProps = {
  row: Row;
  ask: DashboardConfirm;
};

const CommentRow = ({ row, ask }: CommentRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{String(row.text)}</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            ask(t("hide"), () =>
              apiRequest(`/api/admin/comments/${String(row.id)}`, {
                method: "PATCH",
                body: { isHidden: !row.isHidden, confirm: true },
              }).then(() => undefined),
            )
          }
        >
          {row.isHidden ? <Eye /> : <EyeOff />}
          {t("hide")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CommentRow;
