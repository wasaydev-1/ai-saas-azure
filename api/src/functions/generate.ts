import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { AzureOpenAI } from "openai";

export async function generate(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await req.json().catch(() => null)) as
    | { prompt?: string }
    | null;

  const prompt = body?.prompt?.trim();
  if (!prompt) {
    return {
      status: 400,
      jsonBody: { error: "Missing prompt" },
    };
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2025-04-01-preview";

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

  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
  });

  try {
    const result = await client.chat.completions.create({
      model: "",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Reply concisely and clearly. If you must assume, say so.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const content = result.choices?.[0]?.message?.content ?? "";
    return {
      status: 200,
      jsonBody: { prompt, content },
    };
  } catch (err) {
    const detail = err instanceof Error ? err.message : "OpenAI request failed";
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

