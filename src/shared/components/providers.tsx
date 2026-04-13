"use client";

import { AuthProvider } from "@/shared/contexts/auth-context";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster richColors position="top-right" closeButton />
    </AuthProvider>
  );
}
