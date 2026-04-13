import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  kind?: "contact" | "feedback" | string;
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function contact(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await req.json().catch(() => null)) as ContactBody | null;

  const email = body?.email?.trim();
  const message = body?.message?.trim();

  if (!email || !isValidEmail(email) || !message) {
    return {
      status: 400,
      jsonBody: {
        error: "Missing/invalid email or message",
      },
    };
  }

  // Placeholder: later trigger Azure Logic Apps (email automation) and optionally save to Cosmos DB.
  return {
    status: 200,
    jsonBody: {
      ok: true,
      kind: body?.kind ?? "contact",
      receivedAt: new Date().toISOString(),
    },
  };
}

app.http("contact", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "contact",
  handler: contact,
});

