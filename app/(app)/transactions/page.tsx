import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
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

export default async function TransactionsPage() {
  const txns = await prisma.transaction.findMany({
    include: { yarn: { select: { id: true, yarnId: true, name: true } } },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`${txns.length} stock movement(s) logged`}
      />
      <div className="p-8">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Yarn</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                txns.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(t.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/inventory/${t.yarn.id}`} className="hover:underline">
                        {t.yarn.name}
                      </Link>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {t.yarn.yarnId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          (t.type === "IN"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200") + " border"
                        }
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{t.quantity}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
