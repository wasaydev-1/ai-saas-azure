import { app } from "@azure/functions";
export async function health(_req, _ctx) {
    return {
        status: 200,
        jsonBody: {
            ok: true,
            service: "ai-saas-api",
        },
    };
}
app.http("health", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "health",
    handler: health,
});
