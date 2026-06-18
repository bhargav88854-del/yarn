import { prisma } from "@/lib/prisma";
import { rackGroup } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { RackLayout, type Rack } from "@/components/rack-layout";

export const dynamic = "force-dynamic";

export default async function StoragePage() {
  const yarns = await prisma.yarn.findMany({ orderBy: { location: "asc" } });

  const map = new Map<string, Rack>();
  for (const y of yarns) {
    const name = rackGroup(y.location);
    const rack = map.get(name) ?? { name, yarns: [], totalCones: 0 };
    rack.yarns.push({
      id: y.id,
      yarnId: y.yarnId,
      name: y.name,
      quantity: y.quantity,
      location: y.location,
    });
    rack.totalCones += y.quantity;
    map.set(name, rack);
  }
  const racks = Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <>
      <PageHeader
        title="Storage Layout"
        subtitle={`${racks.length} rack(s) · click a rack to see its yarns`}
      />
      <div className="p-8">
        {racks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No yarns stored yet.</p>
        ) : (
          <RackLayout racks={racks} />
        )}
      </div>
    </>
  );
}
