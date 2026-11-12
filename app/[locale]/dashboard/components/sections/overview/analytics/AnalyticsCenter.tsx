"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/lib/intl-format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChartConfig } from "@/components/ui/chart";
import AnalyticsChart from "./AnalyticsChart";
import AnalyticsControls from "./AnalyticsControls";
import {
  CATEGORY_CHARTS,
  SERIES_COLORS,
  type AnalyticsCategory,
  type ChartType,
  type DateRangeDays,
  type Granularity,
  type TrendsBundle,
} from "./types";
import {
  buildPeriodCompare,
  buildTimeSeries,
  chartFamily,
  distributionForCategory,
  isTimeCategory,
  parseAnalyticsStats,
  seriesForCategory,
} from "./utils";

type AnalyticsCenterProps = {
  stats: Record<string, unknown>;
  trends: TrendsBundle;
  days: DateRangeDays;
  onDaysChange: (days: DateRangeDays) => void;
};

const STATUS_KEYS = new Set([
  "PENDING",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
]);

const AnalyticsCenter = ({
  stats,
  trends,
  days,
  onDaysChange,
}: AnalyticsCenterProps) => {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const [category, setCategory] = useState<AnalyticsCategory>("adActivity");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [comparePeriods, setComparePeriods] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const parsedStats = useMemo(() => parseAnalyticsStats(stats), [stats]);

  useEffect(() => {
    const allowed = comparePeriods
      ? (["bar", "horizontalBar", "pie", "donut", "radialBar"] as ChartType[])
      : CATEGORY_CHARTS[category];
    if (!allowed.includes(chartType)) {
      setChartType(allowed[0]);
    }
  }, [category, chartType, comparePeriods]);

  useEffect(() => {
    setHiddenSeries(new Set());
    if (!isTimeCategory(category)) setComparePeriods(false);
  }, [category]);

  const statusLabel = (status: string) =>
    STATUS_KEYS.has(status) ? t(`status_${status}`) : status;

  const distributionLabels = useMemo(
    () => ({
      activeAds: t("activeAds"),
      inactiveAds: t("inactiveAds"),
      featuredAds: t("featuredAds"),
      standardActiveAds: t("standardActiveAds"),
      messages: t("messages"),
      comments: t("comments"),
      reviews: t("reviews"),
      premiumSubscriptions: t("premiumSubscriptions"),
      otherUsers: t("otherUsers"),
      status: statusLabel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- next-intl t is stable enough for labels
    [t],
  );

  const seriesLabels = useMemo(
    () => ({
      ads: t("series_ads"),
      users: t("series_users"),
      reports: t("series_reports"),
      value: t("series_value"),
    }),
    [t],
  );

  const seriesMap = useMemo(
    () => seriesForCategory(category, trends),
    [category, trends],
  );
  const seriesKeys = Object.keys(seriesMap);

  const comparing = comparePeriods && isTimeCategory(category);

  const timeData = useMemo(() => {
    if (!isTimeCategory(category) || comparing) return [];
    return buildTimeSeries(days, seriesMap, granularity);
  }, [category, comparing, days, granularity, seriesMap]);

  const distributionData = useMemo(() => {
    if (comparing) {
      const sourceKey =
        category === "userRegistration"
          ? "users"
          : category === "moderationActivity"
            ? "reports"
            : category === "activityCompare"
              ? "ads"
              : "ads";
      const points =
        category === "activityCompare"
          ? trends.ads
          : trends[sourceKey as "ads" | "users" | "reports"];
      return buildPeriodCompare(
        days,
        points,
        t("periodEarlier"),
        t("periodLater"),
      );
    }
    if (isTimeCategory(category)) return [];
    return distributionForCategory(
      category,
      parsedStats,
      distributionLabels,
      trends,
      days,
      { earlier: t("periodEarlier"), later: t("periodLater") },
    );
  }, [
    category,
    comparing,
    days,
    distributionLabels,
    parsedStats,
    t,
    trends,
  ]);

  const activeChartType: ChartType = comparing
    ? chartType === "horizontalBar" ||
      chartType === "pie" ||
      chartType === "donut" ||
      chartType === "radialBar"
      ? chartType
      : "bar"
    : chartType;

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const [index, row] of distributionData.entries()) {
      config[row.key] = {
        label: row.label,
        color: row.fill || SERIES_COLORS[index % SERIES_COLORS.length],
      };
      config[row.label] = {
        label: row.label,
        color: row.fill || SERIES_COLORS[index % SERIES_COLORS.length],
      };
    }
    config.value = { label: t("series_value"), color: SERIES_COLORS[0] };
    for (const [index, key] of seriesKeys.entries()) {
      config[key] = {
        label: seriesLabels[key as keyof typeof seriesLabels] ?? key,
        color: SERIES_COLORS[index % SERIES_COLORS.length],
      };
    }
    return config;
  }, [distributionData, seriesKeys, seriesLabels, t]);

  const secondaryCategory: AnalyticsCategory =
    category === "userRegistration" || category === "subscriptions"
      ? "subscriptions"
      : category === "moderationActivity" || category === "reportStatus"
        ? "reportStatus"
        : category === "paymentTransactions" || category === "paymentRevenue"
          ? "paymentTransactions"
          : category === "engagement"
            ? "engagement"
            : "adStatus";

  const secondaryDistribution = useMemo(
    () =>
      distributionForCategory(
        secondaryCategory,
        parsedStats,
        distributionLabels,
      ),
    [distributionLabels, parsedStats, secondaryCategory],
  );

  const family = chartFamily(activeChartType);
  const timeTotal = seriesKeys.reduce(
    (sum, key) =>
      sum +
      timeData.reduce((inner, row) => inner + Number(row[key] ?? 0), 0),
    0,
  );
  const insightTotal = distributionData.reduce(
    (sum, row) => sum + row.value,
    0,
  );

  const rangeHint =
    isTimeCategory(category) || category === "periodCompare"
      ? ` · ${t(`range_${days}d`)}`
      : "";

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card className="@container/card overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-1">
            <CardTitle>{t("analyticsTitle")}</CardTitle>
            <CardDescription>{t("analyticsDescription")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 pt-5">
          <AnalyticsControls
            category={category}
            chartType={activeChartType}
            days={days}
            granularity={granularity}
            comparePeriods={comparePeriods}
            seriesKeys={seriesKeys}
            hiddenSeries={hiddenSeries}
            seriesLabels={seriesLabels}
            onCategoryChange={setCategory}
            onChartTypeChange={setChartType}
            onDaysChange={onDaysChange}
            onGranularityChange={setGranularity}
            onComparePeriodsChange={setComparePeriods}
            onToggleSeries={(key) => {
              setHiddenSeries((current) => {
                const next = new Set(current);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                if (next.size >= seriesKeys.length) return current;
                return next;
              });
            }}
          />

          <div
            className={
              family === "cartesian"
                ? "rounded-2xl border border-border/70 bg-card p-2 sm:p-4"
                : "mx-auto w-full max-w-3xl rounded-[2rem] border border-border/70 bg-linear-to-b from-muted/40 to-card p-3 sm:p-6"
            }
          >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
              <div>
                <p className="text-sm font-medium">
                  {comparing
                    ? `${t(`category_${category}`)} · ${t("comparePeriods")}`
                    : t(`category_${category}`)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`chart_${activeChartType}`)}
                  {rangeHint}
                </p>
              </div>
              <p className="text-lg font-semibold tabular-nums">
                {formatNumber(
                  isTimeCategory(category) && !comparing
                    ? timeTotal
                    : insightTotal,
                  locale,
                )}
              </p>
            </div>
            <AnalyticsChart
              type={activeChartType}
              timeData={timeData}
              distributionData={
                comparing || !isTimeCategory(category) ? distributionData : []
              }
              seriesKeys={seriesKeys}
              hiddenSeries={hiddenSeries}
              config={chartConfig}
              emptyLabel={t("empty")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">
              {t(`category_${secondaryCategory}`)}
            </CardTitle>
            <CardDescription>{t("analyticsSecondaryHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="donut"
              timeData={[]}
              distributionData={secondaryDistribution}
              seriesKeys={[]}
              hiddenSeries={new Set()}
              config={Object.fromEntries(
                secondaryDistribution.flatMap((row) => [
                  [row.key, { label: row.label, color: row.fill }],
                  [row.label, { label: row.label, color: row.fill }],
                ]),
              )}
              emptyLabel={t("empty")}
            />
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-primary/5 via-card to-card">
          <CardHeader>
            <CardTitle className="text-base">{t("analyticsSnapshot")}</CardTitle>
            <CardDescription>{t("analyticsSnapshotHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart
              type="radar"
              timeData={[]}
              distributionData={[
                {
                  key: "users",
                  label: t("totalUsers"),
                  value: parsedStats.users,
                  fill: SERIES_COLORS[0],
                },
                {
                  key: "advertisements",
                  label: t("totalAds"),
                  value: parsedStats.advertisements,
                  fill: SERIES_COLORS[1],
                },
                {
                  key: "comments",
                  label: t("comments"),
                  value: parsedStats.comments,
                  fill: SERIES_COLORS[2],
                },
                {
                  key: "reviews",
                  label: t("reviews"),
                  value: parsedStats.reviews,
                  fill: SERIES_COLORS[3],
                },
                {
                  key: "messages",
                  label: t("messages"),
                  value: parsedStats.messages,
                  fill: SERIES_COLORS[4],
                },
                {
                  key: "premiumSubscriptions",
                  label: t("premiumSubscriptions"),
                  value: parsedStats.premiumSubscriptions,
                  fill: SERIES_COLORS[0],
                },
              ]}
              seriesKeys={[]}
              hiddenSeries={new Set()}
              config={{
                value: { label: t("series_value"), color: "var(--primary)" },
              }}
              emptyLabel={t("empty")}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsCenter;
