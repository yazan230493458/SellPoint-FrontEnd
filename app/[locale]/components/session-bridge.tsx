"use client";

import { useEffect } from "react";
import { ApiError, apiRequest } from "@/lib/api";
import { applyAuthResponse } from "@/lib/auth-session";
import type { AuthResponse } from "@/lib/ads";
import { useUserStore } from "@/store/user.store";

const SessionBridge = () => {
  useEffect(() => {
    let cancelled = false;

    const restore = () => {
      if (cancelled) return;
      void apiRequest<AuthResponse>("/api/me")
        .then((result) => {
          if (cancelled) return;
          if (!result.user) {
            useUserStore.getState().clearUser();
            return;
          }
          applyAuthResponse(result);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          if (error instanceof ApiError && error.status === 401) {
            useUserStore.getState().clearUser();
          }
        })
        .finally(() => {
          if (!cancelled) useUserStore.setState({ sessionReady: true });
        });
    };

    if (useUserStore.persist.hasHydrated()) {
      restore();
      return () => {
        cancelled = true;
      };
    }

    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      restore();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return null;
};

export default SessionBridge;
