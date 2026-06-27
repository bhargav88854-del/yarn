import { describe, it, expect } from "vitest";
import { computeReport } from "@/lib/reports";

const yarns = [
  { material: "Cotton", quantity: 100, costPerCone: 10, reorderLevel: 50 },
  { material: "Cotton", quantity: 20, costPerCone: 5, reorderLevel: 50 }, // low
  { material: "Wool", quantity: 30, costPerCone: 100, reorderLevel: 20 }, // not low (30>=20)
];

const txns = [
  { type: "IN", quantity: 40, date: "2026-01-10T00:00:00.000Z" },
  { type: "OUT", quantity: 15, date: "2026-01-20T00:00:00.000Z" },
  { type: "IN", quantity: 10, date: "2026-02-05T00:00:00.000Z" },
];

describe("computeReport", () => {
  const r = computeReport(yarns, txns);

  it("totals value and stock", () => {
    expect(r.totalValue).toBe(100 * 10 + 20 * 5 + 30 * 100); // 4100
    expect(r.totalStock).toBe(150);
  });

  it("flags low stock by each yarn's reorderLevel", () => {
    expect(r.lowStock).toHaveLength(1);
    expect(r.lowStock[0].quantity).toBe(20);
  });

  it("groups value by material, biggest first", () => {
    expect(r.byMaterial.map((m) => m.material)).toEqual(["Wool", "Cotton"]);
    expect(r.byMaterial[0].value).toBe(3000);
    expect(r.byMaterial[1].value).toBe(1100);
  });

  it("buckets monthly IN/OUT in chronological order", () => {
    expect(r.monthly).toEqual([
      { month: "2026-01", in: 40, out: 15 },
      { month: "2026-02", in: 10, out: 0 },
    ]);
  });

  it("handles empty input", () => {
    const e = computeReport([], []);
    expect(e.totalValue).toBe(0);
    expect(e.byMaterial).toEqual([]);
    expect(e.monthly).toEqual([]);
    expect(e.lowStock).toEqual([]);
  });
});
