"use client";

import React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";

type HeroButton = {
  id: string;
  label: string;
  variant?: "Primary Style" | "Secondary Style" | string;
};

type ShopHeroSectionProps = {
  storeName?: string;
  bgColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  buttonText?: string;
  heroImage?: string;
  heroButtons?: HeroButton[];
};

const ShopHeroSection: React.FC<ShopHeroSectionProps> = ({
  storeName,
  bgColor = "#09090b",
  heroTitle,
  heroSubtitle,
  buttonText,
  heroImage = "/placeholder.png",
  heroButtons,
}) => {
  const t = useTranslations("Storefront");
  const resolvedStoreName = storeName || t("defaultStoreName");
  const resolvedTitle = heroTitle || t("defaultHeroTitle");
  const resolvedSubtitle = heroSubtitle || t("defaultHeroSubtitle");
  const resolvedButtonText = buttonText || t("shopCollection");

  const defaultButtons: HeroButton[] = [
    {
      id: "def1",
      label: resolvedButtonText,
      variant: "Primary Style",
    },
  ];

  const buttons =
    heroButtons && heroButtons.length > 0 ? heroButtons : defaultButtons;

  return (
    <div
      style={{ backgroundColor: bgColor }}
      className="relative overflow-hidden rounded-xl text-zinc-100 p-8 md:p-14 border border-zinc-700 shadow-lg shadow-black/10 flex flex-col md:flex-row items-center justify-between gap-10"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(120,119,198,0.15),transparent_50%)]" />
      <div className="relative flex flex-col space-y-6 max-w-xl text-center md:text-left z-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-100 border border-zinc-700 w-fit mx-auto md:mx-0">
          <Sparkles className="w-4 h-4 text-zinc-100" />
          {t("exclusiveEdition", { storeName: resolvedStoreName })}
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-zinc-100">
          {resolvedTitle}
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed font-medium">
          {resolvedSubtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
          {buttons.map((btn) => (
            <Button
              key={btn.id}
              type="button"
              className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors duration-200 cursor-pointer shadow-lg shadow-black/10 ${
                btn.variant === "Primary Style"
                  ? "bg-zinc-50 text-zinc-950 hover:bg-zinc-200"
                  : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative w-full max-w-md aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700 shadow-lg shadow-black/10 flex items-center justify-center group/img">
        <Image
          src={heroImage}
          alt={t("heroImageAlt")}
          fill
          className="object-cover group-hover/img:scale-105 transition-transform duration-200 ease-in-out opacity-90"
        />
      </div>
    </div>
  );
};

export default ShopHeroSection;
