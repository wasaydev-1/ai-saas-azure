"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Alerts & charts</CardTitle>
          <CardDescription>
            Wire your charting library (e.g. Tremor, ECharts) to live query
            streams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-md border border-dashed border-border bg-muted/30" />
        </CardContent>
      </Card>
    </div>
  );
}
