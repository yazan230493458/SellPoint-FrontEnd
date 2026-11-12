const sessionKey = "sellpoint-session";

export const clearBrowserSession = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(sessionKey);
  const raw = localStorage.getItem("user-storage");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string; refreshToken?: string; isAuthenticated?: boolean } };
    if (!parsed.state) return;
    delete parsed.state.accessToken;
    delete parsed.state.refreshToken;
    localStorage.setItem("user-storage", JSON.stringify(parsed));
  } catch {
    return;
  }
};

export const migrateLegacyTokens = () => {
  clearBrowserSession();
};
