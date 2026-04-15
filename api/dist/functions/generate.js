import { app } from "@azure/functions";
import { AzureOpenAI } from "openai";
import crypto from "node:crypto";
import { getCosmosClient, getCosmosConfigFromEnv } from "../lib/cosmos.js";
export async function generate(req, _ctx) {
    const body = (await req.json().catch(() => null));
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
    const client = new AzureOpenAI({
        endpoint,
        apiKey,
        apiVersion,
        deployment,
    });
    try {
        const result = await client.chat.completions.create({
            model: deployment,
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Reply concisely and clearly. If you must assume, say so.",
                },
                { role: "user", content: prompt },
            ],
            max_completion_tokens: 400,
        });
        const content = result.choices?.[0]?.message?.content ?? "";
        // Best-effort history save (doesn't block the response if Cosmos is misconfigured).
        try {
            const cfg = getCosmosConfigFromEnv();
            if (cfg) {
                const container = getCosmosClient(cfg)
                    .database(cfg.databaseId)
                    .container(cfg.containerId);
                await container.items.create({
                    id: crypto.randomUUID(),
                    type: "generation",
                    title: prompt.slice(0, 80) || "generation",
                    content: { prompt, content },
                    metadata: { model: deployment },
                    createdAt: new Date().toISOString(),
                });
            }
        }
        catch {
            // ignore
        }
        return {
            status: 200,
            jsonBody: {
                prompt,
                content,
            },
        };
    }
    catch (err) {
        const anyErr = err;
        const status = anyErr?.status ?? anyErr?.response?.status;
        const code = anyErr?.code ?? anyErr?.error?.code;
        const azureMessage = anyErr?.error?.message;
        const azureMeta = anyErr?.error && typeof anyErr.error === "object"
            ? JSON.stringify({
                type: anyErr.error.type,
                param: anyErr.error.param,
            }, null, 0)
            : null;
        const message = anyErr?.message ?? azureMessage ?? "OpenAI request failed";
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
