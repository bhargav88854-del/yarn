"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/sign-out-button";
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  BarChart3,
  Warehouse,
  ShoppingCart,
  QrCode,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/reorder", label: "Reorder", icon: ShoppingCart },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/storage", label: "Storage Layout", icon: Warehouse },
  { href: "/labels", label: "QR Labels", icon: QrCode },
];

/** Shared sidebar content — used by the desktop rail and the mobile drawer. */
export function SidebarNav({
  onNavigate,
  userName,
}: {
  onNavigate?: () => void;
  userName?: string | null;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-card">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 border-b px-5 py-5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-xl">
          🧵
        </span>
        <div className="leading-tight">
          <p className="font-display font-semibold tracking-tight">YarnTrack</p>
          <p className="text-xs text-muted-foreground">Inventory System</p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-1 pt-2 text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground/70">
          Manage
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Unit: Cones · Low stock &lt; 50
      </div>

      <SignOutButton name={userName} />
    </div>
  );
}

/** Desktop sidebar rail (hidden on mobile). */
export function Sidebar({ userName }: { userName?: string | null }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r md:block">
      <SidebarNav userName={userName} />
    </aside>
  );
}
