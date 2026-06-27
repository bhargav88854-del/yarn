import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

// Always reflect live inventory — never serve a build-time snapshot.
export const dynamic = "force-dynamic";

const HEADERS = [
  "yarnId",
  "name",
  "material",
  "color",
  "quantity",
  "unit",
  "costPerCone",
  "reorderLevel",
  "location",
  "supplier",
];

// GET /api/yarns/export — full inventory as a CSV download.
export async function GET() {
  try {
    const yarns = await prisma.yarn.findMany({ orderBy: { yarnId: "asc" } });
    const csv = toCsv(HEADERS, yarns);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="inventory-${date}.csv"`,
      },
    });
  } catch {
    return Response.json({ error: "Failed to export inventory" }, { status: 500 });
  }
}
