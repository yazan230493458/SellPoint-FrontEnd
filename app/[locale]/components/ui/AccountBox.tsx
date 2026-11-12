"use client";
import { useUserStore } from "@/store/user.store";
import { Megaphone, Check, Star, Store, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { isSafeImageSrc } from "@/lib/safe-href";
import { useHydrated } from "@/lib/use-hydrated";
import { formatDate } from "@/lib/intl-format";
import { features } from "@/app/[locale]/features";

const formatMemberSince = (
  registration: Date | string | number | undefined,
  locale: string,
) => {
  if (!registration) return undefined;
  const formatted = formatDate(registration, locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatted || undefined;
};

const AccountBox = () => {
  const { user } = useUserStore();
  const hydrated = useHydrated();
  const locale = useLocale();
  const t = useTranslations("AccountBox");
  const time = hydrated
    ? formatMemberSince(user?.settings?.account?.registration, locale)
    : undefined;

  const stats = [
    {
      id: "reviews",
      label: t("reviews"),
      count: user?.settings?.account?.evaluation ?? 0,
      icon: Star,
    },
    ...(features.stores
      ? [{ id: "stores", label: t("stores"), count: 0, icon: Store }]
      : []),
    { id: "ads", label: t("ads"), count: 0, icon: Megaphone },
  ];

  const infoList = [
    { id: "region", label: t("region"), value: user?.settings?.account?.region },
    { id: "city", label: t("city"), value: user?.settings?.account?.city },
    { id: "memberSince", label: t("memberSince"), value: time },
  ];

  return (
    <div className="w-full h-auto flex flex-col gap-6 p-5 rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20">
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-24 h-24 overflow-hidden rounded-full flex justify-center items-center bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20">
          {isSafeImageSrc(user?.settings?.account?.avatarUrl) ? (
            user.settings.account.avatarUrl.startsWith("data:") ? (
              <div
                role="img"
                aria-label={t("profileImageAlt")}
                className="h-full w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${JSON.stringify(user.settings.account.avatarUrl)})`,
                }}
              />
            ) : (
              <Image
                src={user.settings.account.avatarUrl}
                className="w-full h-full object-cover"
                width={96}
                height={96}
                alt={t("profileImageAlt")}
              />
            )
          ) : (
            <span className="text-3xl font-bold">
              {user?.settings?.account?.firstName?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {user?.settings?.account?.firstName} {user?.settings?.account?.lastName}
        </h2>

        <div className="w-full flex flex-col gap-2.5">
          <div className="w-full p-3 rounded-xl bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20 flex items-center justify-between">
            <span className="text-sm font-medium">
              {user?.settings?.account?.verifiedEmail
                ? t("verifiedEmail")
                : t("unverifiedEmail")}
            </span>
            <div className="rounded-full p-1 bg-black text-white dark:bg-white dark:text-black">
              {user?.settings?.account?.verifiedEmail ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="w-full p-3 rounded-xl bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20 flex items-center justify-between">
            <span className="text-sm font-medium">
              {user?.settings?.account?.verifiedMobilePhone
                ? t("verifiedPhone")
                : t("unverifiedPhone")}
            </span>
            <div className="rounded-full p-1 bg-black text-white dark:bg-white dark:text-black">
              {user?.settings?.account?.verifiedMobilePhone ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full grid gap-2 py-4 border-y border-zinc-300/20 dark:border-zinc-700/20 ${
          features.stores ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {stats.map(({ id, label, count, icon: Icon }) => (
          <div
            key={id}
            className="flex flex-col items-center justify-center p-1"
          >
            <div className="flex items-center gap-1.5 font-bold text-lg text-zinc-900 dark:text-zinc-100">
              <span>{count}</span>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs text-zinc-900/70 dark:text-zinc-100/70 mt-1">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col gap-2.5">
        {infoList.map(({ id, label, value }) => (
          <div key={id} className="flex items-center justify-between text-sm">
            <span className="text-zinc-900/70 dark:text-zinc-100/70">
              {label}
            </span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {value || t("none")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountBox;