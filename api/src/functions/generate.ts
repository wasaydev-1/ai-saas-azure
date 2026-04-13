import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

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

  // Placeholder: later wire to Azure OpenAI (via env vars + SDK) and persist to Cosmos DB.
  return {
    status: 200,
    jsonBody: {
      prompt,
      content: `Stub response for: ${prompt}`,
    },
  };
}

app.http("generate", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "generate",
  handler: generate,
});

