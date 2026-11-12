import { apiRequest } from "@/lib/api";
import { applyAuthResponse } from "@/lib/auth-session";
import { clearAllStores } from "@/store/clear-stores";
import type { AuthResponse } from "@/lib/ads";

export type SwitcherAccount = {
  id: number;
  username: string | null;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN" | "OWNER";
  active: boolean;
};

type ListResponse = { accounts: SwitcherAccount[] };

export const fetchSwitcherAccounts = () =>
  apiRequest<ListResponse>("/api/accounts/switcher", { auth: false });

export const switchAccount = async (userId: number) => {
  const payload = await apiRequest<AuthResponse & { message?: string }>(
    "/api/accounts/switch",
    {
      method: "POST",
      body: { userId },
      auth: false,
    },
  );
  clearAllStores();
  applyAuthResponse(payload);
  if (typeof window !== "undefined") {
    window.location.assign(window.location.pathname + window.location.search);
  }
  return payload;
};

export const removeSwitcherAccount = (userId: number) =>
  apiRequest<{ message?: string }>(`/api/accounts/switcher/${userId}`, {
    method: "DELETE",
    auth: false,
  });

export const prepareAddAnotherAccount = async () => {
  await apiRequest<{ message?: string }>("/api/accounts/switcher/prepare-add", {
    method: "POST",
    auth: false,
  });
  clearAllStores();
};
