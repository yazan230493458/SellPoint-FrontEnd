"use client";

import { Edit2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CategoryDraft, DashboardConfirm, Row } from "../../types";

type CategoryRowProps = {
  row: Row;
  onEdit: (draft: CategoryDraft) => void;
  ask: DashboardConfirm;
};

const CategoryRow = ({ row, onEdit, ask }: CategoryRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">{String(row.name)}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{String(row.slug)}</span>
            <Badge variant="outline">
              {row.isActive ? t("activate") : t("deactivate")}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onEdit({
                id: Number(row.id),
                name: String(row.name ?? ""),
                slug: String(row.slug ?? ""),
                description: String(row.description ?? ""),
                parentId: row.parentId ? String(row.parentId) : "",
              })
            }
          >
            <Edit2 />
            {t("editCategory")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() =>
              ask(t("deleteCategory"), () =>
                apiRequest(`/api/categories/${String(row.id)}`, {
                  method: "DELETE",
                }).then(() => undefined),
              )
            }
          >
            <Trash2 />
            {t("deleteCategory")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryRow;
