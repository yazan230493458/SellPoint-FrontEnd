"use client";

import { AlertTriangle } from "lucide-react";

type DashboardErrorBannerProps = {
  message: string;
};

const DashboardErrorBanner = ({ message }: DashboardErrorBannerProps) => (
  <div className="mb-5 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
    <AlertTriangle className="size-5 shrink-0" />
    <p>{message}</p>
  </div>
);

export default DashboardErrorBanner;
