"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Row } from "../../types";
import {
  asUser,
  displayValue,
  formatDashboardDate,
  fullName,
  statusVariant,
  subscriptionDurationLabel,
} from "./billing-utils";

type BillingRowProps = {
  row: Row;
  kind: "payments" | "subscriptions";
};

type DetailItem = {
  label: string;
  value: string | null;
};

const KNOWN_STATUSES = new Set([
  "PENDING",
  "REVIEWING",
  "RESOLVED",
  "DISMISSED",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
]);

const statusLabel = (
  status: string,
  t: ReturnType<typeof useTranslations>,
) => {
  if (KNOWN_STATUSES.has(status)) {
    return t(`status_${status}` as "status_PENDING");
  }
  return status;
};

const BillingRow = ({ row, kind }: BillingRowProps) => {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const user = asUser(row.user);
  const name = fullName(user);
  const status = String(row.status ?? "");
  const planName = String(
    row.planName ??
      (row.plan as { name?: string } | undefined)?.name ??
      t("unknownPlan"),
  );
  const amount = displayValue(row.amount ?? row.planPrice);
  const currency = displayValue(row.currency ?? row.planCurrency);
  const durationDays = subscriptionDurationLabel(row);

  const summaryBits = [
    user.username ? `@${user.username}` : null,
    name,
    amount && currency ? `${amount} ${currency}` : amount,
  ].filter(Boolean);

  const details: DetailItem[] =
    kind === "payments"
      ? [
          { label: t("billingUserId"), value: displayValue(user.id) },
          { label: t("billingUsername"), value: displayValue(user.username) },
          { label: t("billingFullName"), value: name },
          { label: t("billingEmail"), value: displayValue(user.email) },
          { label: t("billingPlanName"), value: planName },
          {
            label: t("billingPlanPrice"),
            value:
              amount && currency
                ? `${amount} ${currency}`
                : amount ?? currency,
          },
          { label: t("billingPaymentStatus"), value: status || null },
          {
            label: t("billingPaymentMethod"),
            value: displayValue(row.paymentMethod),
          },
          {
            label: t("billingPaymentGateway"),
            value: displayValue(row.provider),
          },
          {
            label: t("billingTransactionId"),
            value: displayValue(row.providerIntentId),
          },
          {
            label: t("billingPaymentReference"),
            value: displayValue(row.providerReference),
          },
          {
            label: t("billingSubscriptionId"),
            value: displayValue(row.subscriptionId),
          },
          {
            label: t("billingSubscriptionStatus"),
            value: displayValue(row.subscriptionStatus),
          },
          {
            label: t("billingStartsAt"),
            value: formatDashboardDate(row.startsAt, locale),
          },
          {
            label: t("billingEndsAt"),
            value: formatDashboardDate(row.endsAt, locale),
          },
          {
            label: t("billingDuration"),
            value:
              durationDays !== null
                ? t("billingDurationDays", { days: durationDays })
                : null,
          },
          {
            label: t("billingAutoRenew"),
            value:
              typeof row.autoRenew === "boolean"
                ? row.autoRenew
                  ? t("enabled")
                  : t("disabled")
                : null,
          },
          {
            label: t("billingPaidAt"),
            value: formatDashboardDate(row.paidAt, locale),
          },
          {
            label: t("billingCreatedAt"),
            value: formatDashboardDate(row.createdAt, locale),
          },
          {
            label: t("billingUpdatedAt"),
            value: formatDashboardDate(row.updatedAt, locale),
          },
        ]
      : [
          { label: t("billingUserId"), value: displayValue(user.id) },
          { label: t("billingUsername"), value: displayValue(user.username) },
          { label: t("billingFullName"), value: name },
          { label: t("billingEmail"), value: displayValue(user.email) },
          { label: t("billingPlanName"), value: planName },
          {
            label: t("billingPlanPrice"),
            value:
              amount && currency
                ? `${amount} ${currency}`
                : amount ?? currency,
          },
          { label: t("billingSubscriptionStatus"), value: status || null },
          {
            label: t("billingStartsAt"),
            value: formatDashboardDate(row.startsAt, locale),
          },
          {
            label: t("billingEndsAt"),
            value: formatDashboardDate(row.endsAt, locale),
          },
          {
            label: t("billingDuration"),
            value:
              durationDays !== null
                ? t("billingDurationDays", { days: durationDays })
                : null,
          },
          {
            label: t("billingAutoRenew"),
            value:
              typeof row.autoRenew === "boolean"
                ? row.autoRenew
                  ? t("enabled")
                  : t("disabled")
                : null,
          },
          {
            label: t("billingCancelledAt"),
            value: formatDashboardDate(row.cancelledAt, locale),
          },
          {
            label: t("billingCreatedAt"),
            value: formatDashboardDate(row.createdAt, locale),
          },
          {
            label: t("billingUpdatedAt"),
            value: formatDashboardDate(row.updatedAt, locale),
          },
          {
            label: t("billingLatestPaymentStatus"),
            value: displayValue(
              (row.latestPayment as { status?: string } | null)?.status,
            ),
          },
          {
            label: t("billingLatestPaymentReference"),
            value: displayValue(
              (row.latestPayment as { providerReference?: string } | null)
                ?.providerReference,
            ),
          },
          {
            label: t("billingPaymentGateway"),
            value: displayValue(
              (row.latestPayment as { provider?: string } | null)?.provider,
            ),
          },
          {
            label: t("billingPaymentMethod"),
            value: displayValue(
              (row.latestPayment as { paymentMethod?: string } | null)
                ?.paymentMethod,
            ),
          },
        ];

  const visibleDetails = details.filter((item) => item.value);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="truncate text-sm">{planName}</CardTitle>
          <p className="truncate text-xs text-muted-foreground">
            {summaryBits.join(" · ") || t("billingNoSummary")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {status ? (
            <Badge variant={statusVariant(status)}>
              {statusLabel(status, t)}
            </Badge>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <ChevronUp /> : <ChevronDown />}
            {open ? t("billingHideDetails") : t("billingViewDetails")}
          </Button>
        </div>
      </CardHeader>
      {open ? (
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            {visibleDetails.map((item) => (
              <div
                key={`${item.label}-${item.value}`}
                className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2"
              >
                <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </dt>
                <dd className="mt-1 break-all text-sm font-medium">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      ) : null}
    </Card>
  );
};

export default BillingRow;
