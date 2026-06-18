import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { YarnTable } from "@/components/yarn-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const yarns = await prisma.yarn.findMany({ orderBy: { yarnId: "asc" } });
  const materials = Array.from(new Set(yarns.map((y) => y.material))).sort();

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${yarns.length} yarn types in stock`}
      />
      <div className="p-8">
        <YarnTable yarns={yarns} materials={materials} />
      </div>
    </>
  );
}
