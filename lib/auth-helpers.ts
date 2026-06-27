import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** True when the current session belongs to an admin. */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}

/**
 * Guard for admin-only route handlers: returns a 403 response to return early,
 * or null when the caller is an admin and may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}
