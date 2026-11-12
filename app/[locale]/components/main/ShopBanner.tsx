"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";

type ShopBannerProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  bgColor?: string;
};

const ShopBanner: React.FC<ShopBannerProps> = ({
  title,
  description,
  buttonText,
  bgColor,
}) => {
  const t = useTranslations("Storefront");
  const resolvedTitle = title || t("specialOffer");
  const resolvedDescription = description || t("specialOfferDescription");
  const resolvedButtonText = buttonText || t("claimDeal");

  return (
    <div
      className="flex flex-col items-center justify-center p-10 text-center rounded-xl bg-zinc-900 text-zinc-100 space-y-4 border border-zinc-700 shadow-lg shadow-black/10"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      <h4 className="text-2xl font-black tracking-tight">{resolvedTitle}</h4>
      <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
        {resolvedDescription}
      </p>
      <Button
        type="button"
        className="px-5 py-2.5 rounded-lg font-semibold text-xs bg-zinc-50 text-zinc-950 hover:bg-zinc-200 transition-colors duration-200 cursor-pointer shadow-lg shadow-black/10"
      >
        {resolvedButtonText}
      </Button>
    </div>
  );
};

export default ShopBanner;
