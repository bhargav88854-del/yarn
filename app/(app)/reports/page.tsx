import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { computeReport } from "@/lib/reports";
import { PageHeader } from "@/components/page-header";
import { UsageChart } from "@/components/usage-chart";
import { ValueChart } from "@/components/value-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, IndianRupee, Boxes, Layers, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Reports",
  description: "Inventory valuation, stock health and monthly usage",
};

export default async function ReportsPage() {
  const [yarns, txns] = await Promise.all([
    prisma.yarn.findMany({ orderBy: { quantity: "asc" } }),
    prisma.transaction.findMany({
      select: { type: true, quantity: true, date: true },
    }),
  ]);

  const { totalValue, totalStock, byMaterial, lowStock, monthly } =
    computeReport(yarns, txns);

  const kpis = [
    { label: "Total stock value", value: formatINR(totalValue), icon: IndianRupee },
    {
      label: "Total stock",
      value: `${totalStock.toLocaleString("en-IN")} cones`,
      icon: Boxes,
    },
    { label: "Yarn types", value: String(yarns.length), icon: Layers },
    { label: "Low stock", value: String(lowStock.length), icon: AlertTriangle },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Inventory valuation, stock health & monthly usage"
        icon={<BarChart3 className="h-5 w-5" />}
      />
      <div className="animate-fade-in-up space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{label}</p>
                  <p className="truncate text-lg font-semibold">{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Stock Value by Material</CardTitle>
              <p className="text-sm text-muted-foreground">
                Current holdings priced at cost · {formatINR(totalValue)} total
              </p>
            </CardHeader>
            <CardContent>
              <ValueChart data={byMaterial} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Stock Movement</CardTitle>
              <p className="text-sm text-muted-foreground">Cones in vs out</p>
            </CardHeader>
            <CardContent>
              <UsageChart data={monthly} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Low Stock Report ({lowStock.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No yarns below their reorder level.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Qty / Reorder</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((y) => (
                    <TableRow key={y.id}>
                      <TableCell className="font-mono text-xs">{y.yarnId}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/inventory/${y.id}`}
                          className="hover:underline"
                        >
                          {y.name}
                        </Link>
                      </TableCell>
                      <TableCell>{y.material}</TableCell>
                      <TableCell>{y.location}</TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-red-100 text-red-700 border border-red-200">
                          {y.quantity} / {y.reorderLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatINR(y.quantity * y.costPerCone)}
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
