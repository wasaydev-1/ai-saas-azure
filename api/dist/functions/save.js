import { app } from "@azure/functions";
import crypto from "node:crypto";
import { getCosmosClient, getCosmosConfigFromEnv } from "../lib/cosmos.js";
export async function save(req, _ctx) {
    const body = (await req.json().catch(() => null));
    const type = body?.type?.toString().trim();
    if (!type) {
        return { status: 400, jsonBody: { error: "Missing type" } };
    }
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
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const doc = {
        id,
        type,
        title: body?.title ?? null,
        content: body?.content ?? null,
        metadata: body?.metadata ?? null,
        createdAt: now,
    };
    const client = getCosmosClient(cfg);
    const { database } = await client.databases.createIfNotExists({ id: cfg.databaseId });
    const { container } = await database.containers.createIfNotExists({
        id: cfg.containerId,
        partitionKey: { paths: ["/type"] },
    });
    await container.items.create(doc);
    return {
        status: 200,
        jsonBody: doc,
    };
}
app.http("save", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "save",
    handler: save,
});
