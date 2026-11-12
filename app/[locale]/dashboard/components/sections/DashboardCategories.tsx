"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  CategoryDraft,
  DashboardAction,
  DashboardConfirm,
  Row,
} from "../types";
import CategoryForm from "./categories/CategoryForm";
import CategoryRow from "./categories/CategoryRow";

type DashboardCategoriesProps = {
  rows: Row[];
  draft: CategoryDraft;
  setDraft: Dispatch<SetStateAction<CategoryDraft>>;
  act: DashboardAction;
  ask: DashboardConfirm;
};

const DashboardCategories = ({
  rows,
  draft,
  setDraft,
  act,
  ask,
}: DashboardCategoriesProps) => (
  <>
    <CategoryForm draft={draft} setDraft={setDraft} act={act} />
    {rows.map((row) => (
      <CategoryRow
        key={String(row.id)}
        row={row}
        onEdit={setDraft}
        ask={ask}
      />
    ))}
  </>
);

export default DashboardCategories;
