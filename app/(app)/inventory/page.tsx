import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { YarnTable } from "@/components/yarn-table";
import { CsvTools } from "@/components/csv-tools";
import { Boxes } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Inventory",
  description: "Browse, search, and manage yarn stock",
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const yarns = await prisma.yarn.findMany({ orderBy: { yarnId: "asc" } });
  const materials = Array.from(new Set(yarns.map((y) => y.material))).sort();

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${yarns.length} yarn types in stock`}
        icon={<Boxes className="h-5 w-5" />}
        action={<CsvTools />}
      />
      <div className="animate-fade-in-up p-5 sm:p-8">
        <YarnTable
          yarns={yarns}
          materials={materials}
          initialSearch={searchParams.search ?? ""}
        />
      </div>
    </>
  );
}
