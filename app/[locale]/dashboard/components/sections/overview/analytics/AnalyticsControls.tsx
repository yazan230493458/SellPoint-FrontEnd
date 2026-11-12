"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  CATEGORY_CHARTS,
  type AnalyticsCategory,
  type ChartType,
  type DateRangeDays,
  type Granularity,
  type SeriesKey,
} from "./types";
import { isTimeCategory } from "./utils";

const COMPARE_CHARTS: ChartType[] = [
  "bar",
  "horizontalBar",
  "pie",
  "donut",
  "radialBar",
];

type AnalyticsControlsProps = {
  category: AnalyticsCategory;
  chartType: ChartType;
  days: DateRangeDays;
  granularity: Granularity;
  comparePeriods: boolean;
  seriesKeys: SeriesKey[];
  hiddenSeries: Set<string>;
  seriesLabels: Record<string, string>;
  onCategoryChange: (category: AnalyticsCategory) => void;
  onChartTypeChange: (type: ChartType) => void;
  onDaysChange: (days: DateRangeDays) => void;
  onGranularityChange: (granularity: Granularity) => void;
  onComparePeriodsChange: (value: boolean) => void;
  onToggleSeries: (key: SeriesKey) => void;
};

const CATEGORIES: AnalyticsCategory[] = [
  "adActivity",
  "userRegistration",
  "moderationActivity",
  "activityCompare",
  "adStatus",
  "reportStatus",
  "paymentTransactions",
  "paymentRevenue",
  "subscriptions",
  "engagement",
  "periodCompare",
];

const RANGES: DateRangeDays[] = [7, 14, 30, 60, 90];

const AnalyticsControls = ({
  category,
  chartType,
  days,
  granularity,
  comparePeriods,
  seriesKeys,
  hiddenSeries,
  seriesLabels,
  onCategoryChange,
  onChartTypeChange,
  onDaysChange,
  onGranularityChange,
  onComparePeriodsChange,
  onToggleSeries,
}: AnalyticsControlsProps) => {
  const t = useTranslations("Dashboard");
  const chartTypes = comparePeriods
    ? COMPARE_CHARTS
    : CATEGORY_CHARTS[category];
  const showTimeControls =
    isTimeCategory(category) || category === "periodCompare";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            {t("analyticsCategory")}
            <Select
              value={category}
              onValueChange={(value) => {
                if (value) onCategoryChange(value as AnalyticsCategory);
              }}
            >
              <SelectTrigger className="w-full min-w-0" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`category_${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            {t("chartType")}
            <Select
              value={chartType}
              onValueChange={(value) => {
                if (value) onChartTypeChange(value as ChartType);
              }}
            >
              <SelectTrigger className="w-full min-w-0" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chartTypes.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`chart_${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {showTimeControls ? (
            <>
              <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                {t("dateRange")}
                <Select
                  value={String(days)}
                  onValueChange={(value) => {
                    if (value) onDaysChange(Number(value) as DateRangeDays);
                  }}
                >
                  <SelectTrigger className="w-full min-w-0" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RANGES.map((item) => (
                      <SelectItem key={item} value={String(item)}>
                        {t(`range_${item}d`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>

              {isTimeCategory(category) ? (
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                  {t("granularity")}
                  <Select
                    value={granularity}
                    onValueChange={(value) => {
                      if (value) onGranularityChange(value as Granularity);
                    }}
                  >
                    <SelectTrigger className="w-full min-w-0" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{t("granularity_daily")}</SelectItem>
                      <SelectItem value="weekly">{t("granularity_weekly")}</SelectItem>
                      <SelectItem value="monthly">
                        {t("granularity_monthly")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {showTimeControls ? (
        <div className="flex flex-wrap items-center gap-2">
          <ToggleGroup
            multiple={false}
            value={[String(days)]}
            onValueChange={(value) => {
              const next = value[0];
              if (next) onDaysChange(Number(next) as DateRangeDays);
            }}
            variant="outline"
            size="sm"
            className="hidden md:flex"
          >
            {RANGES.map((item) => (
              <ToggleGroupItem key={item} value={String(item)}>
                {t(`range_${item}d`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          {isTimeCategory(category) ? (
            <Button
              type="button"
              size="sm"
              variant={comparePeriods ? "default" : "outline"}
              onClick={() => onComparePeriodsChange(!comparePeriods)}
            >
              {t("comparePeriods")}
            </Button>
          ) : null}
        </div>
      ) : null}

      {seriesKeys.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("seriesToggle")}
          </span>
          {seriesKeys.map((key) => {
            const active = !hiddenSeries.has(key);
            return (
              <Button
                key={key}
                type="button"
                size="xs"
                variant={active ? "default" : "outline"}
                onClick={() => onToggleSeries(key)}
              >
                {seriesLabels[key] ?? key}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default AnalyticsControls;
