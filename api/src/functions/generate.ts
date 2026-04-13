import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AzureOpenAI } from "openai";
import type { SpeechCreateParams } from "openai/resources/audio/speech";

const TTS_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "onyx",
  "nova",
  "sage",
  "shimmer",
  "verse",
]);

const MIME_BY_FORMAT: Record<string, string> = {
  mp3: "audio/mpeg",
  opus: "audio/opus",
  aac: "audio/aac",
  flac: "audio/flac",
  wav: "audio/wav",
  pcm: "audio/pcm",
};

export async function generate(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await req.json().catch(() => null)) as
    | {
        prompt?: string;
        voice?: string;
        response_format?: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
        instructions?: string;
      }
    | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) {
    return {
      status: 400,
      jsonBody: { error: "Missing prompt" },
    };
  }

  if (prompt.length > 4096) {
    return {
      status: 400,
      jsonBody: { error: "Prompt too long for TTS (max 4096 characters)" },
    };
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2025-01-01-preview";

  if (!endpoint || !apiKey || !deployment) {
    return {
      status: 501,
      jsonBody: {
        error: "Azure OpenAI not configured",
        missing: [
          !endpoint ? "AZURE_OPENAI_ENDPOINT" : null,
          !apiKey ? "AZURE_OPENAI_API_KEY" : null,
          !deployment ? "AZURE_OPENAI_DEPLOYMENT" : null,
        ].filter(Boolean),
      },
    };
  }

  const defaultVoice = process.env.AZURE_OPENAI_DEFAULT_VOICE?.trim() || "alloy";
  const preferred = body?.voice?.trim() || defaultVoice;
  const voice = TTS_VOICES.has(preferred) ? preferred : "alloy";
  const response_format = body?.response_format ?? "mp3";
  const instructions = body?.instructions?.trim();

  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
  });

  try {
    const speech = await client.audio.speech.create({
      model: deployment,
      input: prompt,
      voice: voice as SpeechCreateParams["voice"],
      response_format,
      ...(instructions ? { instructions } : {}),
    });

    const buf = Buffer.from(await speech.arrayBuffer());
    const mimeType = MIME_BY_FORMAT[response_format] ?? "application/octet-stream";

    return {
      status: 200,
      jsonBody: {
        kind: "tts",
        prompt,
        voice,
        response_format,
        mimeType,
        audioBase64: buf.toString("base64"),
      },
    };
  } catch (err) {
    const anyErr = err as unknown as {
      message?: string;
      status?: number;
      code?: string;
      error?: {
        code?: string;
        message?: string;
        type?: string;
        param?: string;
      };
      response?: { status?: number };
    };
    const status = anyErr?.status ?? anyErr?.response?.status;
    const code = anyErr?.code ?? anyErr?.error?.code;
    const azureMessage = anyErr?.error?.message;
    const azureMeta =
      anyErr?.error && typeof anyErr.error === "object"
        ? JSON.stringify(
            {
              type: anyErr.error.type,
              param: anyErr.error.param,
            },
            null,
            0,
          )
        : null;
    const message =
      anyErr?.message ?? azureMessage ?? "OpenAI request failed";
    const detail = [
      status ? `status=${status}` : null,
      code ? `code=${code}` : null,
      message,
      azureMessage && azureMessage !== message ? azureMessage : null,
      azureMeta && azureMeta !== "{}" ? azureMeta : null,
    ]
      .filter(Boolean)
      .join(" ");
    return {
      status: 502,
      jsonBody: { error: "Generate failed", detail },
    };
  }
}

app.http("generate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "generate",
  handler: generate,
});
