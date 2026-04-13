import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

type SaveBody = {
  type?: "generation" | "upload" | "contact" | string;
  title?: string;
  content?: unknown;
  metadata?: Record<string, unknown>;
};

export async function save(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await req.json().catch(() => null)) as SaveBody | null;

  const type = body?.type?.toString().trim();
  if (!type) {
    return { status: 400, jsonBody: { error: "Missing type" } };
  }

  // Placeholder: later persist to Cosmos DB (and return its id + timestamps).
  const id = `sav_${Date.now()}`;

  return {
    status: 200,
    jsonBody: {
      id,
      type,
      title: body?.title ?? null,
      content: body?.content ?? null,
      metadata: body?.metadata ?? null,
      createdAt: new Date().toISOString(),
    },
  };
}

app.http("save", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "save",
  handler: save,
});

