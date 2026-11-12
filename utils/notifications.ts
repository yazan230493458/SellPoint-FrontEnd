import { useUserStore, type NotificationSettings } from "@/store/user.store";

export const checkNotificationSupport = (): boolean => {
  return typeof window !== "undefined" && "Notification" in window;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) return false;
  if (Notification.permission === "granted") {
    return true;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

export const sendNotification = (
  title: string,
  options?: NotificationOptions,
) => {
  if (checkNotificationSupport() && Notification.permission === "granted") {
    new Notification(title, options);
  }
};

export const triggerNotificationByPreference = async (
  type: keyof NotificationSettings,
  title: string,
  options?: NotificationOptions,
): Promise<boolean> => {
  if (!checkNotificationSupport()) return false;

  const user = useUserStore.getState().user;
  const preference = user?.settings?.notifications?.[type];

  if (preference !== 1) {
    return false;
  }

  const isGranted = await requestNotificationPermission();
  if (!isGranted) {
    return false;
  }

  sendNotification(title, options);
  return true;
};
