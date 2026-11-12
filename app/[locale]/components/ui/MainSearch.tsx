"use client";

import React from "react";
import {
  Eraser,
  Search,
  Car,
  Smartphone,
  Tablet,
  Building2,
  Tv,
  Sofa,
  Wrench,
  Shirt,
  Briefcase,
  Trophy,
  Dog,
  Gamepad2,
  BookOpen,
  HeartPulse,
} from "lucide-react";
import Button from "./Button";
import NoteInput from "./NoteInput";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

const MainSearch = () => {
  const t = useTranslations("HomePage");
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();

  const handleSearch = () => {
    if (!textareaRef.current) return;
    const query = textareaRef.current.value.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleWriting = (text: string) => {
    if (textareaRef.current) {
      textareaRef.current.value = textareaRef.current.value + text + " ";
    }
  };

  const handleClear = () => {
    if (!textareaRef.current) return;
    textareaRef.current.value = "";
    textareaRef.current.style.height = "120px";
    textareaRef.current.style.overflowY = "hidden";
  };

  const categories = [
    { id: "cars", label: t("searchCategories.cars"), icon: Car },
    { id: "phones", label: t("searchCategories.phones"), icon: Smartphone },
    { id: "tablets", label: t("searchCategories.tablets"), icon: Tablet },
    {
      id: "real-estate",
      label: t("searchCategories.realEstate"),
      icon: Building2,
    },
    { id: "electronics", label: t("searchCategories.electronics"), icon: Tv },
    { id: "furniture", label: t("searchCategories.furniture"), icon: Sofa },
    { id: "services", label: t("searchCategories.services"), icon: Wrench },
    { id: "fashion", label: t("searchCategories.fashion"), icon: Shirt },
    { id: "jobs", label: t("searchCategories.jobs"), icon: Briefcase },
    { id: "sports", label: t("searchCategories.sports"), icon: Trophy },
    { id: "pets", label: t("searchCategories.pets"), icon: Dog },
    { id: "gaming", label: t("searchCategories.gaming"), icon: Gamepad2 },
    { id: "books", label: t("searchCategories.books"), icon: BookOpen },
    { id: "health", label: t("searchCategories.health"), icon: HeartPulse },
  ];

  return (
    <div className="flex flex-col gap-3 w-full max-w-3xl mt">
      <div className="flex flex-col sm:flex-row gap-2.5 w-full">
        <NoteInput
          className="w-full h-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-zinc-400"
          classNameForContainer="w-full h-32 sm:h-30"
          onKeyDown={handleKeyDown}
          placeholder={t("searchPlaceholder")}
          ref={textareaRef}
        />
        <div className="flex sm:flex-col gap-2.5 shrink-0">
          <Button
            type="button"
            className="flex-1 sm:flex-initial size-12 sm:size-[58px] flex justify-center items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 active:scale-95"
            onClick={handleSearch}
            aria-label={t("searchTitle")}
          >
            <Search className="size-5" />
          </Button>
          <Button
            type="button"
            className="flex-1 sm:flex-initial size-12 sm:size-[58px] flex justify-center items-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200 active:scale-95"
            onClick={handleClear}
            aria-label={t("clear")}
          >
            <Eraser className="size-5" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              type="button"
              className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl py-3 px-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 text-xs font-semibold truncate active:scale-[0.98]"
              key={category.id}
              onClick={() => handleWriting(category.label)}
            >
              <Icon className="size-3.5 shrink-0 text-zinc-600 dark:text-zinc-400" />
              <span className="truncate">{category.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

MainSearch.displayName = "MainSearch";

export default MainSearch;