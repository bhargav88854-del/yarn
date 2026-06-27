import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Middleware already gates these routes; this is defence in depth and gives
  // the nav the signed-in user's name.
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userName = session.user.name ?? session.user.email;

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav userName={userName} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
