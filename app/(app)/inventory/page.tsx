import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/page-header";
import { YarnTable } from "@/components/yarn-table";
import { CsvTools } from "@/components/csv-tools";
import { Boxes } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Inventory",
  description: "Browse, search, and manage yarn stock",
};

const PAGE_SIZE = 10;
const SORT_KEYS = ["name", "quantity", "yarnId"] as const;
type SortKey = (typeof SORT_KEYS)[number];

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    material?: string;
    color?: string;
    location?: string;
    sort?: string;
    dir?: string;
    page?: string;
  };
}) {
  const q = searchParams.q?.trim() ?? "";
  const material = searchParams.material?.trim() ?? "";
  const color = searchParams.color?.trim() ?? "";
  const location = searchParams.location?.trim() ?? "";
  const sort: SortKey = SORT_KEYS.includes(searchParams.sort as SortKey)
    ? (searchParams.sort as SortKey)
    : "yarnId";
  const dir = searchParams.dir === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(searchParams.page) || 1);

  // SQLite LIKE (Prisma `contains`) is case-insensitive for ASCII by default.
  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q } },
              { yarnId: { contains: q } },
              { color: { contains: q } },
              { supplier: { contains: q } },
            ],
          }
        : {},
      material ? { material } : {},
      color ? { color: { contains: color } } : {},
      location ? { location: { contains: location } } : {},
    ],
  };

  const [total, allMaterials, admin] = await Promise.all([
    prisma.yarn.count({ where }),
    prisma.yarn.findMany({
      distinct: ["material"],
      select: { material: true },
      orderBy: { material: "asc" },
    }),
    isAdmin(),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Clamp so a stale/shared ?page beyond the result set doesn't show an empty
  // table with a "Showing 41–50 of 12" footer.
  const safePage = Math.min(page, pageCount);

  const yarns = await prisma.yarn.findMany({
    where,
    orderBy: { [sort]: dir },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const materials = allMaterials.map((m) => m.material);

  return (
    <>
      <PageHeader
        title="Inventory"
        subtitle={`${total} yarn type(s)${q || material || color || location ? " match" : " in stock"}`}
        icon={<Boxes className="h-5 w-5" />}
        action={<CsvTools canImport={admin} />}
      />
      <div className="animate-fade-in-up p-5 sm:p-8">
        <YarnTable
          yarns={yarns}
          materials={materials}
          canManage={admin}
          total={total}
          page={safePage}
          pageSize={PAGE_SIZE}
          pageCount={pageCount}
          filters={{ q, material, color, location, sort, dir }}
        />
      </div>
    </>
  );
}
