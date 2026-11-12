"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import GreatInput from "../../components/ui/GreatInput";
import BaseButton from "../../components/ui/BaseButton";
import BaseLink from "../../components/ui/BaseLink";
import { ApiError, apiRequest } from "@/lib/api";

const passwordIssue = (value: string) => {
  if (!value) return "fieldRequired" as const;
  if (value.length < 8 || value.length > 30) return "passwordLength" as const;
  if (!/[a-z]/.test(value)) return "passwordLower" as const;
  if (!/[A-Z]/.test(value)) return "passwordUpper" as const;
  if (!/[0-9]/.test(value)) return "passwordNumber" as const;
  if (!/[^A-Za-z0-9\s]/.test(value)) return "passwordSpecial" as const;
  if (!/^\S+$/.test(value)) return "passwordSpaces" as const;
  return "" as const;
};

const ResetPasswordForm = () => {
  const t = useTranslations("ResetPasswordPage");
  const token = useSearchParams().get("token")?.trim() ?? "";
  const tokenReady = token.length >= 20 && token.length <= 200;
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState<ReturnType<typeof passwordIssue>>("");
  const [confirmationError, setConfirmationError] = useState<"" | "fieldRequired" | "passwordsDoNotMatch">("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting || updated || !tokenReady) return;
    const nextPasswordError = passwordIssue(password);
    const nextConfirmationError = !confirmation
      ? "fieldRequired"
      : confirmation !== password
        ? "passwordsDoNotMatch"
        : "";
    setPasswordError(nextPasswordError);
    setConfirmationError(nextConfirmationError);
    setFormError("");
    if (nextPasswordError || nextConfirmationError) return;
    setSubmitting(true);
    void apiRequest<{ message: string }>("/api/password/reset", {
      method: "POST",
      auth: false,
      body: { token, password },
    })
      .then(() => setUpdated(true))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 400 && error.message === "Invalid or expired recovery token") {
          setFormError(t("tokenRejected"));
          return;
        }
        if (error instanceof ApiError && error.status === 400) {
          setFormError(t("passwordInvalid"));
          return;
        }
        setFormError(t("requestFailed"));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="mb-5 flex w-full max-w-150 flex-col gap-5 rounded-2xl border border-zinc-200/80 bg-zinc-100 p-5 sm:p-6 text-zinc-900 shadow-sm dark:border-zinc-700/30 dark:bg-zinc-800 dark:text-zinc-100">
      {updated ? (
        <div className="flex flex-col gap-4" role="status">
          <p className="text-sm sm:text-base leading-7">{t("success")}</p>
          <BaseLink
            href="/log-in"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white transition-colors duration-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          >
            {t("backToLogin")}
          </BaseLink>
        </div>
      ) : !tokenReady ? (
        <div className="flex flex-col gap-4" role="alert">
          <p className="text-sm leading-6 text-red-600 dark:text-red-400">{t("invalidToken")}</p>
          <BaseLink href="/log-in" className="text-sm font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
            {t("backToLogin")}
          </BaseLink>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <GreatInput
            id="new-password"
            name="new-password"
            label={t("newPassword")}
            type="password"
            autoComplete="new-password"
            value={password}
            error={passwordError ? t(passwordError) : ""}
            leftIcon={<Lock className="h-5 w-5" />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
            className="w-full"
            required
          />
          <GreatInput
            id="confirm-password"
            name="confirm-password"
            label={t("confirmPassword")}
            type="password"
            autoComplete="new-password"
            value={confirmation}
            error={confirmationError ? t(confirmationError) : ""}
            leftIcon={<Lock className="h-5 w-5" />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmation(event.target.value)}
            className="w-full"
            required
          />
          {formError ? (
            <p className="text-sm leading-6 text-red-600 dark:text-red-400" role="alert">
              {formError}
            </p>
          ) : null}
          <BaseButton
            type="submit"
            loading={submitting}
            disabled={submitting}
            className="h-12 w-full justify-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Lock className="h-4 w-4" />
            <span>{submitting ? t("loading") : t("submit")}</span>
          </BaseButton>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
