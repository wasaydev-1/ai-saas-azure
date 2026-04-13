import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

type UploadBody = {
  filename?: string;
  contentType?: string;
  /**
   * Base64 file contents (no data-url prefix).
   * Later we will switch to direct-to-Blob SAS uploads for large files.
   */
  base64?: string;
};

export async function upload(
  req: HttpRequest,
  _ctx: InvocationContext,
): Promise<HttpResponseInit> {
  const body = (await req.json().catch(() => null)) as UploadBody | null;

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

  // Placeholder: later store to Azure Blob Storage and return the blob URL.
  // For now, return a fake reference so the frontend can be built end-to-end.
  const id = `upl_${Date.now()}`;

  return {
    status: 200,
    jsonBody: {
      id,
      filename,
      contentType,
      sizeBytesApprox: Math.floor((base64.length * 3) / 4),
      url: `/uploads/${id}/${encodeURIComponent(filename)}`,
    },
  };
}

app.http("upload", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "upload",
  handler: upload,
});

