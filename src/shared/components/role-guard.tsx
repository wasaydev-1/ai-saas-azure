"use client";

import { useAuth } from "@/shared/contexts/auth-context";

type RoleGuardProps = {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

/**
 * Client-side guard for conditional UI. Middleware remains the source of truth for routes.
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const userRoles = useAuth().user?.roles ?? [];
  const allowed = roles.some((r) => userRoles.includes(r));
  if (!allowed) return fallback;
  return children;
}
