import type {
  AnalyticsCategory,
  AnalyticsStats,
  ChartFamily,
  ChartType,
  DateRangeDays,
  DistributionRow,
  Granularity,
  PaymentStat,
  SeriesKey,
  TimeSeriesRow,
  TrendPoint,
  TrendsBundle,
} from "./types";
import { SERIES_COLORS as COLORS } from "./types";

const toDayKey = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const parseCount = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const normalizeTrendPoints = (rows: TrendPoint[] | undefined) =>
  (rows ?? []).map((row) => ({
    day: toDayKey(row.day),
    count: parseCount(row.count),
  }));

export const parseAnalyticsStats = (
  stats: Record<string, unknown>,
): AnalyticsStats => {
  const reportsRaw =
    stats.reports && typeof stats.reports === "object"
      ? (stats.reports as Record<string, unknown>)
      : {};
  const paymentsRaw = Array.isArray(stats.payments) ? stats.payments : [];

  return {
    users: parseCount(stats.users),
    administrators: parseCount(stats.administrators),
    advertisements: parseCount(stats.advertisements),
    activeAds: parseCount(stats.activeAds),
    inactiveAds: parseCount(stats.inactiveAds),
    featuredAds: parseCount(stats.featuredAds),
    messages: parseCount(stats.messages),
    comments: parseCount(stats.comments),
    reviews: parseCount(stats.reviews),
    premiumSubscriptions: parseCount(stats.premiumSubscriptions),
    reports: Object.fromEntries(
      Object.entries(reportsRaw).map(([key, value]) => [key, parseCount(value)]),
    ),
    payments: paymentsRaw.map((item) => {
      const row = item as PaymentStat;
      return {
        status: String(row.status ?? "UNKNOWN"),
        count: parseCount(row.count),
        amount: String(row.amount ?? "0"),
      };
    }),
  };
};

const enumerateDays = (days: DateRangeDays) => {
  const keys: string[] = [];
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - index);
    keys.push(date.toISOString().slice(0, 10));
  }
  return keys;
};

const toCountMap = (points: TrendPoint[]) => {
  const map = new Map<string, number>();
  for (const point of normalizeTrendPoints(points)) {
    map.set(point.day, (map.get(point.day) ?? 0) + point.count);
  }
  return map;
};

const weekKey = (day: string) => {
  const date = new Date(`${day}T12:00:00.000Z`);
  const utc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

const monthKey = (day: string) => day.slice(0, 7);

export const buildTimeSeries = (
  days: DateRangeDays,
  series: Record<SeriesKey, TrendPoint[]>,
  granularity: Granularity,
): TimeSeriesRow[] => {
  const dayKeys = enumerateDays(days);
  const maps = Object.fromEntries(
    Object.entries(series).map(([key, points]) => [key, toCountMap(points)]),
  ) as Record<SeriesKey, Map<string, number>>;

  const daily = dayKeys.map((day) => {
    const row: TimeSeriesRow = { label: day, date: day };
    for (const key of Object.keys(maps)) {
      row[key] = maps[key].get(day) ?? 0;
    }
    return row;
  });

  if (granularity === "daily") return daily;

  const buckets = new Map<string, TimeSeriesRow>();
  for (const row of daily) {
    const key =
      granularity === "weekly" ? weekKey(row.date) : monthKey(row.date);
    const current = buckets.get(key) ?? { label: key, date: key };
    for (const seriesKey of Object.keys(maps)) {
      current[seriesKey] =
        Number(current[seriesKey] ?? 0) + Number(row[seriesKey] ?? 0);
    }
    buckets.set(key, current);
  }
  return Array.from(buckets.values());
};

export const buildPeriodCompare = (
  days: DateRangeDays,
  points: TrendPoint[],
  earlierLabel: string,
  laterLabel: string,
): DistributionRow[] => {
  const filled = buildTimeSeries(days, { value: points }, "daily");
  const midpoint = Math.floor(filled.length / 2);
  const earlier = filled
    .slice(0, midpoint)
    .reduce((sum, row) => sum + Number(row.value ?? 0), 0);
  const later = filled
    .slice(midpoint)
    .reduce((sum, row) => sum + Number(row.value ?? 0), 0);
  return [
    {
      key: "earlier",
      label: earlierLabel,
      value: earlier,
      fill: COLORS[0],
    },
    {
      key: "later",
      label: laterLabel,
      value: later,
      fill: COLORS[1],
    },
  ];
};

export const chartFamily = (type: ChartType): ChartFamily => {
  if (type === "pie" || type === "donut") return "circular";
  if (type === "radialBar") return "radial";
  if (type === "radar") return "radar";
  return "cartesian";
};

export const seriesForCategory = (
  category: AnalyticsCategory,
  trends: TrendsBundle,
): Record<SeriesKey, TrendPoint[]> => {
  switch (category) {
    case "adActivity":
    case "periodCompare":
      return { ads: trends.ads };
    case "userRegistration":
      return { users: trends.users };
    case "moderationActivity":
      return { reports: trends.reports };
    case "activityCompare":
      return {
        ads: trends.ads,
        users: trends.users,
        reports: trends.reports,
      };
    default:
      return {};
  }
};

export const distributionForCategory = (
  category: AnalyticsCategory,
  stats: AnalyticsStats,
  labels: {
    activeAds: string;
    inactiveAds: string;
    featuredAds: string;
    standardActiveAds: string;
    messages: string;
    comments: string;
    reviews: string;
    premiumSubscriptions: string;
    otherUsers: string;
    status: (status: string) => string;
  },
  trends?: TrendsBundle,
  days?: DateRangeDays,
  periodLabels?: { earlier: string; later: string },
): DistributionRow[] => {
  if (category === "adStatus") {
    const featured = stats.featuredAds;
    const standardActive = Math.max(0, stats.activeAds - featured);
    return [
      {
        key: "featuredAds",
        label: labels.featuredAds,
        value: featured,
        fill: COLORS[0],
      },
      {
        key: "standardActiveAds",
        label: labels.standardActiveAds,
        value: standardActive,
        fill: COLORS[1],
      },
      {
        key: "inactiveAds",
        label: labels.inactiveAds,
        value: stats.inactiveAds,
        fill: COLORS[2],
      },
    ].filter((row) => row.value > 0 || stats.advertisements === 0);
  }

  if (category === "reportStatus") {
    const entries = Object.entries(stats.reports);
    if (!entries.length) return [];
    return entries.map(([status, value], index) => ({
      key: status,
      label: labels.status(status),
      value,
      fill: COLORS[index % COLORS.length],
    }));
  }

  if (category === "paymentTransactions") {
    return stats.payments.map((payment, index) => ({
      key: payment.status,
      label: labels.status(payment.status),
      value: payment.count,
      fill: COLORS[index % COLORS.length],
    }));
  }

  if (category === "paymentRevenue") {
    return stats.payments.map((payment, index) => ({
      key: payment.status,
      label: labels.status(payment.status),
      value: Number.parseFloat(payment.amount) || 0,
      fill: COLORS[index % COLORS.length],
    }));
  }

  if (category === "subscriptions") {
    const subscribed = stats.premiumSubscriptions;
    const remaining = Math.max(0, stats.users - subscribed);
    return [
      {
        key: "premiumSubscriptions",
        label: labels.premiumSubscriptions,
        value: subscribed,
        fill: COLORS[0],
      },
      {
        key: "otherUsers",
        label: labels.otherUsers,
        value: remaining,
        fill: COLORS[1],
      },
    ];
  }

  if (category === "engagement") {
    return [
      {
        key: "messages",
        label: labels.messages,
        value: stats.messages,
        fill: COLORS[0],
      },
      {
        key: "comments",
        label: labels.comments,
        value: stats.comments,
        fill: COLORS[1],
      },
      {
        key: "reviews",
        label: labels.reviews,
        value: stats.reviews,
        fill: COLORS[2],
      },
    ];
  }

  if (category === "periodCompare" && trends && days && periodLabels) {
    return buildPeriodCompare(
      days,
      trends.ads,
      periodLabels.earlier,
      periodLabels.later,
    );
  }

  return [];
};

export const isTimeCategory = (category: AnalyticsCategory) =>
  category === "adActivity" ||
  category === "userRegistration" ||
  category === "moderationActivity" ||
  category === "activityCompare";
