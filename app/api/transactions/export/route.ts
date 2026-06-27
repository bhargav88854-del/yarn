import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

// Always reflect live data — never serve a build-time snapshot.
export const dynamic = "force-dynamic";

const HEADERS = [
  "date",
  "yarnId",
  "yarnName",
  "type",
  "quantity",
  "reference",
  "note",
  "loggedBy",
];

// GET /api/transactions/export — movement log as a CSV download.
export async function GET() {
  try {
    const txns = await prisma.transaction.findMany({
      include: {
        yarn: { select: { yarnId: true, name: true } },
        user: { select: { name: true } },
      },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });

    const rows = txns.map((t) => ({
      date: new Date(t.date).toISOString(),
      yarnId: t.yarn.yarnId,
      yarnName: t.yarn.name,
      type: t.type,
      quantity: t.quantity,
      reference: t.reference ?? "",
      note: t.note ?? "",
      loggedBy: t.user?.name ?? "",
    }));

    const csv = toCsv(HEADERS, rows);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="transactions-${date}.csv"`,
      },
    });
  } catch {
    return Response.json(
      { error: "Failed to export transactions" },
      { status: 500 }
    );
  }
}
