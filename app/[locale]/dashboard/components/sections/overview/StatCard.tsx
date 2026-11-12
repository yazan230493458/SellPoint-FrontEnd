"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: unknown;
  hint?: string;
};

const StatCard = ({ label, value, hint }: StatCardProps) => (
  <Card className="@container/card">
    <CardHeader>
      <CardDescription>{label}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {String(value ?? 0)}
      </CardTitle>
      <CardAction>
        <Badge variant="outline">{label}</Badge>
      </CardAction>
    </CardHeader>
    {hint ? (
      <CardFooter className="text-sm text-muted-foreground">{hint}</CardFooter>
    ) : null}
  </Card>
);

export default StatCard;
