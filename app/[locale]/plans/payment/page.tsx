"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/app/[locale]/components/main/Header";
import Button from "@/app/[locale]/components/ui/Button";
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Apple,
  Check,
  Zap,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";

type PaymentMethodId = "mada" | "visa" | "mastercard" | "applepay" | "stcpay";

const paymentOptions: Array<{
  id: PaymentMethodId;
  labelKey: "mada" | "visa" | "mastercard" | "applePay" | "stcPay";
  icon: typeof CreditCard;
}> = [
  { id: "mada", labelKey: "mada", icon: CreditCard },
  { id: "visa", labelKey: "visa", icon: CreditCard },
  { id: "mastercard", labelKey: "mastercard", icon: CreditCard },
  { id: "applepay", labelKey: "applePay", icon: Apple },
  { id: "stcpay", labelKey: "stcPay", icon: Wallet },
];

type CatalogPlan = {
  id: number;
  name: string;
  price: string;
  currency: string;
  durationDays: number;
};

type CheckoutResponse = {
  message: string;
  providerConfigured: boolean;
  payment: {
    id: number;
    amount: string;
    currency: string;
    status: string;
    paymentMethod: PaymentMethodId;
  };
  subscription: {
    id: number;
    status: string;
    planId: number;
    planName: string;
  };
  checkout: {
    provider: string;
    mode: "hosted_redirect" | "payment_intent_form";
    checkoutUrl: string | null;
    intentId?: string;
    amountMinor: number;
    currency: string;
    methods: string[];
    supportedNetworks: string[];
  } | null;
};

const planForCycle = (plans: CatalogPlan[], cycle: "monthly" | "yearly") => {
  const matched = plans.filter((plan) =>
    cycle === "yearly" ? plan.durationDays >= 300 : plan.durationDays > 0 && plan.durationDays <= 40,
  );
  return (matched[0] ?? plans[0]) || null;
};

type UiState = "idle" | "redirecting" | "pending_config" | "error";

const PaymentPage = () => {
  const t = useTranslations("PaymentPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const requestedPlanId = Number(searchParams.get("planId"));
  const requestedCycle = searchParams.get("cycle") === "yearly" ? "yearly" : "monthly";
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("mada");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(requestedCycle);
  const [plans, setPlans] = useState<CatalogPlan[]>([]);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [activeProvider, setActiveProvider] = useState("moyasar");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiState, setUiState] = useState<UiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<{
      plans: CatalogPlan[];
      providerConfigured?: boolean;
      activeProvider?: string;
    }>("/api/plans")
      .then((result) => {
        setPlans(result.plans);
        setProviderConfigured(Boolean(result.providerConfigured));
        if (result.activeProvider) setActiveProvider(result.activeProvider);
      })
      .catch(() => setPlans([]));
  }, []);

  const selectedPlan = useMemo(() => {
    const requested = plans.find((plan) => plan.id === requestedPlanId);
    if (requested && requestedPlanId > 0 && billingCycle === requestedCycle) return requested;
    return planForCycle(plans, billingCycle);
  }, [plans, requestedPlanId, billingCycle, requestedCycle]);

  const priceLabel = selectedPlan ? `${selectedPlan.currency} ${selectedPlan.price}` : "—";
  const taxLabel = selectedPlan ? `${selectedPlan.currency} 0.00` : "—";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedPlan) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setUiState("idle");

    void apiRequest<CheckoutResponse>("/api/payments/checkout", {
      method: "POST",
      body: {
        billingCycle,
        planId: selectedPlan.id,
        paymentMethod: selectedMethod,
        locale,
      },
    })
      .then((result) => {
        if (!result.providerConfigured || !result.checkout?.checkoutUrl) {
          setUiState("pending_config");
          setIsSubmitting(false);
          return;
        }
        setUiState("redirecting");
        window.location.assign(result.checkout.checkoutUrl);
      })
      .catch((error: unknown) => {
        setUiState("error");
        setErrorMessage(error instanceof Error ? error.message : t("errorGeneric"));
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <Header className="fixed top-5 inset-x-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 z-50 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80" />

      <main className="min-h-dvh pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <div className="flex flex-col items-center text-center gap-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
            {t("title")}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg leading-relaxed font-medium">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-900/5 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center justify-between">
                <span>{t("paymentMethodTitle")}</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-8">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedMethod(option.id)}
                      className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 font-bold text-xs sm:text-sm text-left ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/50"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-amber-500 text-white" : "bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-600 dark:text-zinc-300"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 truncate">{t(option.labelKey)}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {t("providerNotice", { provider: activeProvider })}
                </p>

                <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {t("hostedCheckoutHint")}
                </div>

                {uiState === "pending_config" ? (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="font-bold text-amber-700 dark:text-amber-300">{t("pendingTitle")}</p>
                    <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{t("pendingDescription")}</p>
                  </div>
                ) : null}

                {uiState === "redirecting" ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
                    <Loader2 className="w-4 h-4 mt-0.5 animate-spin text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-300">{t("redirectingTitle")}</p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{t("redirectingDescription")}</p>
                    </div>
                  </div>
                ) : null}

                {uiState === "error" && errorMessage ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-rose-500" />
                    <div>
                      <p className="font-bold text-rose-700 dark:text-rose-300">{t("errorTitle")}</p>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{errorMessage}</p>
                    </div>
                  </div>
                ) : null}

                {!providerConfigured ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {t("credentialsMissing")}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedPlan}
                  className="mt-4 h-13 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 group disabled:opacity-60"
                >
                  <span>{t("payNow")} ({priceLabel})</span>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </form>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t("secureBadge")}</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-4 flex items-center justify-between">
                <span>{t("summaryTitle")}</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </h3>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{t("billingCycleTitle")}</span>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      billingCycle === "monthly"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {t("monthlyOption")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("yearly")}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      billingCycle === "yearly"
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {t("yearlyOption")}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{selectedPlan?.name || t("planName")}</span>
                    <span className="text-[11px] text-zinc-400">
                      {billingCycle === "yearly" ? t("billedAnnually") : t("billedMonthly")}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-black">{priceLabel}</span>
              </div>

              <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

              <div className="flex flex-col gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{priceLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("tax")}</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{taxLabel}</span>
                </div>
              </div>

              <div className="h-px w-full bg-zinc-200 dark:bg-zinc-800" />

              <div className="flex justify-between items-baseline">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t("total")}</span>
                <span className="text-3xl font-black bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{priceLabel}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {t("guaranteeText")}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentPage;
