"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ApiError, apiRequest } from "@/lib/api";
import { applyAuthResponse } from "@/lib/auth-session";
import type { AuthResponse } from "@/lib/ads";
import BaseLink from "../../components/ui/BaseLink";

const OAuthCompleteClient = () => {
  const t = useTranslations("AuthPage");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const code = searchParams.get("code")?.trim() ?? "";
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!code || code.length < 20) {
      setError(t("oauthFailed"));
      return;
    }

    void apiRequest<AuthResponse>("/api/auth/oauth/complete", {
      method: "POST",
      auth: false,
      body: { code },
    })
      .then((payload) => {
        if (cancelled) return;
        applyAuthResponse(payload);
        window.location.replace(`/${locale}`);
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        if (reason instanceof ApiError) {
          setError(reason.message || t("oauthFailed"));
          return;
        }
        setError(t("oauthFailed"));
      });

    return () => {
      cancelled = true;
    };
  }, [code, locale, t]);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      {error ? (
        <>
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
          <BaseLink
            href="/log-in"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("logIn")}
          </BaseLink>
        </>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-300" role="status">
          …
        </p>
      )}
    </div>
  );
};

const OAuthCompletePage = () => (
  <Suspense
    fallback={
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md items-center justify-center px-4 py-16">
        <div className="h-10 w-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    }
  >
    <OAuthCompleteClient />
  </Suspense>
);

export default OAuthCompletePage;
