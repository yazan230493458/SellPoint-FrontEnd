"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Loader2 } from "lucide-react";
import { cn } from "cn";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import {
  AllCategoriesIcon,
  iconForCategory,
} from "@/lib/category-icon";
import { categorySearchHref } from "@/lib/categories";
import { useCategories } from "@/lib/use-categories";
import { useCatalogLabel } from "@/lib/use-catalog-label";

type CategoriesMenuProps = {
  enabled?: boolean;
  compact?: boolean;
  onNavigate?: () => void;
  className?: string;
};

const CategoriesMenu = ({
  enabled = true,
  compact = false,
  onNavigate,
  className,
}: CategoriesMenuProps) => {
  const t = useTranslations("HomePage.header");
  const catalogLabel = useCatalogLabel();
  const { tree, loading } = useCategories({ enabled });

  if (loading && tree.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 py-8 text-sm text-zinc-500 dark:text-zinc-400",
          className,
        )}
        role="status"
      >
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span>{t("loadingCategories")}</span>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div
        className={cn(
          "px-3 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400",
          className,
        )}
      >
        {t("categoriesEmpty")}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <BaseLink
        href="/search"
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-zinc-300/25 bg-white/80 p-2.5 text-zinc-900 transition-colors hover:bg-zinc-200/80 dark:border-zinc-700/40 dark:bg-zinc-900/70 dark:text-zinc-100 dark:hover:bg-zinc-700/60",
          compact && "min-h-11",
        )}
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300/20 bg-zinc-100 text-zinc-900 dark:border-zinc-700/30 dark:bg-zinc-800 dark:text-zinc-100">
          <AllCategoriesIcon className="text-xl" aria-hidden />
        </div>
        <span className="text-sm font-semibold">{t("categoriesList.all")}</span>
        <ChevronRight
          className="ms-auto h-4 w-4 shrink-0 text-zinc-400 rtl:rotate-180"
          aria-hidden
        />
      </BaseLink>

      <div
        className={cn(
          compact
            ? "flex flex-col gap-1"
            : "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {tree.map((category) => {
          const Icon = iconForCategory(category.slug, category.name);
          const label = catalogLabel(category.name);
          return (
            <div
              key={`${category.id}-${category.slug}`}
              className={cn(
                "rounded-xl border border-transparent p-1.5 transition-colors",
                !compact &&
                  "hover:border-zinc-300/30 hover:bg-white/60 dark:hover:border-zinc-700/40 dark:hover:bg-zinc-900/50",
              )}
            >
              <BaseLink
                href={categorySearchHref(category)}
                onClick={onNavigate}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl p-2 text-start transition-colors hover:bg-zinc-200/80 dark:hover:bg-zinc-700/60",
                  compact && "min-h-11",
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300/20 bg-white text-zinc-900 transition-colors group-hover:border-zinc-400 dark:border-zinc-700/30 dark:bg-zinc-900 dark:text-zinc-100 dark:group-hover:border-zinc-500">
                  <Icon className="text-xl" aria-hidden />
                </div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {label}
                  </span>
                  {category.description ? (
                    <span className="mt-0.5 line-clamp-1 block text-xs text-zinc-500 dark:text-zinc-400">
                      {category.description}
                    </span>
                  ) : null}
                </span>
              </BaseLink>

              {category.children.length > 0 ? (
                <ul
                  className={cn(
                    "mt-1 flex flex-col gap-0.5",
                    compact ? "ps-4" : "ps-3",
                  )}
                >
                  {category.children.map((child) => (
                    <li key={`${child.id}-${child.slug}`}>
                      <BaseLink
                        href={categorySearchHref(child)}
                        onClick={onNavigate}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100"
                      >
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-zinc-400/70 dark:bg-zinc-500"
                          aria-hidden
                        />
                        <span className="truncate">{catalogLabel(child.name)}</span>
                      </BaseLink>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesMenu;
