import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

type WindowType = {
  title?: string | null;
  description?: string | null;
  open: boolean;
  input?: boolean;
  label?: string;
  value?: string;
  setTitle?: (text: string) => void;
  setDescription?: (text: string) => void;
  onOpen: () => void;
  onClose: () => void;
};

export const useWindowStore = create<WindowType>()(
  persist(
    (set) => ({
      title: null,
      description: null,
      open: false,
      input: false,
      label: "",
      value: "",
      setTitle: (text) => set({ title: text }),
      setDescription: (text) => set({ description: text }),
      onOpen: () => set({ open: true }),
      onClose: () => set({ open: false }),
    }),
    {
      name: "window-storage",
      storage: persistStorage,
      partialize: (state) => ({
        title: state.title,
        description: state.description,
        input: state.input,
        label: state.label,
      }),
    },
  ),
);
