import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { maxYarnNumber, formatYarnId, isUniqueViolation } from "@/lib/yarns";
import { parseCsv } from "@/lib/csv";
import { yarnInputSchema, type YarnInput } from "@/lib/validation";

const REQUIRED = ["name", "material", "color", "quantity", "location", "supplier"];

// POST /api/yarns/import — body { csv: string }. Validates each row, creates the
// valid ones with auto-generated yarnIds, and reports per-row errors. yarnId in
// the file (e.g. from export) is ignored — import always adds new rows.
export async function POST(req: NextRequest) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await req.json().catch(() => null);
    const csv = body?.csv;
    if (typeof csv !== "string" || csv.trim() === "") {
      return NextResponse.json({ error: "No CSV provided" }, { status: 400 });
    }

    const rows = parseCsv(csv);
    if (rows.length < 2) {
      return NextResponse.json(
        { error: "CSV needs a header row and at least one data row" },
        { status: 400 }
      );
    }

    const headers = rows[0].map((h) => h.trim());
    const missing = REQUIRED.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required column(s): ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const valid: YarnInput[] = [];
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      // Skip fully blank lines.
      if (cells.every((c) => c.trim() === "")) continue;

      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = (cells[idx] ?? "").trim();
      });

      const parsed = yarnInputSchema.safeParse(obj);
      if (parsed.success) {
        valid.push(parsed.data);
      } else {
        errors.push({ row: i + 1, message: parsed.error.issues[0].message });
      }
    }

    let created = 0;
    if (valid.length > 0) {
      // Allocate yarnIds sequentially from the current max. A concurrent create
      // (single POST or another import) can take the same range, so retry the
      // whole batch on a unique-constraint collision rather than losing it.
      for (let attempt = 0; attempt < 6; attempt++) {
        let maxNum = await maxYarnNumber();
        const data = valid.map((v) => ({ ...v, yarnId: formatYarnId(++maxNum) }));
        try {
          const result = await prisma.yarn.createMany({ data });
          created = result.count;
          break;
        } catch (e) {
          if (isUniqueViolation(e) && attempt < 5) continue;
          throw e;
        }
      }
    }

    return NextResponse.json({
      created,
      skipped: errors.length,
      errors: errors.slice(0, 20), // cap so the response stays small
    });
  } catch {
    return NextResponse.json({ error: "Failed to import CSV" }, { status: 500 });
  }
}
