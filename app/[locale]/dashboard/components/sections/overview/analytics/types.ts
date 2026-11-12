export type TrendPoint = {
  day: string;
  count: number;
};

export type TrendsBundle = {
  ads: TrendPoint[];
  users: TrendPoint[];
  reports: TrendPoint[];
};

export type PaymentStat = {
  status: string;
  count: number;
  amount: string;
};

export type AnalyticsStats = {
  users: number;
  administrators: number;
  advertisements: number;
  activeAds: number;
  inactiveAds: number;
  featuredAds: number;
  messages: number;
  comments: number;
  reviews: number;
  premiumSubscriptions: number;
  reports: Record<string, number>;
  payments: PaymentStat[];
};

export type AnalyticsCategory =
  | "adActivity"
  | "userRegistration"
  | "moderationActivity"
  | "activityCompare"
  | "adStatus"
  | "reportStatus"
  | "paymentTransactions"
  | "paymentRevenue"
  | "subscriptions"
  | "engagement"
  | "periodCompare";

export type ChartType =
  | "area"
  | "stackedArea"
  | "line"
  | "multiLine"
  | "bar"
  | "stackedBar"
  | "horizontalBar"
  | "pie"
  | "donut"
  | "radar"
  | "radialBar"
  | "scatter"
  | "composed";

export type DateRangeDays = 7 | 14 | 30 | 60 | 90;

export type Granularity = "daily" | "weekly" | "monthly";

export type SeriesKey = string;

export type TimeSeriesRow = {
  label: string;
  date: string;
  [key: string]: string | number;
};

export type DistributionRow = {
  key: string;
  label: string;
  value: number;
  fill: string;
};

export type ChartFamily = "cartesian" | "circular" | "radial" | "radar";

export const TIME_SERIES_CHARTS: ChartType[] = [
  "area",
  "stackedArea",
  "line",
  "multiLine",
  "bar",
  "stackedBar",
  "composed",
  "scatter",
];

export const DISTRIBUTION_CHARTS: ChartType[] = [
  "pie",
  "donut",
  "horizontalBar",
  "bar",
  "radialBar",
  "radar",
];

export const CATEGORY_CHARTS: Record<AnalyticsCategory, ChartType[]> = {
  adActivity: TIME_SERIES_CHARTS,
  userRegistration: TIME_SERIES_CHARTS,
  moderationActivity: TIME_SERIES_CHARTS,
  activityCompare: [
    "multiLine",
    "stackedArea",
    "stackedBar",
    "composed",
    "area",
    "line",
    "bar",
    "scatter",
  ],
  periodCompare: ["bar", "horizontalBar", "pie", "donut", "radialBar"],
  adStatus: DISTRIBUTION_CHARTS,
  reportStatus: DISTRIBUTION_CHARTS,
  paymentTransactions: DISTRIBUTION_CHARTS,
  paymentRevenue: DISTRIBUTION_CHARTS,
  subscriptions: ["radialBar", "pie", "donut", "bar", "horizontalBar", "radar"],
  engagement: DISTRIBUTION_CHARTS,
};

export const SERIES_COLORS = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;
