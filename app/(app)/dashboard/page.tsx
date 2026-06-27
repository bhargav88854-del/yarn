import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { DashboardStats } from "@/components/dashboard-stats";
import { LowStockAlert } from "@/components/low-stock-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard",
  description: "Warehouse stock overview",
};

export default async function DashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [allYarns, movements30d] = await Promise.all([
    prisma.yarn.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.transaction.count({ where: { date: { gte: thirtyDaysAgo } } }),
  ]);

  const totalStock = allYarns.reduce((s, y) => s + y.quantity, 0);
  const totalValue = allYarns.reduce((s, y) => s + y.quantity * y.costPerCone, 0);
  const lowStock = allYarns
    .filter((y) => y.quantity < y.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity);
  const recent = allYarns.slice(0, 6);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Warehouse stock overview at a glance"
        icon={<LayoutDashboard className="h-5 w-5" />}
      />
      <div className="animate-fade-in-up space-y-6 p-5 sm:p-8">
        <DashboardStats
          totalStock={totalStock}
          totalValue={totalValue}
          yarnTypes={allYarns.length}
          lowStockCount={lowStock.length}
          movements30d={movements30d}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Recently Added Yarns</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {recent.map((y) => (
                  <li
                    key={y.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <Link
                        href={`/inventory/${y.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {y.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {y.yarnId} · {y.material} · {y.color} · {y.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{y.quantity} cones</Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(y.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <LowStockAlert yarns={lowStock} />
        </div>
      </div>
    </>
  );
}
