"use client";

import type { DashboardConfirm, Row } from "../types";
import AdRow from "./ads/AdRow";

type DashboardAdsProps = {
  rows: Row[];
  ask: DashboardConfirm;
};

const DashboardAds = ({ rows, ask }: DashboardAdsProps) => (
  <>
    {rows.map((row) => (
      <AdRow key={String(row.id)} row={row} ask={ask} />
    ))}
  </>
);

export default DashboardAds;
