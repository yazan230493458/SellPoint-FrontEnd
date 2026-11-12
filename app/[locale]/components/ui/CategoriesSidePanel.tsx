"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Loader2, X } from "lucide-react";
import { cn } from "cn";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import { Button } from "@/components/ui/button";
import { AllCategoriesIcon, iconForCategory } from "@/lib/category-icon";
import { categorySearchHref } from "@/lib/categories";
import { useCategories } from "@/lib/use-categories";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import { isRtlLocale } from "@/i18n/locales";

type CategoriesSidePanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CategoriesSidePanel = ({ open, onOpenChange }: CategoriesSidePanelProps) => {
  const tAside = useTranslations("HomePage.aside");
  const tHeader = useTranslations("HomePage.header");
  const locale = useLocale();
  const catalogLabel = useCatalogLabel();
  const { tree, loading } = useCategories({ enabled: open });
  const side = isRtlLocale(locale) ? "right" : "left";

  const parentIdsWithChildren = useMemo(
    () => tree.filter((node) => node.children.length > 0).map((node) => node.id),
    [tree],
  );

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) return;
    setExpandedIds(new Set(parentIdsWithChildren));
  }, [open, parentIdsWithChildren]);

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="aside-categories-panel"
        side={side}
        showCloseButton={false}
        className={cn(
          "w-full max-w-md gap-0 border-zinc-200 bg-zinc-50 p-0 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:max-w-md",
          "data-[side=left]:inset-s-0 data-[side=right]:inset-e-0",
        )}
      >
        <SheetHeader className="sticky top-0 z-10 flex-row items-start justify-between gap-3 border-b border-zinc-200/80 bg-zinc-50/95 px-4 py-4 backdrop-blur dark:border-zinc-700/80 dark:bg-zinc-900/95">
          <div className="min-w-0 space-y-1 pe-10">
            <SheetTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {tAside("Categories")}
            </SheetTitle>
            <SheetDescription className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {tAside("categoriesPanelHint")}
            </SheetDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-3 end-3 rounded-xl text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label={tAside("closeCategories")}
            onClick={close}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {loading && tree.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-zinc-500 dark:text-zinc-400"
              role="status"
            >
              <Loader2 className="size-5 animate-spin" aria-hidden />
              <span>{tHeader("loadingCategories")}</span>
            </div>
          ) : tree.length === 0 ? (
            <p className="px-2 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {tHeader("categoriesEmpty")}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <BaseLink
                href="/search"
                onClick={close}
                className="flex min-h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700/70"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                  <AllCategoriesIcon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-semibold">
                  {tAside("allCategories")}
                </span>
              </BaseLink>

              {tree.map((category) => {
                const Icon = iconForCategory(category.slug, category.name);
                const hasChildren = category.children.length > 0;
                const expanded = expandedIds.has(category.id);
                const label = catalogLabel(category.name);

                return (
                  <div
                    key={`${category.id}-${category.slug}`}
                    className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-700/80 dark:bg-zinc-800/80"
                  >
                    <div className="flex items-stretch">
                      <BaseLink
                        href={categorySearchHref(category)}
                        onClick={close}
                        className="group flex min-h-12 flex-1 items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700/60"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700 transition-colors group-hover:border-zinc-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {label}
                          </span>
                          {hasChildren ? (
                            <span className="mt-0.5 block text-[11px] text-zinc-500 dark:text-zinc-400">
                              {tAside("subcategoryCount", {
                                count: category.children.length,
                              })}
                            </span>
                          ) : null}
                        </span>
                      </BaseLink>

                      {hasChildren ? (
                        <button
                          type="button"
                          className="flex w-11 shrink-0 items-center justify-center border-s border-zinc-200/80 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700/80 dark:hover:bg-zinc-700/60 dark:hover:text-zinc-100"
                          aria-expanded={expanded}
                          aria-label={
                            expanded
                              ? tAside("collapseCategory")
                              : tAside("expandCategory")
                          }
                          onClick={() => toggleExpanded(category.id)}
                        >
                          <ChevronDown
                            className={cn(
                              "size-4 transition-transform duration-200",
                              expanded && "rotate-180",
                            )}
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>

                    {hasChildren ? (
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-200 ease-out",
                          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                        )}
                      >
                        <ul className="min-h-0 overflow-hidden border-t border-zinc-200/70 dark:border-zinc-700/70">
                          {category.children.map((child) => (
                            <li key={`${child.id}-${child.slug}`}>
                              <BaseLink
                                href={categorySearchHref(child)}
                                onClick={close}
                                className="flex items-center gap-2.5 px-4 py-2.5 ps-14 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100"
                              >
                                <span
                                  className="size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500"
                                  aria-hidden
                                />
                                <span className="truncate">
                                  {catalogLabel(child.name)}
                                </span>
                              </BaseLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CategoriesSidePanel;
