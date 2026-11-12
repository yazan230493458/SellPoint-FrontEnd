"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Store,
  Phone,
  Globe,
  Mail,
  Check,
  CreditCard,
  Upload,
  X,
} from "lucide-react";
import Alert from "../components/ui/Alert";
import Stepper from "../components/ui/Stepper";
import GreatInput from "../components/ui/GreatInput";
import NoteInput from "../components/ui/NoteInput";
import Button from "../components/ui/Button";
import BaseButton from "../components/ui/BaseButton";
import { ProSelect } from "../components/ui/ProSelect";
import { useAlertStore } from "@/store/alert.store";
import { useUserStore } from "@/store/user.store";
import { useStoreStore, type StoreType } from "@/store/store.store";
import { useActivityLogStore } from "@/store/activity-log.store";
import { categoryOptions } from "../../../data/CategoriesData";
import { defaultStoreFormData } from "@/store/store.store";
import { features } from "@/app/[locale]/features";
import { redirect } from "next/navigation";
import {
  citiesByCountry,
  countryCallingCodes,
  countryOptions,
} from "../../../data/locationData";

if (!features.stores) {
  redirect("/");
}

const getContactOptions = (t: (key: string) => string) => [
  {
    value: "contact_methods",
    items: [t("mobileCall"), t("whatsApp"), t("both"), t("emailSupport")],
  },
];

const paymentOptions = [
  { id: "Mada", labelKey: "mada" },
  { id: "Credit Card", labelKey: "creditCard" },
  { id: "Apple Pay", labelKey: "applePay" },
  { id: "Cash on Delivery", labelKey: "cashOnDelivery" },
  { id: "Bank Transfer", labelKey: "bankTransfer" },
];

const CreateStore = () => {
  const t = useTranslations("createStore");
  const tCommon = useTranslations("Common");
  const catalogLabel = useCatalogLabel();
  const contactOptions = getContactOptions(t);
  const router = useRouter();
  const stepRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const user = useUserStore((state) => state.user);
  const addStore = useStoreStore((state) => state.addStore);
  const addActivity = useActivityLogStore((state) => state.addActivity);

  const username = user?.settings.account.username ?? "";

  const [activeStep, setActiveStep] = useState<number>(1);
  const [formData, setFormData] = useState<StoreType>(() => defaultStoreFormData);
  const [isDesktop, setIsDesktop] = useState(false);
  const storeIdRef = useRef(0);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const allAvailableCategories = Array.isArray(categoryOptions)
    ? categoryOptions.flatMap((group) =>
        Array.isArray(group?.items) ? group.items.map((item) => item) : [],
      )
    : [];

  const cityOptions =
    formData.step1.selectedCountry && citiesByCountry
      ? [
          {
            value: formData.step1.selectedCountry,
            items: citiesByCountry[formData.step1.selectedCountry] ?? [],
          },
        ]
      : [];

  const countryCode =
    formData.step1.selectedCountry && countryCallingCodes
      ? (countryCallingCodes[
          formData.step1.selectedCountry as keyof typeof countryCallingCodes
        ] ?? undefined)
      : undefined;

  const step1InputFields = [
    {
      disabled: false,
      id: "storeName" as const,
      isMobileNumber: false,
      label: t("storeName"),
      leftIcon: <Store />,
      type: "text",
    },
    {
      disabled: !formData.step1.selectedCountry,
      id: "mobileNumber" as const,
      isMobileNumber: true,
      label: t("mobileNumber"),
      leftIcon: <Phone />,
      type: "text",
    },
  ];

  const handleToggleCategory = (categoryName: string) => {
    setFormData((prev) => {
      const exists = prev.step2.categories.includes(categoryName);

      return {
        ...prev,
        step2: {
          ...prev.step2,
          categories: exists
            ? prev.step2.categories.filter(
                (category) => category !== categoryName,
              )
            : [...prev.step2.categories, categoryName],
        },
      };
    });
  };

  
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    handleShowAlert(t("attention"), t("imageFormats"));
    e.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    const source = new window.Image();

    source.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 1000;
      const scale = Math.min(
        1,
        maxSize / Math.max(source.width, source.height),
      );

      canvas.width = Math.round(source.width * scale);
      canvas.height = Math.round(source.height * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        handleShowAlert(t("attention"), t("imageFormats"));
        return;
      }

      context.drawImage(source, 0, 0, canvas.width, canvas.height);

      const compressedImage = canvas.toDataURL("image/jpeg", 0.7);

      setFormData((prev) => ({
        ...prev,
        step2: {
          ...prev.step2,
          image: compressedImage,
        },
      }));
    };

    source.onerror = () => {
      handleShowAlert(t("attention"), t("imageFormats"));
    };

    source.src = reader.result as string;
  };

  reader.onerror = () => {
    handleShowAlert(t("attention"), t("imageFormats"));
  };

  reader.readAsDataURL(file);
};


  const handleRemoveImage = () => {
    setFormData((prev: StoreType) => ({
      ...prev,
      step2: {
        ...prev.step2,
        image: "",
      },
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTogglePaymentMethod = (methodId: string) => {
    setFormData((prev) => {
      const exists = prev.step3.paymentMethods.includes(methodId);

      const updatedMethods = exists
        ? prev.step3.paymentMethods.filter((method) => method !== methodId)
        : [...prev.step3.paymentMethods, methodId];

      return {
        ...prev,
        step3: {
          ...prev.step3,
          paymentMethods: updatedMethods,
        },
      };
    });
  };

  const handleContactMethodChange = (value: string | null) => {
    setFormData((prevData: StoreType) => ({
      ...prevData,
      step3: {
        ...prevData.step3,
        preferredContactMethod: value,
      },
    }));
  };

  const handleCityChange = (value: string | null) => {
    setFormData((prevData: StoreType) => ({
      ...prevData,
      step1: {
        ...prevData.step1,
        selectedCity: value,
      },
    }));
  };

  const handleCountryChange = (value: string | null) => {
    setFormData((prevData: StoreType) => ({
      ...prevData,
      step1: {
        ...prevData.step1,
        selectedCity: null,
        selectedCountry: value,
      },
    }));
  };

  const handleDeleteData = () => {
    if (activeStep === 1) {
      setFormData((prev: StoreType) => ({
        ...prev,
        step1: formData.step1,
      }));
    } else if (activeStep === 2) {
      setFormData((prev: StoreType) => ({
        ...prev,
        step2: formData.step2,
      }));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (activeStep === 3) {
      setFormData((prev: StoreType) => ({
        ...prev,
        step3: formData.step3,
      }));
    }
  };

  const handleFormatMobileNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 9);
    const match = cleaned.match(/^(\d{2})(\d{3})(\d{5})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    const partialMatch = cleaned.match(/^(\d{1,2})(\d{0,3})(\d{0,5})$/);
    if (partialMatch) {
      return [partialMatch[1], partialMatch[2], partialMatch[3]]
        .filter(Boolean)
        .join(" ");
    }
    return cleaned;
  };

  const handleNext = () => {
    const {
      storeName,
      description,
      mobileNumber,
      selectedCity,
      selectedCountry,
    } = formData.step1;

    const cleanMobile = mobileNumber.replace(/\D/g, "");
    const { categories, image } = formData.step2;
    const { preferredContactMethod, paymentMethods, acceptTerms } =
      formData.step3;

    if (activeStep === 1) {
      const hasMissingFields =
        !storeName.trim() ||
        !mobileNumber.trim() ||
        !selectedCountry ||
        !selectedCity ||
        !description.trim();

      if (hasMissingFields) {
        handleShowAlert(t("attention"), t("requiredFields"));
        return;
      }

      if (cleanMobile.length !== 9) {
        handleShowAlert(t("attention"), t("incompleteMobile"));
        return;
      }

      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      if (categories.length === 0 || !image) {
        handleShowAlert(t("attention"), t("categoryAndImageRequired"));
        return;
      }

      setActiveStep(3);
      return;
    }

    if (activeStep === 3) {
      if (!preferredContactMethod || paymentMethods.length === 0) {
        handleShowAlert(t("attention"), t("contactAndPaymentRequired"));
        return;
      }

      if (!acceptTerms) {
        handleShowAlert(t("attention"), t("acceptTermsFirst"));
        return;
      }

      if (storeIdRef.current === 0) {
        storeIdRef.current = new Date().getTime();
      } else {
        storeIdRef.current += 1;
      }
      const storePayload = {
        id: storeIdRef.current,
        ...formData,
        username,
        step2: {
          ...formData.step2,
          mainImageIndex: 0,
        },
        sections: [],
      };

      addStore(storePayload);

      addActivity({
        id: `store-${storePayload.id}`,
        type: "store",
        actionTitle: storePayload.step1.storeName,
        description: storePayload.step1.description,
        timestamp: new Date().toLocaleString("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        category: storePayload.step2.categories.join(", "),
        imageUrl: storePayload.step2.image,
        href: `/stores/${storePayload.id}`,
      });

      setActiveStep(1);
      setFormData(formData);
      router.push("/");
    }
  };

  const handlePrev = () => {
    setActiveStep(Math.max(activeStep - 1, 1));
  };

  const handleShowAlert = (title: string, description: string) => {
    if (setTitle) setTitle(title);
    if (setDescription) setDescription(description);
    if (onOpen) onOpen();
  };

  const handleStep1InputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    const finalValue =
      id === "mobileNumber" ? handleFormatMobileNumber(value) : value;

    setFormData((prevData: StoreType) => ({
      ...prevData,
      step1: {
        ...prevData.step1,
        [id]: finalValue,
      },
    }));
  };

  const handleStep2InputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    setFormData((prevData: StoreType) => ({
      ...prevData,
      step2: {
        ...prevData.step2,
        [id]: value,
      },
    }));
  };

  const handleStep3TermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setFormData((prevData: StoreType) => ({
      ...prevData,
      step3: {
        ...prevData.step3,
        [id]: checked,
      },
    }));
  };

  useEffect(() => {
    const handleClearData = () => {
      setFormData(defaultStoreFormData);
    };
    window.addEventListener("popstate", handleClearData);

    return () => {
      window.removeEventListener("popstate", handleClearData);
    };
  }, [setFormData]);

  const controlElements = [
    {
      condition: activeStep === 1,
      render: () => (
        <div className="flex flex-col gap-5 p-5 w-full max-w-[50rem]">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              {t("step1Title")}
            </h1>
            <p className="text-zinc-900/50 dark:text-zinc-100/50">
              {t("step1Subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProSelect
              className="w-full h-14 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20"
              onChange={handleCountryChange}
              options={countryOptions}
              placeholder={t("selectRegion")}
              value={formData.step1.selectedCountry}
            />

            <ProSelect
              className="w-full h-14 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20"
              disabled={!formData.step1.selectedCountry}
              onChange={handleCityChange}
              options={cityOptions}
              placeholder={t("selectCity")}
              value={formData.step1.selectedCity}
            />

            {step1InputFields.map((field) => (
              <GreatInput
                className="w-full h-full bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20"
                countryCode={
                  field.id === "mobileNumber" ? countryCode : undefined
                }
                disabled={field.disabled}
                id={field.id}
                isMobileNumber={field.id === "mobileNumber"}
                key={field.id}
                label={field.label}
                leftIcon={field.leftIcon}
                onChange={handleStep1InputChange}
                type={field.type}
                value={formData.step1[field.id]}
              />
            ))}

            <NoteInput
              className="col-span-1 md:col-span-2 w-full h-full bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20"
              id="description"
              label={t("description")}
              onChange={handleStep1InputChange}
              rows={10}
              value={formData.step1.description}
            />
          </div>
          <div className="flex justify-between">
            <BaseButton
              disabled={activeStep === 1}
              onClick={handlePrev}
              variant="default"
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {t("prev")}
            </BaseButton>
            <div className="flex gap-5">
              <Button
                onClick={handleDeleteData}
                className="border border-zinc-300/20 dark:border-zinc-700/20 text-zinc-900 dark:text-zinc-100"
              >
                {t("clearData")}
              </Button>
              <BaseButton
                onClick={handleNext}
                variant="default"
                className="bg-black text-white dark:bg-white dark:text-black"
              >
                {t("next")}
              </BaseButton>
            </div>
          </div>
        </div>
      ),
    },
    {
      condition: activeStep === 2,
      render: () => (
        <div className="flex flex-col gap-5 p-5 w-full max-w-[50rem]">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              {t("step2Title")}
            </h1>
            <p className="text-zinc-900/50 dark:text-zinc-100/50">
              {t("step2Subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="col-span-1 md:col-span-2 flex flex-col gap-3 p-4 rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {t("categories")}
                </label>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  {t("selectedCount", { count: formData.step2.categories.length })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                {allAvailableCategories.map((catLabel) => {
                  const isSelected =
                    formData.step2.categories.includes(catLabel);
                  return (
                    <Button
                      key={catLabel}
                      type="button"
                      onClick={() => handleToggleCategory(catLabel)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-md"
                          : "bg-white text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100 border-zinc-300/20 dark:border-zinc-700/20 hover:border-black/20 dark:hover:border-white/20"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      )}
                      <span>{catLabel}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-3 p-4 rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20">
              <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {t("storeImageRequired")}
              </label>
              {formData.step2.image ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-300/20 dark:border-zinc-700/20 bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center">
                  <Image
                    src={formData.step2.image}
                    alt={t("storePreviewAlt")}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer bg-white dark:bg-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-zinc-500 dark:text-zinc-400" />
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {t("clickToUpload")}
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {t("imageFormats")}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <GreatInput
              className="w-full h-full bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20"
              id="websiteUrl"
              label={t("websiteUrl")}
              leftIcon={<Globe />}
              onChange={handleStep2InputChange}
              type="text"
              value={formData.step2.websiteUrl}
            />

            <GreatInput
              className="w-full h-full bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20"
              id="supportEmail"
              label={t("supportEmail")}
              leftIcon={<Mail />}
              onChange={handleStep2InputChange}
              type="email"
              value={formData.step2.supportEmail}
            />
          </div>

          <div className="flex justify-between">
            <BaseButton
              onClick={handlePrev}
              variant="default"
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {t("prev")}
            </BaseButton>
            <div className="flex gap-5">
              <Button
                onClick={handleDeleteData}
                className="border border-zinc-300/20 dark:border-zinc-700/20 text-zinc-900 dark:text-zinc-100"
              >
                {t("clearData")}
              </Button>
              <BaseButton
                onClick={handleNext}
                variant="default"
                className="bg-black text-white dark:bg-white dark:text-black"
              >
                {t("next")}
              </BaseButton>
            </div>
          </div>
        </div>
      ),
    },
    {
      condition: activeStep === 3,
      render: () => (
        <div className="flex flex-col gap-5 p-5 w-full max-w-[50rem]">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              {t("step3Title")}
            </h1>
            <p className="text-zinc-900/50 dark:text-zinc-100/50">
              {t("step3Subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 p-5 rounded-lg border border-zinc-300/20 dark:border-zinc-700/20 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="pb-2 border-b border-zinc-300/20 dark:border-zinc-700/20 font-semibold text-lg">
                {t("storeDetails")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block opacity-60">{t("storeNameLabel")}</span>
                  <span className="font-medium">
                    {formData.step1.storeName || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("mobileNumberLabel")}</span>
                  <span className="font-medium">
                    {formData.step1.mobileNumber || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("countryLabel")}</span>
                  <span className="font-medium">
                    {formData.step1.selectedCountry || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("cityLabel")}</span>
                  <span className="font-medium">
                    {formData.step1.selectedCity || tCommon("emptyValue")}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="block opacity-60">{t("biographyLabel")}</span>
                  <span className="font-medium whitespace-pre-wrap">
                    {formData.step1.description || tCommon("emptyValue")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5 rounded-lg border border-zinc-300/20 dark:border-zinc-700/20 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="pb-2 border-b border-zinc-300/20 dark:border-zinc-700/20 font-semibold text-lg">
                {t("categoriesAndWeb")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="col-span-1 md:col-span-2">
                  <span className="block opacity-65 mb-2 font-medium">
                    {t("categoriesLabel")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {formData.step2.categories.length > 0
                      ? formData.step2.categories.map((category) => (
                          <span
                            key={category}
                            className="px-3 py-1 rounded-md bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white border border-zinc-300/20 dark:border-zinc-700/20 text-xs font-semibold"
                          >
                            {catalogLabel(category)}
                          </span>
                        ))
                      : tCommon("emptyValue")}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="block opacity-65 mb-2 font-medium">
                    {t("storeImageLabel")}
                  </span>
                  {formData.step2.image ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-300/20 dark:border-zinc-700/20">
                      <Image
                        src={formData.step2.image}
                        alt={t("storePreviewAlt")}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    tCommon("emptyValue")
                  )}
                </div>
                <div>
                  <span className="block opacity-60">{t("websiteUrlLabel")}</span>
                  <span className="font-medium">
                    {formData.step2.websiteUrl || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("supportEmailLabel")}</span>
                  <span className="font-medium">
                    {formData.step2.supportEmail || tCommon("emptyValue")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5 rounded-lg border border-zinc-300/20 dark:border-zinc-700/20 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                {t("contactPreferences")}
              </h2>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-sm">
                  {t("preferredContactMethod")}
                </label>
                <ProSelect
                  className="w-full h-12 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20"
                  onChange={handleContactMethodChange}
                  options={contactOptions}
                  placeholder={t("selectContactMethod")}
                  value={formData.step3.preferredContactMethod}
                />
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <label className="font-medium text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  {t("acceptedPaymentMethods")}
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {paymentOptions.map((method) => {
                    const isChecked = formData.step3.paymentMethods.includes(
                      method.id,
                    );
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                          isChecked
                            ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100"
                            : "bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border-zinc-300/20 dark:border-zinc-700/20 hover:border-zinc-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePaymentMethod(method.id)}
                          className="hidden"
                        />
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                            isChecked
                              ? "border-transparent bg-black text-white dark:bg-white dark:text-black"
                              : "border-zinc-400 bg-black dark:bg-white"
                          }`}
                        >
                          {isChecked && (
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          )}
                        </span>
                        <span className="truncate">
                          {method.labelKey === "mada" || method.labelKey === "applePay"
                            ? method.id
                            : t(method.labelKey as "creditCard")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-zinc-300/20 dark:border-zinc-700/20 mt-1">
                <input
                  checked={formData.step3.acceptTerms}
                  className="w-5 h-5 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                  id="acceptTerms"
                  onChange={handleStep3TermsChange}
                  type="checkbox"
                />
                <label
                  className="text-sm cursor-pointer select-none"
                  htmlFor="acceptTerms"
                >
                  {t("acceptTerms")}
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-2">
            <BaseButton
              onClick={handlePrev}
              variant="default"
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {t("prev")}
            </BaseButton>
            <div className="flex gap-5">
              <BaseButton
                disabled={!formData.step3.acceptTerms}
                variant="default"
                onClick={handleNext}
                className="bg-black text-white dark:bg-white dark:text-black"
              >
                {t("launchStore")}
              </BaseButton>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Alert />
      <div
        className="flex flex-col md:flex-row relative w-full min-h-dvh overflow-x-hidden bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
        ref={stepRef}
      >
        <div className="w-full md:fixed md:top-0 md:bottom-0 md:inset-s-0 flex justify-center items-center py-4 md:py-0 md:w-50">
          <Stepper activeStep={activeStep} orientation={isDesktop ? "vertical" : "horizontal"} />
        </div>
        <div className="flex justify-center items-center w-full md:ms-50 p-2 md:p-0">
          {controlElements
            .filter((element) => element.condition)
            .map((element, index) => (
              <React.Fragment key={index}>{element.render()}</React.Fragment>
            ))}
        </div>
      </div>
    </>
  );
};

CreateStore.displayName = "CreateStore";

export default CreateStore;