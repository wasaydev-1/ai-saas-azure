"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { getInitials } from "@/shared/utils/initials";

function formatHeaderDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

function roleLabel(roles: string[] | undefined) {
  if (!roles?.length) return "Operator";
  if (roles.includes("admin")) return "Administrator";
  return roles[0]!.replace(/_/g, " ");
}

export function Navbar() {
  const { user } = useAuth();
  const displayName = user?.name ?? "Admin User";
  const initials = getInitials(displayName);

  return (
    <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4 sm:gap-6">
        <time
          className="hidden text-sm text-slate-500 sm:block"
          dateTime={new Date().toISOString()}
        >
          {formatHeaderDate(new Date())}
        </time>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[hsl(var(--brand-navy))] text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <div className="text-sm font-semibold text-slate-900">
              {displayName}
            </div>
            <div className="text-xs text-slate-500">
              {roleLabel(user?.roles)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
