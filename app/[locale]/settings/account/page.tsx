"use client";

import React, { useRef, useState } from "react";
import SettingsPage from "../page";
import Alert from "../../components/ui/Alert";
import Window from "../../components/ui/Window";
import BaseButton from "../../components/ui/BaseButton";
import InputField from "../../components/ui/InputField";
import NoteInput from "../../components/ui/NoteInput";
import SettingsOption from "../../components/ui/SettingsOption";
import { useTranslations } from "next-intl";
import { useUserStore, defaultAccountSettings } from "@/store/user.store";
import { useHydrated, useSessionGate } from "@/lib/use-hydrated";
import { applyAuthResponse } from "@/lib/auth-session";
import type { AuthResponse } from "@/lib/ads";
import { apiRequest } from "@/lib/api";
import UploadImages from "../../components/ui/UploadImages";
import handleShowAlert from "../../Functions/handleShowAlert";
import { Save, User, Shield } from "lucide-react";
import countriesData, { Country } from "@/data/locationData";
import { redirect } from "next/navigation";
import { features } from "@/app/[locale]/features";

type PasswordModalStep = "current" | "new" | null;

const AccountPage = () => {
  const t = useTranslations("AccountPage");
  const { user, updateAccountSettings } = useUserStore();
  const { pending, isAuthenticated } = useSessionGate();

  const [isSaved, setIsSaved] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordModalStep, setPasswordModalStep] =
    useState<PasswordModalStep>(null);
  const mounted = useHydrated();
  const [twoFactorMode, setTwoFactorMode] = useState<"enable" | "disable" | null>(null);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const currentPasswordRef = useRef("");

  const accountSource = user?.settings?.account;
  const [accountSourceSeen, setAccountSourceSeen] = useState(accountSource);
  const [accountState, setAccountState] = useState({
    ...defaultAccountSettings,
    ...accountSource,
  });

  if (pending) return null;
  if (!user || !isAuthenticated) {
    redirect("/log-in");
  }

  if (accountSourceSeen !== accountSource) {
    setAccountSourceSeen(accountSource);
    setAccountState({
      ...defaultAccountSettings,
      ...accountSource,
    });
  }

  const isEmailValid =
    accountState.email.trim() !== "" &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      accountState.email.trim(),
    );

  const isNewPasswordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[@$!%*?&]/.test(newPassword);

  const is2FAEnabled = user?.settings?.account?.is2FAEnabled ?? false;

  const handleChange = (patch: Partial<typeof accountState>) => {
    setAccountState((prev) => ({
      ...prev,
      ...patch,
    }));

    setIsSaved(false);
  };

  const handleMonitoringChange = () => {
    if (!user) {
      handleShowAlert(t("error"), t("userNotFound"));
      return;
    }

    if (!accountState.email.trim()) {
      handleShowAlert(t("emailInvalid"), t("emailRequired"));
      return;
    }

    if (!isEmailValid) {
      handleShowAlert(t("emailInvalid"), t("emailInvalidDescription"));
      return;
    }

    const currentSettings = {
      ...defaultAccountSettings,
      ...user.settings.account,
    };

    const hasChanges = (
      Object.keys(accountState) as Array<keyof typeof accountState>
    ).some((key) => accountState[key] !== currentSettings[key]);

    if (!hasChanges) {
      setIsSaved(true);
      handleShowAlert(t("noChange"), t("desForNoChange"));
      return;
    }

    updateAccountSettings({
      ...accountState,
    });
    void apiRequest("/api/me", {
      method: "PATCH",
      body: {
        firstName: accountState.firstName,
        lastName: accountState.lastName,
        username: accountState.username,
        email: accountState.email,
        mobileNumber: accountState.mobileNumber,
        region: accountState.region,
        city: accountState.city,
        ...(accountState.bio ? { bio: accountState.bio } : {}),
      },
    }).catch(() => undefined);

    setIsSaved(true);

    handleShowAlert(t("saved"), t("savedSuccessfully"));
  };

  const handleVerifyCurrentPassword = () => {
    if (!currentPassword.trim()) {
      handleShowAlert(t("error"), t("enterCurrentPassword"));
      return;
    }

    currentPasswordRef.current = currentPassword;
    setCurrentPassword("");
    setPasswordModalStep("new");
  };

  const handleSaveNewPassword = () => {
    if (!isNewPasswordValid) {
      handleShowAlert(t("weakPassword"), t("followPasswordRequirements"));
      return;
    }
    void apiRequest("/api/me/password", {
      method: "PATCH",
      body: {
        currentPassword: currentPasswordRef.current,
        newPassword,
      },
    }).then(() => {
      currentPasswordRef.current = "";
      setPasswordModalStep(null);
      setNewPassword("");
      handleShowAlert(t("saved"), t("savedSuccessfully"));
    }).catch(() => {
      handleShowAlert(t("error"), t("enterCurrentPassword"));
    });
  };

  const handleToggle2FA = () => {
    if (!user) {
      handleShowAlert(t("error"), t("userNotFound"));
      return;
    }
    if (is2FAEnabled) {
      setTwoFactorMode("disable");
      return;
    }
    void apiRequest<{ secret: string }>("/api/me/2fa/setup", { method: "POST" })
      .then((result) => {
        setTwoFactorSecret(result.secret);
        setTwoFactorMode("enable");
      })
      .catch(() => handleShowAlert(t("error"), t("userNotFound")));
  };

  const handleConfirm2FA = () => {
    void apiRequest<AuthResponse>("/api/me/2fa/" + (twoFactorMode === "disable" ? "disable" : "enable"), {
      method: "POST",
      body: { currentPassword: twoFactorPassword, code: twoFactorCode },
    }).then((result) => {
      if (result.user) {
        applyAuthResponse(result);
      } else {
        updateAccountSettings({ ...accountState, is2FAEnabled: twoFactorMode !== "disable" });
      }
      setTwoFactorMode(null);
      setTwoFactorSecret("");
      setTwoFactorCode("");
      setTwoFactorPassword("");
      handleShowAlert(t("saved"), t("savedSuccessfully"));
    }).catch(() => handleShowAlert(t("error"), t("enterCurrentPassword")));
  };

  const regionOptions = Object.keys(countriesData).map((country, index) => ({
    id: index + 1,
    label: country,
    value: country,
  }));

  const selectedCountry = Object.prototype.hasOwnProperty.call(
    countriesData,
    accountState.region,
  )
    ? (accountState.region as Country)
    : undefined;

  const cityOptions = selectedCountry
    ? countriesData[selectedCountry].cities.map((city, cityIndex) => ({
        id: cityIndex + 1,
        label: city,
        value: city,
      }))
    : [];

  const handleRegionChange = (region: string | null) => {
    if (!region) return;

    const selectedCountry = Object.prototype.hasOwnProperty.call(
      countriesData,
      region,
    )
      ? (region as Country)
      : undefined;

    const cities: string[] = selectedCountry
      ? countriesData[selectedCountry].cities
      : [];

    handleChange({
      region,
      city: cities[0] ?? "",
    });
  };

  const locationSettings = [
    {
      id: "region",
      title: t("regionTitle"),
      description: t("regionDescription"),
      options: regionOptions,
      value: accountState.region,
      onChange: handleRegionChange,
    },
    {
      id: "city",
      title: t("cityTitle"),
      description: t("cityDescription"),
      options: cityOptions,
      value: accountState.city,
      onChange: (value: string | null) =>
        value && handleChange({ city: value }),
    },
  ];

  const formFields = [
    {
      id: "firstName",
      label: t("firstName"),
      value: accountState.firstName,
      type: "text",
      maxLength: 30,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange({
          firstName: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
        }),
    },
    {
      id: "lastName",
      label: t("lastName"),
      value: accountState.lastName,
      type: "text",
      maxLength: 30,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange({
          lastName: e.target.value.replace(/[^a-zA-Z\s]/g, ""),
        }),
    },
    {
      id: "email",
      label: t("email"),
      value: accountState.email,
      type: "email",
      maxLength: 100,
      required: true,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange({ email: e.target.value }),
    },
    {
      id: "mobilePhone",
      label: t("mobilePhone"),
      value: accountState.mobileNumber,
      type: "tel",
      maxLength: 15,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange({
          mobileNumber: e.target.value.replace(/[^0-9+]/g, ""),
        }),
    },
    {
      id: "username",
      label: t("username"),
      value: accountState.username,
      type: "text",
      maxLength: 30,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleChange({
          username: e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
        }),
    }
  ];

  const securitySettings = [
    {
      id: "password",
      title: t("passwordTitle"),
      description: t("passwordDes"),
      buttonText: t("passwordBtn"),
      onClick: () => setPasswordModalStep("current"),
    },
    {
      id: "2fa",
      title: t("twoFactorTitle"),
      description: t("twoFactorDes"),
      buttonText: is2FAEnabled ? t("twoFactorDisable") : t("twoFactorEnable"),
      onClick: handleToggle2FA,
    },
  ];

  if (!mounted) return null;

  return (
    <SettingsPage>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleMonitoringChange();
        }}
      >
        <Alert />

        <Window
          title={t("verifyCurrentPassword")}
          description={t("enterCurrentPasswordDescription")}
          label={t("currentPassword")}
          show={passwordModalStep === "current"}
          presenceOfInput={true}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          onClickForButton={handleVerifyCurrentPassword}
          onClose={() => {
            setCurrentPassword("");
            setPasswordModalStep(null);
          }}
        />

        <Window
          title={t("changePassword")}
          description={t("passwordMustNotBeReused")}
          label={t("newPassword")}
          show={passwordModalStep === "new"}
          presenceOfInput={true}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onClickForButton={handleSaveNewPassword}
          onClose={() => {
            setNewPassword("");
            setPasswordModalStep(null);
          }}
        />

        <div className="flex flex-col sm:flex-row sm:min-h-20 items-start sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-0">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg">
              {features.stores ? t("subtitle") : t("subtitleNoStores")}
            </p>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {!isSaved && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                {t("notSaved")}
              </span>
            )}

            <BaseButton
              variant="default"
              type="submit"
            >
              <Save className="w-5 h-5" />
              {t("saveChanges")}
            </BaseButton>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("generalIdentity")}
            </h2>
          </div>

          <UploadImages />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {formFields.map((field) => (
              <InputField
                {...field}
                key={field.id}
                classNameForBox={field.id === "username" ? "w-full col-span-1 sm:col-span-2" : "w-full"}
              />
            ))}
          </div>

          <NoteInput
          id="bio"
          variant="fixed"
          label={t("bio")}
          className="w-full min-h-32 resize-y rounded-xl border border-zinc-300 bg-zinc-200 px-4 py-3 text-sm placeholder:text-zinc-400 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:ring-zinc-400"
          value={accountState.bio}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            handleChange({ bio: e.target.value })
          }
          rows={5}
        />

          {locationSettings.map((item) => (
            <SettingsOption
              key={item.id}
              title={item.title}
              description={item.description}
              dropdown={{
                options: item.options,
                value: item.value,
                onChange: item.onChange,
              }}
              className=""
            />
          ))}
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent my-2" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/50">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[2px] text-zinc-500 dark:text-zinc-400">
              {t("security")}
            </h2>
          </div>

          {securitySettings.map((item) => (
            <SettingsOption
              key={item.id}
              title={item.title}
              description={item.description}
              className=""
              button={{
                text: item.buttonText,
                onClick: item.onClick,
              }}
            />
          ))}
          {twoFactorMode ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
              {twoFactorSecret ? <p className="text-sm">{t("twoFactorSecret")}</p> : null}
              {twoFactorSecret ? <p className="font-mono text-sm break-all">{twoFactorSecret}</p> : null}
              <input value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder={t("twoFactorCode")} className="h-11 rounded-xl border border-zinc-200 px-3 dark:border-zinc-700 dark:bg-zinc-950" />
              <input type="password" value={twoFactorPassword} onChange={(event) => setTwoFactorPassword(event.target.value)} placeholder={t("twoFactorPassword")} className="h-11 rounded-xl border border-zinc-200 px-3 dark:border-zinc-700 dark:bg-zinc-950" />
              <BaseButton type="button" onClick={handleConfirm2FA}>{t("twoFactorConfirm")}</BaseButton>
            </div>
          ) : null}
        </div>
      </form>
    </SettingsPage>
  );
};

export default AccountPage;
