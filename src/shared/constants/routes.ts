export const APP_ROUTES = {
  landing: "/",
  dashboard: "/dashboard",
  generate: "/generate",
  upload: "/upload",
  history: "/history",
  login: "/login",
} as const;

/**
 * Route segments (pathname prefixes) that require specific roles.
 * Empty array means any authenticated role is allowed.
 */
export const ROUTE_ROLE_RULES: Record<string, string[]> = {
  // Add role gates here when auth/roles are implemented.
};

export const ROUTE_TITLES: Record<string, string> = {
  [APP_ROUTES.landing]: "Landing",
  [APP_ROUTES.dashboard]: "Dashboard",
  [APP_ROUTES.generate]: "Generate",
  [APP_ROUTES.upload]: "Upload",
  [APP_ROUTES.history]: "History",
};

export function getDashboardTitle(pathname: string): string {
  const entry = Object.entries(ROUTE_TITLES).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return entry?.[1] ?? "Aisleris";
}

export function getRequiredRoles(pathname: string): string[] | null {
  const entry = Object.entries(ROUTE_ROLE_RULES).find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!entry) return null;
  return entry[1];
}
