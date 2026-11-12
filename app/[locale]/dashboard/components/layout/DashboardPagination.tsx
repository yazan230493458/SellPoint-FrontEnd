"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { isRtlLocale } from "@/i18n/locales";
import { Button } from "@/components/ui/button";

type DashboardPaginationProps = {
  page: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const DashboardPagination = ({
  page,
  canGoNext,
  onPrevious,
  onNext,
}: DashboardPaginationProps) => {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);

  return (
    <div className="mt-8 flex items-center justify-center gap-3 border-t border-border pt-5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={onPrevious}
        aria-label={t("previous")}
      >
        {isRtl ? <ChevronRight /> : <ChevronLeft />}
        {t("previous")}
      </Button>
      <span className="px-2 text-sm font-semibold tabular-nums">{page}</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!canGoNext}
        onClick={onNext}
        aria-label={t("next")}
      >
        {t("next")}
        {isRtl ? <ChevronLeft /> : <ChevronRight />}
      </Button>
    </div>
  );
};

export default DashboardPagination;
