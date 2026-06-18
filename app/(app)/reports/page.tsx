import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { UsageChart } from "@/components/usage-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [lowStock, txns] = await Promise.all([
    prisma.yarn.findMany({
      where: { quantity: { lt: LOW_STOCK_THRESHOLD } },
      orderBy: { quantity: "asc" },
    }),
    prisma.transaction.findMany({
      select: { type: true, quantity: true, date: true },
    }),
  ]);

  // Aggregate IN/OUT per month in JS (no raw SQL).
  const buckets = new Map<string, { month: string; in: number; out: number }>();
  for (const t of txns) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = buckets.get(key) ?? { month: key, in: 0, out: 0 };
    if (t.type === "IN") b.in += t.quantity;
    else b.out += t.quantity;
    buckets.set(key, b);
  }
  const monthly = Array.from(buckets.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return (
    <>
      <PageHeader title="Reports" subtitle="Stock health & monthly usage" />
      <div className="space-y-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <UsageChart data={monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Low Stock Report ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No yarns below the {LOW_STOCK_THRESHOLD}-cone threshold.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((y) => (
                    <TableRow key={y.id}>
                      <TableCell className="font-mono text-xs">{y.yarnId}</TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/inventory/${y.id}`} className="hover:underline">
                          {y.name}
                        </Link>
                      </TableCell>
                      <TableCell>{y.material}</TableCell>
                      <TableCell>{y.location}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-red-100 text-red-700 border border-red-200">
                          {y.quantity}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
