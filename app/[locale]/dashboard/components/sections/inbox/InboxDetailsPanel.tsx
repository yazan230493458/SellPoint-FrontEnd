"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Row } from "../../types";

type InboxDetailsPanelProps = {
  selected: Row;
  onClose: () => void;
};

const InboxDetailsPanel = ({ selected, onClose }: InboxDetailsPanelProps) => {
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{String(selected.subject)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="whitespace-pre-wrap">{String(selected.message)}</p>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          {t("close")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default InboxDetailsPanel;
