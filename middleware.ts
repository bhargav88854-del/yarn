import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Edge middleware uses only the slim config (no Prisma/bcrypt). The `authorized`
// callback decides access; protected routes redirect to /login when signed out.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Run on everything except NextAuth's own routes, Next internals, and files.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|fonts).*)",
  ],
};
