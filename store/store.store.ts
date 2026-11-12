import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

export type SectionType =
  | "header"
  | "hero"
  | "banner"
  | "slider"
  | "products"
  | "grid"
  | "contact"
  | "footer";

export interface NavButton {
  id: string;
  label: string;
  url?: string;
}

export interface HeroButton {
  id: string;
  label: string;
  url?: string;
  variant?: string;
}

export interface SliderProduct {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
}

export interface StoreSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  navAlignment?: "left" | "center" | "right";
  navButtons?: NavButton[];
  rightNavButtons?: NavButton[];
  bgColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  title?: string;
  buttonText?: string;
  heroButtons?: HeroButton[];
  heroImage?: string;
  footerTitle?: string;
  footerDescription?: string;
  sliderProducts?: SliderProduct[];
}

export interface StoreStep1 {
  storeName: string;
  mobileNumber: string;
  selectedCountry: string | null;
  selectedCity: string | null;
  description: string;
}

export interface StoreStep2 {
  categories: string[];
  mainImageIndex: number | null;
  websiteUrl: string;
  supportEmail: string;
  image: string;
}

export interface StoreStep3 {
  preferredContactMethod: string | null;
  paymentMethods: string[];
  acceptTerms: boolean;
}

export interface StoreFormData {
  username: string;
  step1: StoreStep1;
  step2: StoreStep2;
  step3: StoreStep3;
}

export interface ActiveStore extends StoreFormData {
  id: number;
  sections: StoreSection[];
}

export type StoreType = StoreFormData;

export type Store = Omit<ActiveStore, "id">;

interface StoreState {
  stores: ActiveStore[];
  currentStore: ActiveStore | null;
  activeStep: number;
  setActiveStep: (stepNumber: number) => void;
  setCurrentStore: (store: ActiveStore) => void;
  addStore: (store: ActiveStore) => void;
  updateStoreDetails: (updatedData: Partial<StoreFormData>) => void;
  updateStoreSections: (sections: StoreSection[]) => void;
  deleteCurrentStore: () => void;
  removeStore: (id: number) => void;
}

export const defaultStoreFormData: ActiveStore = {
  id: 1,
  username: "",
  step1: {
    storeName: "",
    mobileNumber: "",
    selectedCountry: "",
    selectedCity: "",
    description: "",
  },
  step2: {
    categories: [],
    mainImageIndex: null,
    websiteUrl: "",
    supportEmail: "",
    image: "",
  },
  step3: {
    preferredContactMethod: "Mobile Call",
    paymentMethods: [],
    acceptTerms: false,
  },
  sections: [],
};

export const useStoreStore = create<StoreState>()(
  persist(
    (set) => ({
      stores: [],
      currentStore: null,
      activeStep: 1,

      setActiveStep: (activeStep) => set({ activeStep }),

      setCurrentStore: (currentStore) => set({ currentStore }),

      addStore: (store) =>
        set((state) => ({
          stores: [
            store,
            ...state.stores.filter((item) => item.id !== store.id),
          ],
          currentStore: store,
        })),

      updateStoreDetails: (updatedData) =>
        set((state) => {
          if (!state.currentStore) return state;

          const currentStore = {
            ...state.currentStore,
            ...updatedData,
            step1: {
              ...state.currentStore.step1,
              ...updatedData.step1,
            },
            step2: {
              ...state.currentStore.step2,
              ...updatedData.step2,
            },
            step3: {
              ...state.currentStore.step3,
              ...updatedData.step3,
            },
          };

          return {
            currentStore,
            stores: state.stores.map((store) =>
              store.id === currentStore.id ? currentStore : store,
            ),
          };
        }),

      updateStoreSections: (sections) =>
        set((state) => {
          if (!state.currentStore) return state;

          const currentStore = {
            ...state.currentStore,
            sections,
          };

          return {
            currentStore,
            stores: state.stores.map((store) =>
              store.id === currentStore.id ? currentStore : store,
            ),
          };
        }),

      deleteCurrentStore: () =>
        set({
          currentStore: null,
          activeStep: 1,
        }),

      removeStore: (id) =>
        set((state) => ({
          stores: state.stores.filter((store) => store.id !== id),
          currentStore:
            state.currentStore?.id === id ? null : state.currentStore,
        })),
    }),
    {
      name: "active-store-storage",
      storage: persistStorage,
      partialize: (state) => ({
        stores: state.stores,
        currentStore: state.currentStore,
      }),
    },
  ),
);
