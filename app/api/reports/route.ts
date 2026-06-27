import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeReport } from "@/lib/reports";

// GET /api/reports — valuation + low-stock list + monthly IN/OUT aggregate.
export async function GET() {
  try {
    const [yarns, txns] = await Promise.all([
      prisma.yarn.findMany({ orderBy: { yarnId: "asc" } }),
      prisma.transaction.findMany({
        select: { type: true, quantity: true, date: true },
      }),
    ]);

    return NextResponse.json(computeReport(yarns, txns));
  } catch {
    return NextResponse.json({ error: "Failed to build report" }, { status: 500 });
  }
}
