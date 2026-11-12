import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

export interface ActivityItem {
  id: string | number;
  type: "favorite" | "ad" | "store" | "security";
  actionTitle: string;
  description: string;
  timestamp: string;
  category: string;
  imageUrl?: string;
  href?: string;
}

interface ActivityLog {
  activities: ActivityItem[];
  addActivity: (activity: ActivityItem) => void;
  removeActivity: (id: string | number) => void;
  clearActivities: () => void;
}

export const useActivityLogStore = create<ActivityLog>()(
  persist(
    (set) => ({
      activities: [],

      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities],
        })),

      removeActivity: (id) =>
        set((state) => ({
          activities: state.activities.filter(
            (item) => String(item.id) !== String(id),
          ),
        })),

      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: "activity-log-storage",
      storage: persistStorage,
    },
  ),
);
