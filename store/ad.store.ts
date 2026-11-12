import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

export interface step1 {
  adName: string;
  mobileNumber: string;
  selectedCountry: string | null;
  selectedCity: string | null;
  description: string;
}

export interface step2 {
  category: string | null;
  price: string;
  showPrice: boolean;
  images: string[];
  mainImageIndex: number;
}

export interface step3 {
  preferredContactMethod: string;
  acceptTerms: boolean;
}

export interface Steps {
  id: number;
  username?: string;
  step1: step1;
  step2: step2;
  step3: step3;
}

export type AdFormData = Omit<Steps, "id">;

export const initialFormData: AdFormData = {
  username: "",
  step1: {
    adName: "",
    mobileNumber: "",
    selectedCountry: null,
    selectedCity: null,
    description: "",
  },
  step2: {
    category: null,
    price: "",
    showPrice: true,
    images: [],
    mainImageIndex: 0,
  },
  step3: {
    preferredContactMethod: "Mobile Call",
    acceptTerms: false,
  },
};

export type FormDataUpdater = AdFormData | ((prev: AdFormData) => AdFormData);

export interface ad {
  ads: Steps[];
  formData: AdFormData;
  selectedAd: Steps | null;
  activeStep: number;
  setActiveStep: (stepNumber: number) => void;
  setFormData: (data: FormDataUpdater) => void;
  setAd: (id: number) => void;
  clearAd: () => void;
  setAds: (ads: Steps[]) => void;
  removeAd: (id: number) => void;
  addAd: (ad: AdFormData, username: string) => void;
}

export const useAdStore = create<ad>()(
  persist(
    (set) => ({
      ads: [],
      formData: initialFormData,
      selectedAd: null,
      activeStep: 1,
      setActiveStep: (stepNumber) => set({ activeStep: stepNumber }),
      setFormData: (data) =>
        set((state) => ({
          formData: typeof data === "function" ? data(state.formData) : data,
        })),

      setAd: (id) =>
        set((state) => ({
          selectedAd: state.ads.find((ad) => ad.id === id) ?? null,
        })),

      clearAd: () =>
        set({
          ads: [],
          selectedAd: null,
        }),
      setAds: (ads) => set({ ads }),

      removeAd: (id) =>
        set((state) => ({
          ads: state.ads.filter((ad) => ad.id !== id),
          selectedAd: state.selectedAd?.id === id ? null : state.selectedAd,
        })),

      addAd: (ad, username) =>
        set((state) => {
          const newAd: Steps = {
            ...ad,
            id: Date.now(),
            username,
          };

          return {
            ads: [...state.ads, newAd],
            activeStep: 1,
            formData: initialFormData,
          };
        }),
    }),
    {
      name: "ad-storage",
      storage: persistStorage,
      partialize: (state) => ({
        ads: state.ads,
      }),
    },
  ),
);
