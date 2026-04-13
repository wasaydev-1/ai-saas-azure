/**
 * Base URL for REST calls.
 *
 * In the browser, always use same-origin `/api/v1` so requests go through the Next.js
 * proxy (`app/api/v1/[...path]`) to `BACKEND_API_URL`. Calling the backend host directly
 * from the page would trigger CORS (and OPTIONS preflight) on the API server.
 *
 * On the server, use an absolute URL to this app’s proxy so `serverFetch` can reach it.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const pub = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (pub?.startsWith("/")) return pub;
    if (
      pub?.startsWith("http") &&
      pub.includes(window.location.host)
    ) {
      return pub;
    }
    return "/api/v1";
  }

  const internal = process.env.INTERNAL_API_URL?.replace(/\/$/, "");
  if (internal) {
    return internal.endsWith("/api/v1") ? internal : `${internal}/api/v1`;
  }
  const port = process.env.PORT ?? "3000";
  const host =
    process.env.VERCEL_URL != null
      ? `https://${process.env.VERCEL_URL}`
      : `http://127.0.0.1:${port}`;
  return `${host}/api/v1`;
}
