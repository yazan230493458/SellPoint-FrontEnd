"use client";

import { useTranslations } from "next-intl";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DashboardAction, Row } from "../../types";

type SettingRowProps = {
  row: Row;
  role: string | null | undefined;
  act: DashboardAction;
};

const SettingRow = ({ row, role, act }: SettingRowProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{String(row.key)}</CardTitle>
      </CardHeader>
      <CardContent>
        {role === "OWNER" ? (
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const raw = String(form.get("value") ?? "");
              const value =
                raw === "true" ? true : raw === "false" ? false : Number(raw);
              void act(() =>
                apiRequest(`/api/admin/settings/${String(row.key)}`, {
                  method: "PUT",
                  body: { value },
                }).then(() => undefined),
              );
            }}
          >
            {typeof row.value === "boolean" ? (
              <select
                name="value"
                defaultValue={String(row.value)}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="true">{t("enabled")}</option>
                <option value="false">{t("disabled")}</option>
              </select>
            ) : (
              <Input
                name="value"
                defaultValue={String(row.value ?? "")}
                className="flex-1"
              />
            )}
            <Button type="submit">{t("saveSetting")}</Button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            {JSON.stringify(row.value)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SettingRow;
