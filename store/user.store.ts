import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistStorage } from "@/lib/persist-storage";
import {
  clearBrowserSession,
  migrateLegacyTokens,
} from "@/lib/browser-session";

migrateLegacyTokens();

export interface GeneralSettings {
  theme: "light" | "dark" | "system";
  language: string;
  emailSummary: boolean;
  desktopNotifications: boolean;
  region: string;
  city: string;
  clearCache: boolean;
  disableAccount: boolean;
  deleteAccount: boolean;
}

export interface AccountSettings {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  mobileNumber: string;
  region: string;
  city: string;
  registration?: Date;
  avatarUrl?: string;
  modify?: Date;
  is2FAEnabled?: boolean;
  verifiedEmail?: boolean;
  verifiedMobilePhone?: boolean;
  evaluation?: number;
  bio?: string;
}

export interface PrivacyAndSecuritySettings {
  mobileNumber: string;
  emailAddress: string;
  showCity: string;
  allowDirectMessages: boolean;
  listOfBanned: string[];
}

export type NotificationChannel = 1 | 2;

export interface NotificationSettings {
  messages: NotificationChannel;
  offersAndBids: NotificationChannel;
  adStatus: NotificationChannel;
  accountSecurity: NotificationChannel;
  reviewsAndRatings: NotificationChannel;
  priceDrops: NotificationChannel;
  recommendations: NotificationChannel;
}

export interface FavoritesAd {
  adName: string;
  mobileNumber: string;
  selectedCountry: string | null;
  selectedCity: string | null;
  description: string;
  category: string | null;
  price: string;
  showPrice: boolean;
  images: string[];
  mainImageIndex: number;
  preferredContactMethod: string;
  acceptTerms: boolean;
}

export interface FavoritesStore {
  storeName: string;
  mobileNumber: string;
  selectedCountry: string | null;
  selectedCity: string | null;
  description: string;
  categories: string[];
  images: string[];
  mainImageIndex: number;
  preferredContactMethod: string;
  acceptTerms: boolean;
}

export type FavoritesSettings = FavoritesAd | FavoritesStore;

export interface Settings {
  general: GeneralSettings;
  account: AccountSettings;
  privacyAndSecurity: PrivacyAndSecuritySettings;
  notifications: NotificationSettings;
  favorites?: FavoritesSettings;
}

export type UserRole = "USER" | "ADMIN" | "OWNER";

const readRole = (value: unknown): UserRole | null =>
  value === "USER" || value === "ADMIN" || value === "OWNER" ? value : null;

const resolvePersistedRole = (
  profileRole: unknown,
  legacyRole: unknown,
): UserRole | null => {
  const profile = readRole(profileRole);
  const legacy = readRole(legacyRole);
  if (profile && profile !== "USER") return profile;
  if (legacy && legacy !== "USER") return legacy;
  return profile ?? legacy;
};

export interface UserProfile {
  id: string | null;
  subscriber?: boolean;
  rating?: number;
  role: UserRole | null;
  settings: Settings;
}

export type UserAccountFields = Partial<
  Pick<
    AccountSettings,
    | "firstName"
    | "lastName"
    | "username"
    | "email"
    | "mobileNumber"
    | "region"
    | "city"
    | "bio"
    | "avatarUrl"
  >
>;

export type SetUserPayload = Partial<UserProfile> & UserAccountFields;

export interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  sessionReady: boolean;
  premium: boolean;
  setUser: (user: SetUserPayload) => void;
  updateAvatar: (avatarUrl: string) => void;
  updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
  updateAccountSettings: (settings: Partial<AccountSettings>) => void;
  updatePrivacySettings: (
    settings: Partial<PrivacyAndSecuritySettings>,
  ) => void;
  updateNotificationSetting: (
    key: keyof NotificationSettings,
    value: NotificationChannel,
  ) => void;
  updateAllNotificationSettings: (settings: NotificationSettings) => void;
  clearUser: () => void;
  setSession: (session: {
    role?: UserRole | null;
    premium: boolean;
  }) => void;
  onCityChange: (value: string) => void;
  onRegionChange: (value: string) => void;
  on2FAChange?: () => void;
}

export const defaultGeneralSettings: GeneralSettings = {
  theme: "system",
  language: "en",
  emailSummary: false,
  desktopNotifications: false,
  region: "unknown",
  city: "unknown",
  clearCache: false,
  disableAccount: false,
  deleteAccount: false,
};

export const defaultAccountSettings: AccountSettings = {
  firstName: "unknown",
  lastName: "unknown",
  username: "unknown",
  email: "unknown",
  mobileNumber: "unknown",
  region: "unknown",
  city: "unknown",
  bio: "unknown",
  modify: new Date(),
  registration: new Date(),
  is2FAEnabled: false,
};

export const defaultPrivacyAndSecuritySettings: PrivacyAndSecuritySettings = {
  mobileNumber: "Everyone",
  emailAddress: "Just Me",
  showCity: "Everyone",
  allowDirectMessages: true,
  listOfBanned: [],
};

export const defaultNotificationSettings: NotificationSettings = {
  messages: 2,
  offersAndBids: 2,
  adStatus: 1,
  accountSecurity: 1,
  reviewsAndRatings: 2,
  priceDrops: 2,
  recommendations: 1,
};

export const defaultSettings: Settings = {
  general: defaultGeneralSettings,
  account: defaultAccountSettings,
  privacyAndSecurity: defaultPrivacyAndSecuritySettings,
  notifications: defaultNotificationSettings,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionReady: false,
      premium: false,
      setUser: (userData) => {
        const currentUser = get().user;
        const {
          firstName,
          lastName,
          username,
          email,
          mobileNumber,
          region,
          city,
          bio,
          avatarUrl,
          settings: incomingSettings,
          id,
          role,
          subscriber,
          rating,
        } = userData;

        const accountFromFields: UserAccountFields = {
          ...(firstName !== undefined ? { firstName } : {}),
          ...(lastName !== undefined ? { lastName } : {}),
          ...(username !== undefined ? { username } : {}),
          ...(email !== undefined ? { email } : {}),
          ...(mobileNumber !== undefined ? { mobileNumber } : {}),
          ...(region !== undefined ? { region } : {}),
          ...(city !== undefined ? { city } : {}),
          ...(bio !== undefined ? { bio } : {}),
          ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        };

        const settings = {
          ...defaultSettings,
          ...currentUser?.settings,
          ...incomingSettings,
          general: {
            ...defaultGeneralSettings,
            ...currentUser?.settings.general,
            ...incomingSettings?.general,
            ...(region !== undefined ? { region } : {}),
            ...(city !== undefined ? { city } : {}),
          },
          account: {
            ...defaultAccountSettings,
            ...currentUser?.settings.account,
            ...incomingSettings?.account,
            ...accountFromFields,
            modify: new Date(),
            registration:
              incomingSettings?.account?.registration ??
              currentUser?.settings.account.registration ??
              new Date(),
          },
          privacyAndSecurity: {
            ...defaultPrivacyAndSecuritySettings,
            ...currentUser?.settings.privacyAndSecurity,
            ...incomingSettings?.privacyAndSecurity,
          },
          notifications: {
            ...defaultNotificationSettings,
            ...currentUser?.settings.notifications,
            ...incomingSettings?.notifications,
          },
        };

        set({
          user: {
            id: id ?? currentUser?.id ?? null,
            subscriber: subscriber ?? currentUser?.subscriber,
            rating: rating ?? currentUser?.rating,
            role: role !== undefined ? role : (currentUser?.role ?? null),
            settings,
          },
          isAuthenticated: true,
        });
      },

      updateAvatar: (avatarUrl) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              account: {
                ...user.settings.account,
                avatarUrl,
              },
            },
          },
        });
      },

      updateGeneralSettings: (newGeneralSettings) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              general: {
                ...user.settings.general,
                ...newGeneralSettings,
              },
            },
          },
        });
      },

      updateAccountSettings: (newAccountSettings) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              account: {
                ...user.settings.account,
                ...newAccountSettings,
              },
            },
          },
        });
      },

      updatePrivacySettings: (newPrivacySettings) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              privacyAndSecurity: {
                ...user.settings.privacyAndSecurity,
                ...newPrivacySettings,
              },
            },
          },
        });
      },

      updateNotificationSetting: (key, value) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              notifications: {
                ...user.settings.notifications,
                [key]: value,
              },
            },
          },
        });
      },

      updateAllNotificationSettings: (newNotifications) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              notifications: newNotifications,
            },
          },
        });
      },

      clearUser: () => {
        clearBrowserSession();
        set({
          user: null,
          isAuthenticated: false,
          premium: false,
        });
      },
      setSession: ({ role, premium }) => {
        const current = get().user;
        const nextRole = role !== undefined && role !== null ? role : (current?.role ?? null);
        set({
          premium,
          isAuthenticated: true,
          sessionReady: true,
          user: current
            ? { ...current, role: nextRole }
            : {
                id: null,
                role: nextRole,
                settings: defaultSettings,
              },
        });
      },

      onCityChange: (value) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              general: {
                ...user.settings.general,
                city: value,
              },
              account: {
                ...user.settings.account,
                city: value,
              },
            },
          },
        });
      },

      onRegionChange: (value) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            settings: {
              ...user.settings,
              general: {
                ...user.settings.general,
                region: value,
                city: "",
              },
              account: {
                ...user.settings.account,
                region: value,
                city: "",
              },
            },
          },
        });
      },
    }),
    {
      name: "user-storage",
      storage: persistStorage,
      merge: (persistedState, currentState) => {
        const persisted = persistedState as
          | {
              user?: UserProfile | null;
              premium?: boolean;
              role?: unknown;
            }
          | undefined;
        const persistedUser = persisted?.user;
        const restoredProfile = persistedUser
          ? {
              id: persistedUser.id ?? null,
              subscriber: persistedUser.subscriber,
              rating: persistedUser.rating,
              role: resolvePersistedRole(persistedUser.role, persisted?.role),
              settings: {
                ...defaultSettings,
                ...persistedUser.settings,
                general: {
                  ...defaultGeneralSettings,
                  ...persistedUser.settings?.general,
                },
                account: {
                  ...defaultAccountSettings,
                  ...persistedUser.settings?.account,
                },
                privacyAndSecurity: {
                  ...defaultPrivacyAndSecuritySettings,
                  ...persistedUser.settings?.privacyAndSecurity,
                },
                notifications: {
                  ...defaultNotificationSettings,
                  ...persistedUser.settings?.notifications,
                },
              },
            }
          : null;
        const live = Boolean(
          currentState.sessionReady &&
            currentState.isAuthenticated &&
            currentState.user,
        );

        return {
          ...currentState,
          user: live ? currentState.user : restoredProfile,
          isAuthenticated: live ? true : false,
          sessionReady: live ? true : currentState.sessionReady,
          premium: live ? currentState.premium : Boolean(persisted?.premium),
        };
      },
      partialize: (state) => ({
        user: state.user,
        premium: state.premium,
      }),
    },
  ),
);
