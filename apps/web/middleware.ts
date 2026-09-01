import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Route-level RBAC. Each role may only enter its own area.
const ROLE_PREFIX: Record<string, string[]> = {
  "/citizen": ["CITIZEN", "ADMIN"],
  "/university": ["STUDENT", "FACULTY", "UNIVERSITY_ADMIN", "ADMIN"],
  "/industry": ["INDUSTRY", "ADMIN"],
  "/gov": ["GOVERNMENT", "ADMIN"],
  "/admin": ["ADMIN"],
};

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role as string | undefined;
    const entry = Object.entries(ROLE_PREFIX).find(([p]) => pathname.startsWith(p));
    if (entry && role && !entry[1].includes(role)) {
      return NextResponse.redirect(new URL("/login?error=forbidden", req.url));
    }
    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: ["/citizen/:path*", "/university/:path*", "/industry/:path*", "/gov/:path*", "/admin/:path*"],
};
