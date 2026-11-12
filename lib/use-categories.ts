"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  buildCategoryTree,
  catalogCategoriesFlat,
  clearCategoriesCache,
  fetchCategories,
  getCachedCategories,
  getCategoriesCacheError,
  type ApiCategory,
  type CategoryTreeNode,
} from "@/lib/categories";

type UseCategoriesOptions = {
  enabled?: boolean;
};

export const useCategories = (options: UseCategoriesOptions = {}) => {
  const enabled = options.enabled ?? true;
  const [categories, setCategories] = useState<ApiCategory[]>(() => {
    const cached = getCachedCategories();
    if (cached && cached.length > 0) return cached;
    // Immediate catalog so the menu never opens empty while waiting on API.
    return catalogCategoriesFlat();
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    if (force) clearCategoriesCache();
    setLoading(true);
    try {
      const data = await fetchCategories({ force });
      setCategories(data.length > 0 ? data : catalogCategoriesFlat());
      setError(null);
    } catch (reason: unknown) {
      setCategories(catalogCategoriesFlat());
      setError(reason instanceof Error ? reason.message : null);
    } finally {
      setLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    if (!enabled) return;
    const cached = getCachedCategories();
    if (cached && cached.length > 0) {
      setCategories(cached);
      setError(getCategoriesCacheError());
      setLoading(false);
      return;
    }
    void load(false);
  }, [enabled, load]);

  const tree = useMemo<CategoryTreeNode[]>(
    () => buildCategoryTree(categories),
    [categories],
  );

  return {
    categories,
    tree,
    loading,
    error,
    reload: () => load(true),
  };
};
