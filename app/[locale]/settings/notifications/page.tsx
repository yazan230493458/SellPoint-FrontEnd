"use client";

import React, { useEffect, useState } from "react";
import SettingsPage from "../page";
import Alert from "../../components/ui/Alert";
import SettingsOption from "../../components/ui/SettingsOption";
import BaseButton from "../../components/ui/BaseButton";
import { useTranslations } from "next-intl";
import {
  useUserStore,
  defaultNotificationSettings,
  type NotificationSettings,
  type NotificationChannel,
} from "@/store/user.store";
import { apiRequest } from "@/lib/api";
import { useHydrated, useSessionGate } from "@/lib/use-hydrated";
import handleShowAlert from "../../Functions/handleShowAlert";
import { Save, MessageSquare, ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

type NotificationKey = keyof NotificationSettings;

interface NotificationSection {
  id: string;
  sectionTitle: string;
  icon: React.ElementType;
  items: {
    id: NotificationKey;
    title: string;
    description: string;
  }[];
}

const NotificationsPage = () => {
  const t = useTranslations("NotificationsPage");
  const { user, updateAllNotificationSettings, isAuthenticated, sessionReady } = useUserStore();
  const { pending } = useSessionGate();

  const [isSaved, setIsSaved] = useState(true);
  const mounted = useHydrated();
  const savedNotifications = user?.settings?.notifications;
  const [notificationSource, setNotificationSource] = useState(savedNotifications);
  const [notificationState, setNotificationState] =
    useState<NotificationSettings>({
      ...defaultNotificationSettings,
      ...savedNotifications,
    });
  if (savedNotifications && notificationSource !== savedNotifications) {
    setNotificationSource(savedNotifications);
    setNotificationState({
      ...defaultNotificationSettings,
      ...savedNotifications,
    });
  }

  useEffect(() => {
    if (!sessionReady || !isAuthenticated) return;
    void apiRequest<{ preference: {
      messagesChannel: number;
      offersChannel: number;
      adStatusChannel: number;
      securityChannel: number;
      reviewsChannel: number;
      priceDropsChannel: number;
      recommendationsChannel: number;
    } }>("/api/me/preferences").then((result) => {
      const preference = result.preference;
      const next: NotificationSettings = {
        messages: preference.messagesChannel === 1 ? 1 : 2,
        offersAndBids: preference.offersChannel === 1 ? 1 : 2,
        adStatus: preference.adStatusChannel === 1 ? 1 : 2,
        accountSecurity: preference.securityChannel === 1 ? 1 : 2,
        reviewsAndRatings: preference.reviewsChannel === 1 ? 1 : 2,
        priceDrops: preference.priceDropsChannel === 1 ? 1 : 2,
        recommendations: preference.recommendationsChannel === 1 ? 1 : 2,
      };
      setNotificationState(next);
      updateAllNotificationSettings(next);
    }).catch(() => undefined);
  }, [isAuthenticated, sessionReady, updateAllNotificationSettings]);

  if (pending) return null;
  if (!user || !isAuthenticated) {
    redirect("/log-in");
  }

  const handleChannelChange = (
    key: NotificationKey,
    value: NotificationChannel,
  ) => {
    setNotificationState((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!user || !sessionReady || !isAuthenticated) {
      handleShowAlert(t("error"), t("userNotFound"));
      return;
    }
    void apiRequest("/api/me/preferences", {
      method: "PUT",
      body: {
        messagesChannel: notificationState.messages,
        offersChannel: notificationState.offersAndBids,
        adStatusChannel: notificationState.adStatus,
        securityChannel: notificationState.accountSecurity,
        reviewsChannel: notificationState.reviewsAndRatings,
        priceDropsChannel: notificationState.priceDrops,
        recommendationsChannel: notificationState.recommendations,
      },
    }).then(() => {
      updateAllNotificationSettings(notificationState);
      setIsSaved(true);
      handleShowAlert(t("saved"), t("savedSuccessfully"));
    }).catch(() => {
      handleShowAlert(t("error"), t("userNotFound"));
    });
  };

  const choicesOptions = [
    { id: 1, value: "Enabled" },
    { id: 2, value: "Disabled" },
  ];

  const notificationSections: NotificationSection[] = [
    {
      id: "activity",
      sectionTitle: t("activitySectionTitle"),
      icon: MessageSquare,
      items: [
        {
          id: "messages",
          title: t("messagesTitle"),
          description: t("messagesDescription"),
        },
        {
          id: "reviewsAndRatings",
          title: t("reviewsAndRatingsTitle"),
          description: t("reviewsAndRatingsDescription"),
        },
      ],
    },
    {
      id: "systemAndUpdates",
      sectionTitle: t("systemSectionTitle"),
      icon: ShieldAlert,
      items: [
        {
          id: "accountSecurity",
          title: t("accountSecurityTitle"),
          description: t("accountSecurityDescription"),
        },
      ],
    },
  ];

  if (!mounted) return null;

  return (
    <SettingsPage>
      <div className="flex flex-col gap-6">
        <Alert />

        <div className="flex flex-col sm:flex-row sm:min-h-20 items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {!isSaved && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                {t("notSaved")}
              </span>
            )}

            <BaseButton
              type="button"
              variant="default"
              onClick={handleSave}
              className="gap-2.5 shadow-lg shadow-zinc-900/10 dark:shadow-zinc-950/20"
            >
              <Save className="w-4 h-4" />
              {t("saveChanges")}
            </BaseButton>
          </div>
        </div>

        {notificationSections.map((section, index) => {
          const SectionIcon = section.icon;

          return (
            <React.Fragment key={section.id}>
              {index > 0 && (
                <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-1" />
              )}

              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
                    <SectionIcon className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
                    {section.sectionTitle}
                  </h2>
                </div>

                <div className="w-full min-h-20 p-5 flex flex-col rounded-2xl bg-zinc-100 text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800 border border-zinc-300/20 dark:border-zinc-700/20 gap-5">
                  <div className="w-full flex items-center justify-end pb-2 border-b border-zinc-200 dark:border-zinc-700/50">
                    <div className="w-full sm:w-1/2 grid grid-cols-2 place-items-center text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <span>{t("enabled")}</span>
                      <span>{t("disabled")}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {section.items.map((item) => (
                      <SettingsOption
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        choices={{
                          options: choicesOptions,
                          selectedId: notificationState[item.id],
                          onChange: (selectedId: number) =>
                            handleChannelChange(
                              item.id,
                              selectedId as NotificationChannel,
                            ),
                        }}
                        className="bg-white/50 dark:bg-zinc-900/40 border border-zinc-300/20 dark:border-zinc-700/30"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </SettingsPage>
  );
};

export default NotificationsPage;
