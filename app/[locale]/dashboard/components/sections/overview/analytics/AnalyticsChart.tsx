"use client";

import { useLocale } from "next-intl";
import { getLocaleIntl } from "@/i18n/locales";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  ChartType,
  DistributionRow,
  SeriesKey,
  TimeSeriesRow,
} from "./types";
import { chartFamily } from "./utils";

type AnalyticsChartProps = {
  type: ChartType;
  timeData: TimeSeriesRow[];
  distributionData: DistributionRow[];
  seriesKeys: SeriesKey[];
  hiddenSeries: Set<string>;
  config: ChartConfig;
  emptyLabel: string;
};

const AnalyticsChart = ({
  type,
  timeData,
  distributionData,
  seriesKeys,
  hiddenSeries,
  config,
  emptyLabel,
}: AnalyticsChartProps) => {
  const locale = useLocale();
  const family = chartFamily(type);
  const visibleSeries = seriesKeys.filter((key) => !hiddenSeries.has(key));
  const dateLocale = getLocaleIntl(locale);

  const formatTick = (value: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = new Date(`${value}T12:00:00`);
      return date.toLocaleDateString(dateLocale, {
        month: "short",
        day: "numeric",
      });
    }
    return value;
  };

  const formatTooltipLabel = (value: unknown) => {
    const text = String(value ?? "");
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return new Date(`${text}T12:00:00`).toLocaleDateString(dateLocale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return text;
  };

  const heightClass =
    family === "cartesian"
      ? "aspect-auto h-[300px] w-full sm:h-[340px]"
      : family === "radar"
        ? "mx-auto aspect-square h-[280px] w-full max-w-md"
        : "mx-auto aspect-square h-[280px] w-full max-w-sm sm:h-[320px]";

  if (family === "cartesian" && timeData.length === 0 && distributionData.length === 0) {
    return (
      <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  if (
    (family === "circular" || family === "radial" || family === "radar") &&
    distributionData.length === 0 &&
    type !== "radar"
  ) {
    return (
      <p className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  const scatterData = timeData.flatMap((row, index) =>
    visibleSeries.map((key) => ({
      x: index + 1,
      y: Number(row[key] ?? 0),
      series: key,
      label: row.label,
    })),
  );

  const radarData =
    distributionData.length > 0
      ? distributionData.map((row) => ({
          metric: row.label,
          value: row.value,
        }))
      : seriesKeys.map((key) => ({
          metric: String(config[key]?.label ?? key),
          value: timeData.reduce((sum, row) => sum + Number(row[key] ?? 0), 0),
        }));

  return (
    <ChartContainer config={config} className={heightClass}>
      {type === "area" || type === "stackedArea" ? (
        <AreaChart data={timeData}>
          <defs>
            {visibleSeries.map((key) => (
              <linearGradient
                key={key}
                id={`fill-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.85}
                />
                <stop
                  offset="95%"
                  stopColor={`var(--color-${key})`}
                  stopOpacity={0.08}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={formatTick}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={formatTooltipLabel}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {visibleSeries.map((key) => (
            <Area
              key={key}
              dataKey={key}
              type="natural"
              fill={`url(#fill-${key})`}
              stroke={`var(--color-${key})`}
              stackId={type === "stackedArea" ? "stack" : undefined}
            />
          ))}
        </AreaChart>
      ) : null}

      {type === "line" || type === "multiLine" ? (
        <LineChart data={timeData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={formatTick}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent labelFormatter={formatTooltipLabel} />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {visibleSeries.map((key) => (
            <Line
              key={key}
              dataKey={key}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      ) : null}

      {type === "bar" || type === "stackedBar" ? (
        <BarChart
          data={
            distributionData.length && !timeData.length
              ? distributionData.map((row) => ({
                  label: row.label,
                  date: row.label,
                  value: row.value,
                  fill: row.fill,
                }))
              : timeData
          }
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={formatTick}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent labelFormatter={formatTooltipLabel} />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {distributionData.length && !timeData.length ? (
            <Bar dataKey="value" radius={6}>
              {distributionData.map((row) => (
                <Cell key={row.key} fill={row.fill} />
              ))}
            </Bar>
          ) : (
            visibleSeries.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={4}
                stackId={type === "stackedBar" ? "stack" : undefined}
              />
            ))
          )}
        </BarChart>
      ) : null}

      {type === "horizontalBar" ? (
        <BarChart
          layout="vertical"
          data={
            distributionData.length
              ? distributionData.map((row) => ({
                  label: row.label,
                  value: row.value,
                  fill: row.fill,
                }))
              : timeData.map((row) => ({
                  label: formatTick(row.label),
                  value: visibleSeries.reduce(
                    (sum, key) => sum + Number(row[key] ?? 0),
                    0,
                  ),
                }))
          }
          margin={{ left: 8, right: 8 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            width={88}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={6}>
            {(distributionData.length
              ? distributionData
              : visibleSeries.map((key, index) => ({
                  key,
                  fill: `var(--color-${key})`,
                }))
            ).map((row, index) => (
              <Cell
                key={"key" in row ? row.key : index}
                fill={"fill" in row ? String(row.fill) : "var(--primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      ) : null}

      {type === "composed" ? (
        <ComposedChart data={timeData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={formatTick}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            content={
              <ChartTooltipContent labelFormatter={formatTooltipLabel} />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {visibleSeries.length === 1 ? (
            <>
              <Area
                dataKey={visibleSeries[0]}
                type="natural"
                fill={`var(--color-${visibleSeries[0]})`}
                fillOpacity={0.15}
                stroke={`var(--color-${visibleSeries[0]})`}
              />
              <Line
                dataKey={visibleSeries[0]}
                type="monotone"
                stroke={`var(--color-${visibleSeries[0]})`}
                strokeWidth={2}
                dot={false}
              />
            </>
          ) : (
            visibleSeries.map((key, index) =>
              index === 0 ? (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`var(--color-${key})`}
                  radius={4}
                />
              ) : (
                <Line
                  key={key}
                  dataKey={key}
                  type="monotone"
                  stroke={`var(--color-${key})`}
                  strokeWidth={2}
                  dot={false}
                />
              ),
            )
          )}
        </ComposedChart>
      ) : null}

      {type === "scatter" ? (
        <ScatterChart>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="index"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="value"
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <ZAxis range={[60, 60]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          {visibleSeries.map((key) => (
            <Scatter
              key={key}
              name={String(config[key]?.label ?? key)}
              data={scatterData.filter((point) => point.series === key)}
              fill={`var(--color-${key})`}
            />
          ))}
        </ScatterChart>
      ) : null}

      {type === "pie" || type === "donut" ? (
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="label" />} />
          <ChartLegend content={<ChartLegendContent nameKey="label" />} />
          <Pie
            data={distributionData}
            dataKey="value"
            nameKey="label"
            innerRadius={type === "donut" ? "55%" : 0}
            outerRadius="80%"
            strokeWidth={2}
          >
            {distributionData.map((row) => (
              <Cell key={row.key} fill={row.fill} />
            ))}
          </Pie>
        </PieChart>
      ) : null}

      {type === "radialBar" ? (
        <RadialBarChart
          data={distributionData.map((row) => ({
            ...row,
            name: row.label,
          }))}
          innerRadius="24%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
        >
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <PolarGrid gridType="circle" />
          <RadialBar dataKey="value" background>
            {distributionData.map((row) => (
              <Cell key={row.key} fill={row.fill} />
            ))}
          </RadialBar>
          <Legend />
        </RadialBarChart>
      ) : null}

      {type === "radar" ? (
        <RadarChart data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Radar
            dataKey="value"
            fill="var(--primary)"
            fillOpacity={0.35}
            stroke="var(--primary)"
          />
        </RadarChart>
      ) : null}
    </ChartContainer>
  );
};

export default AnalyticsChart;
