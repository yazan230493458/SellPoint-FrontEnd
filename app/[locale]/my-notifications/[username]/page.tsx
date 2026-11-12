"use client";

import React, { useState, useMemo, useEffect } from "react";
import Header from "@/app/[locale]/components/main/Header";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import BaseButton from "@/app/[locale]/components/ui/BaseButton";
import { isSafeInternalHref } from "@/lib/safe-href";
import {
  useNotificationStore,
  NotificationItem,
} from "@/store/notification.store";
import {
  Bell,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Filter,
  BellOff,
  Sparkles,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { useUserStore } from "@/store/user.store";
import { useHydrated } from "@/lib/use-hydrated";
import { formatDateTime } from "@/lib/intl-format";

const MyNotificationsPage = () => {
  const t = useTranslations("MyNotificationsPage");
  const locale = useLocale();
  const mounted = useHydrated();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const sessionReady = useUserStore((state) => state.sessionReady);

  useEffect(() => {
    if (!sessionReady || !isAuthenticated) return;
    void apiRequest<{ notifications: Array<{ id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string; href: string | null }> }>("/api/notifications")
      .then((result) => {
        const mapped: NotificationItem[] = result.notifications.map((item) => ({
          id: String(item.id),
          title: item.title,
          message: item.message,
          type: item.type === "SUCCESS" || item.type === "REVIEW" ? "success" : item.type === "WARNING" || item.type === "REPORT" ? "warning" : item.type === "ERROR" || item.type === "SECURITY" ? "error" : "info",
          createdAt: item.createdAt,
          isRead: item.isRead,
          ...(item.href ? { href: item.href } : {}),
        }));
        setNotifications(mapped);
      })
      .catch(() => undefined);
  }, [isAuthenticated, sessionReady, setNotifications]);

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useNotificationStore();

  const unreadCount = mounted ? notifications.filter((item) => !item.isRead).length : 0;

  const filteredNotifications = useMemo(() => {
    if (!mounted) return [];
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab, mounted]);

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case "error":
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getTypeBadgeStyle = (type: NotificationItem["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "warning":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "error":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "info":
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
  };

  const formatDate = (dateString: string) =>
    formatDateTime(dateString, locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      year: undefined,
    }) || dateString;

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Header className="h-20 flex justify-between rounded-xl fixed top-5 inset-x-3 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/30" />
      <main className="min-h-dvh mt-30 pb-16 px-5 max-w-5xl mx-auto text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50 shadow-sm relative">
              <Bell className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
                  {t("title") || "Notifications"}
                </h1>
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {t("subtitle") || "Manage and review all your account alerts"}
              </p>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            {notifications.length > 0 && (
              <>
                <BaseButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void apiRequest("/api/notifications/read-all", { method: "PATCH" }).catch(() => undefined);
                    markAllAsRead();
                  }}
                  className="h-10 gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-3.5 py-0 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t("markAllAsRead")}</span>
                </BaseButton>

                <BaseButton
                  type="button"
                  variant="ghost"
                  onClick={clearNotifications}
                  className="h-10 gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-0 text-xs font-semibold text-rose-600 shadow-sm hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t("clearAll")}</span>
                </BaseButton>
              </>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between my-6">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 w-fit">
            <BaseButton
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("all")}
              className={`h-auto gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                activeTab === "all"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>{t("all")}</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                {notifications.length}
              </span>
            </BaseButton>

            <BaseButton
              type="button"
              variant="ghost"
              onClick={() => setActiveTab("unread")}
              className={`h-auto gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                activeTab === "unread"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>{t("unread")}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </BaseButton>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-zinc-400">
            <Filter className="w-3.5 h-3.5" />
            <span>{t("sortedByNewest") || "Sorted by newest"}</span>
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 text-center gap-4 shadow-sm my-6">
            <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
              <BellOff className="w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1 max-w-sm">
              <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                {activeTab === "unread"
                  ? t("noUnreadNotifications") || "No unread notifications"
                  : t("noNotifications") || "No notifications yet"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {t("emptyStateDescription") ||
                  "When you receive new alerts, updates or system messages, they will appear here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((notification) => {
              const cardContent = (
                <div
                  className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                    notification.isRead
                      ? "bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/60"
                      : "bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700/80 shadow-md shadow-zinc-900/5"
                  }`}
                >
                  {!notification.isRead && (
                    <span className="absolute top-4 right-4 sm:top-5 sm:right-5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                  )}

                  <div className="flex items-start gap-3.5 w-full">
                    <div className="mt-0.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/50">
                      {getIcon(notification.type)}
                    </div>

                    <div className="flex flex-col gap-1 pr-6 sm:pr-0 w-full">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-sm font-bold tracking-tight ${
                            notification.isRead
                              ? "text-zinc-700 dark:text-zinc-300"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getTypeBadgeStyle(
                            notification.type
                          )} uppercase tracking-wider`}
                        >
                          {notification.type}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-0.5">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                          {formatDate(notification.createdAt)}
                        </span>

                        {isSafeInternalHref(notification.href) && (
                          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:underline">
                            <span>{t("viewDetails") || "View details"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Item */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 w-full sm:w-auto justify-end">
                    {!notification.isRead && (
                      <BaseButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("markAsRead")}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          markAsRead(notification.id);
                      void apiRequest(`/api/notifications/${notification.id}/read`, { method: "PATCH" }).catch(() => undefined);
                          void apiRequest(`/api/notifications/${notification.id}/read`, { method: "PATCH" }).catch(() => undefined);
                        }}
                        className="size-9 p-0 text-zinc-400 hover:bg-zinc-100 hover:text-emerald-600 dark:hover:bg-zinc-800 dark:hover:text-emerald-400"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </BaseButton>
                    )}

                    <BaseButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("delete")}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeNotification(notification.id);
                        void apiRequest(`/api/notifications/${notification.id}`, { method: "DELETE" }).catch(() => undefined);
                      }}
                      className="size-9 p-0 text-zinc-400 hover:bg-zinc-100 hover:text-rose-600 dark:hover:bg-zinc-800 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </BaseButton>
                  </div>
                </div>
              );

              const destination = isSafeInternalHref(notification.href)
                ? notification.href
                : null;

              return destination ? (
                <BaseLink
                  key={notification.id}
                  href={destination}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                      void apiRequest(`/api/notifications/${notification.id}/read`, { method: "PATCH" }).catch(() => undefined);
                    }
                  }}
                  className="block"
                >
                  {cardContent}
                </BaseLink>
              ) : (
                <BaseButton
                  key={notification.id}
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                      void apiRequest(`/api/notifications/${notification.id}/read`, { method: "PATCH" }).catch(() => undefined);
                    }
                  }}
                  className="h-auto w-full whitespace-normal bg-transparent p-0 text-start hover:bg-transparent"
                >
                  {cardContent}
                </BaseButton>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
};

export default MyNotificationsPage;