"use client";

import { useTranslations } from "next-intl";
import StatCard from "./overview/StatCard";
import AnalyticsCenter from "./overview/analytics/AnalyticsCenter";
import type {
  DateRangeDays,
  TrendsBundle,
} from "./overview/analytics/types";

type DashboardOverviewProps = {
  stats: Record<string, unknown>;
  trends: TrendsBundle;
  trendDays: DateRangeDays;
  onTrendDaysChange: (days: DateRangeDays) => void;
};

const DashboardOverview = ({
  stats,
  trends,
  trendDays,
  onTrendDaysChange,
}: DashboardOverviewProps) => {
  const t = useTranslations("Dashboard");

  const primaryCards: Array<[string, unknown, string]> = [
    ["totalUsers", stats.users, t("statUsersHint")],
    ["totalAds", stats.advertisements, t("statAdsHint")],
    ["activeAds", stats.activeAds, t("statActiveAdsHint")],
    ["premiumSubscriptions", stats.premiumSubscriptions, t("statPremiumHint")],
  ];

  const secondaryCards: Array<[string, unknown]> = [
    ["totalAdministrators", stats.administrators],
    ["inactiveAds", stats.inactiveAds],
    ["featuredAds", stats.featuredAds],
    ["messages", stats.messages],
  ];

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 gap-4 px-0 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {primaryCards.map(([label, value, hint]) => (
          <StatCard key={label} label={t(label)} value={value} hint={hint} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {secondaryCards.map(([label, value]) => (
          <StatCard key={label} label={t(label)} value={value} />
        ))}
      </div>

      <AnalyticsCenter
        stats={stats}
        trends={trends}
        days={trendDays}
        onDaysChange={onTrendDaysChange}
      />
    </div>
  );
};

export default DashboardOverview;
