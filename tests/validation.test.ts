import { describe, it, expect } from "vitest";
import {
  yarnInputSchema,
  yarnUpdateSchema,
  transactionInputSchema,
} from "@/lib/validation";

const base = {
  name: "Cotton 30s",
  material: "Cotton",
  color: "White",
  quantity: "100",
  location: "Rack A-1",
  supplier: "Mills",
};

describe("yarnInputSchema", () => {
  it("applies defaults when optional fields are empty strings", () => {
    const r = yarnInputSchema.parse({
      ...base,
      unit: "",
      costPerCone: "",
      reorderLevel: "",
    });
    expect(r.unit).toBe("Cones");
    expect(r.costPerCone).toBe(0);
    expect(r.reorderLevel).toBe(50); // NOT 0
  });

  it("coerces provided numeric strings", () => {
    const r = yarnInputSchema.parse({
      ...base,
      costPerCone: "550",
      reorderLevel: "80",
    });
    expect(r.costPerCone).toBe(550);
    expect(r.reorderLevel).toBe(80);
  });

  it("rejects a negative quantity", () => {
    expect(yarnInputSchema.safeParse({ ...base, quantity: "-1" }).success).toBe(
      false
    );
  });
});

describe("yarnUpdateSchema", () => {
  it("omits quantity (stock only moves via transactions)", () => {
    const r = yarnUpdateSchema.parse({ ...base, quantity: "9999" });
    expect("quantity" in r).toBe(false);
  });
});

describe("transactionInputSchema", () => {
  it("treats blank note/reference as undefined", () => {
    const r = transactionInputSchema.parse({
      yarnId: "1",
      type: "IN",
      quantity: "5",
      note: "   ",
      reference: "",
    });
    expect(r.note).toBeUndefined();
    expect(r.reference).toBeUndefined();
  });

  it("rejects quantity <= 0 and bad type", () => {
    expect(
      transactionInputSchema.safeParse({ yarnId: 1, type: "IN", quantity: 0 })
        .success
    ).toBe(false);
    expect(
      transactionInputSchema.safeParse({ yarnId: 1, type: "X", quantity: 5 })
        .success
    ).toBe(false);
  });
});
