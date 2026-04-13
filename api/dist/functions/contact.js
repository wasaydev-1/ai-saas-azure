import { app } from "@azure/functions";
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
export async function contact(req, _ctx) {
    const body = (await req.json().catch(() => null));
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
