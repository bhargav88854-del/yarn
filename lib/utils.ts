import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Low stock threshold in cones. */
export const LOW_STOCK_THRESHOLD = 50;

/** Format a number as Indian-rupee currency, e.g. 125000 -> "₹1,25,000". */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Format a date as DD-MM-YYYY for display. */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/** Generate the next yarn id from the current row count: Y001, Y002... */
export function nextYarnId(count: number): string {
  return `Y${String(count + 1).padStart(3, "0")}`;
}

export type StockLevel = "low" | "medium" | "high";

/**
 * Stock level relative to a yarn's reorder level: red below it, amber below 2×,
 * green otherwise. `reorderLevel` defaults to the legacy 50-cone threshold so
 * callers that don't have a per-yarn level still work.
 */
export function stockLevel(
  quantity: number,
  reorderLevel: number = LOW_STOCK_THRESHOLD
): StockLevel {
  if (quantity < reorderLevel) return "low";
  if (quantity < reorderLevel * 2) return "medium";
  return "high";
}

/** Tailwind classes for a stock-level badge. */
export function stockBadgeClass(
  quantity: number,
  reorderLevel: number = LOW_STOCK_THRESHOLD
): string {
  const level = stockLevel(quantity, reorderLevel);
  if (level === "low") return "bg-red-100 text-red-700 border-red-200";
  if (level === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

/** Extract the rack group from a location like "Rack A-12" -> "Rack A". */
export function rackGroup(location: string): string {
  const m = location.match(/^(.*?)[-\s]?\d+\s*$/);
  return (m ? m[1] : location).trim().replace(/[-\s]+$/, "");
}
