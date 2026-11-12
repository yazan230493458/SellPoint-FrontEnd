"use client";

import { useTranslations } from "next-intl";
import { categoryOptions } from "@/data/CategoriesData";

export const catalogLabels = new Set(
  categoryOptions.flatMap((group) => [group.value, ...group.items]),
);

export function useCatalogLabel() {
  const t = useTranslations("Catalog");

  return (value: string) => {
    if (!catalogLabels.has(value)) return value;
    return t(value as never);
  };
}
