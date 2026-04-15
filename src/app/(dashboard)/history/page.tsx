"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type HistoryItem = {
  id: string;
  type: string;
  title: string | null;
  content: unknown;
  metadata: Record<string, unknown> | null;
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

function isObj(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function getGeneration(item: HistoryItem): { prompt: string; content: string } | null {
  if (item.type !== "generation" || !isObj(item.content)) return null;
  const prompt = typeof item.content.prompt === "string" ? item.content.prompt : null;
  const content = typeof item.content.content === "string" ? item.content.content : null;
  if (!prompt || !content) return null;
  return { prompt, content };
}

function getUpload(item: HistoryItem): { filename: string; url: string; expiresOn?: string } | null {
  if (item.type !== "upload" || !isObj(item.content)) return null;
  const filename = typeof item.content.filename === "string" ? item.content.filename : null;
  const url = typeof item.content.url === "string" ? item.content.url : null;
  const expiresOn = typeof item.content.expiresOn === "string" ? item.content.expiresOn : undefined;
  if (!filename || !url) return null;
  return { filename, url, expiresOn };
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.type === filter);
  }, [items, filter]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/history?limit=50", { method: "GET" });
      const data = (await res.json().catch(() => null)) as
        | { items: HistoryItem[] }
        | { error: string; detail?: string; missing?: string[] }
        | null;

      if (!res.ok || !data) throw new Error("Failed to load history");
      if ("error" in data) {
        const missing = data.missing?.length ? ` Missing: ${data.missing.join(", ")}` : "";
        throw new Error(`${data.error}${data.detail ? ` — ${data.detail}` : ""}${missing}`);
      }

      setItems(data.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function copy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>History</CardTitle>
            <Badge variant="neutral">{items.length} items</Badge>
          </div>
          <CardDescription>
            Everything you generate and upload is stored in Cosmos DB and listed here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm font-medium">Filter</div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="generation">Generations</option>
              <option value="upload">Uploads</option>
              <option value="contact">Contacts</option>
            </select>
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh"}
            </Button>
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-border bg-destructive/10 p-3 text-sm text-foreground">
              <div className="font-medium">Error</div>
              <div className="mt-1 whitespace-pre-wrap text-muted-foreground">
                {error}
              </div>
            </div>
          ) : null}

          {filtered.length ? (
            <div className="mt-4 grid gap-3">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md border border-border bg-muted/10 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
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
                      <div className="text-sm font-medium">{item.title ?? "Untitled"}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{formatTime(item.createdAt)}</span>
                    </div>
                  </div>

                  {getGeneration(item) ? (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-md border border-border bg-background/40 p-3">
                        <div className="text-xs font-medium text-muted-foreground">Prompt</div>
                        <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                          {getGeneration(item)!.prompt}
                        </div>
                      </div>
                      <div className="rounded-md border border-border bg-background/40 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-medium text-muted-foreground">Output</div>
                          <Button
                            variant="secondary"
                            className="px-3 py-1 text-xs"
                            onClick={() => copy(getGeneration(item)!.content, item.id)}
                          >
                            {copiedId === item.id ? "Copied" : "Copy"}
                          </Button>
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                          {getGeneration(item)!.content}
                        </div>
                      </div>
                    </div>
                  ) : getUpload(item) ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-md border border-border bg-background/40 p-2">
                        <Image
                          src={getUpload(item)!.url}
                          alt={getUpload(item)!.filename}
                          width={1200}
                          height={800}
                          unoptimized
                          className="h-auto w-full rounded"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          File: <span className="font-mono">{getUpload(item)!.filename}</span>
                        </div>
                        {getUpload(item)!.expiresOn ? (
                          <div className="text-xs text-muted-foreground">
                            Expires: <span className="font-mono">{getUpload(item)!.expiresOn}</span>
                          </div>
                        ) : null}
                        <div className="text-xs font-medium">Share link</div>
                        <input
                          readOnly
                          value={getUpload(item)!.url}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                          onFocus={(e) => e.currentTarget.select()}
                        />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            variant="secondary"
                            className="px-3 py-1 text-xs"
                            onClick={() => copy(getUpload(item)!.url, item.id)}
                          >
                            {copiedId === item.id ? "Copied" : "Copy link"}
                          </Button>
                          <a
                            href={getUpload(item)!.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1 text-xs font-medium hover:bg-muted"
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <pre className="mt-3 whitespace-pre-wrap rounded bg-background/40 p-3 text-xs text-foreground">
                      {JSON.stringify(item.content, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              {loading
                ? "Loading…"
                : "No history yet. Use Generate or Upload and then come back here."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

