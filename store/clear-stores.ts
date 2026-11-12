import { useActivityLogStore } from "@/store/activity-log.store";
import { useAdStore } from "@/store/ad.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { useNotificationStore } from "@/store/notification.store";
import { useStoreStore } from "@/store/store.store";
import { useUserStore } from "@/store/user.store";
import { useChatStore } from "@/store/chat.store";

export const clearAllStores = () => {
  const stores = [
    useActivityLogStore,
    useAdStore,
    useFavoritesStore,
    useNotificationStore,
    useStoreStore,
    useUserStore,
    useChatStore,
  ];

  const storageKeys = stores
    .map((store) => store.persist?.getOptions().name)
    .filter((name): name is string => Boolean(name));

  storageKeys.push("theme", "theme-storage");

  useActivityLogStore.setState(useActivityLogStore.getInitialState(), true);
  useChatStore.setState(useChatStore.getInitialState(), true);
  useAdStore.setState(useAdStore.getInitialState(), true);
  useFavoritesStore.setState(useFavoritesStore.getInitialState(), true);
  useNotificationStore.setState(useNotificationStore.getInitialState(), true);
  useStoreStore.setState(useStoreStore.getInitialState(), true);
  useUserStore.setState(useUserStore.getInitialState(), true);

  storageKeys.forEach((key) => {
    localStorage.removeItem(key);
  });
};
