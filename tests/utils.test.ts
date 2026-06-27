import { describe, it, expect } from "vitest";
import {
  stockLevel,
  stockBadgeClass,
  nextYarnId,
  rackGroup,
  formatINR,
} from "@/lib/utils";

describe("stockLevel", () => {
  it("uses the default 50 threshold when no reorderLevel given", () => {
    expect(stockLevel(40)).toBe("low");
    expect(stockLevel(60)).toBe("medium");
    expect(stockLevel(120)).toBe("high");
  });

  it("respects a per-yarn reorderLevel", () => {
    expect(stockLevel(60, 80)).toBe("low"); // below reorder
    expect(stockLevel(120, 80)).toBe("medium"); // below 2x
    expect(stockLevel(200, 80)).toBe("high");
  });
});

describe("stockBadgeClass", () => {
  it("is red below the reorder level", () => {
    expect(stockBadgeClass(60, 80)).toContain("red");
  });
  it("is green well above it", () => {
    expect(stockBadgeClass(200, 80)).toContain("emerald");
  });
});

describe("nextYarnId", () => {
  it("pads to three digits", () => {
    expect(nextYarnId(0)).toBe("Y001");
    expect(nextYarnId(9)).toBe("Y010");
    expect(nextYarnId(99)).toBe("Y100");
  });
});

describe("rackGroup", () => {
  it("extracts the rack prefix", () => {
    expect(rackGroup("Rack A-12")).toBe("Rack A");
    expect(rackGroup("Rack B-3")).toBe("Rack B");
  });
});

describe("formatINR", () => {
  it("formats with the Indian grouping and rupee sign", () => {
    expect(formatINR(125000)).toBe("₹1,25,000");
    expect(formatINR(0)).toBe("₹0");
  });
});
