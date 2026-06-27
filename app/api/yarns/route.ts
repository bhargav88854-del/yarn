import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { maxYarnNumber, formatYarnId, isUniqueViolation } from "@/lib/yarns";
import { yarnInputSchema, type YarnInput } from "@/lib/validation";

// GET /api/yarns — list with optional filters: name, color, material, location
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const name = sp.get("name") ?? undefined;
    const color = sp.get("color") ?? undefined;
    const material = sp.get("material") ?? undefined;
    const location = sp.get("location") ?? undefined;

    const ci = "insensitive" as const;
    const yarns = await prisma.yarn.findMany({
      where: {
        name: name ? { contains: name, mode: ci } : undefined,
        color: color ? { contains: color, mode: ci } : undefined,
        material: material ? { equals: material } : undefined,
        location: location ? { contains: location, mode: ci } : undefined,
      },
      orderBy: { yarnId: "asc" },
    });

    return NextResponse.json(yarns);
  } catch {
    return NextResponse.json({ error: "Failed to load yarns" }, { status: 500 });
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Derive the next yarnId from the current maximum (Y001, Y002...). Two concurrent
// POSTs can read the same max, so the unique constraint on `yarnId` is the real
// guard — on a P2002 collision we recompute and retry. We also retry on a write
// conflict / busy DB (P2034, or SQLite's single-writer lock) since those are
// transient under concurrency.
async function createYarnWithId(data: YarnInput) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const yarnId = formatYarnId((await maxYarnNumber()) + 1);
      return await prisma.yarn.create({ data: { ...data, yarnId } });
    } catch (e) {
      const code =
        typeof (e as { code?: unknown }).code === "string"
          ? (e as { code: string }).code
          : "";
      const isBusy =
        code === "P2034" ||
        (e instanceof Error && /database is locked|SQLITE_BUSY/i.test(e.message));

      if (isUniqueViolation(e) || isBusy) {
        await sleep(25 * (attempt + 1)); // back off, then recompute and retry
        continue;
      }
      throw e;
    }
  }
  throw new Error("YARN_ID_CONFLICT");
}

// POST /api/yarns — create a yarn with an auto-generated yarnId (admin only)
export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await req.json();
    const parsed = yarnInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const yarn = await createYarnWithId(parsed.data);
    return NextResponse.json(yarn, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "YARN_ID_CONFLICT") {
      return NextResponse.json(
        { error: "Could not allocate a yarn ID, please retry" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create yarn" }, { status: 500 });
  }
}
