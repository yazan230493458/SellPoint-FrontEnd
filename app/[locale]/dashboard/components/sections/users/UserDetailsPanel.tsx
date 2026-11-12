"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Row } from "../../types";

type UserDetailsPanelProps = {
  details: Row;
  onClose: () => void;
};

const UserDetailsPanel = ({ details, onClose }: UserDetailsPanelProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{String(details.username ?? "")}</CardTitle>
        <Badge variant="secondary">{String(details.role ?? "")}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>{String(details.email ?? "")}</p>
        <p>{details.isActive ? t("activeStatus") : t("bannedStatus")}</p>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          {t("close")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserDetailsPanel;
