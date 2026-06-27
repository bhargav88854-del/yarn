import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { LabelSheet, type Label } from "@/components/label-sheet";
import { QrCode } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Labels",
  description: "Printable QR labels for every yarn",
};

export default async function LabelsPage() {
  const yarns = await prisma.yarn.findMany({ orderBy: { yarnId: "asc" } });

  // Build an absolute URL so a scanned code opens the yarn on any device.
  const h = headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = `${proto}://${host}`;

  const labels: Label[] = yarns.map((y) => ({
    id: y.id,
    yarnId: y.yarnId,
    name: y.name,
    color: y.color,
    location: y.location,
    url: `${base}/inventory/${y.id}`,
  }));

  return (
    <>
      <PageHeader
        title="QR Labels"
        subtitle="Print and stick on cones — scan to open the yarn"
        icon={<QrCode className="h-5 w-5" />}
      />
      <div className="animate-fade-in-up p-5 sm:p-8">
        <Card className="print:border-0 print:shadow-none">
          <CardContent className="p-5">
            <LabelSheet labels={labels} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
