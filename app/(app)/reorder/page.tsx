import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
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
  title: "Reorder",
  description: "Yarns below reorder level and suggested purchase",
};

type Row = {
  id: number;
  yarnId: string;
  name: string;
  material: string;
  supplier: string;
  location: string;
  quantity: number;
  reorderLevel: number;
  costPerCone: number;
  unit: string;
  suggested: number;
  lineCost: number;
};

export default async function ReorderPage() {
  const yarns = await prisma.yarn.findMany({ orderBy: { yarnId: "asc" } });

  // Restock target = 2× the reorder level; order the shortfall to reach it.
  const low: Row[] = yarns
    .filter((y) => y.quantity < y.reorderLevel)
    .map((y) => {
      const suggested = Math.max(y.reorderLevel * 2 - y.quantity, 0);
      return {
        id: y.id,
        yarnId: y.yarnId,
        name: y.name,
        material: y.material,
        supplier: y.supplier,
        location: y.location,
        quantity: y.quantity,
        reorderLevel: y.reorderLevel,
        costPerCone: y.costPerCone,
        unit: y.unit,
        suggested,
        lineCost: suggested * y.costPerCone,
      };
    });

  // Group into one purchase order per supplier — single pass over the low rows.
  const bySupplier = new Map<string, Row[]>();
  for (const r of low) {
    const list = bySupplier.get(r.supplier) ?? [];
    list.push(r);
    bySupplier.set(r.supplier, list);
  }

  const grandTotal = low.reduce((s, r) => s + r.lineCost, 0);
  const suppliers = Array.from(bySupplier.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <>
      <PageHeader
        title="Reorder"
        subtitle="Yarns below reorder level · suggested purchase by supplier"
        icon={<ShoppingCart className="h-5 w-5" />}
      />
      <div className="animate-fade-in-up space-y-6 p-5 sm:p-8">
        {low.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              All yarns are at or above their reorder level. Nothing to order. 🎉
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {low.length} item(s) to reorder across {suppliers.length}{" "}
                    supplier(s)
                  </p>
                  <p className="text-2xl font-semibold">{formatINR(grandTotal)}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  Estimated purchase cost
                </Badge>
              </CardContent>
            </Card>

            {suppliers.map(([supplier, rows]) => {
              const subtotal = rows.reduce((s, r) => s + r.lineCost, 0);
              return (
                <Card key={supplier}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base">{supplier}</CardTitle>
                    <span className="text-sm font-medium">
                      {formatINR(subtotal)}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Qty / Reorder</TableHead>
                          <TableHead className="text-right">Order qty</TableHead>
                          <TableHead className="text-right">Unit cost</TableHead>
                          <TableHead className="text-right">Line cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono text-xs">
                              {r.yarnId}
                            </TableCell>
                            <TableCell className="font-medium">
                              <Link
                                href={`/inventory/${r.id}`}
                                className="hover:underline"
                              >
                                {r.name}
                              </Link>
                              <span className="ml-1 text-xs text-muted-foreground">
                                {r.material}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge className="bg-red-100 text-red-700 border border-red-200">
                                {r.quantity} / {r.reorderLevel}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {r.suggested} {r.unit.toLowerCase()}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {formatINR(r.costPerCone)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatINR(r.lineCost)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
