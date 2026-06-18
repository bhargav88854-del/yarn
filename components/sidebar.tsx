"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  BarChart3,
  Warehouse,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/storage", label: "Storage Layout", icon: Warehouse },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-card sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b">
        <span className="text-2xl">🧵</span>
        <div className="leading-tight">
          <p className="font-semibold tracking-tight">YarnTrack</p>
          <p className="text-xs text-muted-foreground">Inventory System</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t px-5 py-3 text-xs text-muted-foreground">
        Unit: Cones · Low stock &lt; 50
      </div>
    </aside>
  );
}
