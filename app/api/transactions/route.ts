import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { transactionInputSchema } from "@/lib/validation";

// GET /api/transactions — movement log with yarn name
export async function GET() {
  try {
    const txns = await prisma.transaction.findMany({
      include: { yarn: { select: { yarnId: true, name: true } } },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });
    return NextResponse.json(txns);
  } catch {
    return NextResponse.json(
      { error: "Failed to load transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions — log a movement and adjust quantity atomically
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = transactionInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { yarnId, type, quantity, note, reference } = parsed.data;

    // Stamp who logged the movement (null if unauthenticated or non-numeric id).
    const session = await auth();
    const parsedUserId = Number(session?.user?.id);
    const userId = Number.isInteger(parsedUserId) ? parsedUserId : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const yarn = await tx.yarn.findUnique({ where: { id: yarnId } });
      if (!yarn) {
        throw new Error("NOT_FOUND");
      }
      if (type === "OUT" && yarn.quantity < quantity) {
        throw new Error("INSUFFICIENT");
      }

      const delta = type === "IN" ? quantity : -quantity;
      await tx.yarn.update({
        where: { id: yarnId },
        data: { quantity: yarn.quantity + delta },
      });

      return tx.transaction.create({
        data: { yarnId, type, quantity, note, reference, userId },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NOT_FOUND") {
      return NextResponse.json({ error: "Yarn not found" }, { status: 404 });
    }
    if (msg === "INSUFFICIENT") {
      return NextResponse.json(
        { error: "Insufficient stock for this OUT movement" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to log transaction" },
      { status: 500 }
    );
  }
}
