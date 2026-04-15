"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import Link from "next/link";
import { APP_ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useEffect, useState } from "react";

type HistoryItem = {
  id: string;
  type: string;
  title: string | null;
  content: unknown;
  createdAt: string;
};

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function DashboardPage() {
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/history?limit=5");
      const data = (await res.json().catch(() => null)) as { items?: HistoryItem[] } | null;
      if (res.ok && data?.items) setRecent(data.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Generate content, upload images, and keep everything in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={APP_ROUTES.generate}>
            <Button>Generate</Button>
          </Link>
          <Link href={APP_ROUTES.upload}>
            <Button variant="outline">Upload</Button>
          </Link>
          <Link href={APP_ROUTES.history}>
            <Button variant="secondary">History</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Latest items saved to Cosmos DB.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <div className="space-y-2">
                {recent.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/10 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.type === "generation"
                            ? "success"
                            : item.type === "upload"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {item.type}
                      </Badge>
                      <div className="text-sm font-medium">
                        {item.title ?? "Untitled"}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(item.createdAt)}
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link
                    href={APP_ROUTES.history}
                    className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                  >
                    View all →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
                {loading
                  ? "Loading…"
                  : "No activity yet. Generate or upload something to get started."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What’s included</CardTitle>
            <CardDescription>
              A simple, shareable Azure demo stack.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>
                <span className="font-medium">Generate:</span> Azure OpenAI
              </li>
              <li>
                <span className="font-medium">Upload:</span> Azure Blob Storage (SAS links)
              </li>
              <li>
                <span className="font-medium">History:</span> Cosmos DB (NoSQL)
              </li>
            </ul>
            <div className="mt-4">
              <Button variant="outline" onClick={load} disabled={loading}>
                {loading ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
