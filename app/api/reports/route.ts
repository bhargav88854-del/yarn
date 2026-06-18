import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/utils";

// GET /api/reports — low-stock list + monthly IN/OUT aggregate (grouped in JS, no raw SQL)
export async function GET() {
  try {
    const lowStock = await prisma.yarn.findMany({
      where: { quantity: { lt: LOW_STOCK_THRESHOLD } },
      orderBy: { quantity: "asc" },
    });

    const txns = await prisma.transaction.findMany({
      select: { type: true, quantity: true, date: true },
    });

    const buckets = new Map<string, { month: string; in: number; out: number }>();
    for (const t of txns) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.get(key) ?? { month: key, in: 0, out: 0 };
      if (t.type === "IN") bucket.in += t.quantity;
      else bucket.out += t.quantity;
      buckets.set(key, bucket);
    }

    const monthly = Array.from(buckets.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return NextResponse.json({ lowStock, monthly });
  } catch {
    return NextResponse.json({ error: "Failed to build report" }, { status: 500 });
  }
}
