"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import { useAdStore, type Steps } from "@/store/ad.store";
import { apiRequest } from "@/lib/api";
import { formatPrice } from "@/lib/format-price";
import { toAdSteps, type ApiAd } from "@/lib/ads";
import { useUserStore } from "@/store/user.store";
import { useAlertStore } from "@/store/alert.store";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import Header from "../components/main/Header";
import SubStudy from "../components/ui/SubStudy";
import Alert from "../components/ui/Alert";
import {
  ShoppingBag,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Tag,
  MapPin,
  Phone,
  DollarSign,
} from "lucide-react";
import Button from "../components/ui/Button";

const MyAds = () => {
  const t = useTranslations("MyAds");
  const catalogLabel = useCatalogLabel();
  const rawAds = useAdStore((state) => state.ads);
  const setAds = useAdStore((state) => state.setAds);
  const removeAd = useAdStore((state) => state.removeAd);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const sessionReady = useUserStore((state) => state.sessionReady);
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const myAds = useMemo(() => {
    return (rawAds as Steps[]) || [];
  }, [rawAds]);

  const showAlert = (titleText: string, descriptionText: string) => {
    if (setTitle) setTitle(titleText);
    if (setDescription) setDescription(descriptionText);
    if (onOpen) onOpen();
  };

  useEffect(() => {
    if (!sessionReady || !isAuthenticated) return;
    void apiRequest<{ ads: ApiAd[] }>("/api/get-ads")
      .then((result) => setAds(result.ads.map(toAdSteps)))
      .catch(() => undefined);
  }, [isAuthenticated, sessionReady, setAds]);

  const handleDeleteAd = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number,
    name: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    void apiRequest("/api/remove-ad", { method: "POST", body: { adID: id }, })
      .then(() => {
        removeAd(id);
        showAlert(t("deletedTitle"), t("deletedDescription", { name }));
      })
      .catch(() => undefined);
  };

  return (
    <>
      <Alert />
      <Header className="h-20 flex justify-between rounded-xl fixed top-5 inset-x-3 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/30" />
      <main className="min-h-dvh mt-30 flex flex-col items-center px-3 space-y-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <section className="w-full max-w-7xl flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                <ShoppingBag className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                <span>{t("title")}</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {t("subtitle")}
              </p>
            </div>

            <BaseLink
              href="/create-ad"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm transition-all duration-200 ease-in-out shadow-lg shadow-zinc-900/5 dark:shadow-black/10 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("createNewAd")}</span>
            </BaseLink>
          </div>

          <SubStudy classNameForBox="w-full flex justify-start items-center py-2" />

          {myAds.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-xl bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 text-center gap-5 shadow-lg shadow-zinc-900/5 dark:shadow-black/10 my-10">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <ShoppingBag className="w-12 h-12" />
              </div>
              <div className="flex flex-col space-y-1.5 max-w-md">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  {t("emptyTitle")}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                  {t("emptyDescription")}
                </p>
              </div>
              <BaseLink
                href="/create-ad"
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm transition-all duration-200 ease-in-out shadow-lg shadow-zinc-900/5 dark:shadow-black/10"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t("createYourAd")}</span>
              </BaseLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myAds.map((ad) => {
                const adName = ad.step1?.adName || t("untitledAd");
                const adIdentifier = ad.username || ad.id;
                const adDescription = ad.step1?.description || "";
                const adImages = ad.step2?.images || [];
                const mainImage =
                  adImages[ad.step2?.mainImageIndex] ||
                  adImages[0] ||
                  "/placeholder.png";
                const categoryText = ad.step2?.category
                  ? catalogLabel(ad.step2.category)
                  : t("general");
                const locationText = `${ad.step1?.selectedCity || ""}, ${
                  ad.step1?.selectedCountry || ""
                }`;
                const priceDisplay =
                  ad.step2?.showPrice && ad.step2?.price
                    ? `${formatPrice(ad.step2.price)} ${t("currency")}`
                    : t("priceOnRequest");

                return (
                  <div
                    key={`myad-${ad.id}`}
                    className="flex flex-col rounded-xl overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border group border-zinc-200 dark:border-zinc-700 shadow-lg shadow-zinc-900/5 dark:shadow-black/10 transition-all duration-200 ease-in-out p-5 relative"
                  >
                    <div className="absolute top-7 right-7 z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800/80 text-zinc-100 dark:bg-zinc-200/80 dark:text-zinc-900 text-xs font-semibold shadow-md backdrop-blur-md">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{t("adBadge")}</span>
                    </div>

                    <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden mb-4 border border-zinc-200 dark:border-zinc-700">
                      <Image
                        src={mainImage}
                        alt={adName}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-all duration-200 ease-in-out"
                      />
                    </div>

                    <div className="flex flex-col space-y-4 flex-1 justify-between">
                      <div className="flex flex-col space-y-2">
                        <span
                          title={categoryText}
                          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate flex items-center gap-1.5"
                        >
                          <Tag className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{categoryText}</span>
                        </span>

                        <h3
                          title={adName}
                          className="font-bold text-xl text-zinc-900 dark:text-zinc-100 truncate"
                        >
                          {adName}
                        </h3>

                        <p
                          title={adDescription}
                          className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed h-8"
                        >
                          {adDescription || t("noDescription")}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center justify-between font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0" />
                            <span className="truncate">{priceDisplay}</span>
                          </span>
                        </div>

                        {locationText.trim() !== "," && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span title={locationText} className="truncate">
                              {locationText}
                            </span>
                          </div>
                        )}

                        {ad.step1?.mobileNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {ad.step1.mobileNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <BaseLink
                          href={`/search/ad/${encodeURIComponent(adIdentifier)}`}
                          className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors duration-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t("viewAd")}</span>
                        </BaseLink>

                        <BaseLink
                          href={`/my-ads/edit/${encodeURIComponent(adName)}`}
                          className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 font-semibold text-xs transition-colors duration-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{t("edit")}</span>
                        </BaseLink>

                        <Button
                          type="button"
                          onClick={(e) => handleDeleteAd(e, ad.id, adName)}
                          className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 font-semibold text-xs transition-colors duration-200 col-span-2 z-20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("deleteAd")}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default MyAds;
