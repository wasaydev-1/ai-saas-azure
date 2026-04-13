import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];
const PROTECTED_PREFIX = [
  "/dashboard",
  "/generate",
  "/upload",
  "/history",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // -----------------------------------------
  // 1. SKIP NEXT INTERNALS & STATIC FILES
  // -----------------------------------------
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // -----------------------------------------
  // 2. GET TOKEN (cookie preferred)
  // -----------------------------------------
  const token = req.cookies.get("accessToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_PREFIX.some((route) =>
    pathname.startsWith(route),
  );

  // -----------------------------------------
  // 3. REDIRECT LOGIC
  // -----------------------------------------

  // Not logged in → trying to access protected route
  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in → trying to access login/signup
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // -----------------------------------------
  // 4. PASS THROUGH
  // -----------------------------------------
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     Apply middleware to all routes EXCEPT:
     - api
     - _next (static + RSC)
     - static files
    */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/",
  ],
};
