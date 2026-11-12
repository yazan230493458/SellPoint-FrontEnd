"use client";

import { FlagIcon, SearchIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Section } from "../types";
import AdminThemeToggle from "./AdminThemeToggle";

type AdminSiteHeaderProps = {
  section: Section;
  query: string;
  onQueryChange: (value: string) => void;
  onOpenReports: () => void;
};

const AdminSiteHeader = ({
  section,
  query,
  onQueryChange,
  onOpenReports,
}: AdminSiteHeaderProps) => {
  const t = useTranslations("Dashboard");
  const showSearch =
    section !== "overview" && section !== "categories" && section !== "settings";

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-2 px-4 lg:gap-3 lg:px-6">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-1 h-4 data-vertical:self-auto"
        />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-medium">{t(section)}</h1>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {t("subtitle")}
          </p>
        </div>
        {showSearch ? (
          <div className="relative w-full max-w-64">
            <SearchIcon className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t("search")}
              className="h-9 ps-8"
              aria-label={t("search")}
            />
          </div>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant={section === "reports" ? "default" : "outline"}
          onClick={onOpenReports}
          aria-label={t("reportsShortcut")}
          title={t("reportsShortcut")}
        >
          <FlagIcon />
          <span className="hidden sm:inline">{t("reports")}</span>
        </Button>
        <AdminThemeToggle />
      </div>
    </header>
  );
};

export default AdminSiteHeader;
