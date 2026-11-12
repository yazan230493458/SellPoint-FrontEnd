"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  useStoreStore,
  StoreFormData,
  ActiveStore,
} from "@/store/store.store";
import { useAlertStore } from "@/store/alert.store";
import Header from "@/app/[locale]/components/main/Header";
import Alert from "@/app/[locale]/components/ui/Alert";
import {
  Edit,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  User,
  Phone,
  Globe,
  MapPin,
  FileText,
  Tag,
  Mail,
  PhoneCall,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import Button from "../../../components/ui/Button";
import { features } from "@/app/[locale]/features";
import { redirect } from "next/navigation";

if (!features.stores) {
  redirect("/");
}

interface PageProps {
  params: Promise<{ name: string }>;
}

export default function EditStorePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const targetIdentifier = decodeURIComponent(resolvedParams.name);
  const router = useRouter();
  const t = useTranslations("EditStore");

  const stores = useStoreStore((state) => state.stores);
  const currentStore = useStoreStore((state) => state.currentStore);
  const { setTitle, setDescription, onOpen } = useAlertStore();

  const [syncedStores, setSyncedStores] = useState<typeof stores | null>(null);
  const [syncedCurrentStore, setSyncedCurrentStore] = useState<
    typeof currentStore | undefined
  >(undefined);
  const [syncedIdentifier, setSyncedIdentifier] = useState<string | null>(null);
  const [formState, setFormState] = useState<StoreFormData | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);

  if (
    syncedStores !== stores ||
    syncedCurrentStore !== currentStore ||
    syncedIdentifier !== targetIdentifier
  ) {
    setSyncedStores(stores);
    setSyncedCurrentStore(currentStore);
    setSyncedIdentifier(targetIdentifier);
    const catalog = [
      ...stores,
      ...(currentStore && !stores.some((store) => store.id === currentStore.id)
        ? [currentStore]
        : []),
    ];
    const matchedStore = catalog.find(
      (store) =>
        String(store.id) === targetIdentifier ||
        store.username === targetIdentifier ||
        store.step1?.storeName === targetIdentifier,
    );

    if (matchedStore) {
      setTargetId(matchedStore.id);
      setFormState({
        username: matchedStore.username || "",
        step1: { ...matchedStore.step1 },
        step2: { ...matchedStore.step2 },
        step3: { ...matchedStore.step3 },
      });
    } else {
      setTargetId(null);
      setFormState(null);
    }
  }

  const notFound =
    syncedStores === stores &&
    syncedCurrentStore === currentStore &&
    syncedIdentifier === targetIdentifier &&
    formState == null;

  const showAlert = (titleText: string, descriptionText: string) => {
    if (setTitle) setTitle(titleText);
    if (setDescription) setDescription(descriptionText);
    if (onOpen) onOpen();
  };

  const handleStep1Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step1: {
          ...prev.step1,
          [name]: value,
        },
      };
    });
  };

  const handleStep2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step2: {
          ...prev.step2,
          [name]: value,
        },
      };
    });
  };

  const handleStep3Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step3: {
          ...prev.step3,
          [name]: type === "checkbox" ? checked : value,
        },
      };
    });
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setFormState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step2: {
          ...prev.step2,
          image: imageUrl,
          mainImageIndex: 0,
        },
      };
    });
  };

  const handleImageRemove = () => {
    setFormState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        step2: {
          ...prev.step2,
          image: "",
          mainImageIndex: 0,
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState || targetId === null) return;

    useStoreStore.setState((state) => {
      const applyUpdate = (store: ActiveStore): ActiveStore =>
        store.id === targetId
          ? {
              ...store,
              username: formState.username,
              step1: formState.step1,
              step2: formState.step2,
              step3: formState.step3,
            }
          : store;

      const stores = state.stores.map(applyUpdate);
      const currentStore = state.currentStore
        ? applyUpdate(state.currentStore)
        : state.currentStore;

      return { stores, currentStore };
    });

    showAlert(t("updatedTitle"), t("updatedDescription"));
    router.push("/my-stores");
  };

  if (notFound) {
    return (
      <>
        <Header className="" />
        <main className="min-h-dvh flex items-center justify-center p-5 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
          <div className="flex flex-col items-center p-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-center space-y-4 max-w-md w-full">
            <h2 className="text-2xl font-bold">{t("notFoundTitle")}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {t("notFoundDescription")}
            </p>
            <Button
              onClick={() => router.push("/my-stores")}
              className="px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 font-semibold text-sm"
            >
              {t("backToMyStores")}
            </Button>
          </div>
        </main>
      </>
    );
  }

  if (!formState) {
    return (
      <>
        <Header className="" />
        <main className="min-h-dvh flex items-center justify-center p-5 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
          <p className="text-sm font-medium text-zinc-500">
            {t("loading")}
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Alert />
      <Header className="" />
      <main className="min-h-dvh flex flex-col items-center p-5 space-y-6 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
        <section className="w-full max-w-4xl flex flex-col space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={() => router.back()}
                aria-label={t("goBack")}
                className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <Edit className="w-6 h-6" />
                  <span>{t("title")}</span>
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t("updatingFor", {
                    name: formState.step1.storeName || t("untitled"),
                  })}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <User className="w-5 h-5 text-zinc-500" />
                <span>{t("step1")}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> {t("username")}
                  </label>
                  <input
                    type="text"
                    value={formState.username}
                    onChange={(e) =>
                      setFormState((prev) =>
                        prev ? { ...prev, username: e.target.value } : prev,
                      )
                    }
                    required
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> {t("storeName")}
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formState.step1.storeName}
                    onChange={handleStep1Change}
                    required
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {t("mobileNumber")}
                  </label>
                  <input
                    type="text"
                    name="mobileNumber"
                    value={formState.step1.mobileNumber}
                    onChange={handleStep1Change}
                    required
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {t("country")}
                  </label>
                  <input
                    type="text"
                    name="selectedCountry"
                    value={formState.step1.selectedCountry || ""}
                    onChange={handleStep1Change}
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {t("city")}
                  </label>
                  <input
                    type="text"
                    name="selectedCity"
                    value={formState.step1.selectedCity || ""}
                    onChange={handleStep1Change}
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> {t("description")}
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formState.step1.description}
                    onChange={handleStep1Change}
                    required
                    className="p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <Mail className="w-5 h-5 text-zinc-500" />
                <span>{t("step2")}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> {t("websiteUrl")}
                  </label>
                  <input
                    type="text"
                    name="websiteUrl"
                    value={formState.step2.websiteUrl || ""}
                    onChange={handleStep2Change}
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {t("supportEmail")}
                  </label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={formState.step2.supportEmail || ""}
                    onChange={handleStep2Change}
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col space-y-3 sm:col-span-2 pt-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> {t("storeImage")}
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formState.step2.image ? (
                      <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-zinc-900 dark:border-zinc-100">
                        <Image
                          src={formState.step2.image}
                          alt={t("storeImageAlt")}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-1 right-1 flex gap-1 z-10">
                          <Button
                            type="button"
                            onClick={handleImageRemove}
                            aria-label={t("removeImage")}
                            className="p-1 rounded bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 cursor-pointer transition-colors bg-zinc-100/50 dark:bg-zinc-800/50">
                      <ImageIcon className="w-5 h-5 text-zinc-400" />
                      <span className="text-[11px] font-medium text-zinc-500 mt-1">
                        {t("upload")}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageAdd}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <PhoneCall className="w-5 h-5 text-zinc-500" />
                <span>{t("step3")}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    {t("preferredContactMethod")}
                  </label>
                  <select
                    name="preferredContactMethod"
                    value={formState.step3.preferredContactMethod || "phone"}
                    onChange={handleStep3Change}
                    className="h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  >
                    <option value="phone">{t("phoneCall")}</option>
                    <option value="whatsapp">{t("whatsApp")}</option>
                    <option value="email">{t("email")}</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 sm:col-span-2 pt-2">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formState.step3.acceptTerms}
                    onChange={handleStep3Change}
                    required
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                    {t("acceptTerms")}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-sm transition-colors"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold text-sm transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                <span>{t("saveChanges")}</span>
              </Button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
