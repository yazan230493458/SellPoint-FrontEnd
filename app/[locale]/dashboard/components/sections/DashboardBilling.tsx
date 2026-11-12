"use client";

import type { Row } from "../types";
import BillingRow from "./billing/BillingRow";

type DashboardBillingProps = {
  rows: Row[];
  kind: "payments" | "subscriptions";
};

const DashboardBilling = ({ rows, kind }: DashboardBillingProps) => (
  <>
    {rows.map((row) => (
      <BillingRow key={String(row.id)} row={row} kind={kind} />
    ))}
  </>
);

export default DashboardBilling;
