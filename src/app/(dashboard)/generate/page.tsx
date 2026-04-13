"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function GeneratePage() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate (AI)</CardTitle>
          <CardDescription>
            This page will call your Azure Functions API backed by Azure OpenAI.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 rounded-md border border-dashed border-border bg-muted/30" />
        </CardContent>
      </Card>
    </div>
  );
}

