"use client";

import type { DashboardConfirm, Row } from "../types";
import CommentRow from "./comments/CommentRow";

type DashboardCommentsProps = {
  rows: Row[];
  ask: DashboardConfirm;
};

const DashboardComments = ({ rows, ask }: DashboardCommentsProps) => (
  <>
    {rows.map((row) => (
      <CommentRow key={String(row.id)} row={row} ask={ask} />
    ))}
  </>
);

export default DashboardComments;
