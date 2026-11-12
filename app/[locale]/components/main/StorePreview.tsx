"use client";

import React, { useState } from "react";
import { useStoreStore } from "@/store/store.store";
import ShopHeader from "./ShopHeader";
import ShopHeroSection from "./ShopHero";
import ShopBanner from "./ShopBanner";
import ShopSlider, { type SliderProductConfig as ShopSliderProduct } from "./ShopSlider";
import ShopFooter from "./ShopFooter";
import { StoreSection } from "@/lib/store-editor.types";
import { useTranslations } from "next-intl";
import { useHydrated } from "@/lib/use-hydrated";

type StoreSectionView = StoreSection & {
  heroImage?: string;
};

type StorePreviewProps = {
  storeName?: string;
  sections?: StoreSection[];
  totalCartCount?: number;
  setIsCartOpen?: (isOpen: boolean) => void;
  onAddToCart?: (product: ShopSliderProduct) => void;
};

export const StorePreview: React.FC<StorePreviewProps> = ({
  storeName,
  sections: propSections,
  totalCartCount = 0,
  setIsCartOpen = () => {},
  onAddToCart = () => {},
}) => {
  const t = useTranslations("Storefront");
  const mounted = useHydrated();
  const [headerSearchTerm, setHeaderSearchTerm] = useState("");
  const currentStore = useStoreStore((state) => state.currentStore);

  if (!mounted) {
    return (
      <div className="flex flex-col space-y-10 p-6 md:p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg transition-colors duration-200 relative animate-pulse">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  const finalStoreName =
    currentStore?.step1?.storeName || storeName || t("luxuryStoreName");
  const sections: StoreSectionView[] =
    (propSections as StoreSectionView[] | undefined) ||
    (currentStore?.sections as StoreSectionView[] | undefined) ||
    [];

  return (
    <div className="flex flex-col space-y-10 p-6 md:p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg transition-colors duration-200 relative">
      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {t("previewMode")}
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
                  storeName={finalStoreName}
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
                  storeName={finalStoreName}
                  bgColor={sec.bgColor}
                  heroTitle={sec.heroTitle || finalStoreName}
                  heroSubtitle={sec.heroSubtitle}
                  buttonText={sec.buttonText}
                  heroButtons={sec.heroButtons}
                  heroImage={sec.heroImage}
                />
              )}

              {sec.type === "banner" && (
                <ShopBanner
                  title={sec.title || finalStoreName}
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
                  storeName={finalStoreName}
                  bgColor={sec.bgColor}
                  footerTitle={sec.footerTitle || finalStoreName}
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
