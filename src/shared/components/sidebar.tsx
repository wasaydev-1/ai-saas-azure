"use client";

import { APP_ROUTES } from "@/shared/constants/routes";
import { brandAssetPaths } from "@/shared/assets/brand/paths";
import { useAuth } from "@/shared/contexts/auth-context";
import { cn } from "@/shared/utils/cn";
import {
  LayoutDashboard,
  LogOut,
  Sparkles,
  Upload,
  History,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const nav = [
  { href: APP_ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: APP_ROUTES.generate, label: "Generate", icon: Sparkles },
  { href: APP_ROUTES.upload, label: "Upload", icon: Upload },
  { href: APP_ROUTES.history, label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const onLogout = () => {
    logout();
    toast.success("Signed out");
    router.push(APP_ROUTES.login);
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        sidebarCollapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 border-b border-sidebar-border px-3 py-4">
        <Link
          href={APP_ROUTES.dashboard}
          className={cn(
            "flex min-w-0 flex-1 items-center",
            sidebarCollapsed && "justify-center",
          )}
        >
          <Image
            src={brandAssetPaths.logo}
            alt="AISLERIS"
            width={200}
            height={28}
            priority
            className="h-7 w-auto max-w-[180px]"
          />
        </Link>
        <button
          type="button"
          onClick={() => setSidebarCollapsed((c) => !c)}
          className="hidden rounded-md p-2 text-slate-500 hover:bg-sidebar-muted hover:text-slate-900 lg:inline-flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[hsl(var(--brand-navy))] text-white shadow-sm"
                  : "text-slate-700 hover:bg-sidebar-muted",
                sidebarCollapsed && "justify-center px-2",
              )}
            >
              <Icon className="size-5 shrink-0 opacity-90" />
              {!sidebarCollapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={onLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-sidebar-muted",
            sidebarCollapsed && "justify-center",
          )}
        >
          <LogOut className="size-5 shrink-0" />
          {!sidebarCollapsed ? <span>Logout</span> : null}
        </button>
      </div>
    </aside>
  );
}
