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
import { useMemo, useState } from "react";
import Image from "next/image";

type UploadResponse =
  | {
      id: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
      blobName: string;
      url: string;
      expiresOn?: string;
    }
  | { error: string; detail?: string; missing?: string[] };

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [uploaded, setUploaded] = useState<{
    filename: string;
    url: string;
    sizeBytes: number;
    expiresOn?: string;
  } | null>(null);

  const canSubmit = useMemo(() => !!file && !submitting, [file, submitting]);

  async function onUpload() {
    if (!file) return;
    setSubmitting(true);
    setError("");
    setUploaded(null);
    setCopied(false);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result !== "string") return reject(new Error("Read failed"));
          const comma = result.indexOf(",");
          if (comma === -1) return reject(new Error("Unexpected file data"));
          resolve(result.slice(comma + 1));
        };
        reader.onerror = () => reject(new Error("Read failed"));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          base64,
        }),
      });

      const data = (await res.json().catch(() => null)) as UploadResponse | null;
      if (!res.ok || !data) throw new Error("Upload failed");
      if ("error" in data) {
        const missing =
          data.missing?.length ? ` Missing: ${data.missing.join(", ")}` : "";
        throw new Error(`${data.error}${data.detail ? ` — ${data.detail}` : ""}${missing}`);
      }

      setUploaded({
        filename: data.filename,
        url: data.url,
        sizeBytes: data.sizeBytes,
        expiresOn: data.expiresOn,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onCopy() {
    if (!uploaded?.url) return;
    try {
      await navigator.clipboard.writeText(uploaded.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Upload</CardTitle>
            <Badge variant="success">Auto-saved to History</Badge>
          </div>
          <CardDescription>
            Upload an image to Azure Blob Storage. You’ll get a time-limited share link (SAS URL).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Choose an image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full rounded-md border border-border bg-background p-2 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Keep it under ~10MB (this demo sends base64 JSON to the Function).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={!canSubmit} onClick={onUpload}>
                  {submitting ? "Uploading…" : "Upload"}
                </Button>
                <Button
                  variant="outline"
                  disabled={submitting && !file && !uploaded && !error}
                  onClick={() => {
                    setFile(null);
                    setUploaded(null);
                    setError("");
                    setCopied(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  disabled={!uploaded?.url}
                  onClick={onCopy}
                >
                  {copied ? "Copied" : "Copy link"}
                </Button>
              </div>

              {error ? (
                <div className="rounded-md border border-border bg-destructive/10 p-3 text-sm text-foreground">
                  <div className="font-medium">Error</div>
                  <div className="mt-1 whitespace-pre-wrap text-muted-foreground">
                    {error}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-md border border-border bg-muted/20 p-3">
              <div className="text-sm font-medium">Preview</div>
              {uploaded ? (
                <>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{uploaded.filename}</span> ·{" "}
                    <span className="font-mono">{uploaded.sizeBytes}</span> bytes
                    {uploaded.expiresOn ? (
                      <>
                        {" "}
                        · Expires: <span className="font-mono">{uploaded.expiresOn}</span>
                      </>
                    ) : null}
                  </p>
                  <div className="mt-3 rounded-md border border-border bg-background p-2">
                    <Image
                      src={uploaded.url}
                      alt={uploaded.filename}
                      width={1200}
                      height={800}
                      unoptimized
                      className="h-auto w-full rounded"
                    />
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-medium">Share link</div>
                    <input
                      readOnly
                      value={uploaded.url}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                      onFocus={(e) => e.currentTarget.select()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Anyone with the link can view the file until it expires.
                    </p>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload an image to see its preview and share link here.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

