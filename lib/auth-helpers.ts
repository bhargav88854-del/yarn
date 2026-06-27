import { auth } from "@/auth";

/** True when the current session belongs to an admin. */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === "admin";
}
