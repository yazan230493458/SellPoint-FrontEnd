import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";

export interface FavoriteItem {
  id: string | number;
  title: string;
  category: string;
  price: string;
  location: string;
  imageUrl: string;
  href: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string | number) => void;
  setFavorites: (items: FavoriteItem[]) => void;
  clearFavorites: () => void;
  isFavorite: (id: string | number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (item) =>
        set((state) => {
          if (state.favorites.some((fav) => fav.id === item.id)) {
            return state;
          }
          return { favorites: [...state.favorites, item] };
        }),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== id),
        })),
      setFavorites: (items) => set({ favorites: items }),
      clearFavorites: () => set({ favorites: [] }),
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
    }),
    {
      name: "favorites-storage",
      storage: persistStorage,
    },
  ),
);
