import { getLocaleIntl } from "@/i18n/locales";
import type { Row } from "../../types";

export type BillingUser = {
  id?: number;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export const asUser = (value: unknown): BillingUser =>
  value && typeof value === "object" ? (value as BillingUser) : {};

export const fullName = (user: BillingUser) => {
  const name = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  return name || null;
};

export const displayValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
};

export const formatDashboardDate = (
  value: unknown,
  locale: string,
) => {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(getLocaleIntl(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const statusVariant = (
  status: string,
): "default" | "secondary" | "destructive" | "outline" => {
  const normalized = status.toUpperCase();
  if (
    normalized === "COMPLETED" ||
    normalized === "ACTIVE" ||
    normalized === "PAID"
  ) {
    return "default";
  }
  if (
    normalized === "FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "REFUNDED"
  ) {
    return "destructive";
  }
  if (normalized === "PENDING" || normalized === "EXPIRED") {
    return "secondary";
  }
  return "outline";
};

export const subscriptionDurationLabel = (row: Row) => {
  const days = Number(row.durationDays);
  if (Number.isFinite(days) && days > 0) return days;
  const startsAt = row.startsAt ? new Date(String(row.startsAt)) : null;
  const endsAt = row.endsAt ? new Date(String(row.endsAt)) : null;
  if (
    startsAt &&
    endsAt &&
    !Number.isNaN(startsAt.getTime()) &&
    !Number.isNaN(endsAt.getTime())
  ) {
    return Math.max(
      0,
      Math.round((endsAt.getTime() - startsAt.getTime()) / 86_400_000),
    );
  }
  return null;
};
