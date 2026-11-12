"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  sortedLocalesByNativeName,
  type AppLocale,
  isAppLocale,
} from "@/i18n/locales";
import { cn } from "cn";

type LanguageSelectProps = {
  value: string;
  onChange: (locale: AppLocale) => void;
  className?: string;
  /** Render search + list only (no trigger button). */
  embedded?: boolean;
};

const LanguageList = ({
  value,
  onChange,
  query,
  setQuery,
}: {
  value: string;
  onChange: (locale: AppLocale) => void;
  query: string;
  setQuery: (value: string) => void;
}) => {
  const t = useTranslations("LanguageSelect");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sortedLocalesByNativeName;
    return sortedLocalesByNativeName.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(needle) ||
        item.englishName.toLowerCase().includes(needle) ||
        item.code.toLowerCase().includes(needle),
    );
  }, [query]);

  return (
    <>
      <div className="relative border-b border-border p-2">
        <SearchIcon className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("search")}
          className="h-9 ps-8"
          autoFocus
          aria-label={t("search")}
        />
      </div>
      <ul
        role="listbox"
        className="max-h-64 overflow-y-auto p-1"
        aria-label={t("listLabel")}
      >
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {t("empty")}
          </li>
        ) : (
          filtered.map((item) => {
            const isActive = item.code === value;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-muted",
                    isActive && "bg-muted font-medium",
                  )}
                  onClick={() => onChange(item.code)}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{item.nativeName}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.englishName} · {item.code}
                    </span>
                  </span>
                  {isActive ? <CheckIcon className="size-4 shrink-0" /> : null}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </>
  );
};

const LanguageSelect = ({
  value,
  onChange,
  className,
  embedded = false,
}: LanguageSelectProps) => {
  const t = useTranslations("LanguageSelect");
  const activeLocale = useLocale();
  const [open, setOpen] = useState(embedded);
  const [query, setQuery] = useState("");

  const selected = isAppLocale(value)
    ? sortedLocalesByNativeName.find((item) => item.code === value)
    : sortedLocalesByNativeName.find((item) => item.code === activeLocale);

  const handleChange = (locale: AppLocale) => {
    onChange(locale);
    if (!embedded) {
      setOpen(false);
      setQuery("");
    }
  };

  if (embedded) {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground",
          className,
        )}
      >
        <LanguageList
          value={value}
          onChange={handleChange}
          query={query}
          setQuery={setQuery}
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <Button
        type="button"
        variant="outline"
        className="h-10 w-full justify-between"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate text-start">
          {selected
            ? `${selected.nativeName} (${selected.englishName})`
            : t("placeholder")}
        </span>
        <ChevronsUpDownIcon className="size-4 opacity-60" />
      </Button>

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
          <LanguageList
            value={value}
            onChange={handleChange}
            query={query}
            setQuery={setQuery}
          />
        </div>
      ) : null}
    </div>
  );
};

export default LanguageSelect;
