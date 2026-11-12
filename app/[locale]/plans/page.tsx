"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/app/[locale]/components/main/Header";
import Button from "@/app/[locale]/components/ui/Button";
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  ArrowRight,
  Star,
  HelpCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import BaseLink from "../components/ui/BaseLink";
import { apiRequest } from "@/lib/api";
import { features } from "@/app/[locale]/features";

type CatalogPlan = {
  id: number;
  name: string;
  price: string;
  currency: string;
  durationDays: number;
  features: string[];
};

const planForCycle = (plans: CatalogPlan[], cycle: "monthly" | "yearly") => {
  const matched = plans.filter((plan) =>
    cycle === "yearly" ? plan.durationDays >= 300 : plan.durationDays > 0 && plan.durationDays <= 40,
  );
  return (matched[0] ?? plans[0]) || null;
};

const PlansPage = () => {
  const t = useTranslations("PlansPage");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [plans, setPlans] = useState<CatalogPlan[]>([]);

  useEffect(() => {
    void apiRequest<{ plans: CatalogPlan[] }>("/api/plans")
      .then((result) => setPlans(result.plans))
      .catch(() => setPlans([]));
  }, []);

  const selectedPlan = useMemo(
    () => planForCycle(plans, billingCycle),
    [plans, billingCycle],
  );

  const freeFeatures = [
    t("freeFeature1"),
    t("freeFeature2"),
    ...(features.stores ? [t("freeFeature3")] : []),
    t("freeFeature4"),
  ];

  const premiumFeatures = [
    t("premiumFeature1"),
    t("premiumFeature2"),
    ...(features.stores ? [t("premiumFeature3")] : []),
    t("premiumFeature4"),
    t("premiumFeature5"),
    t("premiumFeature6"),
  ];
  const premiumList = selectedPlan?.features.length
    ? selectedPlan.features.filter(
        (feature) =>
          features.stores ||
          !/store|متجر/i.test(feature),
      )
    : premiumFeatures;

  return (
    <>
      <Header className="fixed top-5 inset-x-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 z-50" />
      
      <main className="min-h-dvh pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            {t("title")}
          </h1>

          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
            {features.stores ? t("subtitle") : t("subtitleAdsOnly")}
          </p>

          <div className="flex items-center gap-3 p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span>{t("yearly")}</span>
              <span className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold">
                {t("saveDiscount")}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          
          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm relative transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{t("freeTitle")}</h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("freeSubtitle")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                  $0
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  / {t("forever")}
                </span>
              </div>

              <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

              <ul className="flex flex-col gap-3.5 my-2">
                {freeFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <div className="p-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="button"
              className="mt-8 h-12 w-full rounded-2xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold text-sm transition-all shadow-sm"
            >
              {t("currentPlan")}
            </Button>
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-amber-500/80 shadow-xl shadow-amber-500/5 relative transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-md flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>{t("mostPopular")}</span>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-1.5">
                      <span>{t("premiumTitle")}</span>
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t("premiumSubtitle")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-1 my-2">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  {selectedPlan ? `${selectedPlan.currency} ${selectedPlan.price}` : "—"}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  / {billingCycle === "monthly" ? t("month") : t("year")}
                </span>
              </div>

              <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

              <ul className="flex flex-col gap-3.5 my-2">
                {premiumList.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    <div className="p-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <BaseLink
            href={selectedPlan ? `/plans/payment?planId=${selectedPlan.id}&cycle=${billingCycle}` : "/plans/payment"}
              className="mt-8 h-12 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group"
            >
              <span>{t("upgradeNow")}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </BaseLink>
          </div>

        </div>

        <div className="mt-16 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 max-w-4xl mx-auto text-xs text-zinc-400">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>{t("needHelp")}</span>
        </div>

      </main>
    </>
  );
};

export default PlansPage;