import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getCosmosClient, getCosmosConfigFromEnv } from "../lib/cosmos.js";

export async function history(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  const cfg = getCosmosConfigFromEnv();
  if (!cfg) {
    return {
      status: 501,
      jsonBody: {
        error: "Cosmos DB not configured",
        missing: [
          !process.env.COSMOS_DB_ENDPOINT ? "COSMOS_DB_ENDPOINT" : null,
          !process.env.COSMOS_DB_KEY ? "COSMOS_DB_KEY" : null,
          !process.env.COSMOS_DB_DATABASE ? "COSMOS_DB_DATABASE" : null,
          !process.env.COSMOS_DB_CONTAINER ? "COSMOS_DB_CONTAINER" : null,
        ].filter(Boolean),
      },
    };
  }

  const type = req.query.get("type")?.trim() || null;
  const limitRaw = Number(req.query.get("limit") ?? "25");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 25;

  const client = getCosmosClient(cfg);
  const container = client.database(cfg.databaseId).container(cfg.containerId);

  const querySpec = type
    ? {
        query:
          "SELECT TOP @limit c.id, c.type, c.title, c.content, c.metadata, c.createdAt FROM c WHERE c.type = @type ORDER BY c.createdAt DESC",
        parameters: [
          { name: "@type", value: type },
          { name: "@limit", value: limit },
        ],
      }
    : {
        query:
          "SELECT TOP @limit c.id, c.type, c.title, c.content, c.metadata, c.createdAt FROM c ORDER BY c.createdAt DESC",
        parameters: [{ name: "@limit", value: limit }],
      };

  const { resources } = await container.items.query(querySpec).fetchAll();
  return { status: 200, jsonBody: { items: resources } };
}

app.http("history", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "history",
  handler: history,
});

