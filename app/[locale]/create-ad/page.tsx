"use client";

import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCatalogLabel } from "@/lib/use-catalog-label";
import React, { useState, useRef, useEffect } from "react";
import { Smartphone, User } from "lucide-react";
import Alert from "../components/ui/Alert";
import Stepper from "../components/ui/Stepper";
import GreatInput from "../components/ui/GreatInput";
import NoteInput from "../components/ui/NoteInput";
import Button from "../components/ui/Button";
import BaseButton from "../components/ui/BaseButton";
import { ProSelect } from "../components/ui/ProSelect";
import { useAlertStore } from "@/store/alert.store";
import { useAdStore, initialFormData } from "@/store/ad.store";
import { useUserStore } from "@/store/user.store";
import { apiRequest } from "@/lib/api";
import { formatPrice, formatPriceInput, parsePriceInput } from "@/lib/format-price";
import { categoryOptions } from "../../../data/CategoriesData";
import { useActivityLogStore } from "@/store/activity-log.store";
import Checkbox from "../components/ui/Checkbox";
import {
  citiesByCountry,
  countryCallingCodes,
  countryOptions,
} from "../../../data/locationData";

const CreateAdPage = () => {
  const router = useRouter();
  const t = useTranslations("CreateAdPage");
  const tCommon = useTranslations("Common");
  const catalogLabel = useCatalogLabel();
  const step1Ref = useRef<HTMLDivElement | null>(null);
  const { setTitle, setDescription, onOpen } = useAlertStore();
  const { addAd, formData, setFormData, activeStep, setActiveStep } =
    useAdStore();

  const addActivity = useActivityLogStore((state) => state.addActivity);
  const username = useUserStore(
    (state) => state.user?.settings.account.username,
  );
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(
    null,
  );
  const [isDesktop, setIsDesktop] = useState<boolean | undefined>(true);
  const contactOptions = [
    {
      value: "contact_methods",
      label: t("contactPreferences"),
      items: [t("mobileCall"), t("whatsApp"), t("both")],
    },
  ];

  const cityOptions = formData.step1.selectedCountry
    ? [
        {
          value: formData.step1.selectedCountry,
          items:
            citiesByCountry[formData.step1.selectedCountry] ?? [],
        },
      ]
    : [];

  const countryCode = formData.step1.selectedCountry
    ? (countryCallingCodes[
      formData.step1.selectedCountry as keyof typeof countryCallingCodes
    ] ?? undefined)
    : undefined;

  const step1InputFields = [
    {
      disabled: false,
      id: "adName" as const,
      isMobileNumber: false,
      label: t("adName"),
      leftIcon: <User />,
      type: "text",
    },
    {
      disabled: !formData.step1.selectedCountry,
      id: "mobileNumber" as const,
      isMobileNumber: true,
      label: t("mobileNumber"),
      leftIcon: <Smartphone />,
      type: "text",
    },
  ];

  const handleCategoryChange = (value: string | null) => {
    setFormData((prevData) => ({
      ...prevData,
      step2: {
        ...prevData.step2,
        category: value,
      },
    }));
  };

  const handleCityChange = (value: string | null) => {
    setFormData((prevData) => ({
      ...prevData,
      step1: {
        ...prevData.step1,
        selectedCity: value,
      },
    }));
  };

  const handleCountryChange = (value: string | null) => {
    setFormData((prevData) => ({
      ...prevData,
      step1: {
        ...prevData.step1,
        selectedCity: null,
        selectedCountry: value,
      },
    }));
  };

  const handleContactMethodChange = (value: string | null) => {
    setFormData((prevData) => ({
      ...prevData,
      step3: {
        ...prevData.step3,
        preferredContactMethod: value || "",
      },
    }));
  };

  const handleDeleteData = () => {
    if (activeStep === 1) {
      setFormData((prev) => ({
        ...prev,
        step1: initialFormData.step1,
      }));
    } else if (activeStep === 2) {
      setFormData((prev) => ({
        ...prev,
        step2: initialFormData.step2,
      }));
    } else if (activeStep === 3) {
      setFormData((prev) => ({
        ...prev,
        step3: initialFormData.step3,
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


  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
  
    if (!files?.length) return;
  
    const currentImagesCount = formData.step2.images.length;
  
    if (currentImagesCount >= 8) {
      handleShowAlert(t("imageLimitTitle"), t("imageLimitDescription"));
      e.target.value = "";
      return;
    }
  
    const remainingSlots = 8 - currentImagesCount;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
  
    const compressImage = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
  
        reader.onload = () => {
          const image = new window.Image();
  
          image.onload = () => {
            const maxDimension = 1200;
            const scale = Math.min(
              1,
              maxDimension / Math.max(image.width, image.height),
            );
  
            const canvas = document.createElement("canvas");
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
  
            const context = canvas.getContext("2d");
  
            if (!context) {
              reject(new Error("Could not process the image."));
              return;
            }
  
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
  
            resolve(canvas.toDataURL("image/jpeg", 0.65));
          };
  
          image.onerror = () => reject(new Error("Could not load the image."));
          image.src = reader.result as string;
        };
  
        reader.onerror = () => reject(new Error("Could not read the image."));
        reader.readAsDataURL(file);
      });
  
    try {
      const newImages = await Promise.all(
        filesToUpload.map(compressImage),
      );
  
      setFormData((prev) => ({
        ...prev,
        step2: {
          ...prev.step2,
          images: [...prev.step2.images, ...newImages].slice(0, 8),
        },
      }));
    } catch {
      handleShowAlert(
        t("optionsAlertTitle"),
        t("optionsAlertDescription"),
      );
    } finally {
      e.target.value = "";
    }
  };
  

  const handleNext = async () => {
    const { adName, description, mobileNumber, selectedCity, selectedCountry } =
      formData.step1;

    const { category, images, price, mainImageIndex } = formData.step2;

    if (activeStep === 1) {
      const hasMissingFields =
        !adName.trim() ||
        !description.trim() ||
        !mobileNumber.trim() ||
        !selectedCountry ||
        !selectedCity;

      if (hasMissingFields) {
        handleShowAlert(t("optionsAlertTitle"), t("optionsAlertDescription"));
        return;
      }

      const cleanMobile = mobileNumber.replace(/\D/g, "");

      if (cleanMobile.length !== 9) {
        handleShowAlert(
          t("optionsAlertTitle"),
          t("incompleteMobileAlertDescription"),
        );
        return;
      }

      setActiveStep(2);
      return;
    }

    if (activeStep === 2) {
      const hasValidPrice =
        price.trim() !== "" &&
        Number.isFinite(Number(price)) &&
        Number(price) >= 0;

      if (!category || !hasValidPrice || images.length === 0) {
        handleShowAlert(t("optionsAlertTitle"), t("optionsAlertDescription"));
        return;
      }

      if (mainImageIndex < 0 || mainImageIndex >= images.length) {
        setFormData((prev) => ({
          ...prev,
          step2: {
            ...prev.step2,
            mainImageIndex: 0,
          },
        }));
      }

      setActiveStep(3);
      return;
    }

    if (activeStep === 3) {
      if (!formData.step3.preferredContactMethod) {
        handleShowAlert(t("optionsAlertTitle"), t("optionsAlertDescription"));
        return;
      }

      if (!formData.step3.acceptTerms) {
        handleShowAlert(t("optionsAlertTitle"), t("optionsAlertDescription"));
        return;
      }

      const mainImage = images[mainImageIndex] ?? images[0];

      try {
        if (!isAuthenticated) {
          handleShowAlert(t("optionsAlertTitle"), t("optionsAlertDescription"));
          return;
        }
        const preferredContactMethod = formData.step3.preferredContactMethod === t("whatsApp")
          ? "WHATSAPP"
          : formData.step3.preferredContactMethod === t("both")
            ? "BOTH"
            : "MOBILECALL";
        const created = await apiRequest<{ ad: { id: number } }>("/api/create-ad", {
          method: "POST",
          body: {
            adName: adName.trim(),
            mobileNumber: `${countryCode}${mobileNumber.replace(/\D/g, "")}`,
            selectedCountry,
            selectedCity,
            description: description.trim(),
            category,
            price: Number(price),
            showPrice: formData.step2.showPrice,
            mainImageIndex: 0,
            preferredContactMethod,
            acceptTerms: true,
          },
        });
        const files = await Promise.all(images.map(async (image, index) => {
          const response = await fetch(image);
          const blob = await response.blob();
          const type = blob.type === "image/png" || blob.type === "image/webp" ? blob.type : "image/jpeg";
          const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
          return new File([blob], `image-${index}.${extension}`, { type });
        }));
        if (files.length > 0) {
          const form = new FormData();
          files.forEach((file) => form.append("images", file));
          await apiRequest(`/api/upload-ad-images/${created.ad.id}`, { method: "POST", formData: form });
          await apiRequest(`/api/ads/${created.ad.id}/main-image`, {
            method: "PATCH",
            body: { mainImageIndex },
          });
        }
        addAd(formData, username ?? "");

        addActivity({
          id: crypto.randomUUID(),
          type: "ad",
          actionTitle: adName.trim(),
          description: description.trim(),
          timestamp: new Date().toLocaleString("sv-SE", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          category: category || "Ads",
          imageUrl: mainImage,
          href: `/search/ad/${created.ad.id}`,
        });

        setActiveStep(1);
        setFormData(initialFormData);
        router.push("/");
      } catch {
        handleShowAlert(t("optionsAlertTitle"), t("optionsAlertDescription"));
      }
    }
  };

  const handlePrev = () => {
    setActiveStep(Math.max(activeStep - 1, 1));
  };

  const handleRemoveAllImages = () => {
    setFormData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        images: [],
        mainImageIndex: 0,
      },
    }));
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => {
      const updatedImages = prev.step2.images.filter(
        (_, index) => index !== indexToRemove,
      );
      let updatedMainIndex = prev.step2.mainImageIndex;
      if (indexToRemove === prev.step2.mainImageIndex) {
        updatedMainIndex = 0;
      } else if (indexToRemove < prev.step2.mainImageIndex) {
        updatedMainIndex = prev.step2.mainImageIndex - 1;
      }
      return {
        ...prev,
        step2: {
          ...prev.step2,
          images: updatedImages,
          mainImageIndex: updatedImages.length > 0 ? updatedMainIndex : 0,
        },
      };
    });
  };

  const handleSetMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      step2: {
        ...prev.step2,
        mainImageIndex: index,
      },
    }));
  };

  const handleShowAlert = (title: string, description: string) => {
    if (setTitle) setTitle(title);
    if (setDescription) setDescription(description);
    if (onOpen) onOpen();
  };


  const handleShowPriceChange = (checked: boolean) => {
    setFormData((prevData) => ({
      ...prevData,
      step2: {
        ...prevData.step2,
        showPrice: checked,
      },
    }));
  };
  

  const handleStep1InputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { id, value } = e.target;
    const finalValue =
      id === "mobileNumber" ? handleFormatMobileNumber(value) : value;

    setFormData((prevData) => ({
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
    setFormData((prevData) => ({
      ...prevData,
      step2: {
        ...prevData.step2,
        [id]: value,
      },
    }));
  };

  const handleStep3TermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      step3: {
        ...prevData.step3,
        [id]: checked,
      },
    }));
  };

  useEffect(() => {
    const handleClearData = () => {
      setFormData(initialFormData);
    };
    document.addEventListener("popstate", handleClearData);

    return () => {
      document.removeEventListener("popstate", handleClearData);
    };
  }, [setFormData]);

  useEffect(() => {
    window.addEventListener("resize", () => {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(isDesktop);
    });
    return () => {
      window.removeEventListener("resize", () => {
        const isDesktop = window.matchMedia("(min-width: 768px)").matches;
        setIsDesktop(isDesktop);
      });
    };
  }, [])

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
  }, []);

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
              className="w-full h-full bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20"
              id="description"
              classNameForContainer="w-full h-full col-span-1 md:col-span-2"
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
              variant="ghost"
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {t("prev")}
            </BaseButton>
            <div className="flex gap-5">
              <Button
                onClick={handleDeleteData}
                className="border border-zinc-300/20 dark:border-zinc-700/20 text-zinc-900 dark:text-zinc-100"
              >
                {t("deleteData")}
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
            <ProSelect
              className="col-span-1 md:col-span-2 w-full h-14 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300/20 dark:border-zinc-700/20"
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder={t("selectCategory")}
              value={formData.step2.category}
            />

            <GreatInput
              className="w-full h-full bg-zinc-200 text-black dark:bg-zinc-700 dark:text-white border border-zinc-300/20 dark:border-zinc-700/20"
              id="price"
              label={t("price")}
              inputMode="decimal"
              onChange={(event) => {
                const parsed = parsePriceInput(event.target.value);
                const formatted = formatPriceInput(parsed);
                const digitsBefore = event.target.value.slice(0, event.target.selectionStart ?? event.target.value.length).replace(/[^\d]/g, "").length;
                setFormData((prevData) => ({
                  ...prevData,
                  step2: { ...prevData.step2, price: parsed },
                }));
                requestAnimationFrame(() => {
                  const field = document.getElementById("price");
                  if (!(field instanceof HTMLInputElement)) return;
                  let seen = 0;
                  let position = formatted.length;
                  for (let index = 0; index < formatted.length; index += 1) {
                    if (/\d/.test(formatted[index] ?? "")) seen += 1;
                    if (seen >= digitsBefore) {
                      position = index + 1;
                      break;
                    }
                  }
                  field.setSelectionRange(position, position);
                });
              }}
              type="text"
              value={formatPriceInput(formData.step2.price)}
            />

            <Checkbox
              id="showPrice"
              checked={formData.step2.showPrice}
              onChange={handleShowPriceChange}
              label={t("showPrice")}
            />

            <div className="col-span-1 md:col-span-2 flex flex-col gap-3">
              <div className="flex gap-3">
                <label
                  className="flex flex-1 justify-center items-center h-15 font-medium text-sm text-zinc-700 dark:text-zinc-300 hover:border-zinc-500 dark:hover:border-zinc-500 rounded-lg border border-dashed border-zinc-300/20 dark:border-zinc-700/20 transition-colors cursor-pointer"
                  htmlFor="image-upload-input"
                >
                  {t("adImages")}
                </label>
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={formData.step2.images.length >= 8}
                  id="image-upload-input"
                  multiple
                  onChange={handleImageUpload}
                  type="file"
                />
                {formData.step2.images.length > 0 && (
                  <Button
                    className="px-4 h-15 font-medium text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    onClick={handleRemoveAllImages}
                    type="button"
                  >
                    {t("deleteAllPhotos")}
                  </Button>
                )}
              </div>

              {formData.step2.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                  {formData.step2.images.map((img, index) => {
                    const isMain = index === formData.step2.mainImageIndex;
                    return (
                      <div
                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${isMain
                            ? "border-blue-500 ring-2 ring-blue-500/50"
                            : "border-zinc-300/20 dark:border-zinc-700/20"
                          }`}
                        key={index}
                      >
                        <Image
                          alt={t("previewAlt")}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          height={1080}
                          onClick={() => setSelectedImageModal(img)}
                          src={img}
                          width={1920}
                        />
                        {isMain && (
                          <span className="absolute top-1 left-1 px-2 py-0.5 rounded shadow bg-blue-600 text-[10px] text-white">
                            {t("main")}
                          </span>
                        )}
                        <div className="absolute inset-0 flex flex-col justify-between p-2 bg-black/40 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                          <Button
                            className="self-end px-2 py-1 rounded bg-red-600 text-xs text-white pointer-events-auto"
                            onClick={() => handleRemoveImage(index)}
                            type="button"
                          >
                            {t("delete")}
                          </Button>
                          {!isMain && (
                            <Button
                              className="py-1 rounded font-medium bg-white text-xs text-black pointer-events-auto"
                              onClick={() => handleSetMainImage(index)}
                              type="button"
                            >
                              {t("setMain")}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <BaseButton
              onClick={handlePrev}
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {t("prev")}
            </BaseButton>
            <div className="flex gap-5">
              <Button
                onClick={handleDeleteData}
                className="border border-zinc-300/20 dark:border-zinc-700/20 text-zinc-900 dark:text-zinc-100"
              >
                {t("deleteData")}
              </Button>
              <BaseButton
                onClick={handleNext}
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
                {t("adDetails")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block opacity-60">{t("adName")}:</span>
                  <span className="font-medium">
                    {formData.step1.adName || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("mobileNumber")}:</span>
                  <span className="font-medium">
                    {formData.step1.mobileNumber || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("country")}</span>
                  <span className="font-medium">
                    {formData.step1.selectedCountry || tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("city")}</span>
                  <span className="font-medium">
                    {formData.step1.selectedCity || tCommon("emptyValue")}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="block opacity-60">{t("description")}:</span>
                  <span className="font-medium whitespace-pre-wrap">
                    {formData.step1.description || tCommon("emptyValue")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5 rounded-lg border border-zinc-300/20 dark:border-zinc-700/20 bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              <h2 className="pb-2 border-b border-zinc-300/20 dark:border-zinc-700/20 font-semibold text-lg">
                {t("pricingAndMedia")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block opacity-60">{t("category")}</span>
                  <span className="font-medium">
                    {formData.step2.category
                      ? catalogLabel(formData.step2.category)
                      : tCommon("emptyValue")}
                  </span>
                </div>
                <div>
                  <span className="block opacity-60">{t("price")}</span>
                  <span className="font-medium">
                    {formData.step2.price ? `${formatPrice(formData.step2.price)} ${t("currency")}` : tCommon("emptyValue")}{" "}
                    {formData.step2.showPrice ? t("visible") : t("hidden")}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <span className="block mb-2 opacity-60">
                    {t("uploadedImages")} ({formData.step2.images.length}):
                  </span>
                  {formData.step2.images.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {formData.step2.images.map((img, idx) => (
                        <div
                          className={`relative w-20 h-14 rounded overflow-hidden border shrink-0 ${idx === formData.step2.mainImageIndex
                              ? "border-blue-500 ring-2 ring-blue-500/50"
                              : "border-zinc-300/20 dark:border-zinc-700/20"
                            }`}
                          key={idx}
                        >
                          <Image
                            alt={t("previewAlt")}
                            className="w-full h-full object-cover cursor-pointer"
                            height={1080}
                            onClick={() => setSelectedImageModal(img)}
                            src={img}
                            width={1920}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-medium">{t("noImages")}</span>
                  )}
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
                  placeholder={t("preferredContactMethod")}
                  value={formData.step3.preferredContactMethod || null}
                />
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
              variant="ghost"
              onClick={handlePrev}
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              {t("prev")}
            </BaseButton>
            <div className="flex gap-5">
              <BaseButton
                variant="default"
                disabled={!formData.step3.acceptTerms}
                onClick={handleNext}
                className="bg-black text-white dark:bg-white dark:text-black"
              >
                {t("publishAd")}
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
        ref={step1Ref}
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

      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/80 cursor-pointer"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="flex relative justify-center items-center w-full h-full max-w-5xl max-h-[90vh]">
            <Image
              alt={t("fullscreenPreview")}
              className="object-contain"
              fill
              src={selectedImageModal}
            />
            <Button
              className="absolute top-4 right-4 p-2 rounded-sm text-white bg-white/20 hover:bg-white/45 transition-colors backdrop-blur-md"
              onClick={() => setSelectedImageModal(null)}
              type="button"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

CreateAdPage.displayName = "CreateAdPage";

export default CreateAdPage;