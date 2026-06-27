import type { NextAuthConfig } from "next-auth";

// Routes that require a signed-in user. Everything else (landing page, login)
// stays public. Kept here — separate from auth.ts — so the Edge middleware can
// import it without pulling in Prisma/bcrypt (which can't run on the Edge).
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/inventory",
  "/transactions",
  "/reorder",
  "/reports",
  "/storage",
  "/labels",
  "/api/yarns",
  "/api/transactions",
  "/api/reports",
];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [], // real provider is added in auth.ts (Node runtime only)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname === "/login") {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      const isProtected = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
      );
      if (isProtected) {
        if (isLoggedIn) return true;
        // API routes must answer with JSON, not an HTML login redirect, so fetch
        // callers get a parseable { error } instead of throwing on res.json().
        if (pathname.startsWith("/api/")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        return false; // pages => redirect to /login
      }

      return true; // public route
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
