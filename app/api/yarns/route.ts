import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth-helpers";
import { yarnInputSchema, type YarnInput } from "@/lib/validation";

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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Derive the next yarnId from the current maximum (Y001, Y002...). Two concurrent
// POSTs can read the same max, so the unique constraint on `yarnId` is the real
// guard — on a P2002 collision we recompute and retry. We also retry on a write
// conflict / busy DB (P2034, or SQLite's single-writer lock) since those are
// transient under concurrency.
async function createYarnWithId(data: YarnInput) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      // Numeric max, not lexicographic: ordering the String column "desc" would
      // rank "Y999" above "Y1000", stalling id allocation past 999.
      const rows = await prisma.yarn.findMany({ select: { yarnId: true } });
      const maxNum = rows.reduce((m, r) => {
        const n = parseInt(r.yarnId.slice(1), 10);
        return Number.isFinite(n) && n > m ? n : m;
      }, 0);
      const yarnId = `Y${String(maxNum + 1).padStart(3, "0")}`;

      return await prisma.yarn.create({ data: { ...data, yarnId } });
    } catch (e) {
      // Duck-type on the error code rather than `instanceof`: under Next's dev
      // bundler the generated client can load as a separate module instance, so
      // `e instanceof Prisma.PrismaClientKnownRequestError` is unreliable.
      const code =
        typeof (e as { code?: unknown }).code === "string"
          ? (e as { code: string }).code
          : "";
      const isBusy =
        code === "P2034" ||
        (e instanceof Error && /database is locked|SQLITE_BUSY/i.test(e.message));

      if (code === "P2002" || isBusy) {
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
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

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
