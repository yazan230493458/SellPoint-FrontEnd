"use client";

import { useState } from "react";
import type { DashboardConfirm, Row } from "../types";
import UserDetailsPanel from "./users/UserDetailsPanel";
import UserRow from "./users/UserRow";

type DashboardUsersProps = {
  rows: Row[];
  role: string | null | undefined;
  ask: DashboardConfirm;
};

const DashboardUsers = ({ rows, role, ask }: DashboardUsersProps) => {
  const [details, setDetails] = useState<Row | null>(null);

  return (
    <>
      {rows.map((row) => (
        <UserRow
          key={String(row.id)}
          row={row}
          role={role}
          ask={ask}
          onViewDetails={setDetails}
        />
      ))}
      {details ? (
        <UserDetailsPanel details={details} onClose={() => setDetails(null)} />
      ) : null}
    </>
  );
};

export default DashboardUsers;
