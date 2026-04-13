"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function UploadPage() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
          <CardDescription>
            This page will upload files to Azure Blob Storage via Azure
            Functions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 rounded-md border border-dashed border-border bg-muted/30" />
        </CardContent>
      </Card>
    </div>
  );
}

