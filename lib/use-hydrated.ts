import { useSyncExternalStore } from "react";
import { useUserStore } from "@/store/user.store";

function subscribe() {
  return () => {};
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function useSessionGate() {
  const user = useUserStore((state) => state.user);
  const sessionReady = useUserStore((state) => state.sessionReady);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const clientReady = useHydrated();
  const storeHydrated = useSyncExternalStore(
    (onStoreChange) => useUserStore.persist.onFinishHydration(onStoreChange),
    () => useUserStore.persist.hasHydrated(),
    () => false,
  );

  return {
    user,
    sessionReady,
    isAuthenticated,
    pending: !clientReady || !storeHydrated || !sessionReady,
  };
}
