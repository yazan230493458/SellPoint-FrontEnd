"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ShoppingBag,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Button from "../ui/Button";

export type SliderProductConfig = {
  id: string;
  title: string;
  price: string | number;
  image?: string;
};

type ShopSliderProps = {
  buttonText?: string;
  sliderProducts?: SliderProductConfig[];
  onAddToCart?: (product: SliderProductConfig) => void;
};

const fallbackProductIds = ["watch", "leatherBag", "earbuds"] as const;

const EmbeddedProductSlider: React.FC<{
  buttonText?: string;
  products?: SliderProductConfig[];
  onAddToCart?: (product: SliderProductConfig) => void;
}> = ({
  buttonText,
  products,
  onAddToCart,
}) => {
  const t = useTranslations("Storefront");
  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const resolvedButtonText = buttonText || t("addToCart");
  const resolvedProducts =
    products && products.length > 0
      ? products
      : fallbackProductIds.map((id, index) => ({
          id: `prod-${index + 1}`,
          title: t(id),
          price: ["$199.00", "$299.00", "$149.00"][index],
          image: "/placeholder.png",
        }));

  return (
    <div className="w-full mx-auto py-2 relative group">
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-lg shadow-black/10">
            <ShoppingBag className="w-5 h-5 text-black dark:text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {t("handpicked")}
            </span>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
              {t("featuredProducts")}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            ref={setPrevEl}
            type="button"
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 shadow-lg shadow-zinc-900/5 dark:shadow-black/15 cursor-pointer"
            aria-label={t("previousSlide")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            ref={setNextEl}
            type="button"
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 shadow-lg shadow-zinc-900/5 dark:shadow-black/15 cursor-pointer"
            aria-label={t("nextSlide")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Swiper
        modules={[Pagination, Navigation, Autoplay]}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        spaceBetween={20}
        slidesPerView={1}
        navigation={{ prevEl, nextEl }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-6 pt-1"
      >
        {resolvedProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex flex-col justify-between shadow-lg shadow-zinc-900/5 dark:shadow-black/10 transition-colors duration-200 space-y-4 group/card h-full">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white dark:bg-zinc-800">
                <Image
                  src={product.image || "/placeholder.png"}
                  alt={product.title}
                  fill
                  className="object-cover group-hover/card:scale-105 transition-transform duration-200 ease-in-out"
                />
              </div>

              <div className="flex flex-col space-y-1 text-center">
                <h4
                  className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate"
                  title={product.title}
                >
                  {product.title}
                </h4>
                <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {product.price}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => onAddToCart && onAddToCart(product)}
                className="w-full py-2.5 px-5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-700 dark:hover:bg-zinc-200 font-semibold text-sm transition-colors duration-200 ease-in-out shadow-lg shadow-zinc-900/5 dark:shadow-black/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{resolvedButtonText}</span>
              </Button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const ShopSlider: React.FC<ShopSliderProps> = ({
  buttonText,
  sliderProducts,
  onAddToCart,
}) => {
  return (
    <div className="p-6 md:p-8 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-lg shadow-zinc-900/5 dark:shadow-black/10 transition-colors duration-200">
      <EmbeddedProductSlider
        buttonText={buttonText}
        products={sliderProducts}
        onAddToCart={onAddToCart}
      />
    </div>
  );
};

export default ShopSlider;
