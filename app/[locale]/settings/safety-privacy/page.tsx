"use client";

import React, { useState } from "react";
import Image from "next/image";
import SettingsPage from "../page";
import Alert from "../../components/ui/Alert";
import { useTranslations } from "next-intl";
import BaseButton from "../../components/ui/BaseButton";
import InputField from "../../components/ui/InputField";
import SettingsOption from "../../components/ui/SettingsOption";
import {
  useUserStore,
  defaultPrivacyAndSecuritySettings,
  type PrivacyAndSecuritySettings,
} from "@/store/user.store";
import { useHydrated, useSessionGate } from "@/lib/use-hydrated";
import handleShowAlert from "../../Functions/handleShowAlert";
import { isSafeImageSrc } from "@/lib/safe-href";
import {
  Save,
  ShieldCheck,
  MessageSquare,
  UserX,
  Unlock,
  Search,
  ShieldX,
  UserMinus,
} from "lucide-react";
import { redirect } from "next/navigation";

type PrivacyKey = "mobileNumber" | "emailAddress" | "showCity";

export interface BannedUser {
  id: string | number;
  name: string;
  username: string;
  avatarUrl?: string;
  bannedAt?: string;
}

const SafetyPrivacyPage = () => {
  const t = useTranslations("SafetyPrivacyPage");
  const tBanned = useTranslations("ListOfBannedPage");
  const { user, updatePrivacySettings } = useUserStore();
  const { pending, isAuthenticated } = useSessionGate();
  const [isSaved, setIsSaved] = useState(true);
  const mounted = useHydrated();
  const [showBannedList, setShowBannedList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const privacySource = user?.settings?.privacyAndSecurity;
  const [privacySourceSeen, setPrivacySourceSeen] = useState(privacySource);
  const [privacyState, setPrivacyState] = useState<PrivacyAndSecuritySettings>({
    ...defaultPrivacyAndSecuritySettings,
    ...privacySource,
  });

  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>(
    (privacySource?.listOfBanned as unknown as BannedUser[]) || [],
  );

  if (pending) return null;
  if (!user || !isAuthenticated) {
    redirect("/log-in");
  }

  if (privacySource && privacySourceSeen !== privacySource) {
    setPrivacySourceSeen(privacySource);
    setPrivacyState(privacySource);
    if (privacySource.listOfBanned) {
      setBannedUsers(privacySource.listOfBanned as unknown as BannedUser[]);
    }
  }

  const privacyItems: { id: PrivacyKey; title: string; description: string }[] =
    [
      {
        id: "mobileNumber",
        title: t("mobileNumberTitle"),
        description: t("mobileNumberDescription"),
      },
      {
        id: "emailAddress",
        title: t("emailAddressTitle"),
        description: t("emailAddressDescription"),
      },
      {
        id: "showCity",
        title: t("showCityTitle"),
        description: t("showCityDescription"),
      },
    ];

  const dropdownOptions = [
    { id: 1, label: t("justMe"), value: "Just Me" },
    { id: 2, label: t("everyone"), value: "Everyone" },
  ];

  const handleDropdownChange = (key: PrivacyKey, value: string) => {
    setPrivacyState((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleToggleMessages = (checked: boolean) => {
    setPrivacyState((prev) => ({ ...prev, allowDirectMessages: checked }));
    setIsSaved(false);
  };

  const handleUnban = (id: string | number) => {
    const updatedList = bannedUsers.filter((item) => item.id !== id);
    setBannedUsers(updatedList);
    setPrivacyState((prev) => ({
      ...prev,
      listOfBanned: updatedList as unknown as string[],
    }));
    setIsSaved(false);

    handleShowAlert(tBanned("unbannedTitle"), tBanned("unbannedDescription"));
  };

  const handleMonitoringChange = () => {
    if (!user) {
      handleShowAlert(t("error"), t("userNotFound"));
      return;
    }

    const currentPrivacy = {
      ...defaultPrivacyAndSecuritySettings,
      ...user.settings?.privacyAndSecurity,
    };

    const hasChanges = (
      Object.keys(privacyState) as Array<keyof PrivacyAndSecuritySettings>
    ).some((key) => privacyState[key] !== currentPrivacy[key]);

    if (!hasChanges) {
      setIsSaved(true);
      handleShowAlert(t("noChange"), t("desForNoChange"));
      return;
    }

    updatePrivacySettings({
      ...privacyState,
      listOfBanned: bannedUsers as unknown as string[],
    });

    setIsSaved(true);

    handleShowAlert(t("saved"), t("savedSuccessfully"));
  };

  const filteredUsers = bannedUsers.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!mounted) return null;

  return (
    <SettingsPage>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleMonitoringChange();
        }}
      >
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
              variant="default"
              type="submit"
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
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("privacySectionTitle")}
            </h2>
          </div>

          {privacyItems.map((item) => (
            <SettingsOption
              key={item.id}
              title={item.title}
              description={item.description}
              className=""
              dropdown={{
                options: dropdownOptions,
                placeholder: t("chooseOption"),
                value: privacyState[item.id],
                onChange: (opt) =>
                  handleDropdownChange(
                    item.id,
                    typeof opt === "object" && opt !== null && "value" in opt
                      ? (opt as { value: string }).value
                      : String(opt),
                  ),
              }}
            />
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-2" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("messagesSectionTitle")}
            </h2>
          </div>

          <SettingsOption
            title={t("allowDirectMessagesTitle")}
            description={t("allowDirectMessagesDescription")}
            className=""
            switchProps={{
              checked: privacyState.allowDirectMessages,
              onChange: handleToggleMessages,
            }}
          />

          <SettingsOption
            title={t("listOfBannedTitle")}
            description={t("listOfBannedsDescription")}
            className=""
            button={{
              text: showBannedList ? t("hideList") : t("listOfBannedTitle"),
              onClick: () => setShowBannedList((prev) => !prev),
            }}
          />

          {showBannedList && (
            <div className="w-full min-h-20 p-5 flex flex-col shadow-xl rounded-2xl bg-zinc-100 text-zinc-900 dark:text-zinc-100 dark:bg-zinc-800 border border-zinc-300/20 dark:border-zinc-700/20 gap-5 animate-in fade-in-80 zoom-in-95">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-600/50">
                  <UserMinus className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
                  {tBanned("bannedSectionTitle")}
                </h3>
                <span className="rounded-lg border border-zinc-300/20 dark:border-zinc-700/50 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 text-xs font-semibold">
                  {bannedUsers.length}
                </span>
              </div>

              {bannedUsers.length > 0 && (
                <div className="relative w-full max-w-md">
                  <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 z-10" />
                  <InputField
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tBanned("searchPlaceholder")}
                    aria-label={tBanned("searchPlaceholder")}
                    className="w-full rounded-xl py-2.5 ps-9 pe-4 text-xs"
                  />
                </div>
              )}

              {filteredUsers.length === 0 ? (
                <div className="flex w-full flex-col items-center justify-center gap-3 py-6 text-center">
                  <div className="rounded-xl bg-zinc-200 dark:bg-zinc-700 p-3 text-zinc-400">
                    <ShieldX className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {searchQuery.trim()
                        ? tBanned("noResultsTitle")
                        : tBanned("emptyTitle")}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {searchQuery.trim()
                        ? tBanned("noResultsDescription")
                        : tBanned("emptyDescription")}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredUsers.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-zinc-300/20 dark:border-zinc-700/30 bg-white/50 dark:bg-zinc-900/40 p-3.5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700/50 bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                          {isSafeImageSrc(item.avatarUrl) ? (
                            <Image
                              src={item.avatarUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <UserX className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            @{item.username}
                          </p>
                        </div>
                      </div>

                      <BaseButton
                        type="button"
                        variant="ghost"
                        onClick={() => handleUnban(item.id)}
                        className="h-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-200 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <Unlock className="h-3.5 w-3.5 text-amber-500" />
                        <span>{tBanned("unbanButton")}</span>
                      </BaseButton>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </SettingsPage>
  );
};

export default SafetyPrivacyPage;
