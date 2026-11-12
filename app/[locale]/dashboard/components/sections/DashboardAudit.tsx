"use client";

import type { Row } from "../types";
import AuditRow from "./audit/AuditRow";

type DashboardAuditProps = {
  rows: Row[];
};

const DashboardAudit = ({ rows }: DashboardAuditProps) => (
  <>
    {rows.map((row) => (
      <AuditRow key={String(row.id)} row={row} />
    ))}
  </>
);

export default DashboardAudit;
