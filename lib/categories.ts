import { apiRequest } from "@/lib/api";
import { categoryOptions } from "@/data/CategoriesData";

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
};

export type CategoryTreeNode = ApiCategory & {
  children: ApiCategory[];
};

type CategoriesCache = {
  data: ApiCategory[] | null;
  source: "api" | "catalog" | null;
  error: string | null;
  promise: Promise<ApiCategory[]> | null;
};

const cache: CategoriesCache = {
  data: null,
  source: null,
  error: null,
  promise: null,
};

export const categorySearchHref = (category: Pick<ApiCategory, "slug" | "name">) => {
  const value = category.slug || category.name;
  return `/search?category=${encodeURIComponent(value)}`;
};

/** Existing marketplace catalog used by search / create-ad (not invented for the dropdown). */
export const catalogCategoriesFlat = (): ApiCategory[] => {
  const rows: ApiCategory[] = [];

  categoryOptions.forEach((group, groupIndex) => {
    const parentId = groupIndex + 1;
    rows.push({
      id: parentId,
      name: group.value,
      slug: group.value,
      description: null,
      imageUrl: null,
      parentId: null,
      sortOrder: groupIndex,
      isActive: true,
    });

    group.items.forEach((item, childIndex) => {
      rows.push({
        id: parentId * 1000 + childIndex + 1,
        name: item,
        slug: item,
        description: null,
        imageUrl: null,
        parentId,
        sortOrder: childIndex,
        isActive: true,
      });
    });
  });

  return rows;
};

export const buildCategoryTree = (categories: ApiCategory[]): CategoryTreeNode[] => {
  const sorted = [...categories].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.name.localeCompare(b.name);
  });

  const childrenByParent = new Map<number, ApiCategory[]>();
  for (const category of sorted) {
    if (category.parentId == null) continue;
    const list = childrenByParent.get(category.parentId) ?? [];
    list.push(category);
    childrenByParent.set(category.parentId, list);
  }

  return sorted
    .filter((category) => category.parentId == null)
    .map((category) => ({
      ...category,
      children: childrenByParent.get(category.id) ?? [],
    }));
};

const normalizeCategoriesPayload = (payload: unknown): ApiCategory[] => {
  if (Array.isArray(payload)) return payload as ApiCategory[];
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.categories)) return record.categories as ApiCategory[];
    if (Array.isArray(record.data)) return record.data as ApiCategory[];
    if (record.data && typeof record.data === "object") {
      const nested = record.data as Record<string, unknown>;
      if (Array.isArray(nested.categories)) return nested.categories as ApiCategory[];
    }
  }
  return [];
};

export const fetchCategories = async (options?: { force?: boolean }) => {
  if (!options?.force && cache.data !== null) {
    return cache.data;
  }
  if (!options?.force && cache.promise) {
    return cache.promise;
  }

  cache.error = null;
  cache.promise = apiRequest<unknown>("/api/get-categories", {
    auth: false,
  })
    .then((payload) => {
      const fromApi = normalizeCategoriesPayload(payload).filter(
        (row) => row && typeof row === "object" && row.isActive !== false,
      );

      // API table may be empty while the marketplace catalog still has full groups/items.
      const categories = fromApi.length > 0 ? fromApi : catalogCategoriesFlat();
      cache.data = categories;
      cache.source = fromApi.length > 0 ? "api" : "catalog";
      cache.promise = null;
      return categories;
    })
    .catch((error: unknown) => {
      // Keep original catalog visible even if the API request fails.
      const categories = catalogCategoriesFlat();
      cache.data = categories;
      cache.source = "catalog";
      cache.error = error instanceof Error ? error.message : "Failed to load categories";
      cache.promise = null;
      return categories;
    });

  return cache.promise;
};

export const getCachedCategories = () => cache.data;
export const getCategoriesCacheError = () => cache.error;
export const getCategoriesSource = () => cache.source;

export const clearCategoriesCache = () => {
  cache.data = null;
  cache.source = null;
  cache.error = null;
  cache.promise = null;
};
