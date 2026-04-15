import { app, } from "@azure/functions";
import { BlobSASPermissions, BlobServiceClient, SASProtocol, StorageSharedKeyCredential, generateBlobSASQueryParameters, } from "@azure/storage-blob";
import crypto from "node:crypto";
import { getCosmosClient, getCosmosConfigFromEnv } from "../lib/cosmos.js";
function getStorageConnectionString() {
    return (process.env.AZURE_STORAGE_CONNECTION_STRING ??
        process.env.AzureWebJobsStorage ??
        null);
}
function parseAccountFromConnectionString(connectionString) {
    const parts = new Map(connectionString
        .split(";")
        .map((kv) => kv.split("=", 2))
        .filter((x) => x.length === 2));
    const accountName = parts.get("AccountName");
    const accountKey = parts.get("AccountKey");
    const endpointSuffix = parts.get("EndpointSuffix") ?? "core.windows.net";
    const defaultEndpointsProtocol = parts.get("DefaultEndpointsProtocol") ?? "https";
    if (!accountName || !accountKey)
        return null;
    return { accountName, accountKey, endpointSuffix, defaultEndpointsProtocol };
}
function sanitizeFilename(filename) {
    // Remove path separators and shrink whitespace.
    return filename
        .replace(/[\\/]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 180);
}
export async function upload(req, _ctx) {
    const body = (await req.json().catch(() => null));
    const filename = body?.filename?.trim();
    const contentType = body?.contentType?.trim() || "application/octet-stream";
    const base64 = body?.base64?.trim();
    if (!filename || !base64) {
        return {
            status: 400,
            jsonBody: {
                error: "Missing filename/base64",
            },
        };
    }
    const connectionString = getStorageConnectionString();
    if (!connectionString) {
        return {
            status: 501,
            jsonBody: {
                error: "Azure Storage not configured",
                missing: ["AZURE_STORAGE_CONNECTION_STRING (or AzureWebJobsStorage)"],
            },
        };
    }
    const containerName = (process.env.AZURE_STORAGE_CONTAINER ?? "uploads").toLowerCase();
    const sasMinutes = Number(process.env.AZURE_STORAGE_SAS_MINUTES ?? "60");
    const sasTtlMinutes = Number.isFinite(sasMinutes) ? sasMinutes : 60;
    const safeFilename = sanitizeFilename(filename);
    const ext = safeFilename.includes(".")
        ? safeFilename.slice(safeFilename.lastIndexOf("."))
        : "";
    const id = crypto.randomUUID();
    const blobName = `upl/${id}${ext}`;
    let buf;
    try {
        buf = Buffer.from(base64, "base64");
    }
    catch {
        return {
            status: 400,
            jsonBody: { error: "Invalid base64" },
        };
    }
    // 10MB limit for JSON-base64 uploads (keeps Function memory/latency sane).
    const maxBytes = Number(process.env.UPLOAD_MAX_BYTES ?? `${10 * 1024 * 1024}`);
    if (buf.byteLength > maxBytes) {
        return {
            status: 413,
            jsonBody: {
                error: "File too large",
                maxBytes,
                sizeBytes: buf.byteLength,
            },
        };
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(buf, {
        blobHTTPHeaders: {
            blobContentType: contentType,
            blobContentDisposition: `inline; filename=\"${safeFilename}\"`,
        },
    });
    // Return a SAS URL so you can share without making the container public.
    const parsed = parseAccountFromConnectionString(connectionString);
    if (!parsed) {
        return {
            status: 200,
            jsonBody: {
                id,
                filename: safeFilename,
                contentType,
                sizeBytes: buf.byteLength,
                blobName,
                url: blockBlobClient.url,
            },
        };
    }
    const sharedKeyCredential = new StorageSharedKeyCredential(parsed.accountName, parsed.accountKey);
    const startsOn = new Date(Date.now() - 2 * 60 * 1000);
    const expiresOn = new Date(Date.now() + sasTtlMinutes * 60 * 1000);
    const sas = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
    }, sharedKeyCredential).toString();
    const url = `${blockBlobClient.url}?${sas}`;
    // Best-effort history save (doesn't block the response if Cosmos is misconfigured).
    try {
        const cfg = getCosmosConfigFromEnv();
        if (cfg) {
            const container = getCosmosClient(cfg)
                .database(cfg.databaseId)
                .container(cfg.containerId);
            await container.items.create({
                id: crypto.randomUUID(),
                type: "upload",
                title: safeFilename,
                content: {
                    filename: safeFilename,
                    contentType,
                    sizeBytes: buf.byteLength,
                    blobName,
                    url,
                    expiresOn: expiresOn.toISOString(),
                },
                metadata: { container: containerName },
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
            id,
            filename: safeFilename,
            contentType,
            sizeBytes: buf.byteLength,
            blobName,
            url,
            expiresOn: expiresOn.toISOString(),
        },
    };
}
app.http("upload", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "upload",
    handler: upload,
});
