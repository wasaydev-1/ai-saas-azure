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
  | {
      kind: "tts";
      prompt: string;
      voice: string;
      response_format: string;
      mimeType: string;
      audioBase64: string;
    }
  | { error: string; detail?: string; missing?: string[] };

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [ttsMeta, setTtsMeta] = useState<{ voice: string; format: string } | null>(
    null,
  );
  const [error, setError] = useState<string>("");

  const canSubmit = useMemo(() => prompt.trim().length > 0 && !submitting, [
    prompt,
    submitting,
  ]);

  async function onGenerate() {
    setSubmitting(true);
    setError("");
    setAudioSrc(null);
    setTtsMeta(null);
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

      if (data.kind !== "tts" || !data.audioBase64) {
        throw new Error("Unexpected response shape");
      }
      setTtsMeta({ voice: data.voice, format: data.response_format });
      setAudioSrc(`data:${data.mimeType};base64,${data.audioBase64}`);
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
            Enter text to speak. The API uses your Azure deployment (e.g.{" "}
            <code className="font-mono">gpt-4o-mini-tts</code>) via{" "}
            <code className="font-mono">/api/generate</code>.
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
                placeholder="Type the sentence you want read aloud…"
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={!canSubmit} onClick={onGenerate}>
                {submitting ? "Synthesizing…" : "Speak text"}
              </Button>
              <Button
                variant="outline"
                disabled={submitting && !prompt}
                onClick={() => {
                  setPrompt("");
                  setAudioSrc(null);
                  setTtsMeta(null);
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

            {audioSrc ? (
              <div className="rounded-md border border-border bg-muted/20 p-3">
                <div className="text-sm font-medium">Audio</div>
                {ttsMeta ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Voice: <span className="font-mono">{ttsMeta.voice}</span> · Format:{" "}
                    <span className="font-mono">{ttsMeta.format}</span>
                  </p>
                ) : null}
                <audio
                  className="mt-3 w-full"
                  controls
                  src={audioSrc}
                  preload="metadata"
                />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

