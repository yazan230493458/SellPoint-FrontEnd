"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/user.store";

const AdminThemeToggle = () => {
  const t = useTranslations("HomePage.header");
  const { resolvedTheme, setTheme } = useTheme();
  const updateGeneralSettings = useUserStore(
    (state) => state.updateGeneralSettings,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={t("darkMode")}
      title={t("darkMode")}
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        setTheme(nextTheme);
        updateGeneralSettings({ theme: nextTheme });
      }}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
};

export default AdminThemeToggle;
