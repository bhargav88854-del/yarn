// Shared report aggregation so the /reports page and /api/reports return
// identical numbers from one source of truth (valuation, low-stock, monthly).

type TxnLite = { type: string; quantity: number; date: Date | string };

type YarnLite = {
  material: string;
  quantity: number;
  costPerCone: number;
  reorderLevel: number;
};

export function computeReport<Y extends YarnLite>(yarns: Y[], txns: TxnLite[]) {
  // Low stock against each yarn's own reorder level.
  const lowStock = yarns.filter((y) => y.quantity < y.reorderLevel);

  // Inventory valuation: value = quantity × costPerCone.
  const totalValue = yarns.reduce((s, y) => s + y.quantity * y.costPerCone, 0);
  const totalStock = yarns.reduce((s, y) => s + y.quantity, 0);

  // Stock value grouped by material, biggest first.
  const matMap = new Map<
    string,
    { material: string; value: number; quantity: number }
  >();
  for (const y of yarns) {
    const m =
      matMap.get(y.material) ?? { material: y.material, value: 0, quantity: 0 };
    m.value += y.quantity * y.costPerCone;
    m.quantity += y.quantity;
    matMap.set(y.material, m);
  }
  const byMaterial = Array.from(matMap.values()).sort((a, b) => b.value - a.value);

  // Aggregate IN/OUT per month (no raw SQL).
  const buckets = new Map<string, { month: string; in: number; out: number }>();
  for (const t of txns) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const b = buckets.get(key) ?? { month: key, in: 0, out: 0 };
    if (t.type === "IN") b.in += t.quantity;
    else b.out += t.quantity;
    buckets.set(key, b);
  }
  const monthly = Array.from(buckets.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return { totalValue, totalStock, byMaterial, lowStock, monthly };
}
