"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import { Button } from "@/shared/ui/button";
import { Eye, EyeOff, Shield, Sparkles, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { APP_ROUTES } from "@/shared/constants/routes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Signed in", {
        description: "Opening the dashboard…",
        duration: 6000,
      });
      await new Promise((r) => setTimeout(r, 900));
      router.push(APP_ROUTES.dashboard);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-[#0078D7] lg:flex lg:w-1/2">
        <Image
          src="/assets/brand/style.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-30"
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm">
              <Sparkles className="size-7" />
            </div>
            <div>
              <h1 className="text-2xl">DataNex</h1>
              <p className="text-sm text-white/80">Master Data Platform</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl leading-tight">
                Master Your Data,
                <br />
                Empower Your Business
              </h2>
              <p className="max-w-md text-lg text-white/90">
                The ultimate platform for cleansing, validating, and
                standardizing your master data across all domains.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
                  <Shield className="size-5" />
                </div>
                <div>
                  <p className="text-white">Enterprise-Grade Security</p>
                  <p className="text-sm text-white/70">
                    Bank-level encryption &amp; compliance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
                  <Zap className="size-5" />
                </div>
                <div>
                  <p className="text-white">Lightning Fast Processing</p>
                  <p className="text-sm text-white/70">
                    Process millions of records instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-white/70">
            © 2025 DataNex. All rights reserved.
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-[#F8FAFB] p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-12 items-center justify-center rounded-lg bg-[#0078D7]">
              <Sparkles className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl text-[#1E1E1E]">DataNex</h1>
              <p className="text-sm text-slate-500">Master Data Platform</p>
            </div>
          </div>

          <div className="space-y-6 rounded-xl border border-[#E0E0E0] bg-white p-8 shadow-lg">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1E1E1E]">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#1E1E1E]"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-[#E0E0E0] bg-[#F3F4F6] px-3 text-sm text-[#1E1E1E] outline-none transition-all placeholder:text-slate-500 focus:border-[#0078D7] focus:ring-2 focus:ring-[#0078D7]/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#1E1E1E]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 w-full rounded-lg border border-[#E0E0E0] bg-[#F3F4F6] px-3 pr-10 text-sm text-[#1E1E1E] outline-none transition-all placeholder:text-slate-500 focus:border-[#0078D7] focus:ring-2 focus:ring-[#0078D7]/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-[#1E1E1E]"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border border-[#E0E0E0] accent-[#0078D7]"
                  />
                  <span className="text-sm text-[#1E1E1E]">Remember me</span>
                </label>
                <Link
                  href="#"
                  className="text-sm text-[#0078D7] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-lg bg-[#0078D7] text-white hover:bg-[#0056A3] disabled:opacity-60"
              >
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E0E0E0]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-[#E0E0E0] hover:border-[#0078D7] hover:bg-[#F8FAFB]"
                onClick={() => toast.message("Connect Google OAuth")}
              >
                <svg className="mr-2 size-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-lg border-[#E0E0E0] hover:border-[#0078D7] hover:bg-[#F8FAFB]"
                onClick={() => toast.message("Connect Apple OAuth")}
              >
                <svg
                  className="mr-2 size-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                Apple
              </Button>
            </div>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="#" className="text-[#0078D7] hover:underline">
                Contact Sales
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Shield className="size-4" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="size-4" />
              <span>SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
