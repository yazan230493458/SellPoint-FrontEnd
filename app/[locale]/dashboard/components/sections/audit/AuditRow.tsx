"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Row } from "../../types";

type AuditRowProps = {
  row: Row;
};

const AuditRow = ({ row }: AuditRowProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm">{String(row.action)}</CardTitle>
    </CardHeader>
    <CardContent className="text-xs text-muted-foreground">
      {String(row.targetType)} {String(row.targetId ?? "")}
    </CardContent>
  </Card>
);

export default AuditRow;
