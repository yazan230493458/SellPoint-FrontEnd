"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, History, ArrowUpLeft } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Button from "./Button";

interface SubStudyProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  recentSearchesKey?: string;
  maxRecentSearches?: number;
  classNameForBox?: string;
  className?: string;
}

const SubStudy: React.FC<SubStudyProps> = ({
  onSearch,
  placeholder,
  recentSearchesKey = "substudy_recent_searches",
  maxRecentSearches = 5,
  classNameForBox,
  className,
}) => {
  const t = useTranslations("SubStudy");
  const resolvedPlaceholder = placeholder || t("searchPlaceholder");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const loadRecentSearches = async () => {
      await Promise.resolve();
      if (!active) return;
      try {
        const saved = localStorage.getItem(recentSearchesKey);
        if (!active || !saved) return;
        setRecentSearches(JSON.parse(saved) as string[]);
      } catch {
        if (active) setRecentSearches([]);
      }
    };
    void loadRecentSearches();
    return () => {
      active = false;
    };
  }, [recentSearchesKey]);

  const saveSearchTerm = useCallback(
    (term: string) => {
      const cleanTerm = term.trim();
      if (!cleanTerm) return;

      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (item) => item.toLowerCase() !== cleanTerm.toLowerCase(),
        );
        const updated = [cleanTerm, ...filtered].slice(0, maxRecentSearches);
        try {
          localStorage.setItem(recentSearchesKey, JSON.stringify(updated));
        } catch (error) {
          console.log(error);
        }
        return updated;
      });
    },
    [recentSearchesKey, maxRecentSearches],
  );

  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(recentSearchesKey, JSON.stringify(updated));
      } catch (error) {
        console.log(error);
      }
      return updated;
    });
  };

  const handleExecuteSearch = useCallback(
    (searchTerm: string) => {
      const cleanTerm = searchTerm.trim();
      if (!cleanTerm) return;

      setIsLoading(true);
      saveSearchTerm(cleanTerm);
      setIsFocused(false);
      setSelectedIndex(-1);

      router.push(`/search?q=${encodeURIComponent(cleanTerm)}`);

      if (onSearch) {
        onSearch(cleanTerm);
      }

      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(timer);
    },
    [onSearch, saveSearchTerm, router],
  );

  const handleClear = () => {
    setQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < recentSearches.length) {
        const selectedTerm = recentSearches[selectedIndex];
        setQuery(selectedTerm);
        handleExecuteSearch(selectedTerm);
      } else {
        handleExecuteSearch(query);
      }
      return;
    }

    if (!isFocused || recentSearches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < recentSearches.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : recentSearches.length - 1,
      );
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showDropdown =
    isFocused && query.trim() === "" && recentSearches.length > 0;

  return (
    <div className={`${classNameForBox} relative w-full`} ref={containerRef}>
      <div
        className={`flex items-center w-full h-12 px-4 rounded-xl border transition-all duration-200 bg-white dark:bg-zinc-900 ${
          isFocused
            ? "border-white ring-2 ring-black shadow-md"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
        }`}
      >
        <Search className="w-5 h-5 text-zinc-400 shrink-0" />

        <input
          className={`${className} w-full h-full px-3 text-sm text-zinc-900 dark:text-zinc-100 bg-transparent placeholder-zinc-400 outline-none border-none focus:ring-0`}
          onBlur={() => setSelectedIndex(-1)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
          aria-label={resolvedPlaceholder}
          ref={inputRef}
          type="text"
          value={query}
        />

        <div className="flex items-center gap-1 shrink-0">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          )}

          {query && !isLoading && (
            <Button
              aria-label={t("clearSearch")}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={handleClear}
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          <Button
            type="button"
            onClick={() => handleExecuteSearch(query)}
            className="px-3 py-1.5 ml-1 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            {t("search")}
          </Button>
        </div>
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-1.5 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {t("recentSearches")}
          </div>
          {recentSearches.map((term, index) => {
            const isSelected = index === selectedIndex;
            return (
              <div
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
                key={term}
                onClick={() => {
                  setQuery(term);
                  handleExecuteSearch(term);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <History className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="text-sm truncate">{term}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={t("removeItem")}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                    onClick={(e) => removeRecentSearch(e, term)}
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                  <ArrowUpLeft className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

SubStudy.displayName = "SubStudy";

export default SubStudy;
