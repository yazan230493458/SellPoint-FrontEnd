"use client";

import React, { useState } from "react";
import { useStoreStore } from "@/store/store.store";
import ShopHeader from "./ShopHeader";
import ShopHeroSection from "./ShopHero";
import ShopBanner from "./ShopBanner";
import ShopSlider, { type SliderProductConfig as ShopSliderProduct } from "./ShopSlider";
import ShopFooter from "./ShopFooter";
import { StoreSection } from "@/lib/store-editor.types";
import { Store as StoreIcon, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";

type StoreSectionView = StoreSection & {
  heroImage?: string;
};

type StoreProps = {
  query?: string;
  entityName?: string;
  totalCartCount?: number;
  setIsCartOpen?: (isOpen: boolean) => void;
  onAddToCart?: (product: ShopSliderProduct) => void;
};

const Store: React.FC<StoreProps> = ({
  entityName,
  totalCartCount = 0,
  setIsCartOpen = () => {},
  onAddToCart = () => {},
}) => {
  const t = useTranslations("Storefront");
  const stores = useStoreStore((state) => state.stores);
  const currentStoreFromState = useStoreStore((state) => state.currentStore);
  const currentStore = React.useMemo(() => {
    if (!entityName) return currentStoreFromState;
    const decodedName = decodeURIComponent(entityName).toLowerCase();
    return (
      stores.find((item) => {
        const uName = (item.username || "").toLowerCase();
        const sName = (item.step1?.storeName || "").toLowerCase();
        return (
          uName === decodedName ||
          sName === decodedName ||
          item.id.toString() === decodedName
        );
      }) || null
    );
  }, [stores, currentStoreFromState, entityName]);
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");

  if (!currentStore) {
    return (
      <div className="w-full p-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 shadow-lg">
        <div className="inline-flex p-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
          <StoreIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">{t("storeNotFound")}</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("storeNotFoundDescription")}
        </p>
      </div>
    );
  }

  const storeName =
    currentStore.step1?.storeName ||
    currentStore.username ||
    t("luxuryStoreName");
  const sections: StoreSectionView[] =
    (currentStore.sections as StoreSectionView[] | undefined) || [];

  return (
    <div className="flex flex-col space-y-10 p-6 md:p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg transition-colors duration-200 relative">
      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span>{t("previewMode")}</span>
        <BaseLink
          href={`/stores/${storeName}`}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100 hover:underline font-semibold"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t("visitStorefront")}</span>
        </BaseLink>
      </div>

      {sections
        .filter((s) => s.enabled)
        .map((sec) => {
          const processedSliderProducts = (sec.sliderProducts ?? []).map((product) => ({
            id: String(product.id),
            title: product.title,
            price: product.price,
            image: product.image,
          })).filter((product) =>
            product.title
              .toLowerCase()
              .includes(headerSearchTerm.toLowerCase()),
          );

          return (
            <div key={`preview-${sec.id}`} className="w-full">
              {sec.type === "header" && (
                <ShopHeader
                  storeName={storeName}
                  navAlignment={sec.navAlignment}
                  navButtons={sec.navButtons}
                  rightNavButtons={sec.rightNavButtons}
                  totalCartCount={totalCartCount}
                  setIsCartOpen={setIsCartOpen}
                  searchTerm={headerSearchTerm}
                  onSearchChange={setHeaderSearchTerm}
                />
              )}

              {sec.type === "hero" && (
                <ShopHeroSection
                  storeName={storeName}
                  bgColor={sec.bgColor}
                  heroTitle={sec.heroTitle || storeName}
                  heroSubtitle={sec.heroSubtitle}
                  buttonText={sec.buttonText}
                  heroButtons={sec.heroButtons}
                  heroImage={sec.heroImage}
                />
              )}

              {sec.type === "banner" && (
                <ShopBanner
                  title={sec.title || storeName}
                  description={sec.footerDescription}
                  buttonText={sec.buttonText}
                  bgColor={sec.bgColor}
                />
              )}

              {sec.type === "slider" && (
                <ShopSlider
                  buttonText={sec.buttonText}
                  sliderProducts={processedSliderProducts}
                  onAddToCart={onAddToCart}
                />
              )}

              {sec.type === "footer" && (
                <ShopFooter
                  storeName={storeName}
                  bgColor={sec.bgColor}
                  footerTitle={sec.footerTitle || storeName}
                  footerDescription={sec.footerDescription}
                  buttonText={sec.buttonText}
                />
              )}
            </div>
          );
        })}
    </div>
  );
};

export default Store;
