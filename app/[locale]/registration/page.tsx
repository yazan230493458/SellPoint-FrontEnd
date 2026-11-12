"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import Header from "../components/main/Header";
import GreatInput from "../components/ui/GreatInput";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { apiRequest, ApiError } from "@/lib/api";
import { applyAuthResponse, startOAuth } from "@/lib/auth-session";
import type { AuthResponse } from "@/lib/ads";
import { useAlertStore } from "@/store/alert.store";
import { Globe, Check, User } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { CheckboxTile } from "../components/ui/CheckboxTile";
import ProSelect from "../components/ui/ProSelect";
import countriesData, { type Country } from "@/data/locationData";

const oauthProviders = [
  {
    id: "google",
    label: "continueGoogle",
    btnClass:
      "flex justify-center items-center gap-3 min-w-max border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700/60",
    icon: <Globe className="h-5 w-5 shrink-0 text-blue-500" />,
  },
  {
    id: "github",
    label: "continueGitHub",
    btnClass:
      "flex justify-center items-center gap-3 min-w-max bg-[#24292e] text-white hover:bg-[#2c3137] focus:ring-zinc-400 dark:bg-[#24292e] dark:text-white dark:hover:bg-[#2f363d]",
    icon: <FaGithub className="h-5 w-5 shrink-0" />,
  },
];

const passwordIssue = (value: string) => {
  if (value.length < 8 || value.length > 30) return "passwordLength" as const;
  if (!/[a-z]/.test(value)) return "passwordLower" as const;
  if (!/[A-Z]/.test(value)) return "passwordUpper" as const;
  if (!/[0-9]/.test(value)) return "passwordNumber" as const;
  if (!/[^A-Za-z0-9\s]/.test(value)) return "passwordSpecial" as const;
  if (!/^\S+$/.test(value)) return "passwordSpaces" as const;
  return "" as const;
};

type FormFields = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  region: string;
  city: string;
};

const RegistrationPage = () => {
  const t = useTranslations("AuthPage");
  const router = useRouter();
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const [formData, setFormData] = useState<FormFields>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    region: "",
    city: "",
  });

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormFields, string>>
  >({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const countryOptions = useMemo(
    () => [
      {
        value: "Countries",
        items: Object.keys(countriesData),
      },
    ],
    [],
  );

  const cityGroups = useMemo(() => {
    if (!formData.region || !countriesData[formData.region as Country])
      return [];
    return [
      {
        value: formData.region,
        items: [...countriesData[formData.region as Country].cities],
      },
    ];
  }, [formData.region]);

  const countryCode =
    formData.region && countriesData[formData.region as Country]
      ? countriesData[formData.region as Country].callingCode
      : undefined;

  const handleFormatMobileNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");

    return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  };

  const handleInputChange = (field: keyof FormFields, value: string) => {
    if (field === "mobileNumber") {
      value = handleFormatMobileNumber(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleShowAlert = (alertTitle: string, alertDescription: string) => {
    setTitle?.(alertTitle);
    setDescription?.(alertDescription);
    onOpen?.();
  };

  const handleRegionChange = (value: string | null) => {
    const region = value ?? "";
    setFormData((prev) => {
      const cityStillValid =
        region && countriesData[region as Country]?.cities.includes(prev.city);
      return {
        ...prev,
        region,
        city: cityStillValid ? prev.city : "",
      };
    });
    setFieldErrors((prev) => ({
      ...prev,
      region: undefined,
      city: undefined,
    }));
  };

  const handleCityChange = (value: string | null) => {
    handleInputChange("city", value ?? "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const nextErrors: Partial<Record<keyof FormFields, string>> = {};

    const fieldsToValidate = [
      "firstName",
      "lastName",
      "username",
      "email",
      "mobileNumber",
      "password",
      "confirmPassword",
      "region",
      "city",
    ] as const;

    fieldsToValidate.forEach((field) => {
      const value = formData[field];
      if (!value || typeof value !== "string" || !value.trim()) {
        nextErrors[field] = t("fieldRequired");
      }
    });

    if (
      formData.email &&
      typeof formData.email === "string" &&
      formData.email.trim() &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        formData.email.trim(),
      )
    ) {
      nextErrors.email = t("emailInvalid");
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = t("passwordsDoNotMatch");
    } else if (formData.password.trim()) {
      const issue = passwordIssue(formData.password);
      if (issue) nextErrors.password = t(issue);
    }

    if (formData.region && !countriesData[formData.region as Country]) {
      nextErrors.region = t("invalidRegion");
    }

    if (
      formData.region &&
      formData.city &&
      !countriesData[formData.region as Country]?.cities.includes(formData.city)
    ) {
      nextErrors.city = t("invalidCity");
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      handleShowAlert(
        t("warning"),
        nextErrors.password && formData.password.trim()
          ? nextErrors.password
          : t("completeRequiredFields"),
      );
      return;
    }

    if (!acceptedTerms) {
      handleShowAlert(t("warning"), t("acceptTermsFirst"));
      return;
    }

    setSubmitting(true);

    if (!countryCode) {
      setFieldErrors((prev) => ({
        ...prev,
        region: t("invalidRegion"),
      }));
      setSubmitting(false);
      return;
    }

    void apiRequest<AuthResponse>("/api/register", {
      method: "POST",
      auth: false,
      body: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        mobileNumber: `+${countryCode.replace(/^\+/, "")}${formData.mobileNumber.replace(/\D/g, "").replace(/^0/, "")}`,
        region: formData.region,
        city: formData.city,
        password: formData.password,
        acceptTerms: acceptedTerms,
      },
    })
      .then((payload) => {
        applyAuthResponse(payload);
        router.push("/");
      })
      .catch((error: unknown) => {
        const message =
          error instanceof ApiError ? error.message : t("requestFailed");
        handleShowAlert(t("warning"), message);
      })
      .finally(() => setSubmitting(false));
  };

  const handleOAuthLogin = (provider: "google" | "github") => {
    startOAuth(provider);
  };

  return (
    <div className="min-h-dvh bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      <Alert />

      <Header className="h-20 flex justify-between rounded-xl top-5 inset-x-3 fixed p-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/30" />
      <main className="flex flex-col gap-8 sm:gap-10 items-center px-3 sm:px-5 pt-28 sm:pt-36 pb-10">
        <div className="w-full max-w-2xl flex flex-col justify-center items-center gap-3 sm:gap-5 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold">
            {t("createAccount")}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            {t("registrationSubtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-150 flex flex-col gap-5 rounded-2xl p-4 sm:p-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/80 dark:border-zinc-700/30 shadow-xl"
          noValidate
        >
          <div className="flex flex-col items-center gap-3.5">
            {oauthProviders.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                className={`w-full h-12 ${provider.btnClass}`}
                onClick={() => handleOAuthLogin(provider.id as "google" | "github")}
              >
                {provider.icon}
                <span>{t(provider.label)}</span>
              </Button>
            ))}
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full"></div>
            <span className="bg-zinc-100 dark:bg-zinc-800 px-3 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider absolute">
              {t("or")}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-5">
              <GreatInput
                id="firstName"
                name="firstName"
                label={t("firstName")}
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="w-full sm:w-1/2 h-12 rounded-lg outline-0"
                error={fieldErrors.firstName}
                required
              />
              <GreatInput
                id="lastName"
                name="lastName"
                label={t("lastName")}
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="w-full sm:w-1/2 h-12 rounded-lg outline-0"
                error={fieldErrors.lastName}
                required
              />
            </div>

            <GreatInput
              id="username"
              name="username"
              label={t("username")}
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="w-full h-12 rounded-lg outline-0"
              error={fieldErrors.username}
              required
            />

            <GreatInput
              id="email"
              name="email"
              label={t("email")}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full h-12 rounded-lg outline-0"
              error={fieldErrors.email}
              required
            />

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full sm:w-1/2 flex flex-col gap-1.5">
                <label htmlFor="region" className="sr-only">
                  {t("region")}
                </label>
                <ProSelect
                  id="region"
                  name="region"
                  value={formData.region || null}
                  onChange={handleRegionChange}
                  options={countryOptions}
                  placeholder={t("selectRegion")}
                  searchPlaceholder={t("searchRegion")}
                  emptyText={t("emptyRegions")}
                  className="w-full h-12 bg-zinc-200 text-black dark:bg-zinc-700 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20"
                />
                {fieldErrors.region ? (
                  <p
                    role="alert"
                    className="ms-1 text-xs font-medium text-red-500 dark:text-red-400"
                  >
                    {fieldErrors.region}
                  </p>
                ) : null}
              </div>
              <div className="w-full sm:w-1/2 flex flex-col gap-1.5">
                <label htmlFor="city" className="sr-only">
                  {t("city")}
                </label>
                <ProSelect
                  id="city"
                  name="city"
                  value={formData.city || null}
                  onChange={handleCityChange}
                  options={cityGroups}
                  placeholder={t("selectCity")}
                  searchPlaceholder={t("searchCity")}
                  emptyText={t("emptyCities")}
                  disabled={!formData.region}
                  className="w-full h-12 bg-zinc-200 text-black dark:bg-zinc-700 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20"
                />
                {fieldErrors.city ? (
                  <p
                    role="alert"
                    className="ms-1 text-xs font-medium text-red-500 dark:text-red-400"
                  >
                    {fieldErrors.city}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <GreatInput
                countryCode={countryCode}
                id="mobileNumber"
                name="mobileNumber"
                label={t("mobileNumber")}
                type="tel"
                inputMode="numeric"
                value={formData.mobileNumber}
                leftIcon={<User />}
                isMobileNumber={true}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                className="w-full h-12 rounded-lg outline-0"
                error={fieldErrors.mobileNumber}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <GreatInput
                id="password"
                name="password"
                label={t("password")}
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full sm:w-1/2 h-12 rounded-lg outline-0"
                error={fieldErrors.password}
                required
              />
              <GreatInput
                id="confirmPassword"
                name="confirmPassword"
                label={t("confirmPassword")}
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className="w-full sm:w-1/2 h-12 rounded-lg outline-0"
                error={fieldErrors.confirmPassword}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 w-full mt-2">
            <CheckboxTile
              checked={acceptedTerms}
              onCheckedChange={setAcceptedTerms}
              title={t("acceptTerms")}
              description={t("termsDescription")}
            />

            <Button
              type="submit"
              disabled={submitting}
              className="h-12 flex justify-center items-center gap-3 w-full transition-colors duration-200 rounded-2xl bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{t("submit")}</span>
              <Check className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
            </Button>

            <div className="flex justify-center items-center text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {t("haveAccount")}{" "}
              <BaseLink
                href="/log-in"
                className="ms-1 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-500 dark:hover:text-zinc-300 hover:underline"
              >
                {t("logIn")}
              </BaseLink>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegistrationPage;
