"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/store/user.store";
import Button from "./Button";

const ThemeToggle = () => {
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

  const toggleTheme = () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    updateGeneralSettings({ theme: nextTheme });
  };

  return (
    <Button
      type="button"
      onClick={toggleTheme}
      aria-label={t("darkMode")}
      title={t("darkMode")}
      className="ms-auto size-10 shrink-0 rounded-xl px-0 text-zinc-900 shadow-none hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800 md:ms-2"
    >
      {isDark ? (
        <Sun className="size-5" aria-hidden />
      ) : (
        <Moon className="size-5" aria-hidden />
      )}
    </Button>
  );
};

export default ThemeToggle;
