import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

type AsideState = {
  isOpen: boolean;
  openAside: () => void;
  closeAside: () => void;
  toggleAside: () => void;
};

export const useAsideStore = create<AsideState>()(
  persist(
    (set) => ({
      isOpen: false,
      openAside: () => set({ isOpen: true }),
      closeAside: () => set({ isOpen: false }),
      toggleAside: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "aside-storage",
      storage: persistStorage,
    },
  ),
);
