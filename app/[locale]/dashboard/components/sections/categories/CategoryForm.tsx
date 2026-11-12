"use client";

import type { Dispatch, SetStateAction } from "react";
import { Edit2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CategoryDraft, DashboardAction } from "../../types";

type CategoryFormProps = {
  draft: CategoryDraft;
  setDraft: Dispatch<SetStateAction<CategoryDraft>>;
  act: DashboardAction;
};

const CategoryForm = ({ draft, setDraft, act }: CategoryFormProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardContent className="p-4">
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const body = {
              name: draft.name.trim(),
              slug: draft.slug.trim(),
              description: draft.description.trim() || null,
              ...(draft.parentId ? { parentId: Number(draft.parentId) } : {}),
              sortOrder: 0,
            };
            void act(() =>
              apiRequest(
                draft.id ? `/api/edit-category/${draft.id}` : "/api/set-category",
                {
                  method: draft.id ? "PATCH" : "POST",
                  body,
                },
              ).then(() => {
                setDraft({
                  id: 0,
                  name: "",
                  slug: "",
                  description: "",
                  parentId: "",
                });
              }),
            );
          }}
        >
          <Input
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            placeholder={t("categoryName")}
          />
          <Input
            value={draft.slug}
            onChange={(event) =>
              setDraft((current) => ({ ...current, slug: event.target.value }))
            }
            placeholder={t("categorySlug")}
          />
          <Input
            value={draft.parentId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                parentId: event.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder={t("categoryParent")}
          />
          <Input
            value={draft.description}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder={t("categoryDescription")}
          />
          <Button type="submit" className="sm:col-span-2">
            {draft.id ? <Edit2 /> : <Plus />}
            {draft.id ? t("editCategory") : t("createCategory")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CategoryForm;
