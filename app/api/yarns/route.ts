import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextYarnId } from "@/lib/utils";
import { yarnInputSchema } from "@/lib/validation";

// GET /api/yarns — list with optional filters: name, color, material, location
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const name = sp.get("name") ?? undefined;
    const color = sp.get("color") ?? undefined;
    const material = sp.get("material") ?? undefined;
    const location = sp.get("location") ?? undefined;

    const yarns = await prisma.yarn.findMany({
      where: {
        name: name ? { contains: name } : undefined,
        color: color ? { contains: color } : undefined,
        material: material ? { equals: material } : undefined,
        location: location ? { contains: location } : undefined,
      },
      orderBy: { yarnId: "asc" },
    });

    return NextResponse.json(yarns);
  } catch {
    return NextResponse.json({ error: "Failed to load yarns" }, { status: 500 });
  }
}

// POST /api/yarns — create a yarn with an auto-generated yarnId
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = yarnInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const count = await prisma.yarn.count();
    const yarn = await prisma.yarn.create({
      data: { ...parsed.data, yarnId: nextYarnId(count) },
    });

    return NextResponse.json(yarn, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create yarn" }, { status: 500 });
  }
}
