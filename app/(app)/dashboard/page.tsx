import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD, formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { DashboardStats } from "@/components/dashboard-stats";
import { LowStockAlert } from "@/components/low-stock-alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [agg, yarnTypes, lowStock, movements30d, recent] = await Promise.all([
    prisma.yarn.aggregate({ _sum: { quantity: true } }),
    prisma.yarn.count(),
    prisma.yarn.findMany({
      where: { quantity: { lt: LOW_STOCK_THRESHOLD } },
      orderBy: { quantity: "asc" },
    }),
    prisma.transaction.count({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.yarn.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Warehouse stock overview at a glance"
      />
      <div className="space-y-6 p-8">
        <DashboardStats
          totalStock={agg._sum.quantity ?? 0}
          yarnTypes={yarnTypes}
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
