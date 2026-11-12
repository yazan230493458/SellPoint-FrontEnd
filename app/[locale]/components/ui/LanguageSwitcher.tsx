"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "lucide-react";
import LanguageSelect from "./LanguageSelect";
import { confirmSavedLocale } from "../locale-history";
import { isAppLocale, type AppLocale, getLocaleConfig } from "@/i18n/locales";
import { useUserStore } from "@/store/user.store";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

type LanguageSwitcherProps = {
  className?: string;
};

const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const updateGeneralSettings = useUserStore(
    (state) => state.updateGeneralSettings,
  );
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const config = getLocaleConfig(locale);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleChange = (nextLocale: AppLocale) => {
    if (!isAppLocale(nextLocale)) return;
    updateGeneralSettings({ language: nextLocale });
    confirmSavedLocale(nextLocale);
    void apiRequest("/api/me/preferences", {
      method: "PUT",
      body: { language: nextLocale },
    }).catch(() => undefined);
    setOpen(false);
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  };

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-2"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <Languages className="size-4 shrink-0" aria-hidden />
        <span className="max-w-[7rem] truncate text-xs sm:text-sm">
          {config.nativeName}
        </span>
      </Button>
      {open ? (
        <div className="absolute end-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-1.5rem))] shadow-lg">
          <LanguageSelect
            embedded
            value={locale}
            onChange={handleChange}
          />
        </div>
      ) : null}
    </div>
  );
};

export default LanguageSwitcher;
