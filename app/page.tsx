import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rackGroup } from "@/lib/utils";
import { LandingSearch } from "@/components/landing-search";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/transactions", label: "Transactions" },
  { href: "/reports", label: "Reports" },
  { href: "/storage", label: "Storage" },
];

export default async function LandingPage() {
  const yarns = await prisma.yarn.findMany({
    select: { location: true, quantity: true, reorderLevel: true },
  });
  const skuCount = yarns.length;
  const totalCones = yarns.reduce((s, y) => s + y.quantity, 0);
  const lowCount = yarns.filter((y) => y.quantity < y.reorderLevel).length;
  const rackCount = new Set(yarns.map((y) => rackGroup(y.location))).size;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1b1448] text-white">
      {/* cosmic backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(124,77,255,0.45),transparent_55%),radial-gradient(ellipse_at_80%_85%,rgba(255,141,84,0.40),transparent_55%),radial-gradient(circle_at_60%_45%,rgba(64,42,140,0.55),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.12]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#120d33] to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        {/* nav */}
        <header className="flex items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧵</span>
            <span className="text-lg font-semibold tracking-tight">YarnTrack</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-white/80 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="transition-colors hover:text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/dashboard"
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
          >
            Open app
          </Link>
        </header>

        {/* hero */}
        <main className="flex flex-1 flex-col justify-center pb-24 pt-10">
          <div className="max-w-2xl">
            <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Every cone,
              <br />
              accounted for.
            </h1>

            <div className="mt-5 flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span className="font-semibold text-emerald-300">live</span>
                <span className="text-white/70">{totalCones.toLocaleString()} cones 🧶</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="font-semibold text-amber-300">racks</span>
                <span className="text-white/70">{rackCount} zones 📦</span>
              </span>
            </div>

            <p className="mt-6 max-w-xl text-base leading-7 text-white/75">
              YarnTrack is the warehouse system for your yarn and thread stock.
              Track inventory by rack, log every movement in and out, and catch
              low stock before it stops a production run.
            </p>

            <div className="mt-9 max-w-xl">
              <LandingSearch />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1b1448] transition-transform hover:-translate-y-0.5"
              >
                Open Dashboard
              </Link>
              <Link
                href="/inventory"
                className="rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition-colors hover:bg-white/10"
              >
                Browse Inventory
              </Link>
            </div>
          </div>

          {/* feature row */}
          <div className="mt-16 grid max-w-3xl gap-4 sm:grid-cols-3">
            {[
              { icon: "📋", title: "Track", body: "Every yarn, by rack and supplier." },
              { icon: "🔄", title: "Move", body: "Log stock in and out, balance updates live." },
              { icon: "📊", title: "Report", body: "Low-stock alerts and monthly usage." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur transition-colors hover:bg-white/10"
              >
                <div className="text-xl">{f.icon}</div>
                <p className="mt-2 font-display font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-white/70">{f.body}</p>
              </div>
            ))}
          </div>
        </main>

        {/* footer strip */}
        <footer className="relative mb-8 ml-auto max-w-md rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm text-white/70 backdrop-blur">
          {skuCount} yarn types tracked · {lowCount} low on stock. Jump to{" "}
          <Link href="/reports" className="font-medium text-white hover:underline">
            Reports
          </Link>{" "}
          for the full picture.
        </footer>
      </div>
    </div>
  );
}
