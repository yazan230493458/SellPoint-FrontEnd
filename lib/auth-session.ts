import { useUserStore } from "@/store/user.store";
import type { AuthResponse } from "@/lib/ads";
import { API_URL } from "@/lib/api";

export const applyAuthResponse = (payload: AuthResponse) => {
  if (!payload.user) return;
  const { setUser, setSession } = useUserStore.getState();
  setUser({
    id: String(payload.user.id),
    firstName: payload.user.firstName,
    lastName: payload.user.lastName,
    username: payload.user.username,
    email: payload.user.email,
    mobileNumber: payload.user.mobileNumber,
    region: payload.user.region,
    city: payload.user.city,
    bio: payload.user.bio,
    avatarUrl: payload.user.avatarUrl ?? undefined,
    role: payload.user.role,
  });
  useUserStore.getState().updateAccountSettings({
    evaluation: payload.user.evaluation,
    is2FAEnabled: payload.user.is2FAEnabled,
    verifiedEmail: payload.user.verifiedEmail,
    verifiedMobilePhone: payload.user.verifiedMobilePhone,
  });
  setSession({
    role: payload.user.role,
    premium: payload.user.premium,
  });
};

export const startOAuth = (provider: "google" | "github") => {
  window.location.assign(`${API_URL}/api/auth/${provider}`);
};
