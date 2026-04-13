"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function HistoryPage() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Saved generations, uploads, and form submissions will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 rounded-md border border-dashed border-border bg-muted/30" />
        </CardContent>
      </Card>
    </div>
  );
}

