import { cookies } from "next/headers";
import { getApiBaseUrl } from "@/lib/api-url";

type FetcherInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

/**
 * Server-side fetch helper: forwards cookies for authenticated SSR / RSC calls.
 */
export async function serverFetch<T>(
  path: string,
  init: FetcherInit = {},
): Promise<T> {
  const base = getApiBaseUrl();
  const cookieStore = await cookies();

  const url = path.startsWith("http") ? path : `${base}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieStore.toString(),
      ...(init.headers ?? {}),
    },
    cache: init.cache ?? "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`serverFetch ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}
