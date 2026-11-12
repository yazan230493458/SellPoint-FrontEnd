import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

type AlertType = {
  title?: string | null;
  description?: string | null;
  open: boolean;
  input?: boolean;
  setTitle?: (text: string) => void;
  setDescription?: (text: string) => void;
  onOpen: () => void;
  onClose: () => void;
};

export const useAlertStore = create<AlertType>()(
  persist(
    (set) => ({
      title: null,
      description: null,
      open: false,
      setTitle: (text) => set({ title: text }),
      setDescription: (text) => set({ description: text }),
      onOpen: () => set({ open: true }),
      onClose: () => set({ open: false }),
    }),
    {
      name: "alert-storage",
      storage: persistStorage,
      partialize: (state) => ({
        title: state.title,
        description: state.description,
      }),
    },
  ),
);
