const AUTH_COOKIE = "accessToken";

export function setAuthCookie(token: string, maxAgeSeconds = 60 * 60 * 8) {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getAuthCookieName() {
  return AUTH_COOKIE;
}
