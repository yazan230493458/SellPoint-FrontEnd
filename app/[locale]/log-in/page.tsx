"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/main/Header";
import GreatInput from "../components/ui/GreatInput";
import { Lock, ArrowRight, Globe } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import Button from "../components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import { useTranslations } from "next-intl";
import { apiRequest, ApiError } from "@/lib/api";
import { applyAuthResponse, startOAuth } from "@/lib/auth-session";
import type { AuthResponse } from "@/lib/ads";
import Alert from "../components/ui/Alert";
import { useAlertStore } from "@/store/alert.store";
import BaseButton from "../components/ui/BaseButton";
import AccountSwitcher from "../components/ui/AccountSwitcher";

const oauthProviders = [
  {
    id: "google",
    label: "continueGoogle",
    btnClass:
      "w-full h-12 gap-2.5 flex justify-center items-center border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/60",
    icon: <Globe className="h-5 w-5 shrink-0 text-blue-500" />,
  },
  {
    id: "github",
    label: "continueGitHub",
    btnClass:
      "w-full h-12 gap-2.5 flex justify-center items-center bg-[#24292e] text-white hover:bg-[#2c3137] focus:ring-zinc-400 dark:bg-[#24292e] dark:text-white dark:hover:bg-[#2f363d]",
    icon: <FaGithub className="h-5 w-5 shrink-0" />,
  },
];

type LoginFormFields = {
  identifier: string;
  password: string;
};

const LoginPage = () => {
  const t = useTranslations("AuthPage");
  const router = useRouter();
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const [formData, setFormData] = useState<LoginFormFields>({
    identifier: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);

  const handleInputChange = (field: keyof LoginFormFields, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleShowAlert = (alertTitle: string, alertDescription: string) => {
    setTitle?.(alertTitle);
    setDescription?.(alertDescription);
    onOpen?.();
  };

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const identifier = formData.identifier.trim();
    if (!challengeToken && (!identifier || !formData.password)) {
      setFormError(t("completeRequiredFields"));
      handleShowAlert(t("warning"), t("completeRequiredFields"));
      return;
    }

    setFormError("");
    setSubmitting(true);
    const request = challengeToken
      ? apiRequest<AuthResponse>("/api/log-in/2fa", {
          method: "POST",
          auth: false,
          body: { challengeToken, code: authenticatorCode.trim() },
        })
      : apiRequest<AuthResponse>("/api/log-in", {
          method: "POST",
          auth: false,
          body: { identifier, password: formData.password },
        });
    void request
      .then((payload) => {
        if (payload.twoFactorRequired && payload.challengeToken) {
          setChallengeToken(payload.challengeToken);
          return;
        }
        applyAuthResponse(payload);
        if (!rememberMe && typeof window !== "undefined") {
          sessionStorage.setItem("sellpoint-remember-me", "0");
        }
        router.push("/");
      })
      .catch((error: unknown) => {
        const message = error instanceof ApiError ? error.message : t("completeRequiredFields");
        setFormError(message);
        handleShowAlert(t("warning"), message);
      })
      .finally(() => setSubmitting(false));
  };

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error !== "google" && error !== "github") return;
    setFormError(t("oauthFailed"));
    const { setTitle, setDescription, onOpen } = useAlertStore.getState();
    setTitle?.(t("warning"));
    setDescription?.(t("oauthFailed"));
    onOpen?.();
  }, [t]);

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <Alert />
      <Header
        className="h-20 flex justify-between rounded-xl fixed top-5 inset-x-3 px-5 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/30"
      />
      <main className="flex flex-col gap-8 sm:gap-10 items-center p-3 sm:px-5 pt-28 sm:pt-36 pb-8">
        <div className="w-full max-w-2xl flex flex-col justify-center items-center gap-3 sm:gap-5 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold">{t("welcomeBack")}</h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            {t("loginSubtitle")}
          </p>
        </div>

        <div className="w-full max-w-150 flex flex-col gap-5 mb-5 rounded-2xl p-4 sm:p-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/30 shadow-sm">
          <AccountSwitcher
            defaultOpen
            hideWhenEmpty
            showAddOption={false}
            className="rounded-2xl border border-zinc-200/80 dark:border-zinc-700/40 bg-white/60 dark:bg-zinc-900/50 p-3"
          />
          <div className="flex flex-col items-center gap-3.5">
            {oauthProviders.map((provider) => (
              <Button
                className={`${provider.btnClass}`}
                key={provider.id}
                type="button"
                onClick={() => startOAuth(provider.id as "google" | "github")}
              >
                {provider.icon}
                <span>{t(provider.label)}</span>
              </Button>
            ))}
          </div>
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
            <span className="absolute bg-zinc-100 dark:bg-zinc-800 px-3 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              {t("orContinueWith")}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <GreatInput
              id="identifier"
              name="identifier"
              label={t("emailOrUsername")}
              type="text"
              value={formData.identifier}
              onChange={(e) => handleInputChange("identifier", e.target.value)}
              className="w-full h-full rounded-lg outline-0"
              required
            />
            <GreatInput
              id="password"
              name="password"
              label={t("password")}
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="w-full h-full rounded-lg outline-0"
              required
            />
            {challengeToken ? (
              <GreatInput
                id="authenticatorCode"
                name="authenticatorCode"
                label={t("authenticatorCode")}
                type="text"
                value={authenticatorCode}
                onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full h-full rounded-lg outline-0"
                required
              />
            ) : null}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-400 dark:focus:ring-zinc-400"
                />
                <span className="text-zinc-500 dark:text-zinc-400">
                  {t("rememberMe")}
                </span>
              </label>
              
              <BaseLink
                href="/log-in/reset-password"
                className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 dark:hover:text-zinc-300 hover:underline"
              >
                {t("forgotPassword")}
              </BaseLink>
            </div>
            {formError ? (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">{formError}</p>
            ) : null}
            <div className="flex flex-col gap-3 w-full mt-2">
              <BaseButton className="h-12 flex justify-center items-center gap-3 w-full transition-colors duration-200 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
                <Lock className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                <span className="text-zinc-900 dark:text-zinc-100">{t("logIn")}</span>
                <ArrowRight className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              </BaseButton>

              <div className="flex justify-center items-center text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                {t("noAccount")}{" "}
                <BaseLink
                  href="/registration"
                  className="ms-1 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 dark:hover:text-zinc-300 hover:underline"
                >
                  {t("registration")}
                </BaseLink>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;