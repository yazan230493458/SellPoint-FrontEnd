"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Star,
  Store as StoreIcon,
  Tag,
  UserRound,
  Flag,
} from "lucide-react";
import Header from "../../components/main/Header";
import BaseLink from "../../components/ui/BaseLink";
import Button from "../../components/ui/Button";
import { useUserStore } from "@/store/user.store";
import { useStoreStore, type ActiveStore } from "@/store/store.store";
import { useHydrated } from "@/lib/use-hydrated";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import { apiRequest, assetUrl } from "@/lib/api";
import type { ApiAd } from "@/lib/ads";
import { isSafeImageSrc } from "@/lib/safe-href";
import { features } from "@/app/[locale]/features";
import { formatPrice } from "@/lib/format-price";
import ReportDialog from "../../components/ui/ReportDialog";

const meaningful = (value?: string | null) => {
  const text = value?.trim() ?? "";
  if (!text || text === "unknown") return "";
  return text;
};

const Media = ({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) => {
  if (src.startsWith("data:image/")) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
        style={{ backgroundImage: `url(${src})` }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"
      unoptimized
    />
  );
};

const StatePanel = ({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-14 text-center shadow-sm sm:py-16 dark:border-zinc-800 dark:bg-zinc-900">
    <div className="rounded-full bg-zinc-100 p-4 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
      {icon}
    </div>
    <div className="max-w-md space-y-2">
      <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
    {action}
  </div>
);

const SkeletonGrid = ({ label }: { label: string }) => (
  <div
    aria-busy="true"
    aria-label={label}
    className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3"
  >
    {[0, 1, 2].map((item) => (
      <div
        key={item}
        className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-4 aspect-video animate-pulse rounded-xl bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
        <div className="mb-3 h-3 w-24 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
      </div>
    ))}
  </div>
);

const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white";

const ProfilePage = () => {
  const t = useTranslations("ProfilePage");
  const catalogLabel = useCatalogLabel();
  const hydrated = useHydrated();
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const sessionReady = useUserStore((state) => state.sessionReady);
  const role = useUserStore((state) => state.user?.role);
  const premium = useUserStore((state) => state.premium);
  const stores = useStoreStore((state) => state.stores);
  const [ads, setAds] = useState<ApiAd[]>([]);
  const [adsStatus, setAdsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [adsAttempt, setAdsAttempt] = useState(0);
  const params = useParams<{ username: string }>();
  const routeName = decodeURIComponent(String(params.username ?? ""));
  const [publicProfile, setPublicProfile] = useState<{ id: number; username: string; firstName: string; lastName: string; bio: string; avatarUrl: string | null; city: string | null } | null>(null);
  const [publicStatus, setPublicStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [reporting, setReporting] = useState(false);

  const account = user?.settings.account;
  const username = meaningful(account?.username);
  const viewingSelf = !routeName || routeName.toLowerCase() === username.toLowerCase();

  useEffect(() => {
    if (!sessionReady || !isAuthenticated) return;
    let cancelled = false;
    setAdsStatus("loading");
    void apiRequest<{ ads: ApiAd[] }>("/api/get-ads")
      .then((result) => {
        if (cancelled) return;
        setAds(Array.isArray(result.ads) ? result.ads : []);
        setAdsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setAds([]);
        setAdsStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isAuthenticated, adsAttempt]);

  useEffect(() => {
    if (!sessionReady || !isAuthenticated || viewingSelf || !routeName) return;
    let cancelled = false;
    setPublicStatus("loading");
    void apiRequest<{ user: { id: number; username: string; firstName: string; lastName: string; bio: string; avatarUrl: string | null; city: string | null } }>(`/api/users/${encodeURIComponent(routeName)}`)
      .then((result) => {
        if (cancelled) return;
        setPublicProfile(result.user);
        setPublicStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setPublicProfile(null);
        setPublicStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isAuthenticated, viewingSelf, routeName]);

  const displayName = [meaningful(account?.firstName), meaningful(account?.lastName)]
    .filter(Boolean)
    .join(" ");
  const bio = meaningful(account?.bio);
  const location = [meaningful(account?.city), meaningful(account?.region)].filter(Boolean).join(", ");
  const phone = meaningful(account?.mobileNumber);
  const email = meaningful(account?.email);
  const avatar = account?.avatarUrl ? assetUrl(account.avatarUrl) : "";
  const avatarSafe = isSafeImageSrc(avatar) ? avatar : "";
  const initials = (displayName || username || "S").slice(0, 1).toUpperCase();
  const roleLabel =
    role === "OWNER" ? t("roleOwner") : role === "ADMIN" ? t("roleAdmin") : t("roleUser");

  const myStores = useMemo(() => {
    if (!Array.isArray(stores) || !username) return [];
    return stores.filter(
      (store) => meaningful(store.username).toLowerCase() === username.toLowerCase(),
    );
  }, [stores, username]);
  const storesInvalid = hydrated && stores != null && !Array.isArray(stores);

  const ready = sessionReady && hydrated;

  return (
    <>
      <Header className="fixed inset-x-3 top-5 rounded-2xl border border-zinc-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90" />
      <main className="min-h-dvh bg-zinc-50 px-4 pt-32 pb-16 text-zinc-900 sm:px-6 lg:px-8 dark:bg-zinc-950 dark:text-zinc-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          {!ready ? (
            <section
              aria-busy="true"
              aria-label={t("loading")}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="h-40 animate-pulse bg-zinc-200 motion-reduce:animate-none sm:h-52 dark:bg-zinc-800" />
              <div className="space-y-4 px-6 pb-8 sm:px-8">
                <div className="-mt-12 size-24 animate-pulse rounded-full border-4 border-white bg-zinc-300 motion-reduce:animate-none dark:border-zinc-900 dark:bg-zinc-700" />
                <div className="h-8 w-56 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
                <div className="h-4 w-40 animate-pulse rounded-full bg-zinc-200 motion-reduce:animate-none dark:bg-zinc-800" />
              </div>
            </section>
          ) : !isAuthenticated ? (
            <section className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm sm:py-20 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
                <UserRound className="size-7" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("guestTitle")}</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-zinc-500 sm:text-base dark:text-zinc-400">
                {t("guestDescription")}
              </p>
              <BaseLink href="/log-in" className={`${actionClass} mt-8`}>
                {t("signIn")}
              </BaseLink>
            </section>
          ) : !viewingSelf ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {publicStatus === "loading" || publicStatus === "idle" ? <p>{t("loading")}</p> : null}
              {publicStatus === "error" ? <p>{t("profileError")}</p> : null}
              {publicProfile ? (
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl font-bold">{[publicProfile.firstName, publicProfile.lastName].filter(Boolean).join(" ") || publicProfile.username}</h1>
                  <p className="text-sm text-zinc-500">@{publicProfile.username}</p>
                  {publicProfile.bio ? <p className="text-sm leading-7">{publicProfile.bio}</p> : null}
                  {publicProfile.city ? <p className="text-sm text-zinc-500">{publicProfile.city}</p> : null}
                  {String(user?.id) !== String(publicProfile.id) ? (
                    <Button type="button" onClick={() => setReporting(true)} className="inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-zinc-300 px-4 text-sm dark:border-zinc-700">
                      <Flag className="size-4" />
                      {t("reportAccount")}
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {reporting && publicProfile ? (
                <ReportDialog targetType="USER" targetId={publicProfile.id} open onClose={() => setReporting(false)} />
              ) : null}
            </section>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="relative h-40 bg-zinc-100 sm:h-52 dark:bg-zinc-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_end,rgba(255,255,255,0.7),transparent_46%)] dark:bg-[radial-gradient(circle_at_top_end,rgba(255,255,255,0.08),transparent_42%)]" />
              </div>
              <div className="relative px-5 pb-8 sm:px-8">
                <div className="-mt-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                    <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-zinc-200 shadow-lg shadow-zinc-900/10 dark:border-zinc-900 dark:bg-zinc-800">
                      {avatarSafe ? <Media src={avatarSafe} alt={t("avatarAlt")} /> : null}
                      {!avatarSafe && (
                        <span className="flex h-full items-center justify-center text-3xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-100">
                          {initials}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-1 pb-1 text-start">
                      <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                        {displayName || username}
                      </h1>
                      {username && (
                        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          @{username}
                        </p>
                      )}
                    </div>
                  </div>
                  <BaseLink
                    href="/settings/account"
                    className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium transition-colors duration-200 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {t("editProfile")}
                  </BaseLink>
                </div>

                {bio && (
                  <p className="mt-6 max-w-3xl text-start text-sm leading-7 text-zinc-700 sm:text-base dark:text-zinc-300">
                    {bio}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                    {roleLabel}
                  </span>
                  {premium && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-950">
                      <Sparkles className="size-3.5" />
                      {t("premium")}
                    </span>
                  )}
                  {(account?.verifiedEmail || account?.verifiedMobilePhone) && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <BadgeCheck className="size-3.5" />
                      {t("verified")}
                    </span>
                  )}
                  {typeof account?.evaluation === "number" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <Star className="size-3.5" />
                      {t("evaluation", { value: account.evaluation })}
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <MapPin className="size-3.5 shrink-0" />
                      {location}
                    </span>
                  )}
                  {phone && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <Phone className="size-3.5 shrink-0" />
                      <span dir="ltr">{phone}</span>
                    </span>
                  )}
                  {email && (
                    <span className="inline-flex max-w-full items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <span dir="ltr" className="truncate">
                        {email}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </section>
          )}

          {ready && isAuthenticated && viewingSelf && (
            <>
              <section className="space-y-4">
                <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
                  <div className="space-y-1 text-start">
                    <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                      <ShoppingBag className="size-5" />
                      {t("adsTitle")}
                    </h2>
                    <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">{t("adsSubtitle")}</p>
                  </div>
                  <BaseLink
                    href="/my-ads"
                    className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200"
                  >
                    {t("manageAds")}
                  </BaseLink>
                </div>

                {adsStatus === "loading" ? (
                  <SkeletonGrid label={t("loading")} />
                ) : adsStatus === "error" ? (
                  <StatePanel
                    title={t("adsErrorTitle")}
                    description={t("errorDescription")}
                    icon={<ShoppingBag className="size-8" />}
                    action={
                      <Button type="button" onClick={() => setAdsAttempt((value) => value + 1)} className={actionClass}>
                        <RefreshCw className="size-4" />
                        {t("retry")}
                      </Button>
                    }
                  />
                ) : ads.length === 0 ? (
                  <StatePanel
                    title={t("adsEmptyTitle")}
                    description={t("adsEmptyDescription")}
                    icon={<ShoppingBag className="size-8" />}
                    action={
                      <BaseLink href="/create-ad" className={actionClass}>
                        <Plus className="size-4" />
                        {t("createAd")}
                      </BaseLink>
                    }
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                    {ads.map((ad) => {
                      const adName = meaningful(ad.adName) || t("untitledAd");
                      const image = assetUrl(ad.images?.[ad.mainImageIndex] ?? ad.images?.[0]);
                      const safeImage = isSafeImageSrc(image) ? image : "/placeholder.png";
                      const place = [meaningful(ad.selectedCity), meaningful(ad.selectedCountry)]
                        .filter(Boolean)
                        .join(", ");
                      const price =
                        ad.showPrice && meaningful(ad.price) ? `${formatPrice(ad.price)} ${t("currency")}` : t("priceOnRequest");
                      return (
                        <BaseLink
                          key={ad.id}
                          href={`/search/ad/${ad.id}`}
                          className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg motion-reduce:transform-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                        >
                          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                            <Media src={safeImage} alt={adName} />
                            {ad.featuredActive ? (
                              <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-medium text-zinc-950">
                                <Sparkles className="size-3.5" />
                                {t("featured")}
                              </span>
                            ) : null}
                            <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-zinc-950/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                              <ShoppingBag className="size-3.5" />
                              {t("adBadge")}
                            </span>
                          </div>
                          <span className="flex items-center gap-1.5 text-start text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            <Tag className="size-3.5 shrink-0" />
                            <span className="truncate">
                              {ad.category ? catalogLabel(ad.category) : t("general")}
                            </span>
                          </span>
                          <h3 className="mt-2 truncate text-start text-lg font-bold">{adName}</h3>
                          <p className="mt-1 line-clamp-2 text-start text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                            {meaningful(ad.description) || t("noDescription")}
                          </p>
                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                            <span className="text-lg font-bold tabular-nums">{price}</span>
                            {place && (
                              <span className="flex min-w-0 items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                                <MapPin className="size-3.5 shrink-0" />
                                <span className="truncate">{place}</span>
                              </span>
                            )}
                          </div>
                          <span className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">
                            {t("viewAd")}
                          </span>
                        </BaseLink>
                      );
                    })}
                  </div>
                )}
              </section>

              {features.stores ? (
                <section className="space-y-4">
                  <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-800">
                    <div className="space-y-1 text-start">
                      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                        <StoreIcon className="size-5" />
                        {t("storesTitle")}
                      </h2>
                      <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">{t("storesSubtitle")}</p>
                    </div>
                    <BaseLink
                      href="/my-stores"
                      className="text-sm font-medium text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-200"
                    >
                      {t("manageStores")}
                    </BaseLink>
                  </div>

                  {storesInvalid ? (
                    <StatePanel
                      title={t("storesErrorTitle")}
                      description={t("errorDescription")}
                      icon={<StoreIcon className="size-8" />}
                    />
                  ) : myStores.length === 0 ? (
                    <StatePanel
                      title={t("storesEmptyTitle")}
                      description={t("storesEmptyDescription")}
                      icon={<StoreIcon className="size-8" />}
                      action={
                        <BaseLink href="/create-store" className={actionClass}>
                          <Plus className="size-4" />
                          {t("createStore")}
                        </BaseLink>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                      {myStores.map((store: ActiveStore) => {
                        const storeName =
                          meaningful(store.step1?.storeName) ||
                          meaningful(store.username) ||
                          t("untitledStore");
                        const image = store.step2?.image ? assetUrl(store.step2.image) : "";
                        const safeImage = isSafeImageSrc(image) ? image : "/placeholder.png";
                        const categories =
                          store.step2?.categories?.map(catalogLabel).filter(Boolean).join(", ") ||
                          t("general");
                        const place = [
                          meaningful(store.step1?.selectedCity),
                          meaningful(store.step1?.selectedCountry),
                        ]
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <BaseLink
                            key={store.id}
                            href={`/search/store/${encodeURIComponent(String(store.username || store.id))}`}
                            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg motion-reduce:transform-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                          >
                            <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                              <Media src={safeImage} alt={storeName} />
                              <span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">
                                <StoreIcon className="size-3.5" />
                                {t("storeBadge")}
                              </span>
                            </div>
                            <span className="flex items-center gap-1.5 text-start text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              <Tag className="size-3.5 shrink-0" />
                              <span className="truncate">{categories}</span>
                            </span>
                            <h3 className="mt-2 truncate text-start text-lg font-bold">{storeName}</h3>
                            <p className="mt-1 line-clamp-2 text-start text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                              {meaningful(store.step1?.description) || t("noDescription")}
                            </p>
                            {place && (
                              <p className="mt-4 flex items-center gap-1.5 border-t border-zinc-100 pt-4 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                                <MapPin className="size-3.5 shrink-0" />
                                <span className="truncate">{place}</span>
                              </p>
                            )}
                            <span className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 text-xs font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">
                              {t("viewStore")}
                            </span>
                          </BaseLink>
                        );
                      })}
                    </div>
                  )}
                </section>
              ) : null}
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
