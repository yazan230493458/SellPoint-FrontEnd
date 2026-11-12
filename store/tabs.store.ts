import { create } from "zustand";

export type ActiveTabType =
  | "Settings"
  | "General"
  | "Account"
  | "Safety & Privacy"
  | "Notifications"
  | "Favorites"
  | "Activity Log";

interface TabState {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
}

export const useTabStore = create<TabState>((set) => ({
  activeTab:
    typeof window !== "undefined" && window.innerWidth > 1024
      ? "General"
      : "Settings",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
