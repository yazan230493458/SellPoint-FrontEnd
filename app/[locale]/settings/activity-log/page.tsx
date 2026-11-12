"use client";

import { useMemo, useState } from "react";
import { useHydrated, useSessionGate } from "@/lib/use-hydrated";
import { useTranslations } from "next-intl";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import Image from "next/image";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import {
  Activity,
  Trash2,
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  Heart,
  Store,
  Megaphone,
  ShieldAlert,
  Clock3,
  Sparkles,
} from "lucide-react";
import SettingsPage from "../page";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import InputField from "../../components/ui/InputField";
import handleShowAlert from "../../Functions/handleShowAlert";
import {
  useActivityLogStore,
  type ActivityItem,
} from "@/store/activity-log.store";
import { redirect } from "next/navigation";
import { features } from "@/app/[locale]/features";

type FilterType = "all" | ActivityItem["type"];

const ActivityLogPage = () => {
  const t = useTranslations("ActivityLogPage");
  const catalogLabel = useCatalogLabel();

  const { pending, isAuthenticated } = useSessionGate();
  const activities = useActivityLogStore((state) => state.activities);
  const removeActivity = useActivityLogStore((state) => state.removeActivity);
  const clearActivities = useActivityLogStore((state) => state.clearActivities);

  const [isGrid, setIsGrid] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const mounted = useHydrated();

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activities.filter((item) => {
      if (!features.stores && item.type === "store") return false;
      const matchesType = filterType === "all" || item.type === filterType;
      const matchesSearch = [
        item.actionTitle,
        item.description,
        item.category,
      ].some((value) => value.toLowerCase().includes(query));

      return matchesType && matchesSearch;
    });
  }, [activities, filterType, searchQuery]);

  if (pending) return null;
  if (!isAuthenticated) {
    redirect("/log-in");
  }

  const handleRemoveItem = (id: string | number) => {
    removeActivity(id);
    handleShowAlert(t("removedTitle"), t("removedDescription"));
  };

  const handleClearAll = () => {
    if (!activities.length) {
      handleShowAlert(t("noChange"), t("emptyDescription"));
      return;
    }

    clearActivities();
    handleShowAlert(t("clearedTitle"), t("clearedDescription"));
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "favorite", label: t("favorites") },
    { key: "ad", label: t("ads") },
    ...(features.stores
      ? [{ key: "store" as const, label: t("stores") }]
      : []),
    { key: "security", label: t("security") },
  ];

  const getActivityBadge = (type: ActivityItem["type"]) => {
    const badges = {
      favorite: {
        icon: Heart,
        color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        label: t("favorites"),
      },
      ad: {
        icon: Megaphone,
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        label: t("ads"),
      },
      store: {
        icon: Store,
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        label: t("stores"),
      },
      security: {
        icon: ShieldAlert,
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        label: t("security"),
      },
    };

    return badges[type];
  };

  if (!mounted) return null;

  return (
    <SettingsPage className="flex flex-col gap-6">
      <Alert />

      <div className="flex flex-col sm:flex-row sm:min-h-20 items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <span className="rounded-lg border border-zinc-200 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {activities.length}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg">
            {t("subtitle")}
          </p>
        </div>

        {activities.length > 0 && (
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800 p-1">
              {[
                { grid: false, icon: List, label: t("listView") },
                { grid: true, icon: LayoutGrid, label: t("gridView") },
              ].map(({ grid, icon: Icon, label }) => (
                <Button
                  key={label}
                  type="button"
                  aria-label={label}
                  title={label}
                  onClick={() => setIsGrid(grid)}
                  className={`rounded-lg p-2 transition-colors ${
                    isGrid === grid
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            <Button
              type="button"
              onClick={handleClearAll}
              className="rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
              <span className="text-red-500">{t("clearAll")}</span>
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 z-10" />

            <InputField
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-900/60 py-2.5 ps-9 pe-4 text-xs"
            />
          </div>

          {activities.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800 p-1">
              {filters.map(({ key, label }) => (
                <Button
                  key={key}
                  type="button"
                  onClick={() => setFilterType(key)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    filterType === key
                      ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {filteredActivities.length === 0 ? (
          <div className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 p-12 text-center backdrop-blur-xl">
            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
              <Activity className="h-8 w-8" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {searchQuery.trim() || filterType !== "all"
                  ? t("noResultsTitle")
                  : t("emptyTitle")}
              </h3>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                {searchQuery.trim() || filterType !== "all"
                  ? t("noResultsDescription")
                  : t("emptyDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={
              isGrid
                ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {filteredActivities.map((item) => {
              const badge = getActivityBadge(item.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`group relative flex ${
                    isGrid ? "flex-col" : "flex-row"
                  } items-start sm:items-center gap-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-xl p-5 shadow-xl shadow-zinc-900/5 dark:shadow-black/10 transition-all duration-300`}
                >
                  <div
                    className={`relative ${
                      isGrid ? "h-36 w-full" : "h-16 w-16 sm:h-20 sm:w-20"
                    } flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800`}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.actionTitle}
                        fill
                        sizes={
                          isGrid ? "(max-width: 768px) 100vw, 50vw" : "80px"
                        }
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <BadgeIcon className="h-8 w-8 text-zinc-400" />
                    )}
                  </div>

                  <div className="flex min-w-0 w-full flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${badge.color}`}
                        >
                          <BadgeIcon className="h-3 w-3" />
                          <span>{badge.label}</span>
                        </span>

                        <h3 className="truncate text-base font-bold text-zinc-900 dark:text-zinc-100">
                          {item.actionTitle}
                        </h3>

                        <div className="flex items-center gap-1 rounded-md bg-zinc-900/80 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-white border border-zinc-700/50">
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>
                            {item.category
                              .split(", ")
                              .map((part) =>
                                part === "Ads" ? t("ads") : catalogLabel(part),
                              )
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        aria-label={t("removeActivity")}
                        onClick={() => handleRemoveItem(item.id)}
                        className="shrink-0 rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {item.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-200/60 dark:border-zinc-800/80 pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{item.timestamp}</span>
                      </div>

                      {item.href && (
                        <BaseLink
                          href={item.href}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-950 transition-opacity hover:opacity-90 shadow-md shadow-zinc-900/10"
                        >
                          <span>{t("viewDetails")}</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </BaseLink>
                      )}
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

export default ActivityLogPage;
