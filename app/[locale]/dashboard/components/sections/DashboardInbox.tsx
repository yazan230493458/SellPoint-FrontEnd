"use client";

import { useState } from "react";
import type { DashboardConfirm, Row } from "../types";
import InboxDetailsPanel from "./inbox/InboxDetailsPanel";
import InboxRow from "./inbox/InboxRow";

type DashboardInboxProps = {
  rows: Row[];
  ask: DashboardConfirm;
};

const DashboardInbox = ({ rows, ask }: DashboardInboxProps) => {
  const [selected, setSelected] = useState<Row | null>(null);

  return (
    <>
      {rows.map((row) => (
        <InboxRow
          key={String(row.id)}
          row={row}
          ask={ask}
          onSelect={setSelected}
        />
      ))}
      {selected ? (
        <InboxDetailsPanel
          selected={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
};

export default DashboardInbox;
