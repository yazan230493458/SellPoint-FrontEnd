"use client";

import React from "react";
import { Store, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import Button from "../ui/Button";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";

type LinkItem = {
  label: string;
  href?: string;
};

type ShopFooterProps = {
  storeName?: string;
  bgColor?: string;
  footerTitle?: string;
  footerDescription?: string;
  buttonText?: string;
  quickLinks?: LinkItem[];
  customerCareLinks?: LinkItem[];
  onSubscribe?: (email: string) => void;
};

const ShopFooter: React.FC<ShopFooterProps> = ({
  storeName,
  bgColor = "#09090b",
  footerTitle,
  footerDescription,
  buttonText,
  quickLinks,
  customerCareLinks,
  onSubscribe,
}) => {
  const t = useTranslations("Storefront");
  const [email, setEmail] = React.useState("");
  const resolvedStoreName = storeName || t("defaultStoreName");
  const resolvedDescription =
    footerDescription || t("defaultFooterDescription");
  const resolvedButtonText = buttonText || t("subscribe");
  const resolvedQuickLinks = quickLinks || [
    { label: t("home"), href: "#" },
    { label: t("shop"), href: "#" },
    { label: t("aboutUs"), href: "#" },
  ];
  const resolvedCustomerCareLinks = customerCareLinks || [
    { label: t("helpCenter"), href: "#" },
    { label: t("returns"), href: "#" },
    { label: t("shippingPolicy"), href: "#" },
  ];

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubscribe && email) {
      onSubscribe(email);
      setEmail("");
    }
  };

  return (
    <footer
      style={{ backgroundColor: bgColor }}
      className="rounded-xl text-zinc-400 p-8 md:p-12 border border-zinc-700 shadow-lg shadow-black/10 space-y-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2.5 text-zinc-100 font-extrabold text-lg tracking-tight uppercase">
            <Store className="w-5 h-5 text-white" />
            <span>{footerTitle || resolvedStoreName}</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {resolvedDescription}
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            {t("quickLinks")}
          </span>
          {resolvedQuickLinks.map((link, idx) => (
            <BaseLink
              key={idx}
              href={link.href || "#"}
              className="text-xs hover:text-zinc-100 cursor-pointer transition-colors duration-200 w-fit"
            >
              {link.label}
            </BaseLink>
          ))}
        </div>

        <div className="flex flex-col space-y-2">
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            {t("customerCare")}
          </span>
          {resolvedCustomerCareLinks.map((link, idx) => (
            <BaseLink
              key={idx}
              href={link.href || "#"}
              className="text-xs hover:text-zinc-100 cursor-pointer transition-colors duration-200 w-fit"
            >
              {link.label}
            </BaseLink>
          ))}
        </div>

        <div className="flex flex-col space-y-3">
          <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
            {t("newsletter")}
          </span>
          <form
            onSubmit={handleSubscribeSubmit}
            className="flex items-center gap-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              aria-label={t("emailPlaceholder")}
              className="px-4 py-2.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-400 outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 transition-colors duration-200 w-full"
            />
            <Button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-zinc-50 text-zinc-950 hover:bg-zinc-200 transition-colors duration-200 cursor-pointer shadow-lg shadow-black/10 shrink-0"
            >
              {resolvedButtonText}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-zinc-800 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-zinc-100" />
          <span>{t("secureGuarantee")}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <Truck className="w-4 h-4 text-zinc-100" />
          <span>{t("expressShipping")}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
          <RotateCcw className="w-4 h-4 text-zinc-100" />
          <span>{t("easyReturn")}</span>
        </div>
      </div>

      <div className="text-center text-[11px] text-zinc-500 pt-4 border-t border-zinc-800">
        {t("copyright", {
          year: new Date().getFullYear(),
          storeName: resolvedStoreName,
        })}
      </div>
    </footer>
  );
};

export default ShopFooter;
