import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { yarnUpdateSchema } from "@/lib/validation";

type Params = { params: { id: string } };

// GET /api/yarns/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const id = Number(params.id);
    const yarn = await prisma.yarn.findUnique({
      where: { id },
      include: { transactions: { orderBy: { date: "desc" } } },
    });
    if (!yarn) {
      return NextResponse.json({ error: "Yarn not found" }, { status: 404 });
    }
    return NextResponse.json(yarn);
  } catch {
    return NextResponse.json({ error: "Failed to load yarn" }, { status: 500 });
  }
}

// PUT /api/yarns/[id] — edits details only. Quantity is intentionally NOT
// accepted here: stock only moves through IN/OUT transactions, so the figure
// and the movement log never drift apart.
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = Number(params.id);
    const body = await req.json();
    const parsed = yarnUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const yarn = await prisma.yarn.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(yarn);
  } catch {
    return NextResponse.json({ error: "Failed to update yarn" }, { status: 500 });
  }
}

// DELETE /api/yarns/[id] — blocked when transactions exist
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const id = Number(params.id);
    const txnCount = await prisma.transaction.count({ where: { yarnId: id } });
    if (txnCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: this yarn has ${txnCount} transaction record(s). Remove its movements first.`,
        },
        { status: 409 }
      );
    }

    await prisma.yarn.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete yarn" }, { status: 500 });
  }
}
