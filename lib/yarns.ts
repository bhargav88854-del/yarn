import { prisma } from "@/lib/prisma";

/** Highest numeric yarnId in use (Y007 -> 7); 0 when empty. */
export async function maxYarnNumber(): Promise<number> {
  const rows = await prisma.yarn.findMany({ select: { yarnId: true } });
  return rows.reduce((m, r) => {
    const n = parseInt(r.yarnId.slice(1), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
}

/** Format a yarn number as a padded id: 7 -> "Y007". */
export function formatYarnId(n: number): string {
  return `Y${String(n).padStart(3, "0")}`;
}

/**
 * Duck-typed unique-constraint check. Under Next's dev bundler the generated
 * Prisma client can load as a separate module instance, so `instanceof
 * Prisma.PrismaClientKnownRequestError` is unreliable — match on `.code`.
 */
export function isUniqueViolation(e: unknown): boolean {
  const code =
    typeof (e as { code?: unknown })?.code === "string"
      ? (e as { code: string }).code
      : "";
  return code === "P2002";
}
