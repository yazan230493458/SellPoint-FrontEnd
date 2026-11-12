"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiRequest, ApiError } from "@/lib/api";
import type { CategoryDraft, Row, Section } from "../components/types";
import type {
  DateRangeDays,
  TrendPoint,
  TrendsBundle,
} from "../components/sections/overview/analytics/types";
import { normalizeTrendPoints } from "../components/sections/overview/analytics/utils";

type PendingAction = {
  title: string;
  run: () => Promise<void>;
};

type UseDashboardDataArgs = {
  hydrated: boolean;
  sessionReady: boolean;
  isAuthenticated: boolean;
  role: string | null | undefined;
};

const isAbortError = (reason: unknown) =>
  (reason instanceof DOMException && reason.name === "AbortError") ||
  (reason instanceof Error && reason.name === "AbortError");

export const useDashboardData = ({
  hydrated,
  sessionReady,
  isAuthenticated,
  role,
}: UseDashboardDataArgs) => {
  const t = useTranslations("Dashboard");
  const errorFallbackRef = useRef(t("error"));
  errorFallbackRef.current = t("error");
  const router = useRouter();
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [trends, setTrends] = useState<TrendsBundle>({
    ads: [],
    users: [],
    reports: [],
  });
  const [trendDays, setTrendDays] = useState<DateRangeDays>(30);
  const [loadedKey, setLoadedKey] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);
  const [note, setNote] = useState("");
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>({
    id: 0,
    name: "",
    slug: "",
    description: "",
    parentId: "",
  });
  const [pending, setPending] = useState<PendingAction | null>(null);

  const roleDenied = Boolean(role && role !== "ADMIN" && role !== "OWNER");
  const requestKey = `${reloadToken}:${section}:${page}:${query}:${
    section === "overview" ? trendDays : ""
  }`;
  const loading =
    hydrated &&
    sessionReady &&
    isAuthenticated &&
    !roleDenied &&
    !forbidden &&
    loadedKey !== requestKey;

  const refresh = () => setReloadToken((current) => current + 1);

  useEffect(() => {
    if (!hydrated || !sessionReady) return;
    if (!isAuthenticated) {
      router.push("/log-in");
      return;
    }
    if (role !== "ADMIN" && role !== "OWNER") return;

    let cancelled = false;
    const controller = new AbortController();

    const finish = () => {
      if (!cancelled) setLoadedKey(requestKey);
    };

    const fail = (reason: unknown) => {
      if (cancelled || isAbortError(reason)) return;
      if (
        reason instanceof ApiError &&
        (reason.status === 401 || reason.status === 403)
      ) {
        setForbidden(reason.status === 403);
        if (reason.status === 401) router.push("/log-in");
      } else {
        setError(
          reason instanceof ApiError
            ? reason.message
            : errorFallbackRef.current,
        );
      }
      finish();
    };

    setError("");

    if (section === "overview") {
      void (async () => {
        try {
          const statsResult = await apiRequest<{
            stats: Record<string, unknown>;
          }>("/api/admin/stats");
          if (cancelled) return;
          setStats(statsResult.stats);
          setRows([]);
          setForbidden(false);

          try {
            const trendResult = await apiRequest<{
              ads: TrendPoint[];
              users: TrendPoint[];
              reports: TrendPoint[];
            }>(`/api/admin/trends?days=${trendDays}`);
            if (cancelled) return;
            setTrends({
              ads: normalizeTrendPoints(trendResult.ads),
              users: normalizeTrendPoints(trendResult.users),
              reports: normalizeTrendPoints(trendResult.reports),
            });
            setError("");
          } catch (trendReason) {
            if (cancelled || isAbortError(trendReason)) return;
            setTrends({ ads: [], users: [], reports: [] });
            setError(
              trendReason instanceof ApiError
                ? trendReason.message
                : errorFallbackRef.current,
            );
          }
          finish();
        } catch (reason) {
          fail(reason);
        }
      })();
    } else {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (query.trim()) params.set("q", query.trim());
      const path = {
        users: `/api/admin/users?${params}`,
        administrators: `/api/admin/admins?${params}`,
        advertisements: `/api/admin/ads?${params}`,
        reports: `/api/admin/reports?${params}`,
        categories: "/api/admin/categories",
        comments: `/api/admin/comments?${params}`,
        reviews: `/api/admin/reviews?${params}`,
        subscriptions: `/api/admin/subscriptions?${params}`,
        payments: `/api/admin/payments?${params}`,
        inbox: `/api/admin/contact?${params}`,
        settings: "/api/admin/settings",
        audit: `/api/admin/audit?${params}`,
      }[section];

      if (!path) {
        finish();
        return () => {
          cancelled = true;
          controller.abort();
        };
      }

      void apiRequest<Record<string, unknown>>(path)
        .then((result) => {
          if (cancelled) return;
          const list = (result.users ??
            result.ads ??
            result.reports ??
            result.categories ??
            result.comments ??
            result.reviews ??
            result.subscriptions ??
            result.payments ??
            result.messages ??
            result.settings ??
            result.entries ??
            []) as Row[];
          setRows(Array.isArray(list) ? list : []);
          setError("");
          setForbidden(false);
          finish();
        })
        .catch(fail);
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    hydrated,
    isAuthenticated,
    page,
    query,
    requestKey,
    role,
    router,
    section,
    sessionReady,
    trendDays,
  ]);

  const ask = (title: string, run: () => Promise<void>) =>
    setPending({ title, run });

  const act = async (request: () => Promise<void>) => {
    setError("");
    try {
      await request();
      setPending(null);
      setReloadToken((current) => current + 1);
    } catch (reason) {
      if (isAbortError(reason)) return;
      setError(
        reason instanceof ApiError ? reason.message : errorFallbackRef.current,
      );
    }
  };

  return {
    section,
    setSection,
    query,
    setQuery,
    page,
    setPage,
    rows,
    stats,
    trends,
    trendDays,
    setTrendDays,
    loading,
    error,
    forbidden,
    note,
    setNote,
    categoryDraft,
    setCategoryDraft,
    pending,
    setPending,
    ask,
    act,
    refresh,
  };
};
