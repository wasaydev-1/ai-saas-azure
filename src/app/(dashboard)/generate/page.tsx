"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useMemo, useState } from "react";

type GenerateResponse =
  | { prompt: string; content: string }
  | { error: string; detail?: string; missing?: string[] };

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !submitting, [
    prompt,
    submitting,
  ]);

  async function onGenerate() {
    setSubmitting(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = (await res.json().catch(() => null)) as GenerateResponse | null;
      if (!res.ok || !data) {
        throw new Error("Request failed");
      }

      if ("error" in data) {
        const missing =
          data.missing?.length ? ` Missing: ${data.missing.join(", ")}` : "";
        throw new Error(`${data.error}${data.detail ? ` — ${data.detail}` : ""}${missing}`);
      }

      setResult(data.content ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate (AI)</CardTitle>
          <CardDescription>
            Enter a prompt and call <code className="font-mono">/api/generate</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="Write a product description for..."
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={!canSubmit} onClick={onGenerate}>
                {submitting ? "Generating…" : "Generate"}
              </Button>
              <Button
                variant="outline"
                disabled={submitting && !prompt}
                onClick={() => {
                  setPrompt("");
                  setResult("");
                  setError("");
                }}
              >
                Clear
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

            {result ? (
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="text-sm font-medium">Output</div>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {result}
                </pre>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

