"use client";

import type { DashboardConfirm, Row } from "../types";
import ReviewRow from "./reviews/ReviewRow";

type DashboardReviewsProps = {
  rows: Row[];
  ask: DashboardConfirm;
};

const DashboardReviews = ({ rows, ask }: DashboardReviewsProps) => (
  <>
    {rows.map((row) => (
      <ReviewRow key={String(row.id)} row={row} ask={ask} />
    ))}
  </>
);

export default DashboardReviews;
