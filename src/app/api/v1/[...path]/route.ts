import { NextRequest, NextResponse } from "next/server";

/** Backend origin + `/api/v1` (matches real API paths like `/api/v1/auth/login`). */
function getBackendApiRoot() {
  const raw =
    process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";
  if (/\/api\/v\d+$/i.test(raw)) return raw;
  return `${raw}/api/v1`;
}

async function proxy(
  req: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = pathSegments.join("/");
  const target = new URL(`${getBackendApiRoot()}/${path}`);
  target.search = req.nextUrl.search;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (["host", "connection"].includes(lower)) return;
    headers.set(key, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    const body = await req.arrayBuffer();
    if (body.byteLength) init.body = body;
  }

  try {
    const res = await fetch(target, init);
    const outHeaders = new Headers(res.headers);
    return new NextResponse(res.body, {
      status: res.status,
      headers: outHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream request failed";
    return NextResponse.json(
      { error: "Bad Gateway", detail: message },
      { status: 502 },
    );
  }
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function OPTIONS(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
