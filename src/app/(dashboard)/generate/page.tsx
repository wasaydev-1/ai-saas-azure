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

type GenerateResponse =
  | { prompt: string; content: string }
  | { error: string; detail?: string; missing?: string[] };

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !submitting, [
    prompt,
    submitting,
  ]);

  async function onGenerate() {
    setSubmitting(true);
    setError("");
    setResult("");
    setCopied(false);
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

  async function onCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  const examples = [
    "Write a product description for a minimalist desk lamp.",
    "Draft a short support reply to a refund request (polite, firm).",
    "Summarize these notes into 5 bullet points: ...",
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Generate</CardTitle>
            <Badge variant="success">Auto-saved to History</Badge>
          </div>
          <CardDescription>
            Create text with your Azure OpenAI deployment. Results are automatically stored in{" "}
            <code className="font-mono">History</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={10}
                placeholder="Ask for a product description, email draft, summary, etc."
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-slate-700 hover:bg-muted"
                    onClick={() => setPrompt(ex)}
                  >
                    {ex.slice(0, 28)}…
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button disabled={!canSubmit} onClick={onGenerate}>
                  {submitting ? "Generating…" : "Generate"}
                </Button>
                <Button
                  variant="outline"
                  disabled={submitting && !prompt && !result && !error}
                  onClick={() => {
                    setPrompt("");
                    setResult("");
                    setError("");
                    setCopied(false);
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  disabled={!result}
                  onClick={onCopy}
                >
                  {copied ? "Copied" : "Copy output"}
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

              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Output</div>
                  <div className="text-xs text-muted-foreground">
                    {result ? `${result.length} chars` : "—"}
                  </div>
                </div>
                <pre className="mt-2 min-h-44 whitespace-pre-wrap text-sm text-foreground">
                  {result || "Generate something to see it here."}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

