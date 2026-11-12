"use client";

import type { DashboardAction, Row } from "../types";
import SettingRow from "./settings/SettingRow";

type DashboardSettingsProps = {
  rows: Row[];
  role: string | null | undefined;
  act: DashboardAction;
};

const DashboardSettings = ({ rows, role, act }: DashboardSettingsProps) => (
  <>
    {rows.map((row) => (
      <SettingRow key={String(row.key)} row={row} role={role} act={act} />
    ))}
  </>
);

export default DashboardSettings;
