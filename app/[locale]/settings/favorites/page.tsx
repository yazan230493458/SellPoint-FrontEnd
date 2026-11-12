"use client";

import React, { useEffect, useState } from "react";
import SettingsPage from "../page";
import Alert from "../../components/ui/Alert";
import Button from "@/app/[locale]/components/ui/Button";
import { useTranslations } from "next-intl";
import { useFavoritesStore, type FavoriteItem } from "@/store/favorites.store";
import { apiRequest } from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import { useHydrated, useSessionGate } from "@/lib/use-hydrated";
import { useAdStore } from "@/store/ad.store";
import { useStoreStore } from "@/store/store.store";
import Image from "next/image";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import {
  Heart,
  Trash2,
  ExternalLink,
  MapPin,
  Sparkles,
  ShoppingBag,
  LayoutGrid,
  List,
} from "lucide-react";
import handleShowAlert from "../../Functions/handleShowAlert";
import { redirect } from "next/navigation";
import { features } from "@/app/[locale]/features";

type FilterType = "all" | "ads" | "stores";

const FavoritesPage = () => {
  const t = useTranslations("FavoritesPage");

  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const setFavorites = useFavoritesStore((state) => state.setFavorites);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const sessionReady = useUserStore((state) => state.sessionReady);

  const ads = useAdStore((state) => state.ads);
  const stores = useStoreStore((state) => state.stores);

  const [isGrid, setIsGrid] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const mounted = useHydrated();
  const { pending, isAuthenticated: sessionAuthenticated } = useSessionGate();

  useEffect(() => {
    if (!sessionReady || !isAuthenticated) return;
    void apiRequest<{ favorites: Array<FavoriteItem & { adId: number }> }>("/api/favorites")
      .then((result) => {
        setFavorites(result.favorites.map((item) => ({
          id: item.adId,
          title: item.title,
          category: item.category,
          price: item.price,
          location: item.location,
          imageUrl: item.imageUrl,
          href: item.href,
        })));
      })
      .catch(() => undefined);
  }, [isAuthenticated, sessionReady, setFavorites]);

  if (pending) return null;
  if (mounted && sessionReady && !sessionAuthenticated) {
    redirect("/log-in");
  }

  const filteredFavorites = favorites.filter((item) => {
    if (!features.stores && item.category === "Store") return false;
    if (filterType === "ads") return item.category !== "Store";
    if (filterType === "stores") return item.category === "Store";
    return true;
  });

  const handleRemoveFavorite = (id: string | number) => {
    removeFavorite(id);
    void apiRequest(`/api/favorites/${id}`, { method: "DELETE" }).catch(() => undefined);
    handleShowAlert(t("removedTitle"), t("removedDescription"));
  };

  const handleClearAll = () => {
    if (favorites.length === 0) {
      handleShowAlert(t("noChange"), t("desForNoChange"));
      return;
    }
    favorites.forEach((item) => {
      void apiRequest(`/api/favorites/${item.id}`, { method: "DELETE" }).catch(() => undefined);
    });
    clearFavorites();
    handleShowAlert(t("clearedTitle"), t("clearedDescription"));
  };

  const layoutControls = [
    {
      id: "grid",
      active: isGrid,
      onClick: () => setIsGrid(true),
      icon: LayoutGrid,
      label: t("gridView"),
    },
    {
      id: "list",
      active: !isGrid,
      onClick: () => setIsGrid(false),
      icon: List,
      label: t("listView"),
    },
  ];

  const filterOptions: {
    id: FilterType;
    label: string;
  }[] = [
    { id: "all", label: t("all") },
    { id: "ads", label: t("ads") },
    ...(features.stores ? [{ id: "stores" as const, label: t("stores") }] : []),
  ];

  const getDestination = (item: (typeof favorites)[number]) => {
    if (item.category === "Store") {
      const matchedStore = stores?.find(
        (store) =>
          store.username === item.title ||
          store.step1?.storeName === item.title,
      );

      const identifier =
        matchedStore?.username ?? matchedStore?.step1?.storeName;

      if (identifier) {
        return `/search/store/${encodeURIComponent(identifier)}`;
      }

      return item.href;
    }

    const matchedAd = ads.find((ad) => String(ad.id) === String(item.id));

    if (matchedAd?.username) {
      return `/search/ad/${encodeURIComponent(matchedAd.username)}`;
    }

    return item.href;
  };

  if (!mounted) return null;

  return (
    <SettingsPage className="flex flex-col gap-5">
      <Alert />

      <div className="flex flex-col sm:flex-row sm:min-h-20 items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4 sm:pb-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{t("title")}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold border border-zinc-200 dark:border-zinc-700">
              {favorites.length}
            </span>
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>

        {favorites.length > 0 && (
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
              {layoutControls.map((control) => {
                const Icon = control.icon;

                return (
                  <Button
                    key={control.id}
                    type="button"
                    aria-label={control.label}
                    title={control.label}
                    onClick={control.onClick}
                    className={`p-2 rounded-md transition-colors ${
                      control.active
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                );
              })}
            </div>

            <Button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span className="text-red-500">{t("clearAll")}</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="uppercase tracking-[3px] text-zinc-500 dark:text-zinc-400 text-sm font-semibold">
            {t("sectionTitle")}
          </h2>

          {favorites.length > 0 && (
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
              {filterOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  onClick={() => setFilterType(option.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === option.id
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {filteredFavorites.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center p-12 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-center gap-4 shadow-lg shadow-zinc-900/5 dark:shadow-black/10">
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
              <Heart className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {t("emptyTitle")}
              </h3>

              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {t("emptyDescription")}
              </p>
            </div>

            <BaseLink
              href="/search"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t("browseAds")}</span>
            </BaseLink>
          </div>
        ) : (
          <div
            className={
              isGrid
                ? "grid grid-cols-1 md:grid-cols-2 gap-5"
                : "flex flex-col gap-4"
            }
          >
            {filteredFavorites.map((item) => {
              const isStore = item.category === "Store";
              const destinationHref = getDestination(item);

              return (
                <div
                  key={`${item.category}-${item.id}`}
                  className={`group relative flex ${
                    isGrid ? "flex-col sm:flex-row" : "flex-row"
                  } items-center gap-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg shadow-zinc-900/5 dark:shadow-black/10 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 ease-in-out`}
                >
                  <div
                    className={`relative ${
                      isGrid ? "w-full sm:w-32 h-32" : "w-28 h-28"
                    } rounded-lg overflow-hidden bg-white dark:bg-zinc-800 shrink-0`}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 128px"
                      className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
                    />

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{isStore ? t("stores") : t("ads")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 min-w-0 w-full gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 truncate">
                        {item.title}
                      </h3>

                      <Button
                        type="button"
                        aria-label={t("removeFavorite")}
                        onClick={() => handleRemoveFavorite(item.id)}
                        className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-auto border-t border-zinc-200 dark:border-zinc-800 gap-3">
                      <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                        {item.price}
                      </span>

                      <BaseLink
                        href={destinationHref}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold hover:opacity-90 transition-opacity shrink-0"
                      >
                        <span>{isStore ? t("visitStore") : t("viewAd")}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </BaseLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SettingsPage>
  );
};

export default FavoritesPage;
