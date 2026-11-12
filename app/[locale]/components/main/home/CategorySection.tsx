"use client";

import { useTranslations } from "next-intl";
import BaseLink from "@/app/[locale]/components/ui/BaseLink";
import { 
  Car, 
  Smartphone, 
  Home, 
  Laptop, 
  Shirt, 
  Briefcase, 
  Wrench, 
  Armchair,
  LucideIcon
} from "lucide-react";

interface CategoryItem {
  key: string;
  query: string;
  icon: LucideIcon;
}

const categories: CategoryItem[] = [
  { key: "cars", query: "cars", icon: Car },
  { key: "phones", query: "phones", icon: Smartphone },
  { key: "realEstate", query: "real-estate", icon: Home },
  { key: "electronics", query: "electronics", icon: Laptop },
  { key: "fashion", query: "fashion", icon: Shirt },
  { key: "jobs", query: "jobs", icon: Briefcase },
  { key: "services", query: "services", icon: Wrench },
  { key: "furniture", query: "furniture", icon: Armchair },
] as const;

const CategorySection = () => {
  const t = useTranslations("HomePage");

  return (
    <section className="w-full max-w-7xl mx-auto space-y-6">
      <div className="space-y-2 text-center sm:text-start">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {t("home.categoriesTitle")}
        </h2>
        <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          {t("home.categoriesDescription")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map(({ key, query, icon: Icon }) => (
          <BaseLink
            key={key}
            href={`/search?q=${encodeURIComponent(query)}`}
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:focus-visible:ring-zinc-400 active:scale-[0.98]"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors duration-200 group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950">
              <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" />
            </div>

            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white">
              {t(`searchCategories.${key}`)}
            </span>
          </BaseLink>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;