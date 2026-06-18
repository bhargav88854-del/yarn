import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { YarnForm } from "@/components/yarn-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function YarnDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const yarn = await prisma.yarn.findUnique({
    where: { id },
    include: { transactions: { orderBy: { date: "desc" } } },
  });
  if (!yarn) notFound();

  return (
    <>
      <PageHeader
        title={yarn.name}
        subtitle={`${yarn.yarnId} · ${yarn.material} · ${yarn.color}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/inventory">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 p-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Edit yarn</CardTitle>
          </CardHeader>
          <CardContent>
            <YarnForm
              yarnId={yarn.id}
              initial={{
                name: yarn.name,
                material: yarn.material,
                color: yarn.color,
                quantity: yarn.quantity,
                location: yarn.location,
                supplier: yarn.supplier,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Movement history</CardTitle>
          </CardHeader>
          <CardContent>
            {yarn.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No movements yet.</p>
            ) : (
              <ul className="divide-y">
                {yarn.transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          (t.type === "IN"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-red-100 text-red-700 border-red-200") + " border"
                        }
                      >
                        {t.type}
                      </Badge>
                      <span className="text-sm">{t.quantity} cones</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(t.date)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
