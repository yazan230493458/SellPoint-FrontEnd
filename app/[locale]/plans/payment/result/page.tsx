"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import Header from "@/app/[locale]/components/main/Header";
import Button from "@/app/[locale]/components/ui/Button";
import { apiRequest } from "@/lib/api";

type VerifyResponse = {
  message: string;
  payment: {
    id: number;
    status: string;
    amount: string;
    currency: string;
    providerReference?: string | null;
    providerStatus?: string;
  };
};

type ResultState = "loading" | "success" | "failed" | "pending" | "error";

const PaymentResultPage = () => {
  const t = useTranslations("PaymentPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const paymentId = Number(searchParams.get("paymentId"));
  const providerPaymentId = searchParams.get("id");
  const [state, setState] = useState<ResultState>("loading");
  const [detail, setDetail] = useState<string | null>(null);
  const [amountLabel, setAmountLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId || Number.isNaN(paymentId)) {
      setState("error");
      setDetail(t("resultMissingPayment"));
      return;
    }

    const body: {
      paymentId: number;
      providerPaymentId?: string;
    } = { paymentId };
    if (providerPaymentId) body.providerPaymentId = providerPaymentId;

    void apiRequest<VerifyResponse>("/api/payments/verify", {
      method: "POST",
      body,
    })
      .then((result) => {
        setAmountLabel(`${result.payment.currency} ${result.payment.amount}`);
        setDetail(result.message);
        if (result.payment.status === "COMPLETED") setState("success");
        else if (result.payment.status === "FAILED") setState("failed");
        else setState("pending");
      })
      .catch((error: unknown) => {
        setState("error");
        setDetail(error instanceof Error ? error.message : t("errorGeneric"));
      });
  }, [paymentId, providerPaymentId, t]);

  const icon =
    state === "success" ? (
      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
    ) : state === "loading" || state === "pending" ? (
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
    ) : (
      <AlertCircle className="w-10 h-10 text-rose-500" />
    );

  const title =
    state === "success"
      ? t("successTitle")
      : state === "failed"
        ? t("failedTitle")
        : state === "pending"
          ? t("resultPendingTitle")
          : state === "loading"
            ? t("verifyingTitle")
            : t("errorTitle");

  const description =
    state === "success"
      ? t("successDescription")
      : state === "failed"
        ? t("failedDescription")
        : state === "pending"
          ? t("resultPendingDescription")
          : state === "loading"
            ? t("verifyingDescription")
            : detail ?? t("errorGeneric");

  return (
    <>
      <Header className="fixed top-5 inset-x-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 z-50 shadow-sm border border-zinc-200/80 dark:border-zinc-800/80" />
      <main className="min-h-dvh pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto text-zinc-900 dark:text-zinc-100">
        <div className="flex flex-col items-center text-center gap-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("badge")}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{t("resultPageTitle")}</h1>
        </div>

        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-8 shadow-xl flex flex-col items-center gap-4 text-center">
          {icon}
          <h2 className="text-xl font-black">{title}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md">{description}</p>
          {amountLabel ? (
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {t("resultAmount", { amount: amountLabel })}
            </p>
          ) : null}
          {detail && state !== "error" && state !== "loading" ? (
            <p className="text-xs text-zinc-400">{detail}</p>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
            <Link href={`/${locale}/plans`} className="w-full sm:w-auto">
              <Button className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold">
                {t("backToPlans")}
              </Button>
            </Link>
            {state === "failed" || state === "error" ? (
              <Link href={`/${locale}/plans/payment`} className="w-full sm:w-auto">
                <Button className="w-full h-11 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-100 font-bold">
                  {t("tryAgain")}
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentResultPage;
