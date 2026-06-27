import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight } from "lucide-react";
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
  title: "Transactions",
  description: "Stock movement log",
};

export default async function TransactionsPage() {
  const txns = await prisma.transaction.findMany({
    include: {
      yarn: { select: { id: true, yarnId: true, name: true } },
      user: { select: { name: true } },
    },
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={`${txns.length} stock movement(s) logged`}
        icon={<ArrowLeftRight className="h-5 w-5" />}
      />
      <div className="animate-fade-in-up p-5 sm:p-8">
        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Yarn</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Reference / Note</TableHead>
                <TableHead>Logged by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No transactions yet.
                  </TableCell>
                </TableRow>
              ) : (
                txns.map((t) => (
                  <TableRow key={t.id} className="odd:bg-muted/30">
                    <TableCell className="text-muted-foreground tabular-nums">
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
                    <TableCell className="text-right font-medium tabular-nums">
                      {t.quantity}
                    </TableCell>
                    <TableCell className="max-w-[16rem]">
                      {t.reference && (
                        <span className="font-mono text-xs">{t.reference}</span>
                      )}
                      {t.reference && t.note && (
                        <span className="text-muted-foreground"> · </span>
                      )}
                      {t.note && (
                        <span className="text-muted-foreground">{t.note}</span>
                      )}
                      {!t.reference && !t.note && (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {t.user?.name ?? "—"}
                    </TableCell>
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
