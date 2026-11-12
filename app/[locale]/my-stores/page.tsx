"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import { useStoreStore } from "@/store/store.store";
import { useAlertStore } from "@/store/alert.store";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import Header from "../components/main/Header";
import SubStudy from "../components/ui/SubStudy";
import Alert from "../components/ui/Alert";
import {
  Store as StoreIcon,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Tag,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import Button from "../components/ui/Button";
import { features } from "@/app/[locale]/features";
import { redirect } from "next/navigation";

if (!features.stores) {
  redirect("/");
}

const MyStore = () => {
  const t = useTranslations("MyStore");
  const catalogLabel = useCatalogLabel();
  const currentStore = useStoreStore((state) => state.currentStore);
  const deleteCurrentStore = useStoreStore((state) => state.deleteCurrentStore);
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const showAlert = (title: string, description: string) => {
    if (setTitle) setTitle(title);
    if (setDescription) setDescription(description);
    if (onOpen) onOpen();
  };

  const handleDeleteStore = (name: string) => {
    deleteCurrentStore();
    showAlert(t("deletedTitle"), t("deletedDescription", { name }));
  };

  return (
    <>
      <Alert />
      <Header className="" />
      <main className="min-h-dvh flex flex-col items-center space-y-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <section className="w-full max-w-7xl flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                <StoreIcon className="w-8 h-8 text-zinc-900 dark:text-zinc-100" />
                <span>{t("title")}</span>
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                {t("subtitle")}
              </p>
            </div>

            <BaseLink
              href="/create-store"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm transition-all duration-200 ease-in-out shadow-lg shadow-zinc-900/5 dark:shadow-black/10 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t("createNewStore")}</span>
            </BaseLink>
          </div>

          <SubStudy classNameForBox="w-full flex justify-start items-center py-2" />

          {!currentStore ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-xl bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 text-center gap-5 shadow-lg shadow-zinc-900/5 dark:shadow-black/10 my-10">
              <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <StoreIcon className="w-12 h-12" />
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
                href="/create-store"
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm transition-all duration-200 ease-in-out shadow-lg shadow-zinc-900/5 dark:shadow-black/10"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t("createYourStore")}</span>
              </BaseLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const store = currentStore;
                const storeName =
                  store.step1?.storeName || store.username || t("untitledStore");
                const storeIdentifier = store.username || store.id;
                const storeDescription = store.step1?.description || "";
                const storeImages = store.step2?.image
                  ? [store.step2.image]
                  : [];
                const mainImage =
                  storeImages[store.step2?.mainImageIndex || 0] ||
                  storeImages[0] ||
                  "/placeholder.png";
                const storeCategoriesText =
                  store.step2?.categories?.map(catalogLabel).join(", ") ||
                  t("general");
                const locationText = `${store.step1?.selectedCity || ""}, ${
                  store.step1?.selectedCountry || ""
                }`;

                return (
                  <div
                    key={`mystore-${store.id}`}
                    className="flex flex-col rounded-xl overflow-hidden bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border-2 border-zinc-300 dark:border-zinc-600 shadow-lg shadow-zinc-900/5 dark:shadow-black/10 hover:shadow-xl transition-all duration-200 ease-in-out group p-5 relative"
                  >
                    <div className="absolute top-7 right-7 z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-bold shadow-md">
                      <StoreIcon className="w-3.5 h-3.5" />
                      <span>{t("storeBadge")}</span>
                    </div>

                    <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden mb-4 border border-zinc-200 dark:border-zinc-700">
                      <Image
                        src={mainImage}
                        alt={storeName}
                        fill
                        className="object-cover group-hover:scale-105 transition-all duration-200 ease-in-out"
                      />
                    </div>

                    <div className="flex flex-col space-y-4 flex-1 justify-between">
                      <div className="flex flex-col space-y-2">
                        <span
                          title={storeCategoriesText}
                          className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate flex items-center gap-1.5"
                        >
                          <Tag className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {storeCategoriesText}
                          </span>
                        </span>

                        <h3
                          title={storeName}
                          className="font-bold text-xl text-zinc-900 dark:text-zinc-100 truncate"
                        >
                          {storeName}
                        </h3>

                        <p
                          title={storeDescription}
                          className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed h-8"
                        >
                          {storeDescription || t("noDescription")}
                        </p>
                      </div>

                      <div className="flex flex-col space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400">
                        {locationText.trim() !== "," && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span title={locationText} className="truncate">
                              {locationText}
                            </span>
                          </div>
                        )}
                        {store.step1?.mobileNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {store.step1.mobileNumber}
                            </span>
                          </div>
                        )}
                        {store.step2?.supportEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span
                              title={store.step2.supportEmail}
                              className="truncate"
                            >
                              {store.step2.supportEmail}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <BaseLink
                          href={`/search/store/${encodeURIComponent(storeIdentifier)}`}
                          className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-xs transition-colors duration-200"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t("visitStore")}</span>
                        </BaseLink>

                        <BaseLink
                          href={`/stores/${storeIdentifier}`}
                          className="flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600 font-semibold text-xs transition-colors duration-200"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{t("editStore")}</span>
                        </BaseLink>

                        <Button
                          type="button"
                          onClick={() => handleDeleteStore(storeName)}
                          className="flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 font-semibold text-xs transition-colors duration-200 col-span-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t("deleteStore")}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      </main>
    </>
  );
};

export default MyStore;
