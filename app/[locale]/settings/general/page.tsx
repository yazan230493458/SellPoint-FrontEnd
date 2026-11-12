"use client";

import React, { useState } from "react";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { confirmSavedLocale } from "../../components/locale-history";
import SettingsOption from "../../components/ui/SettingsOption";
import LanguageSelect from "../../components/ui/LanguageSelect";
import SettingsPage from "../page";
import Alert from "../../components/ui/Alert";
import Window from "../../components/ui/Window";
import BaseButton from "../../components/ui/BaseButton";
import { clearAllStores } from "@/store/clear-stores";
import { apiRequest, ApiError } from "@/lib/api";
import { useUserStore, defaultGeneralSettings } from "@/store/user.store";
import { useSessionGate } from "@/lib/use-hydrated";
import handleShowAlert from "../../Functions/handleShowAlert";
import { Save, Palette, Sliders, Cpu, UserX } from "lucide-react";
import countriesData from "@/data/locationData";
import {
  requestNotificationPermission,
  sendNotification,
} from "@/utils/notifications";
import { redirect } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/i18n/locales";

type ModalType = "disableAccount" | "deleteAccount";

const GeneralPage = () => {
  const t = useTranslations("GeneralPage");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();

  const { user, updateGeneralSettings } = useUserStore();
  const { pending, isAuthenticated } = useSessionGate();

  const [isSaved, setIsSaved] = useState(true);
  const [openModal, setOpenModal] = useState<ModalType | null>(null);
  const generalSource = user?.settings?.general;
  const [generalSourceSeen, setGeneralSourceSeen] = useState(generalSource);
  const [generalState, setGeneralState] = useState({
    ...defaultGeneralSettings,
    ...generalSource,
  });
  if (generalSource && generalSourceSeen !== generalSource) {
    setGeneralSourceSeen(generalSource);
    setGeneralState({
      ...defaultGeneralSettings,
      ...generalSource,
    });
  }

  const regionOptions = Object.keys(countriesData).map((country, index) => ({
    id: index + 1,
    label: country,
    value: country,
  }));

  const selectedCountry = Object.prototype.hasOwnProperty.call(
    countriesData,
    generalState.region,
  )
    ? (generalState.region as keyof typeof countriesData)
    : undefined;

  const cityOptions = selectedCountry
    ? countriesData[selectedCountry].cities.map((city, cityIndex) => ({
        id: cityIndex + 1,
        label: city,
        value: city,
      }))
    : [];

  const accountActions = [
    {
      id: "disableAccount" as const,
      title: t("disableAccountTitle"),
      description: t("disableAccountDescription"),
      buttonText: t("disableAccountTitle"),
      variant: "secondary" as const,
      className: "bg-amber-50 dark:bg-amber-950/30",
      modalTitle: t("disableAccountModalTitle"),
      modalDescription: t("disableAccountModalDescription"),
      confirmText: t("confirmDeactivation"),
    },
    {
      id: "deleteAccount" as const,
      title: t("deleteAccountTitle"),
      description: t("deleteAccountDescription"),
      buttonText: t("deleteAccountButton"),
      variant: "destructive" as const,
      className: "bg-zinc-100 dark:bg-zinc-800",
      modalTitle: t("deleteAccountModalTitle"),
      modalDescription: t("deleteAccountModalDescription"),
      confirmText: t("deleteAccountButton"),
    },
  ];

  const handleChange = (patch: Partial<typeof generalState>) => {
    setGeneralState((prev) => ({
      ...prev,
      ...patch,
    }));

    setIsSaved(false);
  };

  const handleLocaleChange = (nextLocale: AppLocale) => {
    if (!isAppLocale(nextLocale)) return;
    handleChange({ language: nextLocale });
    updateGeneralSettings({ language: nextLocale });
    confirmSavedLocale(nextLocale);
    void apiRequest("/api/me/preferences", {
      method: "PUT",
      body: { language: nextLocale },
    }).catch(() => undefined);
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  };

  const handleDisableAccount = () => {
    if (!user) {
      handleShowAlert(t("error"), t("userNotFound"));
      return;
    }

    void apiRequest("/api/log-out", { method: "POST", body: {} }).catch(() => undefined).finally(() => {
      updateGeneralSettings({
        ...generalState,
        disableAccount: true,
      });
      useUserStore.setState({ isAuthenticated: false, sessionReady: true });
      setOpenModal(null);
      router.push("/log-in");
      window.location.reload();
    });
  };

  const handleDeleteAccount = () => {
    void apiRequest("/api/me", { method: "DELETE", body: { confirm: "DELETE" } })
      .then(() => apiRequest("/api/log-out", { method: "POST", body: {} }).catch(() => undefined))
      .then(() => {
        clearAllStores();
        setOpenModal(null);
        router.push("/");
        window.location.reload();
      })
      .catch((error: unknown) => {
        handleShowAlert(t("error"), error instanceof ApiError ? error.message : t("userNotFound"));
      });
  };

  const handleRegionChange = (region: string | null) => {
    if (!region) return;

    const selectedCountry = Object.prototype.hasOwnProperty.call(
      countriesData,
      region,
    )
      ? (region as keyof typeof countriesData)
      : undefined;

    const cities: string[] = selectedCountry
      ? countriesData[selectedCountry].cities
      : [];

    handleChange({
      region,
      city: cities[0] ?? "",
    });
  };

  const preferenceOptions = [
    {
      id: "emailSummary",
      title: t("emailDigestTitle"),
      description: t("emailDigestDescription"),
      switchProps: {
        checked: generalState.emailSummary,
        onChange: (checked: boolean) => handleChange({ emailSummary: checked }),
      },
    },
    {
      id: "desktopNotifications",
      title: t("desktopNotificationsTitle"),
      description: t("desktopNotificationsDescription"),
      switchProps: {
        checked: generalState.desktopNotifications,
        onChange: async (checked: boolean) => {
          if (checked) {
            const granted = await requestNotificationPermission();
            if (!granted) {
              handleChange({ desktopNotifications: false });
              return;
            }
            sendNotification(t("desktopNotificationsEnabledTitle"), {
              body: t("desktopNotificationsEnabledBody"),
            });
          }
          handleChange({ desktopNotifications: checked });
        },
      },
    },
    {
      id: "region",
      title: t("regionTitle"),
      description: t("regionDescription"),
      dropdown: {
        options: regionOptions,
        value: generalState.region,
        onChange: handleRegionChange,
      },
    },
    {
      id: "city",
      title: t("cityTitle"),
      description: t("cityDescription"),
      dropdown: {
        options: cityOptions,
        value: generalState.city,
        onChange: (val: string | null) => val && handleChange({ city: val }),
      },
    },
  ];

  const handleClearCache = async () => {
    try {
      sessionStorage.clear();

      if ("caches" in window) {
        const cacheNames = await window.caches.keys();

        await Promise.all(
          cacheNames.map((cacheName) => window.caches.delete(cacheName)),
        );
      }

      handleShowAlert(t("clearCache"), t("desForClearCache"));
    } catch {
      handleShowAlert(t("error"), t("clearCacheError"));
    }
  };

  const handleMonitoringChange = () => {
    if (!user) {
      handleShowAlert(t("error"), t("userNotFound"));
      return;
    }

    const currentSettings = {
      ...defaultGeneralSettings,
      ...user.settings?.general,
    };

    const hasChanges = (
      Object.keys(generalState) as Array<keyof typeof generalState>
    ).some((key) => generalState[key] !== currentSettings[key]);

    if (!hasChanges) {
      setIsSaved(true);
      handleShowAlert(t("noChange"), t("desForNoChange"));
      return;
    }

    updateGeneralSettings({
      ...generalState,
    });

    setIsSaved(true);

    handleShowAlert(t("saved"), t("savedSuccessfully"));

    if (
      isAppLocale(generalState.language) &&
      generalState.language !== locale
    ) {
      confirmSavedLocale(generalState.language);
      router.replace(pathname, { locale: generalState.language });
    }
  };

  if (pending) return null;
  if (!user || !isAuthenticated) {
    redirect("/log-in");
  }

  return (
    <SettingsPage>
      <div className="flex flex-col gap-6">
        <Alert />

        {accountActions.map((action) => (
          <Window
            key={action.id}
            title={action.modalTitle}
            description={action.modalDescription}
            show={openModal === action.id}
            presenceOfInput={false}
            cancelText={t("cancel")}
            confirmText={action.confirmText}
            confirmVariant={action.variant}
            onClickForButton={
              action.id === "deleteAccount"
                ? handleDeleteAccount
                : handleDisableAccount
            }
            onClose={() => setOpenModal(null)}
          />
        ))}

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
              onClick={handleMonitoringChange}
              variant="default"
              className="shadow-lg shadow-zinc-900/10 dark:shadow-zinc-950/20"
            >
              <Save className="w-4 h-4" />
              {t("saveChanges")}
            </BaseButton>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("appearanceSectionTitle")}
            </h2>
          </div>

          <SettingsOption
            title={t("themeTitle")}
            description={t("themeDescription")}
            switchProps={{
              checked: generalState.theme === "dark",
              onChange: (checked: boolean) => {
                const theme = checked ? "dark" : "light";

                handleChange({ theme });
                setTheme(theme);
              },
            }}
          />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-2" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("preferencesSectionTitle")}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {t("languageTitle")}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {t("languageDescription")}
              </p>
            </div>
            <LanguageSelect
              value={
                isAppLocale(generalState.language)
                  ? generalState.language
                  : locale
              }
              onChange={handleLocaleChange}
            />
          </div>

          {preferenceOptions.map((option) => (
            <SettingsOption
              key={option.id}
              title={option.title}
              description={option.description}
              switchProps={option.switchProps}
            />
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-2" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("systemSectionTitle")}
            </h2>
          </div>

          <SettingsOption
            title={t("clearCacheTitle")}
            description={t("clearCacheDescription")}
            button={{
              text: t("clearCacheButton"),
              onClick: () => void handleClearCache(),
            }}
          />
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-2" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <UserX className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("accountActionsSectionTitle")}
            </h2>
          </div>

          {accountActions.map((action) => (
            <SettingsOption
              key={action.id}
              title={action.title}
              description={action.description}
              button={{
                text: action.buttonText,
                onClick: () => setOpenModal(action.id),
              }}
            />
          ))}
        </div>
      </div>
    </SettingsPage>
  );
};

export default GeneralPage;