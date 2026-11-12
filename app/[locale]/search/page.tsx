"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import { apiRequest, assetUrl, ApiError } from "@/lib/api";
import type { ApiAd } from "@/lib/ads";
import { isSafeImageSrc } from "@/lib/safe-href";
import SubStudy from "../components/ui/SubStudy";
import Header from "../components/main/Header";
import { categoryOptions } from "@/data/CategoriesData";
import countriesData, { type Country } from "@/data/locationData";
import {
  Filter,
  RotateCcw,
  MapPin,
  Tag,
  DollarSign,
  Layers,
  ShoppingBag,
  Sparkles,
  Flag,
} from "lucide-react";
import ProSelect from "../components/ui/ProSelect";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import Button from "../components/ui/Button";
import { features } from "@/app/[locale]/features";
import { useUserStore } from "@/store/user.store";
import { formatPrice } from "@/lib/format-price";
import ReportDialog from "../components/ui/ReportDialog";

type SortValue = "newest" | "price_asc" | "price_desc" | "views";

const SearchPageContent = () => {
  const t = useTranslations("SearchPage");
  const catalogLabel = useCatalogLabel();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [typeFilter, setTypeFilter] = useState<"all" | "ads" | "stores">("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);
  const [reportId, setReportId] = useState<number | null>(null);
  const currentUserId = useUserStore((state) => state.user?.id);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const [ads, setAds] = useState<ApiAd[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const countryOptions = useMemo(
    () =>
      Object.keys(countriesData).map((country) => ({
        value: country,
        items: [country],
      })),
    [],
  );
  const availableCities = selectedCountry
    ? countriesData[selectedCountry as Country].cities
    : [];
  const requestKey = JSON.stringify({
    query,
    selectedCategory,
    selectedCountry,
    selectedCity,
    minPrice,
    maxPrice,
    sort,
    page,
  });
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedCountry) params.set("country", selectedCountry);
    if (selectedCity) params.set("city", selectedCity);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");
    void apiRequest<{ ads: ApiAd[]; total: number }>(
      `/api/search/ads?${params.toString()}`,
      { auth: false },
    )
      .then((result) => {
        if (controller.signal.aborted) return;
        setAds(result.ads);
        setTotal(result.total);
        setError("");
        setLoadedKey(requestKey);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setAds([]);
        setTotal(0);
        setError(reason instanceof ApiError ? reason.message : t("loadError"));
        setLoadedKey(requestKey);
      });
    return () => controller.abort();
  }, [
    query,
    selectedCategory,
    selectedCountry,
    selectedCity,
    minPrice,
    maxPrice,
    sort,
    page,
    requestKey,
    t,
  ]);

  const visibleAds = typeFilter === "stores" ? [] : ads;
  const formattedCategoryOptions = categoryOptions.map((group) => ({
    value: group.value,
    items: group.items,
  }));
  const typeOptions: Array<{ value: "all" | "ads" | "stores"; label: string }> =
    [
      { value: "all", label: t("all") },
      { value: "ads", label: t("adsOnly") },
      ...(features.stores
        ? [{ value: "stores" as const, label: t("storesOnly") }]
        : []),
    ];

  return (
    <>
      <Header className="h-20 flex justify-between rounded-xl top-5 inset-x-3 fixed p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/30" />
      <main className="mt-30 flex min-h-dvh w-full flex-col items-center gap-5 bg-white p-4 text-zinc-900 transition-colors duration-200 sm:p-5 lg:flex-row lg:items-start dark:bg-zinc-950 dark:text-zinc-100">
        <aside className="w-full static lg:w-100 p-5 rounded-xl bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-lg flex flex-col space-y-6 lg:sticky top-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5 font-bold text-lg">
              <Filter className="w-5 h-5 text-zinc-500" />
              <span>{t("filters")}</span>
            </div>
            <Button
              type="button"
              onClick={() => {
                setTypeFilter("all");
                setSelectedCategory("");
                setSelectedCountry("");
                setSelectedCity("");
                setMinPrice("");
                setMaxPrice("");
                setSort("newest");
                setPage(1);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-red-600"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t("reset")}</span>
            </Button>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="w-4 h-4" />
              {t("listingType")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTypeFilter(option.value);
                    setPage(1);
                  }}
                  className={`h-10 text-xs font-semibold rounded-lg border px-4 ${typeFilter === option.value ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "bg-zinc-100 dark:bg-zinc-800"}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="w-4 h-4" />
              {t("category")}
            </label>
            <ProSelect
              value={selectedCategory || null}
              onChange={(value) => {
                setSelectedCategory(value || "");
                setPage(1);
              }}
              options={formattedCategoryOptions}
              placeholder={t("allCategories")}
              className="w-full h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              {t("location")}
            </label>
            <ProSelect
              value={selectedCountry || null}
              onChange={(value) => {
                setSelectedCountry(value || "");
                setSelectedCity("");
                setPage(1);
              }}
              options={countryOptions}
              placeholder={t("allCountries")}
              className="w-full h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4"
            />
            <ProSelect
              value={selectedCity || null}
              disabled={!selectedCountry}
              onChange={(value) => {
                setSelectedCity(value || "");
                setPage(1);
              }}
              options={[
                {
                  value: selectedCountry || t("cities"),
                  items: availableCities,
                },
              ]}
              placeholder={t("allCities")}
              className="w-full h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <DollarSign className="w-4 h-4" />
              {t("priceRange")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder={t("minPrice")}
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value);
                  setPage(1);
                }}
                className="w-full h-12 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
              <input
                type="number"
                placeholder={t("maxPrice")}
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setPage(1);
                }}
                className="w-full h-12 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            {t("sort")}
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortValue);
                setPage(1);
              }}
              className="h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3"
            >
              <option value="newest">{t("newest")}</option>
              <option value="price_asc">{t("priceLow")}</option>
              <option value="price_desc">{t("priceHigh")}</option>
              <option value="views">{t("mostViewed")}</option>
            </select>
          </label>
        </aside>
        <section className="flex w-full min-w-0 flex-1 flex-col space-y-6">
          <div className="flex justify-between items-center">
            <SubStudy classNameForBox="w-[calc(100%-200px)] flex justify-start items-center py-5" />
            <h2 className="w-50 text-2xl text-center font-bold">
              {t("results", { count: total })}
            </h2>
          </div>
          {loading ? <p className="text-zinc-500">{t("loading")}</p> : null}
          {error ? <p className="text-red-600">{error}</p> : null}
          {!loading && visibleAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-center">
              <p className="text-zinc-500">{t("noAdsFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {visibleAds.map((ad) => {
                const image = assetUrl(
                  ad.images[ad.mainImageIndex] ?? ad.images[0],
                );
                const safeImage = isSafeImageSrc(image)
                  ? image
                  : "/placeholder.png";
                return (
                  <article
                    key={ad.id}
                    className="relative flex flex-col rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg"
                  >
                  <BaseLink
                    href={`/search/ad/${ad.id}`}
                    className="flex flex-col p-5"
                  >
                    {ad.featuredActive ? (
                      <div className="absolute top-6 left-6 z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500 text-zinc-950 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t("featuredAd")}</span>
                      </div>
                    ) : null}
                    <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/80 text-zinc-100 text-xs font-semibold">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t("ad")}</span>
                    </div>
                    <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={safeImage}
                        alt={ad.adName}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase truncate">
                      {catalogLabel(ad.category)}
                    </span>
                    <h3 className="font-bold text-lg truncate">{ad.adName}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {ad.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="font-extrabold text-lg">
                        {ad.showPrice ? `${formatPrice(ad.price)} ${t("currency")}` : t("priceOnRequest")}
                      </span>
                      <span className="text-xs text-zinc-500 truncate max-w-32">
                        {ad.selectedCity}, {ad.selectedCountry}
                      </span>
                    </div>
                  </BaseLink>
                  {isAuthenticated && String(ad.userId ?? "") !== String(currentUserId ?? "") ? (
                    <button
                      type="button"
                      onClick={() => setReportId(ad.id)}
                      className="mx-5 mb-4 inline-flex w-fit items-center gap-1 self-end rounded-lg border border-zinc-200 px-2 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                    >
                      <Flag className="size-3.5" />
                      {t("reportAd")}
                    </button>
                  ) : null}
                  </article>
                );
              })}
            </div>
          )}
          <div className="flex justify-center gap-3">
            <Button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="h-10 px-4 rounded-lg border"
            >
              -
            </Button>
            <span className="self-center text-sm">{page}</span>
            <Button
              type="button"
              disabled={page * 12 >= total}
              onClick={() => setPage((current) => current + 1)}
              className="h-10 px-4 rounded-lg border"
            >
              +
            </Button>
          </div>
        </section>
      </main>
      {reportId ? (
        <ReportDialog targetType="AD" targetId={reportId} open onClose={() => setReportId(null)} />
      ) : null}
    </>
  );
};

const SearchPageFallback = () => (
  <main className="mt-30 flex min-h-dvh w-full items-center justify-center p-4 text-zinc-500 dark:text-zinc-400">
    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
  </main>
);

const SearchPage = () => (
  <Suspense fallback={<SearchPageFallback />}>
    <SearchPageContent />
  </Suspense>
);

export default SearchPage;
